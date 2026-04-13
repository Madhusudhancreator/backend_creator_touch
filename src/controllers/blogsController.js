/**
 * blogsController — HTTP layer for the blogs API (v2 schema).
 */

const repo = require("../repositories/blogsRepository");

/** Converts a title string into a URL-safe slug. */
function toSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

/**
 * Normalises the tags input from the request body.
 * Accepts either an array or a comma-separated string.
 * Returns { tags_array: string[], cached_tag_list: string }
 */
function normaliseTags(input) {
  let arr = [];
  if (Array.isArray(input)) {
    arr = input.map((t) => String(t).trim()).filter(Boolean);
  } else if (typeof input === "string" && input.trim()) {
    arr = input.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return { tags_array: arr, cached_tag_list: arr.join(", ") };
}

/**
 * Wraps plain-text / markdown paragraphs in <p> tags to populate body_html.
 * If the caller already supplies body_html, it is used as-is.
 */
function buildHtml(markdown) {
  if (!markdown) return "";
  return markdown
    .split(/\n{2,}/)
    .map((p) => `<p>${p.trim()}</p>`)
    .join("\n");
}

/** GET /api/blogs — returns all blogs. */
async function getAll(req, res, next) {
  try {
    const blogs = await repo.findAll();
    res.json(blogs);
  } catch (err) {
    next(err);
  }
}

/** GET /api/blogs/:slug — returns a single blog post by slug. */
async function getBySlug(req, res, next) {
  try {
    const blog = await repo.findBySlug(req.params.slug);
    if (!blog) return next({ status: 404, message: `Blog "${req.params.slug}" not found.` });
    res.json(blog);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/blogs — create a new blog post.
 *
 * Body: {
 *   title, tags (string | string[]), description?, body_markdown?,
 *   body_html?, processed_html?, canonical_url?, social_image?,
 *   reading_time?, published?
 * }
 */
async function create(req, res, next) {
  try {
    const {
      title, tags, description, body_markdown,
      canonical_url, social_image, reading_time, published,
    } = req.body;

    if (!title || typeof title !== "string") {
      return next({ status: 400, message: "`title` is required." });
    }

    const slug              = toSlug(title);
    const { tags_array, cached_tag_list } = normaliseTags(tags);
    const md                = body_markdown  || "";
    // If the client sends body_html (from a rich-text editor), use it directly;
    // otherwise fall back to generating <p> tags from body_markdown.
    const html              = req.body.body_html || buildHtml(md);

    const blog = await repo.create({
      slug,
      title,
      description:    description    || "",
      body_markdown:  md,
      body_html:      html,
      processed_html: html,
      canonical_url:  canonical_url  || "",
      social_image:   social_image   || "",
      published:      published === true,
      published_at:   published === true ? new Date() : null,
      reading_time:   parseInt(reading_time, 10) || 0,
      tags_array,
      cached_tag_list,
      author_id:      null,
    });

    res.status(201).json(blog);
  } catch (err) {
    if (err.code === "23505") {
      return next({ status: 409, message: "A blog with this title already exists." });
    }
    next(err);
  }
}

/**
 * PUT /api/blogs/:id — update an existing blog post.
 *
 * Body: same shape as POST (title required, rest optional).
 */
async function update(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return next({ status: 400, message: "Invalid blog id." });

    const {
      title, tags, description, body_markdown,
      canonical_url, social_image, reading_time, published,
    } = req.body;

    if (!title || typeof title !== "string") {
      return next({ status: 400, message: "`title` is required." });
    }

    // Fetch the existing row to preserve published_at when already set
    const existing = await repo.findById(id);
    if (!existing) return next({ status: 404, message: `Blog ${id} not found.` });

    const { tags_array, cached_tag_list } = normaliseTags(tags);
    const md   = body_markdown || "";
    const html = req.body.body_html || buildHtml(md);

    // Keep the original published_at if already published; set it now if newly publishing
    const wasPublished  = existing.published;
    const nowPublished  = published === true;
    const published_at  = nowPublished
      ? (wasPublished ? existing.published_at : new Date())
      : null;

    const blog = await repo.update(id, {
      title,
      description:    description   || "",
      body_markdown:  md,
      body_html:      html,
      processed_html: html,
      canonical_url:  canonical_url || "",
      social_image:   social_image  || "",
      published:      nowPublished,
      published_at,
      reading_time:   parseInt(reading_time, 10) || 0,
      tags_array,
      cached_tag_list,
    });

    res.json(blog);
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/blogs/:id — delete a blog post. */
async function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return next({ status: 400, message: "Invalid blog id." });

    const deleted = await repo.remove(id);
    if (!deleted) return next({ status: 404, message: `Blog ${id} not found.` });

    res.json({ message: "Deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getBySlug, create, update, remove };
