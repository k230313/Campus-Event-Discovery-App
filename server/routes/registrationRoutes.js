const express = require("express");
const pool = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { registrationRateLimit } = require("../middleware/security");
const { validateBody } = require("../middleware/validate");
const { registrationCreateSchema } = require("../validation/schemas");
const { sendBookingConfirmationEmail } = require("../services/emailService");

const router = express.Router();

router.get("/", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         CAST(student_id AS CHAR) AS userId,
         CAST(event_id AS CHAR) AS eventId,
         'attendee' AS attendeeType,
         NULL AS selectedFoodOption,
         NULL AS seatNumber,
         DATE_FORMAT(registered_at, '%Y-%m-%dT%H:%i:%sZ') AS createdAt
       FROM registrations
       WHERE student_id = ? AND status = 'registered'
       ORDER BY registered_at DESC`,
      [req.user.id]
    );

    return res.json(rows);
  } catch (error) {
    console.error("GET /api/registrations error:", error);
    return res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

router.post("/", requireAuth, requireRole("student"), registrationRateLimit, validateBody(registrationCreateSchema), async (req, res) => {
  const { eventId } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: "eventId is required" });
  }

  try {
    const [eventRows] = await pool.query(
      `SELECT event_id, title, event_date, start_time, end_time, location, capacity, status
       FROM events
       WHERE event_id = ?
       LIMIT 1`,
      [eventId]
    );

    if (!eventRows.length) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (eventRows[0].status !== "published") {
      return res.status(403).json({ error: "Registrations are only available for published events" });
    }

    const [countRows] = await pool.query(
      "SELECT COUNT(*) AS count FROM registrations WHERE event_id = ? AND status = 'registered'",
      [eventId]
    );

    const registrationCount = Number(countRows[0].count || 0);
    const capacity = eventRows[0].capacity;
    if (capacity !== null && capacity !== undefined && registrationCount >= Number(capacity)) {
      return res.status(409).json({ error: "Event is at full capacity" });
    }

    await pool.query(
      `INSERT INTO registrations (student_id, event_id, status)
       VALUES (?, ?, 'registered')
       ON DUPLICATE KEY UPDATE status = 'registered', updated_at = CURRENT_TIMESTAMP`,
      [req.user.id, eventId]
    );

    const [rows] = await pool.query(
      `SELECT
         CAST(student_id AS CHAR) AS userId,
         CAST(event_id AS CHAR) AS eventId,
         'attendee' AS attendeeType,
         NULL AS selectedFoodOption,
         NULL AS seatNumber,
         DATE_FORMAT(registered_at, '%Y-%m-%dT%H:%i:%sZ') AS createdAt
       FROM registrations
       WHERE student_id = ? AND event_id = ? AND status = 'registered'
       LIMIT 1`,
      [req.user.id, eventId]
    );

    let confirmationEmailStatus = "failed";

    try {
      const { error } = await sendBookingConfirmationEmail({
        to: req.user.email,
        attendeeName: req.user.name,
        event: {
          id: eventRows[0].event_id,
          title: eventRows[0].title,
          date: eventRows[0].event_date,
          startTime: eventRows[0].start_time,
          endTime: eventRows[0].end_time,
          location: eventRows[0].location,
        },
        idempotencyKey: `booking/${req.user.id}/${eventRows[0].event_id}`,
      });

      if (error) {
        console.error("POST /api/registrations confirmation email error:", error);
      } else {
        confirmationEmailStatus = "sent";
      }
    } catch (emailError) {
      console.error("POST /api/registrations confirmation email failed:", emailError);
    }

    return res.status(201).json({
      ...rows[0],
      confirmationEmailStatus,
    });
  } catch (error) {
    console.error("POST /api/registrations error:", error);
    return res.status(500).json({ error: "Failed to register for event" });
  }
});

router.delete("/:eventId", requireAuth, requireRole("student"), registrationRateLimit, async (req, res) => {
  try {
    await pool.query(
      `UPDATE registrations
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE student_id = ? AND event_id = ?`,
      [req.user.id, req.params.eventId]
    );

    return res.json({ message: "Registration cancelled" });
  } catch (error) {
    console.error("DELETE /api/registrations/:eventId error:", error);
    return res.status(500).json({ error: "Failed to unregister from event" });
  }
});

module.exports = router;
