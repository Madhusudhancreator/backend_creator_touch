/**
 * Blogs router — mounted at /api/blogs
 *
 * Public:
 *   GET  /api/blogs        → all blog posts
 *
 * Protected (requires x-admin-key header):
 *   POST   /api/blogs      → create a new blog post
 *   DELETE /api/blogs/:id  → delete a blog post
 */

const path      = require("path");
const router    = require("express").Router();
const adminAuth = require("../middlewares/adminAuth");
const upload    = require("../middlewares/upload");
const ctrl      = require("../controllers/blogsController");

/**
 * POST /api/blogs/upload-image
 * Accepts multipart/form-data with field "image".
 * Returns { url } pointing to the saved file.
 */
router.post("/upload-image", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err && err.code === "LIMIT_FILE_SIZE") {
      return next({ status: 413, message: "Image is too large. Maximum size is 20 MB." });
    }
    if (err) return next({ status: 400, message: err.message });
    if (!req.file) return next({ status: 400, message: "No image file provided." });
    const host = `${req.protocol}://${req.get("host")}`;
    res.json({ url: `${host}/uploads/${req.file.filename}` });
  });
});

router.get(    "/",      ctrl.getAll);
router.get(    "/:slug", ctrl.getBySlug);
router.post(   "/",      ctrl.create);
router.put(    "/:id",   ctrl.update);
router.delete( "/:id",   ctrl.remove);

module.exports = router;
