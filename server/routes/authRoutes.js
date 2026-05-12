const express = require("express");
const pool = require("../config/db");
const { hashPassword, verifyPassword } = require("../utils/passwords");
const { createAuthToken } = require("../utils/authTokens");
const { AUTH_COOKIE_NAME, requireAuth } = require("../middleware/auth");
const { authRateLimit, clearAuthRateLimit } = require("../middleware/security");

const router = express.Router();

function toClientRole(dbRole) {
  return dbRole === "organiser" ? "organizer" : dbRole;
}

function toDbRole(clientRole) {
  return clientRole === "organizer" ? "organiser" : clientRole;
}

function serializeUser(row) {
  return {
    id: String(row.user_id),
    name: row.full_name,
    email: row.email,
    role: toClientRole(row.role),
  };
}

async function loadUserById(userId) {
  const [rows] = await pool.query(
    "SELECT user_id, full_name, email, role FROM users WHERE user_id = ? LIMIT 1",
    [userId]
  );

  return rows[0] || null;
}

async function verifyTurnstileToken(token, remoteIp) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    throw new Error("TURNSTILE_SECRET_KEY is not configured");
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      secret,
      response: token,
      remoteip: remoteIp || "",
    }),
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return Boolean(data.success);
}

function getAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
}

function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

router.post("/register", authRateLimit, async (req, res) => {
  const { name, email, password, role, turnstileToken } = req.body;

  if (!name || !email || !password || !role || !turnstileToken) {
    return res.status(400).json({ error: "Name, email, password, role, and captcha verification are required" });
  }

  if (!["student", "organizer"].includes(role)) {
    return res.status(400).json({ error: "Invalid registration role" });
  }

  if (String(name).trim().length > 100) {
    return res.status(400).json({ error: "Name is too long" });
  }

  if (String(email).trim().length > 150) {
    return res.status(400).json({ error: "Email is too long" });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    const turnstileValid = await verifyTurnstileToken(
      String(turnstileToken),
      req.ip || req.socket?.remoteAddress || ""
    );

    if (!turnstileValid) {
      return res.status(400).json({ error: "Captcha verification failed" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const [existingRows] = await pool.query(
      "SELECT user_id FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );

    if (existingRows.length) {
      return res.status(409).json({ error: "An account with that email already exists" });
    }

    const passwordHash = await hashPassword(password);
    const [result] = await pool.query(
      "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name.trim(), normalizedEmail, passwordHash, toDbRole(role)]
    );

    const user = await loadUserById(result.insertId);
    const token = createAuthToken({ userId: user.user_id });
    setAuthCookie(res, token);
    clearAuthRateLimit(req);
    return res.status(201).json({ user: serializeUser(user) });
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return res.status(500).json({ error: "Failed to register user" });
  }
});

router.post("/login", authRateLimit, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const [rows] = await pool.query(
      "SELECT user_id, full_name, email, role, password_hash FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatches = await verifyPassword(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = createAuthToken({ userId: user.user_id });
    setAuthCookie(res, token);
    clearAuthRateLimit(req);
    return res.json({ user: serializeUser(user) });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return res.status(500).json({ error: "Failed to log in" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await loadUserById(req.user.id);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    return res.json({ user: serializeUser(user) });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return res.status(500).json({ error: "Failed to load current user" });
  }
});

router.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  return res.status(204).send();
});

module.exports = router;
