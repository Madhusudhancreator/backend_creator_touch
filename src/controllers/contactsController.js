const repo = require("../repositories/contactsRepository");

/** GET /api/contact — all submissions (admin) */
async function getAll(req, res, next) {
  try {
    const contacts = await repo.findAll();
    res.json(contacts);
  } catch (err) {
    next(err);
  }
}

/** POST /api/contact — submit contact form (public) */
async function create(req, res, next) {
  try {
    const { full_name, phone, email, service, budget, message } = req.body;

    if (!full_name || typeof full_name !== "string") {
      return next({ status: 400, message: "`full_name` is required." });
    }
    if (!email || typeof email !== "string") {
      return next({ status: 400, message: "`email` is required." });
    }
    if (!message || typeof message !== "string") {
      return next({ status: 400, message: "`message` is required." });
    }

    const contact = await repo.create({ full_name, phone, email, service, budget, message });
    res.status(201).json(contact);
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/contact/:id/read — toggle read flag (admin) */
async function setRead(req, res, next) {
  try {
    const id   = parseInt(req.params.id, 10);
    if (isNaN(id)) return next({ status: 400, message: "Invalid id." });

    const { read } = req.body;
    const result = await repo.markRead(id, read === true);
    if (!result) return next({ status: 404, message: `Contact ${id} not found.` });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/contact/:id — delete (admin) */
async function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return next({ status: 400, message: "Invalid id." });

    const deleted = await repo.remove(id);
    if (!deleted) return next({ status: 404, message: `Contact ${id} not found.` });
    res.json({ message: "Deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, create, setRead, remove };
