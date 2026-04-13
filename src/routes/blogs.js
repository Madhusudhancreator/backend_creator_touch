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

const router    = require("express").Router();
const adminAuth = require("../middlewares/adminAuth");
const ctrl      = require("../controllers/blogsController");

router.get(    "/",      ctrl.getAll);
router.get(    "/:slug", ctrl.getBySlug);
router.post(   "/",      ctrl.create);
router.put(    "/:id",   ctrl.update);
router.delete( "/:id",   ctrl.remove);

module.exports = router;
