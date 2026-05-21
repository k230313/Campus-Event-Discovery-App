// ============================================
// File:    registrationRoutes.js
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Handles event registrations, attendee retrieval, waitlist flow, and notification triggers.
// ============================================

const express = require("express");
const pool = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { registrationRateLimit } = require("../middleware/security");
const { validateBody } = require("../middleware/validate");
const { registrationCreateSchema } = require("../validation/schemas");
const {
  sendBookingConfirmationEmail,
  sendOrganizerEventFullEmail,
  sendOrganizerFirstRegistrationEmail,
} = require("../services/emailService");
const { promoteWaitlistedRegistrations } = require("../utils/waitlist");

const router = express.Router();

/**
 * Determines whether a user may view the attendee list for an event.
 * @param {object} params - Inputs describing the event owner and current user.
 * @returns {boolean} True when the viewer is the owning organizer or an admin.
 */
function canAccessEventAttendees({ eventOrganizerId, user }) {
  if (!user) {
    return false;
  }

  if (user.role === "admin") {
    return true;
  }

  return user.role === "organizer" && Number(eventOrganizerId) === Number(user.id);
}

/**
 * Decides whether a registration request should confirm, waitlist, or reject the attendee.
 * @param {object} params - Inputs describing event capacity, current registrations, and waitlist intent.
 * @returns {"registered"|"waitlisted"|"full"} Registration outcome for the current request.
 */
function getRegistrationOutcome({ capacity, registrationCount, waitlistIfFull }) {
  const numericCapacity = capacity === null || capacity === undefined ? null : Number(capacity);

  if (numericCapacity === null || Number.isNaN(numericCapacity)) {
    return "registered";
  }

  if (registrationCount < numericCapacity) {
    return "registered";
  }

  return waitlistIfFull ? "waitlisted" : "full";
}

/**
 * Calculates the confirmed registration count after the current upsert is applied.
 * @param {object} params - Inputs describing previous status, current count, and next status.
 * @returns {number} Confirmed registration count after the write completes.
 */
function getRegisteredCountAfterUpsert({ previousRegistrationStatus, registrationCount, nextRegistrationStatus }) {
  if (nextRegistrationStatus !== "registered") {
    return Number(registrationCount) || 0;
  }

  if (previousRegistrationStatus === "registered") {
    return Number(registrationCount) || 0;
  }

  return (Number(registrationCount) || 0) + 1;
}

/**
 * Determines whether the current registration created the event's first confirmed attendee.
 * @param {object} params - Inputs describing counts before and after the registration.
 * @returns {boolean} True when the first-registration organizer email should be sent.
 */
function shouldSendOrganizerFirstRegistrationNotification({
  previousRegisteredCount,
  currentRegisteredCount,
}) {
  return Number(previousRegisteredCount) === 0 && Number(currentRegisteredCount) === 1;
}

/**
 * Determines whether the current registration caused the event to reach capacity.
 * @param {object} params - Inputs describing capacity and counts before and after the registration.
 * @returns {boolean} True when the event-full organizer email should be sent.
 */
function shouldSendOrganizerEventFullNotification({
  capacity,
  previousRegisteredCount,
  currentRegisteredCount,
}) {
  const numericCapacity = capacity === null || capacity === undefined ? null : Number(capacity);

  if (numericCapacity === null || Number.isNaN(numericCapacity) || numericCapacity <= 0) {
    return false;
  }

  return (
    Number(previousRegisteredCount) < numericCapacity &&
    Number(currentRegisteredCount) === numericCapacity
  );
}

/**
 * Asynchronously returns the current student's confirmed and waitlisted registrations.
 * @param {import("express").Request} req - Authenticated student request.
 * @param {import("express").Response} res - Express response used to return registrations.
 * @returns {Promise<import("express").Response>} JSON response containing the student's registrations.
 */
router.get("/", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         CAST(student_id AS CHAR) AS userId,
         CAST(event_id AS CHAR) AS eventId,
         status,
         'attendee' AS attendeeType,
         NULL AS selectedFoodOption,
         NULL AS seatNumber,
         DATE_FORMAT(registered_at, '%Y-%m-%dT%H:%i:%sZ') AS createdAt
       FROM registrations
       WHERE student_id = ? AND status IN ('registered', 'waitlisted')
       ORDER BY registered_at DESC`,
      [req.user.id]
    );

    return res.json(rows);
  } catch (error) {
    console.error("GET /api/registrations error:", error);
    return res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

/**
 * Asynchronously returns the attendee list for an organizer-owned or admin-managed event.
 * @param {import("express").Request} req - Authenticated organizer or admin request.
 * @param {import("express").Response} res - Express response used to return attendee data.
 * @returns {Promise<import("express").Response>} JSON response containing event attendees or an error.
 */
router.get("/events/:eventId/attendees", requireAuth, requireRole("organizer", "admin"), async (req, res) => {
  const { eventId } = req.params;

  try {
    const [eventRows] = await pool.query(
      `SELECT event_id, organiser_id, title
       FROM events
       WHERE event_id = ?
       LIMIT 1`,
      [eventId]
    );

    if (!eventRows.length) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (!canAccessEventAttendees({ eventOrganizerId: eventRows[0].organiser_id, user: req.user })) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const [rows] = await pool.query(
      `SELECT
         CAST(r.student_id AS CHAR) AS userId,
         u.full_name AS name,
         u.email,
         DATE_FORMAT(r.registered_at, '%Y-%m-%dT%H:%i:%sZ') AS registeredAt
       FROM registrations r
       INNER JOIN users u ON u.user_id = r.student_id
       WHERE r.event_id = ? AND r.status = 'registered'
       ORDER BY r.registered_at ASC`,
      [eventId]
    );

    return res.json({
      eventId: String(eventRows[0].event_id),
      eventTitle: eventRows[0].title,
      attendees: rows,
    });
  } catch (error) {
    console.error("GET /api/registrations/events/:eventId/attendees error:", error);
    return res.status(500).json({ error: "Failed to fetch event attendees" });
  }
});

/**
 * Asynchronously creates or updates a student's registration for a published event.
 * @param {import("express").Request} req - Authenticated student request containing registration details.
 * @param {import("express").Response} res - Express response used to return the resulting registration.
 * @returns {Promise<import("express").Response>} JSON response containing the registration outcome and email status.
 */
router.post("/", requireAuth, requireRole("student"), registrationRateLimit, validateBody(registrationCreateSchema), async (req, res) => {
  const { eventId, waitlistIfFull = false } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: "eventId is required" });
  }

  try {
    const [eventRows] = await pool.query(
      `SELECT
         e.event_id,
         e.title,
         e.event_date,
         e.start_time,
         e.end_time,
         e.location,
         e.capacity,
         e.status,
         e.organiser_id,
         u.full_name AS organizer_name,
         u.email AS organizer_email
       FROM events e
       INNER JOIN users u ON u.user_id = e.organiser_id
       WHERE e.event_id = ?
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

    const [existingRegistrationRows] = await pool.query(
      `SELECT status
       FROM registrations
       WHERE student_id = ? AND event_id = ?
       LIMIT 1`,
      [req.user.id, eventId]
    );

    const registrationCount = Number(countRows[0].count || 0);
    const previousRegistrationStatus = existingRegistrationRows[0]?.status || null;
    const registrationStatus = getRegistrationOutcome({
      capacity: eventRows[0].capacity,
      registrationCount,
      waitlistIfFull,
    });

    if (registrationStatus === "full") {
      return res.status(409).json({ error: "Event is at full capacity" });
    }

    await pool.query(
      `INSERT INTO registrations (student_id, event_id, status)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = CURRENT_TIMESTAMP`,
      [req.user.id, eventId, registrationStatus]
    );

    const [rows] = await pool.query(
      `SELECT
         CAST(student_id AS CHAR) AS userId,
         CAST(event_id AS CHAR) AS eventId,
         status,
         'attendee' AS attendeeType,
         NULL AS selectedFoodOption,
         NULL AS seatNumber,
         DATE_FORMAT(registered_at, '%Y-%m-%dT%H:%i:%sZ') AS createdAt
       FROM registrations
       WHERE student_id = ? AND event_id = ? AND status IN ('registered', 'waitlisted')
       LIMIT 1`,
      [req.user.id, eventId]
    );

    let confirmationEmailStatus = "failed";

    if (registrationStatus === "registered") {
      const currentRegisteredCount = getRegisteredCountAfterUpsert({
        previousRegistrationStatus,
        registrationCount,
        nextRegistrationStatus: registrationStatus,
      });
      const organizerEventPayload = {
        id: eventRows[0].event_id,
        title: eventRows[0].title,
        date: eventRows[0].event_date,
        startTime: eventRows[0].start_time,
        endTime: eventRows[0].end_time,
        location: eventRows[0].location,
        capacity: eventRows[0].capacity,
      };

      try {
        console.log(
          `POST /api/registrations confirmation email attempt: user=${req.user.id} event=${eventRows[0].event_id} to=${req.user.email}`
        );

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
          idempotencyKey: `booking/${req.user.id}/${eventRows[0].event_id}/${Date.now()}`,
        });

        if (error) {
          console.error(
            "POST /api/registrations confirmation email error:",
            error?.message || error
          );
        } else {
          confirmationEmailStatus = "sent";
          console.log(
            `POST /api/registrations confirmation email sent: user=${req.user.id} event=${eventRows[0].event_id} to=${req.user.email}`
          );
        }
      } catch (emailError) {
        console.error("POST /api/registrations confirmation email failed:", emailError);
      }

      if (
        eventRows[0].organizer_email &&
        shouldSendOrganizerFirstRegistrationNotification({
          previousRegisteredCount: registrationCount,
          currentRegisteredCount,
        })
      ) {
        try {
          console.log(
            `POST /api/registrations organizer first-registration email attempt: organizer=${eventRows[0].organiser_id} event=${eventRows[0].event_id} to=${eventRows[0].organizer_email}`
          );

          const { error } = await sendOrganizerFirstRegistrationEmail({
            to: eventRows[0].organizer_email,
            organizerName: eventRows[0].organizer_name,
            event: organizerEventPayload,
            idempotencyKey: `organizer-first/${eventRows[0].event_id}/${currentRegisteredCount}`,
          });

          if (error) {
            console.error(
              "POST /api/registrations organizer first-registration email error:",
              error?.message || error
            );
          }
        } catch (emailError) {
          console.error("POST /api/registrations organizer first-registration email failed:", emailError);
        }
      }

      if (
        eventRows[0].organizer_email &&
        shouldSendOrganizerEventFullNotification({
          capacity: eventRows[0].capacity,
          previousRegisteredCount: registrationCount,
          currentRegisteredCount,
        })
      ) {
        try {
          console.log(
            `POST /api/registrations organizer event-full email attempt: organizer=${eventRows[0].organiser_id} event=${eventRows[0].event_id} to=${eventRows[0].organizer_email}`
          );

          const { error } = await sendOrganizerEventFullEmail({
            to: eventRows[0].organizer_email,
            organizerName: eventRows[0].organizer_name,
            event: organizerEventPayload,
            idempotencyKey: `organizer-full/${eventRows[0].event_id}/${currentRegisteredCount}`,
          });

          if (error) {
            console.error(
              "POST /api/registrations organizer event-full email error:",
              error?.message || error
            );
          }
        } catch (emailError) {
          console.error("POST /api/registrations organizer event-full email failed:", emailError);
        }
      }
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

/**
 * Asynchronously cancels a student's registration and promotes the waitlist when a seat opens.
 * @param {import("express").Request} req - Authenticated student request identifying the target event.
 * @param {import("express").Response} res - Express response used to confirm cancellation.
 * @returns {Promise<import("express").Response>} JSON response confirming the cancellation or describing the error.
 */
router.delete("/:eventId", requireAuth, requireRole("student"), registrationRateLimit, async (req, res) => {
  try {
    const [existingRows] = await pool.query(
      `SELECT status
       FROM registrations
       WHERE student_id = ? AND event_id = ?
       LIMIT 1`,
      [req.user.id, req.params.eventId]
    );

    const existingRegistration = existingRows[0];
    if (!existingRegistration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    await pool.query(
      `UPDATE registrations
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE student_id = ? AND event_id = ?`,
      [req.user.id, req.params.eventId]
    );

    if (existingRegistration.status === "registered") {
      await promoteWaitlistedRegistrations(req.params.eventId);
    }

    return res.json({ message: "Registration cancelled" });
  } catch (error) {
    console.error("DELETE /api/registrations/:eventId error:", error);
    return res.status(500).json({ error: "Failed to unregister from event" });
  }
});

module.exports = router;
module.exports.canAccessEventAttendees = canAccessEventAttendees;
module.exports.getRegistrationOutcome = getRegistrationOutcome;
module.exports.getRegisteredCountAfterUpsert = getRegisteredCountAfterUpsert;
module.exports.shouldSendOrganizerEventFullNotification = shouldSendOrganizerEventFullNotification;
module.exports.shouldSendOrganizerFirstRegistrationNotification =
  shouldSendOrganizerFirstRegistrationNotification;
