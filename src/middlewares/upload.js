const multer = require("multer");
const path   = require("path");
const crypto = require("crypto");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../uploads"),
  filename(_req, file, cb) {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = crypto.randomBytes(12).toString("hex");
    cb(null, `${name}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const allowed = /^image\/(jpeg|png|gif|webp|svg\+xml)$/;
  cb(null, allowed.test(file.mimetype));
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

module.exports = upload;
