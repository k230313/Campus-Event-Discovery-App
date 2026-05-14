const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { doubleCsrf } = require("csrf-csrf");
require("dotenv").config();
const pool = require("./config/db");
const eventRoutes = require("./routes/eventRoutes");
const authRoutes = require("./routes/authRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { attachUser } = require("./middleware/auth");
const { getSecret } = require("./utils/authTokens");
const { corsOptions, securityHeaders } = require("./middleware/security");

const app = express();
const authSecret = getSecret();

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => authSecret,
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

app.use((err, _req, res, _next) => {
  console.error("Unhandled server error:", err);
  res.status(err.status || 500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
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
