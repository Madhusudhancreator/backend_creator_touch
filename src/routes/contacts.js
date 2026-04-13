/**
 * Contacts router — mounted at /api/contact
 *
 * Public:
 *   POST /api/contact          → submit contact form
 *
 * Protected (x-admin-key):
 *   GET    /api/contact        → all submissions
 *   PATCH  /api/contact/:id/read → mark read/unread
 *   DELETE /api/contact/:id    → delete submission
 */

const router    = require("express").Router();
const adminAuth = require("../middlewares/adminAuth");
const ctrl      = require("../controllers/contactsController");

router.post(  "/",           ctrl.create);
router.get(   "/",           ctrl.getAll);
router.patch( "/:id/read",   ctrl.setRead);
router.delete("/:id",        ctrl.remove);

module.exports = router;
