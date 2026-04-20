const express      = require("express");
const cors         = require("cors");
const path         = require("path");
const routes       = require("./routes/index");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

const ALLOWED_ORIGINS = [
  "http://localhost:3000",   // frontend dev
  "http://localhost:3001",   // admin dev
  "https://admin-creators-touch.vercel.app",
  "https://creators-touch.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server / curl / Postman (no origin header)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' is not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api", routes);

// Must be last — catches errors forwarded via next(err)
app.use(errorHandler);

module.exports = app;
