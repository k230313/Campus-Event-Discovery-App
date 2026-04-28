const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { eventFields } = require("../models/eventModel");
const validateEvent = require("../validation/eventValidation");

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM events ORDER BY date ASC");
    return res.json(rows);
  } catch (error) {
    console.error("GET /api/events error:", error);
    return res.status(500).json({ error: "Failed to fetch events" });
  }
});

router.get("/schema", (req, res) => {
  res.json(eventFields);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query("SELECT * FROM events WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("GET /api/events/:id error:", error);
    return res.status(500).json({ error: "Failed to fetch event" });
  }
});

router.post("/", async (req, res) => {
  const { isValid, errors } = validateEvent(req.body);

  if (!isValid) {
    return res.status(400).json({ errors });
  }

  const { title, description, date, location, category } = req.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO events (title, description, date, location, category) VALUES (?, ?, ?, ?, ?)",
      [title, description, date, location, category]
    );

    return res.status(201).json({
      id: result.insertId,
      title,
      description,
      date,
      location,
      category
    });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return res.status(500).json({ error: "Failed to create event" });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { isValid, errors } = validateEvent(req.body);

  if (!isValid) {
    return res.status(400).json({ errors });
  }

  const { title, description, date, location, category } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE events SET title = ?, description = ?, date = ?, location = ?, category = ? WHERE id = ?",
      [title, description, date, location, category, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    return res.json({
      id: Number(id),
      title,
      description,
      date,
      location,
      category
    });
  } catch (error) {
    console.error("PUT /api/events/:id error:", error);
    return res.status(500).json({ error: "Failed to update event" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM events WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    return res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/events/:id error:", error);
    return res.status(500).json({ error: "Failed to delete event" });
  }
});

module.exports = router;
