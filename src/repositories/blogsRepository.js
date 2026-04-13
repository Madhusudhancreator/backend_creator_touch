/**
 * blogsRepository — data layer for the blogs table (v2 schema).
 *
 * Schema:
 *   id              SERIAL        PRIMARY KEY
 *   slug            TEXT          NOT NULL UNIQUE
 *   title           TEXT          NOT NULL
 *   description     TEXT          NOT NULL DEFAULT ''
 *   body_markdown   TEXT          NOT NULL DEFAULT ''
 *   body_html       TEXT          NOT NULL DEFAULT ''
 *   processed_html  TEXT          NOT NULL DEFAULT ''
 *   canonical_url   TEXT          NOT NULL DEFAULT ''
 *   social_image    TEXT          NOT NULL DEFAULT ''
 *   published       BOOLEAN       NOT NULL DEFAULT FALSE
 *   published_at    TIMESTAMPTZ
 *   reading_time    INTEGER       NOT NULL DEFAULT 0
 *   tags_array      TEXT[]        NOT NULL DEFAULT '{}'
 *   cached_tag_list TEXT          NOT NULL DEFAULT ''
 *   author_id       INTEGER
 *   created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
 *   updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
 */

const db = require("../config/db");

const SELECT = `
  SELECT id, slug, title, description, body_markdown, body_html, processed_html,
         canonical_url, social_image, published, published_at, reading_time,
         tags_array, cached_tag_list, author_id, created_at, updated_at
  FROM blogs
`;

/** @returns {Promise<object[]>} All blogs, newest first. */
function findAll() {
  return db.query(`${SELECT} ORDER BY created_at DESC`).then((r) => r.rows);
}

/**
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
function findBySlug(slug) {
  return db.query(`${SELECT} WHERE slug = $1`, [slug]).then((r) => r.rows[0] ?? null);
}

/**
 * @param {number} id
 * @returns {Promise<object|null>}
 */
function findById(id) {
  return db.query(`${SELECT} WHERE id = $1`, [id]).then((r) => r.rows[0] ?? null);
}

/**
 * @param {object} fields
 * @returns {Promise<object>} The inserted row.
 */
function create({
  slug, title, description, body_markdown, body_html, processed_html,
  canonical_url, social_image, published, published_at, reading_time,
  tags_array, cached_tag_list, author_id,
}) {
  return db
    .query(
      `INSERT INTO blogs
         (slug, title, description, body_markdown, body_html, processed_html,
          canonical_url, social_image, published, published_at, reading_time,
          tags_array, cached_tag_list, author_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING id, slug, title, description, body_markdown, body_html, processed_html,
                 canonical_url, social_image, published, published_at, reading_time,
                 tags_array, cached_tag_list, author_id, created_at, updated_at`,
      [
        slug, title, description, body_markdown, body_html, processed_html,
        canonical_url, social_image, published ?? false,
        published ? (published_at ?? new Date()) : null,
        reading_time ?? 0,
        tags_array ?? [], cached_tag_list ?? "", author_id ?? null,
      ]
    )
    .then((r) => r.rows[0]);
}

/**
 * @param {number} id
 * @param {object} fields
 * @returns {Promise<object|null>} Updated row, or null if not found.
 */
function update(id, {
  title, description, body_markdown, body_html, processed_html,
  canonical_url, social_image, published, published_at, reading_time,
  tags_array, cached_tag_list,
}) {
  return db
    .query(
      `UPDATE blogs
          SET title          = $2,
              description    = $3,
              body_markdown  = $4,
              body_html      = $5,
              processed_html = $6,
              canonical_url  = $7,
              social_image   = $8,
              published      = $9,
              published_at   = $10,
              reading_time   = $11,
              tags_array     = $12,
              cached_tag_list = $13
        WHERE id = $1
        RETURNING id, slug, title, description, body_markdown, body_html, processed_html,
                  canonical_url, social_image, published, published_at, reading_time,
                  tags_array, cached_tag_list, author_id, created_at, updated_at`,
      [
        id, title, description, body_markdown, body_html, processed_html,
        canonical_url, social_image, published ?? false,
        published ? (published_at ?? new Date()) : null,
        reading_time ?? 0,
        tags_array ?? [], cached_tag_list ?? "",
      ]
    )
    .then((r) => r.rows[0] ?? null);
}

/**
 * @param {number} id
 * @returns {Promise<boolean>} True if a row was deleted.
 */
function remove(id) {
  return db
    .query("DELETE FROM blogs WHERE id = $1 RETURNING id", [id])
    .then((r) => r.rows.length > 0);
}

module.exports = { findAll, findBySlug, findById, create, update, remove };
