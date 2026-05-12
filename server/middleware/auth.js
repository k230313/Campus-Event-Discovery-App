const pool = require("../config/db");
const { verifyAuthToken } = require("../utils/authTokens");
const AUTH_COOKIE_NAME = "ceda_auth";

function toClientRole(dbRole) {
  return dbRole === "organiser" ? "organizer" : dbRole;
}

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
  AUTH_COOKIE_NAME,
  attachUser,
  getAuthTokenFromRequest,
  requireAuth,
  requireRole,
};
