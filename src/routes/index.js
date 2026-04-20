const router          = require("express").Router();
const blogsRouter     = require("./blogs");
const contactsRouter  = require("./contacts");
const authRouter      = require("./auth");
const usersRouter     = require("./users");

router.get("/health", (_req, res) => res.json({ status: "ok" }));

router.use("/blogs",   blogsRouter);
router.use("/contact", contactsRouter);
router.use("/auth",    authRouter);
router.use("/users",   usersRouter);

module.exports = router;
