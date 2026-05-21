// ============================================
// File:    auth.js
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Implements auth for the backend.
// ============================================

const crypto = require("crypto");
const pool = require("../config/db");
const { verifyAuthToken } = require("../utils/authTokens");
const AUTH_COOKIE_NAME = "ceda_auth";
const ADMIN_UNLOCK_TTL_MS = 30 * 60 * 1000;

/**
 * Executes the to client role logic.
 * @param {*} dbRole - Represents the dbRole input.
 * @returns {*} Returns the resulting value.
 */
function toClientRole(dbRole) {
  return dbRole === "organiser" ? "organizer" : dbRole;
}

/**
 * Executes the get auth token from request logic.
 * @param {*} req - Represents the req input.
 * @returns {*} Returns the resulting value.
 */
function getAuthTokenFromRequest(req) {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookieHeader = req.headers.cookie || "";
  const cookies = cookieHeader.split(";").map((value) => value.trim());
  const authCookie = cookies.find((entry) => entry.startsWith(`${AUTH_COOKIE_NAME}=`));

  if (!authCookie) {
    return null;
  }

  return decodeURIComponent(authCookie.slice(AUTH_COOKIE_NAME.length + 1));
}

/**
 * Asynchronously executes the attach user logic.
 * @param {*} req - Represents the req input.
 * @param {*} _res - Represents the _res input.
 * @param {*} next - Represents the next input.
 * @returns {*} Returns the resulting value.
 */
async function attachUser(req, _res, next) {
  const token = getAuthTokenFromRequest(req);

  if (!token) {
    req.user = null;
    next();
    return;
  }

  const payload = verifyAuthToken(token);
  if (!payload?.userId) {
    req.user = null;
    next();
    return;
  }

  try {
    const [rows] = await pool.query(
      "SELECT user_id, full_name, email, role FROM users WHERE user_id = ? LIMIT 1",
      [payload.userId]
    );

    const row = rows[0];
    req.user = row
      ? {
          id: row.user_id,
          name: row.full_name,
          email: row.email,
          role: toClientRole(row.role),
        }
      : null;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Executes the require auth logic.
 * @param {*} req - Represents the req input.
 * @param {*} res - Represents the res input.
 * @param {*} next - Represents the next input.
 * @returns {*} Returns the resulting value.
 */
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return next();
}

/**
 * Executes the require role logic.
 * @param {*} roles - Represents the roles input.
 * @returns {*} Returns the resulting value.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return next();
  };
}

/**
 * Executes the get unlock token from request logic.
 * @param {*} req - Represents the req input.
 * @returns {*} Returns the resulting value.
 */
function getUnlockTokenFromRequest(req) {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Unlock ")) {
    return authHeader.slice(7);
  }

  if (typeof req.body?.unlockToken === "string" && req.body.unlockToken.trim()) {
    return req.body.unlockToken.trim();
  }

  return null;
}

/**
 * Asynchronously executes the require unlock logic.
 * @param {*} req - Represents the req input.
 * @param {*} res - Represents the res input.
 * @param {*} next - Represents the next input.
 * @returns {*} Returns the resulting value.
 */
async function requireUnlock(req, res, next) {
  const token = getUnlockTokenFromRequest(req);
  const payload = verifyAuthToken(token);
  const tokenType = payload?.type;
  const issuedAt = Number(payload?.iat);

  if (!payload?.adminUnlock || tokenType !== "adminUnlock") {
    return res.status(403).json({ error: "Admin unlock required" });
  }

  if (Date.now() - issuedAt >= ADMIN_UNLOCK_TTL_MS) {
    return res.status(401).json({ error: "Admin unlock token has expired" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT token FROM used_unlock_tokens WHERE token = ?",
      [token]
    );

    if (rows.length > 0) {
      return res.status(401).json({ error: "Token already used" });
    }

    await pool.query(
      "INSERT INTO used_unlock_tokens (token) VALUES (?)",
      [token]
    );

    await pool.query(
      "DELETE FROM used_unlock_tokens WHERE used_at < DATE_SUB(NOW(), INTERVAL 1 HOUR)"
    );

    return next();
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      return res.status(401).json({ error: "Token already used" });
    }

    return next(error);
  }
}

module.exports = {
  ADMIN_UNLOCK_TTL_MS,
  AUTH_COOKIE_NAME,
  attachUser,
  getAuthTokenFromRequest,
  getUnlockTokenFromRequest,
  requireAuth,
  requireRole,
  requireUnlock,
};
