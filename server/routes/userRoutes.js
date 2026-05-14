const express = require("express");
const pool = require("../config/db");
const { requireAuth, requireRole, requireUnlock } = require("../middleware/auth");
const { adminRateLimit } = require("../middleware/security");
const { validateBody } = require("../middleware/validate");
const { hashPassword, verifyPassword } = require("../utils/passwords");
const {
  adminUserUpdateSchema,
  passwordUpdateSchema,
  profileUpdateSchema,
} = require("../validation/schemas");

const router = express.Router();

function toClientRole(dbRole) {
  return dbRole === "organiser" ? "organizer" : dbRole;
}

function toDbRole(clientRole) {
  return clientRole === "organizer" ? "organiser" : clientRole;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function countAdmins() {
  try {
    const [[row]] = await pool.query(
      "SELECT COUNT(*) AS count FROM users WHERE role = 'admin'"
    );

    return Number(row.count || 0);
  } catch (error) {
    console.error("[countAdmins] Failed:", error.message);
    throw error;
  }
}

router.patch("/me", requireAuth, validateBody(profileUpdateSchema), async (req, res) => {
  const fullName = String(req.body?.full_name || "").trim();
  const normalizedEmail = String(req.body?.email || "").trim().toLowerCase();

  if (!fullName) {
    return res.status(400).json({ error: "Full name is required" });
  }

  if (fullName.length > 100) {
    return res.status(400).json({ error: "Full name is too long" });
  }

  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    return res.status(400).json({ error: "A valid email address is required" });
  }

  if (normalizedEmail.length > 150) {
    return res.status(400).json({ error: "Email is too long" });
  }

  try {
    const [conflictRows] = await pool.query(
      "SELECT user_id FROM users WHERE email = ? AND user_id <> ? LIMIT 1",
      [normalizedEmail, req.user.id]
    );

    if (conflictRows[0]) {
      return res.status(400).json({ error: "Email address is already in use" });
    }

    await pool.query(
      "UPDATE users SET full_name = ?, email = ? WHERE user_id = ?",
      [fullName, normalizedEmail, req.user.id]
    );

    const [rows] = await pool.query(
      `SELECT
         CAST(user_id AS CHAR) AS id,
         full_name AS name,
         email,
         role
       FROM users
       WHERE user_id = ?
       LIMIT 1`,
      [req.user.id]
    );

    const row = rows[0];
    return res.json({ ...row, role: toClientRole(row.role) });
  } catch (error) {
    console.error("PATCH /api/users/me error:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

router.patch("/me/password", requireAuth, validateBody(passwordUpdateSchema), async (req, res) => {
  const currentPassword = String(req.body?.currentPassword || "");
  const newPassword = String(req.body?.newPassword || "");

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current password and new password are required" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters long" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT password_hash FROM users WHERE user_id = ? LIMIT 1",
      [req.user.id]
    );

    const userRow = rows[0];
    if (!userRow) {
      return res.status(404).json({ error: "User not found" });
    }

    const isCurrentPasswordValid = await verifyPassword(currentPassword, userRow.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const nextPasswordHash = await hashPassword(newPassword);
    await pool.query(
      "UPDATE users SET password_hash = ? WHERE user_id = ?",
      [nextPasswordHash, req.user.id]
    );

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("PATCH /api/users/me/password error:", error);
    return res.status(500).json({ error: "Failed to update password" });
  }
});

router.get("/", requireAuth, requireRole("admin"), adminRateLimit, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         CAST(user_id AS CHAR) AS id,
         full_name AS name,
         email,
         role,
         'active' AS status,
         DATE_FORMAT(created_at, '%Y-%m-%d') AS joinedDate
       FROM users
       ORDER BY created_at DESC`
    );

    return res.json(rows.map((row) => ({ ...row, role: toClientRole(row.role) })));
  } catch (error) {
    console.error("GET /api/users error:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.put("/:id", requireAuth, requireRole("admin"), adminRateLimit, validateBody(adminUserUpdateSchema), async (req, res) => {
  const { name, email, role } = req.body;

  if (!name || !email || !role || !["student", "organizer", "admin"].includes(role)) {
    return res.status(400).json({ error: "Valid name, email, and role are required" });
  }

  if (String(name).trim().length > 100) {
    return res.status(400).json({ error: "Name is too long" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (normalizedEmail.length > 150) {
    return res.status(400).json({ error: "Email is too long" });
  }

  try {
    const [existingRows] = await pool.query(
      "SELECT user_id, role FROM users WHERE user_id = ? LIMIT 1",
      [req.params.id]
    );

    const existingUser = existingRows[0];
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const changingAwayFromAdmin =
      existingUser.role === "admin" && toDbRole(role) !== "admin";

    if (changingAwayFromAdmin && await countAdmins() <= 1) {
      return res.status(400).json({ error: "You cannot remove the last admin account" });
    }

    const [result] = await pool.query(
      "UPDATE users SET full_name = ?, email = ?, role = ? WHERE user_id = ?",
      [name.trim(), normalizedEmail, toDbRole(role), req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: "User not found" });
    }

    const [rows] = await pool.query(
      `SELECT
         CAST(user_id AS CHAR) AS id,
         full_name AS name,
         email,
         role,
         'active' AS status,
         DATE_FORMAT(created_at, '%Y-%m-%d') AS joinedDate
       FROM users
       WHERE user_id = ?
       LIMIT 1`,
      [req.params.id]
    );

    const row = rows[0];
    return res.json({ ...row, role: toClientRole(row.role) });
  } catch (error) {
    console.error("PUT /api/users/:id error:", error);
    return res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/:id", requireAuth, requireRole("admin"), requireUnlock, adminRateLimit, async (req, res) => {
  if (String(req.user.id) === String(req.params.id)) {
    return res.status(400).json({ error: "You cannot delete your own admin account" });
  }

  try {
    const [existingRows] = await pool.query(
      "SELECT role FROM users WHERE user_id = ? LIMIT 1",
      [req.params.id]
    );

    const existingUser = existingRows[0];
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (existingUser.role === "admin" && await countAdmins() <= 1) {
      return res.status(400).json({ error: "You cannot delete the last admin account" });
    }

    const [result] = await pool.query("DELETE FROM users WHERE user_id = ?", [req.params.id]);

    if (!result.affectedRows) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ message: "User deleted" });
  } catch (error) {
    console.error("DELETE /api/users/:id error:", error);
    return res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
