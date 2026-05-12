const pool = require("../config/db");
const { verifyAuthToken } = require("../utils/authTokens");

function toClientRole(dbRole) {
  return dbRole === "organiser" ? "organizer" : dbRole;
}

async function attachUser(req, _res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

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

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return next();
}

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

module.exports = {
  attachUser,
  requireAuth,
  requireRole,
};
