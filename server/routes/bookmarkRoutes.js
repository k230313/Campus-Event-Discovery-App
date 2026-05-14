const express = require("express");
const pool = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { generalWriteRateLimit } = require("../middleware/security");

const router = express.Router();

router.get("/", requireAuth, requireRole("student", "organizer"), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT CAST(student_id AS CHAR) AS userId, CAST(event_id AS CHAR) AS eventId, DATE_FORMAT(saved_at, '%Y-%m-%dT%H:%i:%sZ') AS savedAt
       FROM bookmarks
       WHERE student_id = ?
       ORDER BY saved_at DESC`,
      [req.user.id]
    );

    return res.json(rows);
  } catch (error) {
    console.error("GET /api/bookmarks error:", error);
    return res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

router.post("/", requireAuth, requireRole("student", "organizer"), generalWriteRateLimit, async (req, res) => {
  const { eventId } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: "eventId is required" });
  }

  try {
    const [eventRows] = await pool.query(
      "SELECT event_id FROM events WHERE event_id = ? AND status = 'published' LIMIT 1",
      [eventId]
    );

    if (!eventRows.length) {
      return res.status(404).json({ error: "Published event not found" });
    }

    await pool.query(
      "INSERT IGNORE INTO bookmarks (student_id, event_id) VALUES (?, ?)",
      [req.user.id, eventId]
    );

    const [rows] = await pool.query(
      `SELECT CAST(student_id AS CHAR) AS userId, CAST(event_id AS CHAR) AS eventId, DATE_FORMAT(saved_at, '%Y-%m-%dT%H:%i:%sZ') AS savedAt
       FROM bookmarks
       WHERE student_id = ? AND event_id = ?
       LIMIT 1`,
      [req.user.id, eventId]
    );

    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error("POST /api/bookmarks error:", error);
    return res.status(500).json({ error: "Failed to save bookmark" });
  }
});

router.delete("/:eventId", requireAuth, requireRole("student", "organizer"), generalWriteRateLimit, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM bookmarks WHERE student_id = ? AND event_id = ?",
      [req.user.id, req.params.eventId]
    );

    return res.json({ message: "Bookmark removed" });
  } catch (error) {
    console.error("DELETE /api/bookmarks/:eventId error:", error);
    return res.status(500).json({ error: "Failed to remove bookmark" });
  }
});

module.exports = router;
