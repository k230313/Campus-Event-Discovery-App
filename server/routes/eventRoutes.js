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

module.exports = router;
