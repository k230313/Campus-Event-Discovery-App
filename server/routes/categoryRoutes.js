const express = require("express");
const pool = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { adminRateLimit } = require("../middleware/security");
const { validateBody } = require("../middleware/validate");
const { categorySchema } = require("../validation/schemas");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         CAST(c.category_id AS CHAR) AS id,
         c.name,
         COUNT(e.event_id) AS eventCount
       FROM categories c
       LEFT JOIN events e ON e.category_id = c.category_id
       GROUP BY c.category_id, c.name
       ORDER BY c.name ASC`
    );

    return res.json(rows.map((row) => ({
      ...row,
      eventCount: Number(row.eventCount || 0),
    })));
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.post("/", requireAuth, requireRole("admin"), adminRateLimit, validateBody(categorySchema), async (req, res) => {
  const { name } = req.body;

  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "Category name is required" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO categories (name) VALUES (?)",
      [String(name).trim()]
    );

    const [rows] = await pool.query(
      `SELECT CAST(category_id AS CHAR) AS id, name, 0 AS eventCount
       FROM categories
       WHERE category_id = ?
       LIMIT 1`,
      [result.insertId]
    );

    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error("POST /api/categories error:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Category already exists" });
    }
    return res.status(500).json({ error: "Failed to create category" });
  }
});

router.put("/:id", requireAuth, requireRole("admin"), adminRateLimit, validateBody(categorySchema), async (req, res) => {
  const { name } = req.body;

  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "Category name is required" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE categories SET name = ? WHERE category_id = ?",
      [String(name).trim(), req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Category not found" });
    }

    const [rows] = await pool.query(
      `SELECT
         CAST(c.category_id AS CHAR) AS id,
         c.name,
         COUNT(e.event_id) AS eventCount
       FROM categories c
       LEFT JOIN events e ON e.category_id = c.category_id
       WHERE c.category_id = ?
       GROUP BY c.category_id, c.name
       LIMIT 1`,
      [req.params.id]
    );

    return res.json({
      ...rows[0],
      eventCount: Number(rows[0].eventCount || 0),
    });
  } catch (error) {
    console.error("PUT /api/categories/:id error:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Category already exists" });
    }
    return res.status(500).json({ error: "Failed to update category" });
  }
});

router.delete("/:id", requireAuth, requireRole("admin"), adminRateLimit, async (req, res) => {
  try {
    const [countRows] = await pool.query(
      "SELECT COUNT(*) AS count FROM events WHERE category_id = ?",
      [req.params.id]
    );

    if (Number(countRows[0].count || 0) > 0) {
      return res.status(409).json({ error: "Cannot delete a category that is used by events" });
    }

    const [result] = await pool.query("DELETE FROM categories WHERE category_id = ?", [req.params.id]);

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.json({ message: "Category deleted" });
  } catch (error) {
    console.error("DELETE /api/categories/:id error:", error);
    return res.status(500).json({ error: "Failed to delete category" });
  }
});

module.exports = router;
