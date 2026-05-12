const express = require("express");
const pool = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

function toClientRole(dbRole) {
  return dbRole === "organiser" ? "organizer" : dbRole;
}

function toDbRole(clientRole) {
  return clientRole === "organizer" ? "organiser" : clientRole;
}

router.get("/", requireAuth, requireRole("admin"), async (_req, res) => {
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

router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { name, email, role } = req.body;

  if (!name || !email || !role || !["student", "organizer", "admin"].includes(role)) {
    return res.status(400).json({ error: "Valid name, email, and role are required" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE users SET full_name = ?, email = ?, role = ? WHERE user_id = ?",
      [name.trim(), String(email).trim().toLowerCase(), toDbRole(role), req.params.id]
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

router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  if (String(req.user.id) === String(req.params.id)) {
    return res.status(400).json({ error: "You cannot delete your own admin account" });
  }

  try {
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
