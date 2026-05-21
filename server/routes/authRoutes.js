// ============================================
// File:    authRoutes.js
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Handles authentication, email verification, session, and password reset endpoints.
// ============================================

const express = require("express");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const pool = require("../config/db");
const { hashPassword, verifyPassword } = require("../utils/passwords");
const { createAuthToken } = require("../utils/authTokens");
const { AUTH_COOKIE_NAME, requireAuth } = require("../middleware/auth");
const { authRateLimit, clearAuthRateLimit } = require("../middleware/security");
const { validateBody } = require("../middleware/validate");
const { sendPasswordResetEmail, sendVerificationEmail } = require("../services/emailService");
const {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} = require("../validation/schemas");

const router = express.Router();
const registrationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: "Too many registration attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Converts a database role value into the frontend-facing role name.
 * @param {string} dbRole - Role value stored in the database.
 * @returns {string} Normalized role string for API responses.
 */
function toClientRole(dbRole) {
  return dbRole === "organiser" ? "organizer" : dbRole;
}

/**
 * Converts a frontend role value into the role name stored in MySQL.
 * @param {string} clientRole - Role value supplied by the client.
 * @returns {string} Normalized role string for database writes.
 */
function toDbRole(clientRole) {
  return clientRole === "organizer" ? "organiser" : clientRole;
}

/**
 * Maps a user row from MySQL into the API response shape.
 * @param {object} row - Raw user row returned from the database.
 * @returns {{id: string, name: string, email: string, role: string}} Serialized user payload.
 */
function serializeUser(row) {
  return {
    id: String(row.user_id),
    name: row.full_name,
    email: row.email,
    role: toClientRole(row.role),
  };
}

/**
 * Hashes a verification or password-reset token before persistence.
 * @param {string} token - Plain-text token sent to the user.
 * @returns {string} SHA-256 token hash.
 */
function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Asynchronously generates a cryptographically secure random token.
 * @param {number} size - Number of random bytes to generate.
 * @returns {Promise<string>} Hex-encoded token.
 */
async function createRandomHexToken(size = 32) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(size, (err, buf) => (
      err ? reject(err) : resolve(buf.toString("hex"))
    ));
  });
}

/**
 * Builds the password reset URL included in reset emails.
 * @param {string} token - Plain-text password reset token.
 * @returns {string} Fully-qualified reset URL.
 */
function getResetPasswordUrl(token) {
  const baseUrl = process.env.RESET_PASSWORD_URL_BASE;

  if (!baseUrl) {
    throw new Error("RESET_PASSWORD_URL_BASE is not configured");
  }

  const url = new URL("/reset-password", baseUrl);
  url.searchParams.set("token", token);
  return url.toString();
}

/**
 * Builds the email verification URL included in verification emails.
 * @param {string} token - Plain-text email verification token.
 * @returns {string} Fully-qualified verification URL.
 */
function getVerifyEmailUrl(token) {
  const baseUrl = process.env.VERIFY_EMAIL_URL_BASE;

  if (!baseUrl) {
    throw new Error("VERIFY_EMAIL_URL_BASE is not configured");
  }

  const url = new URL("/verify-email", baseUrl);
  url.searchParams.set("token", token);
  return url.toString();
}

/**
 * Asynchronously loads a user record by primary key.
 * @param {number|string} userId - User identifier to fetch.
 * @returns {Promise<object|null>} Matching database row or null when not found.
 */
async function loadUserById(userId) {
  try {
    const [rows] = await pool.query(
      "SELECT user_id, full_name, email, role FROM users WHERE user_id = ? LIMIT 1",
      [userId]
    );

    return rows[0] || null;
  } catch (error) {
    console.error("[loadUserById] Failed:", error.message);
    throw error;
  }
}

/**
 * Asynchronously verifies a Cloudflare Turnstile token with the verification API.
 * @param {string} token - Client-side Turnstile token.
 * @param {string} remoteIp - Request IP address forwarded to Turnstile.
 * @returns {Promise<boolean>} True when the token is accepted by Cloudflare.
 */
async function verifyTurnstileToken(token, remoteIp) {
  try {
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
  } catch (error) {
    console.error("[verifyTurnstileToken] Failed:", error.message);
    throw error;
  }
}

/**
 * Returns the standard cookie options used for the auth session cookie.
 * @returns {object} Cookie configuration shared by auth routes.
 */
function getAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

/**
 * Attaches the signed auth token to the HTTP-only session cookie.
 * @param {import("express").Response} res - Express response object.
 * @param {string} token - Signed authentication token.
 * @returns {void} Does not return a value.
 */
function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
}

/**
 * Clears the HTTP-only auth cookie during logout or session reset.
 * @param {import("express").Response} res - Express response object.
 * @returns {void} Does not return a value.
 */
function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

/**
 * Asynchronously registers a new student or organizer account and sends a verification email.
 * @param {import("express").Request} req - Express request containing registration data.
 * @param {import("express").Response} res - Express response used to return the registration outcome.
 * @returns {Promise<import("express").Response>} JSON response describing the registration result.
 */
router.post("/register", registrationRateLimit, authRateLimit, validateBody(registerSchema), async (req, res) => {
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

    const verificationToken = await createRandomHexToken(32);
    const verificationTokenHash = hashResetToken(verificationToken);
    const verificationUrl = getVerifyEmailUrl(verificationToken);
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      "INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
      [result.insertId, verificationTokenHash, verificationExpiresAt]
    );

    const { error: emailError } = await sendVerificationEmail({
      to: normalizedEmail,
      verificationUrl,
      idempotencyKey: `verify-email/${result.insertId}/${verificationTokenHash.slice(0, 12)}`,
    });

    if (emailError) {
      console.error("POST /api/auth/register verification email error:", emailError);
      await pool.query("DELETE FROM email_verifications WHERE user_id = ?", [result.insertId]);
      await pool.query("DELETE FROM users WHERE user_id = ?", [result.insertId]);
      return res.status(500).json({ error: "Failed to send verification email" });
    }

    clearAuthRateLimit(req);
    return res.status(201).json({
      message: "Registration successful. Please check your email to verify your account before logging in.",
    });
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return res.status(500).json({ error: "Failed to register user" });
  }
});

/**
 * Asynchronously authenticates a verified user and sets the session cookie.
 * @param {import("express").Request} req - Express request containing login credentials.
 * @param {import("express").Response} res - Express response used to return the authenticated user.
 * @returns {Promise<import("express").Response>} JSON response containing the signed-in user or an error.
 */
router.post("/login", authRateLimit, validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const [rows] = await pool.query(
      "SELECT user_id, full_name, email, role, password_hash, email_verified_at FROM users WHERE email = ? LIMIT 1",
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

    if (!user.email_verified_at) {
      return res.status(403).json({ error: "Please verify your email address before logging in" });
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

/**
 * Asynchronously creates a password reset token and sends the reset email when the account exists.
 * @param {import("express").Request} req - Express request containing the submitted email address.
 * @param {import("express").Response} res - Express response used to return a generic reset message.
 * @returns {Promise<import("express").Response>} JSON response acknowledging the reset request.
 */
router.post("/forgot-password", authRateLimit, validateBody(forgotPasswordSchema), async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  if (email.length > 150) {
    return res.status(400).json({ error: "Email is too long" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT user_id, email FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    const user = rows[0];
    if (!user) {
      return res.json({ message: "If an account exists for that email, a reset link has been sent." });
    }

    const token = await createRandomHexToken(32);
    const tokenHash = hashResetToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const resetUrl = getResetPasswordUrl(token);

    await pool.query("DELETE FROM password_resets WHERE user_id = ?", [user.user_id]);
    await pool.query(
      "INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
      [user.user_id, tokenHash, expiresAt]
    );

    const { error } = await sendPasswordResetEmail({
      to: user.email,
      resetUrl,
      idempotencyKey: `password-reset/${user.user_id}/${tokenHash.slice(0, 12)}`,
    });

    if (error) {
      console.error("POST /api/auth/forgot-password email error:", error);
      return res.status(500).json({ error: "Failed to send password reset email" });
    }

    return res.json({ message: "If an account exists for that email, a reset link has been sent." });
  } catch (error) {
    console.error("POST /api/auth/forgot-password error:", error);
    return res.status(500).json({ error: "Failed to process password reset request" });
  }
});

/**
 * Asynchronously verifies an email verification token and marks the account as verified.
 * @param {import("express").Request} req - Express request containing the verification token.
 * @param {import("express").Response} res - Express response used to confirm verification.
 * @returns {Promise<import("express").Response>} JSON response describing the verification outcome.
 */
router.post("/verify-email", authRateLimit, validateBody(verifyEmailSchema), async (req, res) => {
  const token = String(req.body?.token || "").trim();

  if (!token) {
    return res.status(400).json({ error: "Verification token is required" });
  }

  try {
    const tokenHash = hashResetToken(token);
    const [rows] = await pool.query(
      `SELECT verification_id, user_id
       FROM email_verifications
       WHERE token_hash = ?
         AND used_at IS NULL
         AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [tokenHash]
    );

    const verificationRow = rows[0];
    if (!verificationRow) {
      return res.status(400).json({ error: "Verification link is invalid or has expired" });
    }

    await pool.query("UPDATE users SET email_verified_at = NOW() WHERE user_id = ?", [
      verificationRow.user_id,
    ]);
    await pool.query("UPDATE email_verifications SET used_at = NOW() WHERE verification_id = ?", [
      verificationRow.verification_id,
    ]);
    await pool.query(
      "DELETE FROM email_verifications WHERE user_id = ? AND verification_id <> ?",
      [verificationRow.user_id, verificationRow.verification_id]
    );

    return res.json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error("POST /api/auth/verify-email error:", error);
    return res.status(500).json({ error: "Failed to verify email" });
  }
});

/**
 * Asynchronously resets a user's password when the supplied reset token is still valid.
 * @param {import("express").Request} req - Express request containing the reset token and new password.
 * @param {import("express").Response} res - Express response used to report the reset result.
 * @returns {Promise<import("express").Response>} JSON response describing the password reset outcome.
 */
router.post("/reset-password", authRateLimit, validateBody(resetPasswordSchema), async (req, res) => {
  const token = String(req.body?.token || "").trim();
  const password = String(req.body?.password || "");

  if (!token || !password) {
    return res.status(400).json({ error: "Token and password are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  try {
    const tokenHash = hashResetToken(token);
    const [rows] = await pool.query(
      `SELECT reset_id, user_id
       FROM password_resets
       WHERE token_hash = ?
         AND used_at IS NULL
         AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [tokenHash]
    );

    const resetRow = rows[0];
    if (!resetRow) {
      return res.status(400).json({ error: "Reset link is invalid or has expired" });
    }

    const nextPasswordHash = await hashPassword(password);

    await pool.query("UPDATE users SET password_hash = ? WHERE user_id = ?", [
      nextPasswordHash,
      resetRow.user_id,
    ]);
    await pool.query("UPDATE password_resets SET used_at = NOW() WHERE reset_id = ?", [
      resetRow.reset_id,
    ]);
    await pool.query(
      "DELETE FROM password_resets WHERE user_id = ? AND reset_id <> ?",
      [resetRow.user_id, resetRow.reset_id]
    );

    return res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("POST /api/auth/reset-password error:", error);
    return res.status(500).json({ error: "Failed to reset password" });
  }
});

/**
 * Asynchronously returns the authenticated user's current session profile.
 * @param {import("express").Request} req - Authenticated Express request.
 * @param {import("express").Response} res - Express response used to return the current user.
 * @returns {Promise<import("express").Response>} JSON response containing the current user.
 */
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

/**
 * Clears the auth cookie and ends the current session.
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response used to return the logout result.
 * @returns {import("express").Response} Empty response confirming logout.
 */
router.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  return res.status(204).send();
});

module.exports = router;
