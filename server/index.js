// ============================================
// File:    index.js
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Implements index for the backend.
// ============================================

const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { doubleCsrf } = require("csrf-csrf");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const pool = require("./config/db");
const eventRoutes = require("./routes/eventRoutes");
const authRoutes = require("./routes/authRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatRoutes = require("./routes/chatRoutes");
const { attachUser } = require("./middleware/auth");
const { getSecret } = require("./utils/authTokens");
const { getErrorBody, getErrorStatus } = require("./utils/errorHandling");
const { corsOptions, securityHeaders } = require("./middleware/security");

const app = express();
const authSecret = getSecret();

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  /**
   * Asynchronously executes the get secret logic.
   * @returns {*} Returns the resulting value.
   */
  getSecret: () => authSecret,
  /**
   * Asynchronously executes the get session identifier logic.
   * @param {*} req - Represents the req input.
   * @returns {*} Returns the resulting value.
   */
  getSessionIdentifier: (req) => (
    req.user?.id
      ? `user:${req.user.id}`
      : `guest:${req.ip || "unknown"}:${req.get("user-agent") || "unknown"}`
  ),
  cookieName: "ceda_csrf_token",
  cookieOptions: {
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  },
  /**
   * Asynchronously executes the get csrf token from request logic.
   * @param {*} req - Represents the req input.
   * @returns {*} Returns the resulting value.
   */
  getCsrfTokenFromRequest: (req) => req.headers["x-csrf-token"],
});

app.set("trust proxy", 1);

app.use(cors(corsOptions()));
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));
app.use(securityHeaders);
app.use(attachUser);
app.use(doubleCsrfProtection);

app.get("/", (req, res) => {
  res.send("API is running");
});

app.get("/api/csrf-token", (req, res) => {
  const csrfToken = generateCsrfToken(req, res, {
    overwrite: true,
  });

  res.json({ csrfToken });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);

app.use((err, _req, res, _next) => {
  console.error("Unhandled server error:", err);
  res.status(getErrorStatus(err)).json(getErrorBody(err));
});

/**
 * Executes the log transactional email config logic.
 * @returns {*} Returns the resulting value.
 */
function logTransactionalEmailConfig() {
  const missing = [];
  if (!process.env.RESEND_API_KEY?.trim()) {
    missing.push("RESEND_API_KEY");
  }
  if (!process.env.EMAIL_FROM?.trim()) {
    missing.push("EMAIL_FROM");
  }

  if (missing.length) {
    console.warn(
      `[Email] Missing ${missing.join(", ")} in server/.env — booking, verification, and password-reset emails will fail.`
    );
    return;
  }

  console.log(`[Email] Resend configured (from: ${process.env.EMAIL_FROM.trim()})`);
}

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  logTransactionalEmailConfig();
});

process.on("SIGTERM", async () => {
  console.log("[Server] SIGTERM received, shutting down gracefully...");
  server.close(async () => {
    console.log("[Server] HTTP server closed");
    try {
      await pool.end();
      console.log("[Server] Database pool closed");
      process.exit(0);
    } catch (err) {
      console.error("[Server] Error closing pool:", err.message);
      process.exit(1);
    }
  });
});

process.on("SIGINT", async () => {
  console.log("[Server] SIGINT received, shutting down gracefully...");
  server.close(async () => {
    try {
      await pool.end();
      console.log("[Server] Database pool closed");
      process.exit(0);
    } catch (err) {
      console.error("[Server] Error closing pool:", err.message);
      process.exit(1);
    }
  });
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[Server] Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
