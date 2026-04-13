const router          = require("express").Router();
const blogsRouter     = require("./blogs");
const contactsRouter  = require("./contacts");

router.get("/health", (_req, res) => res.json({ status: "ok" }));

router.use("/blogs",   blogsRouter);
router.use("/contact", contactsRouter);

module.exports = router;
