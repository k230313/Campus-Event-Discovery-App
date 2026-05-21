// ============================================
// File:    eventRoutes.js
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Handles event listing, moderation, creation, editing, and deletion endpoints.
// ============================================

const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { eventFields } = require("../models/eventModel");
const validateEvent = require("../validation/eventValidation");
const { requireAuth, requireRole } = require("../middleware/auth");
const { validateBody } = require("../middleware/validate");
const { adminRateLimit, generalWriteRateLimit } = require("../middleware/security");
const { eventStatusSchema } = require("../validation/schemas");
const { promoteWaitlistedRegistrations } = require("../utils/waitlist");

const EVENT_SELECT_SQL = [
  "SELECT",
  "e.event_id AS id,",
  "e.title,",
  "e.description,",
  "DATE_FORMAT(e.event_date, '%Y-%m-%d') AS date,",
  "TIME_FORMAT(e.start_time, '%H:%i:%s') AS startTime,",
  "TIME_FORMAT(e.end_time, '%H:%i:%s') AS endTime,",
  "e.location,",
  "c.name AS category,",
  "CAST(e.organiser_id AS CHAR) AS organizerId,",
  "u.full_name AS organiser_name,",
  "e.banner_image_url AS image,",
  "e.status,",
  "e.review_notes AS reviewNotes,",
  "DATE_FORMAT(e.reviewed_at, '%Y-%m-%dT%H:%i:%sZ') AS reviewedAt,",
  "0 AS viewCount,",
  "(",
  "SELECT COUNT(*)",
  "FROM registrations r",
  "WHERE r.event_id = e.event_id",
  "AND r.status = 'registered'",
  ") AS rsvpCount,",
  "NULL AS volunteersNeeded,",
  "NULL AS volunteersRegistered,",
  "e.capacity AS seatingCapacity,",
  "(",
  "SELECT COUNT(*)",
  "FROM registrations r",
  "WHERE r.event_id = e.event_id",
  "AND r.status = 'registered'",
  ") AS seatsBooked,",
  "(",
  "SELECT COUNT(*)",
  "FROM registrations r",
  "WHERE r.event_id = e.event_id",
  "AND r.status = 'waitlisted'",
  ") AS waitlistCount,",
  "0 AS foodProvided,",
  "NULL AS foodOptions,",
  "e.notes,",
  "DATE_FORMAT(e.created_at, '%Y-%m-%dT%H:%i:%sZ') AS createdAt",
  "FROM events e",
  "INNER JOIN categories c ON c.category_id = e.category_id",
  "INNER JOIN users u ON u.user_id = e.organiser_id"
].join(" ");

const LIST_EVENTS_SQL = [
  EVENT_SELECT_SQL,
  "WHERE e.event_date >= CURDATE()",
  "ORDER BY e.event_date ASC, e.start_time ASC"
].join(" ");
const GET_EVENT_BY_ID_SQL = [
  EVENT_SELECT_SQL,
  "WHERE e.event_id = ?",
  "LIMIT 1"
].join(" ");
const INSERT_EVENT_SQL = [
  "INSERT INTO events",
  "(organiser_id, category_id, title, description, event_date, start_time, end_time, location, banner_image_url, capacity, registration_required, status, notes)",
  "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
].join(" ");
const UPDATE_EVENT_SQL = [
  "UPDATE events",
  "SET category_id = ?, title = ?, description = ?, event_date = ?, start_time = ?, end_time = ?, location = ?, banner_image_url = ?, capacity = ?, registration_required = ?, status = ?, notes = ?",
  "WHERE event_id = ?"
].join(" ");

/**
 * Returns the event statuses a user is allowed to write directly.
 * @param {string} role - Authenticated user role.
 * @returns {string[]} List of statuses permitted for that role.
 */
function getAllowedWriteStatuses(role) {
  return role === "admin"
    ? ["draft", "pending", "published", "rejected", "cancelled"]
    : ["draft", "pending", "cancelled"];
}

/**
 * Calculates the status that should actually be saved for an event write request.
 * @param {object} params - Inputs describing the user role, current status, and requested status.
 * @returns {string} Effective status to persist.
 */
function getEffectiveWriteStatus({ userRole, existingStatus = null, requestedStatus, fallbackStatus = "draft" }) {
  const nextStatus = requestedStatus || fallbackStatus;

  if (userRole === "admin") {
    return nextStatus;
  }

  if (existingStatus === "published") {
    return "pending";
  }

  return nextStatus;
}

/**
 * Builds the moderation metadata that accompanies an admin status decision.
 * @param {object} params - Inputs describing the new status, review notes, and acting admin.
 * @returns {{status: string, approvedBy: number|null, reviewNotes: string|null, reviewedAt: Date|null}} Moderation fields to persist.
 */
function getModerationUpdate({ status, reviewNotes, adminUserId }) {
  const trimmedReviewNotes = typeof reviewNotes === "string" ? reviewNotes.trim() : "";

  if (status === "pending") {
    return {
      status,
      approvedBy: null,
      reviewNotes: null,
      reviewedAt: null,
    };
  }

  if (status === "rejected" && !trimmedReviewNotes) {
    throw new Error("Rejection reason is required");
  }

  return {
    status,
    approvedBy: adminUserId,
    reviewNotes: trimmedReviewNotes || null,
    reviewedAt: new Date(),
  };
}

/**
 * Determines whether a viewer is allowed to access an event row.
 * @param {object} row - Event row returned from the database.
 * @param {object|null} user - Authenticated user, if any.
 * @returns {boolean} True when the event should be visible to the viewer.
 */
function canViewEvent(row, user) {
  if (!row) {
    return false;
  }

  if (row.status === "published") {
    return true;
  }

  if (!user) {
    return false;
  }

  if (user.role === "admin") {
    return true;
  }

  return user.role === "organizer" && Number(row.organizerId) === Number(user.id);
}

/**
 * Determines whether a viewer may see internal moderation metadata for an event.
 * @param {object} row - Event row returned from the database.
 * @param {object|null} user - Authenticated user, if any.
 * @returns {boolean} True when moderation fields should be exposed.
 */
function canViewModerationFields(row, user) {
  if (!row || !user) {
    return false;
  }

  if (user.role === "admin") {
    return true;
  }

  return user.role === "organizer" && Number(row.organizerId) === Number(user.id);
}

/**
 * Removes moderation-only fields from an event response when the viewer is not entitled to them.
 * @param {object} row - Event row returned from the database.
 * @param {object|null} user - Authenticated user, if any.
 * @returns {object} Event payload filtered for the current viewer.
 */
function sanitizeEventForViewer(row, user) {
  if (canViewModerationFields(row, user)) {
    return row;
  }

  const { reviewNotes, reviewedAt, waitlistCount, ...rest } = row;
  return rest;
}

/**
 * Asynchronously resolves a category name to its primary key.
 * @param {string} categoryName - Category name supplied by the client.
 * @returns {Promise<number>} Matching category identifier.
 */
async function resolveCategoryId(categoryName) {
  try {
    const [rows] = await pool.query(
      "SELECT category_id FROM categories WHERE name = ? LIMIT 1",
      [categoryName]
    );

    if (!rows.length) {
      throw new Error("Unknown category");
    }

    return rows[0].category_id;
  } catch (error) {
    console.error("[resolveCategoryId] Failed:", error.message);
    throw error;
  }
}

/**
 * Asynchronously resolves the organiser ID for an admin-created event.
 * @param {number|string|undefined} organizerId - Explicit organiser ID, if one was supplied.
 * @returns {Promise<number>} Organizer ID to store on the event.
 */
async function resolveOrganizerId(organizerId) {
  try {
    if (organizerId) {
      return Number(organizerId);
    }

    const [rows] = await pool.query(
      "SELECT user_id FROM users WHERE role = 'organiser' ORDER BY user_id ASC LIMIT 1"
    );

    if (!rows.length) {
      throw new Error("No organiser user available");
    }

    return rows[0].user_id;
  } catch (error) {
    console.error("[resolveOrganizerId] Failed:", error.message);
    throw error;
  }
}

/**
 * Asynchronously loads the owner ID for a single event.
 * @param {number|string} eventId - Event identifier to inspect.
 * @returns {Promise<number|null>} Owning organiser ID or null when the event does not exist.
 */
async function getEventOwnerId(eventId) {
  const [rows] = await pool.query(
    "SELECT organiser_id FROM events WHERE event_id = ? LIMIT 1",
    [eventId]
  );

  return rows[0]?.organiser_id || null;
}

/**
 * Asynchronously returns the event list filtered to what the current viewer is allowed to see.
 * @param {import("express").Request} req - Express request with optional authenticated user context.
 * @param {import("express").Response} res - Express response used to return the event list.
 * @returns {Promise<import("express").Response>} JSON response containing visible events.
 */
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(LIST_EVENTS_SQL);
    return res.json(
      rows
        .filter((row) => canViewEvent(row, req.user))
        .map((row) => sanitizeEventForViewer(row, req.user))
    );
  } catch (error) {
    console.error("GET /api/events error:", error);
    return res.status(500).json({ error: "Failed to fetch events" });
  }
});

/**
 * Returns the frontend event-field schema used by the event form.
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response used to return the schema.
 * @returns {void} Does not return a value.
 */
router.get("/schema", (req, res) => {
  res.json(eventFields);
});

/**
 * Asynchronously applies an admin moderation status change to an event.
 * @param {import("express").Request} req - Authenticated admin request containing the new status.
 * @param {import("express").Response} res - Express response used to return the updated event.
 * @returns {Promise<import("express").Response>} JSON response containing the updated event or an error.
 */
router.patch("/:id/status", requireAuth, requireRole("admin"), adminRateLimit, validateBody(eventStatusSchema), async (req, res) => {
  const { id } = req.params;
  const { status, reviewNotes } = req.body;
  const allowedStatuses = ["draft", "pending", "published", "rejected", "cancelled"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const moderationUpdate = getModerationUpdate({
      status,
      reviewNotes,
      adminUserId: req.user.id,
    });

    const [result] = await pool.query(
      "UPDATE events SET status = ?, approved_by = ?, review_notes = ?, reviewed_at = ? WHERE event_id = ?",
      [
        moderationUpdate.status,
        moderationUpdate.approvedBy,
        moderationUpdate.reviewNotes,
        moderationUpdate.reviewedAt,
        id,
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Event not found" });
    }

    const [rows] = await pool.query(GET_EVENT_BY_ID_SQL, [id]);
    return res.json(sanitizeEventForViewer(rows[0], req.user));
  } catch (error) {
    console.error("PATCH /api/events/:id/status error:", error);
    return res.status(500).json({ error: "Failed to update event status" });
  }
});

/**
 * Asynchronously returns a single event when the current viewer is allowed to access it.
 * @param {import("express").Request} req - Express request containing the event ID.
 * @param {import("express").Response} res - Express response used to return the event.
 * @returns {Promise<import("express").Response>} JSON response containing the event or a not-found error.
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(GET_EVENT_BY_ID_SQL, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (!canViewEvent(rows[0], req.user)) {
      return res.status(404).json({ error: "Event not found" });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("GET /api/events/:id error:", error);
    return res.status(500).json({ error: "Failed to fetch event" });
  }
});

/**
 * Asynchronously creates a new event for an organizer or admin.
 * @param {import("express").Request} req - Authenticated write request containing event form data.
 * @param {import("express").Response} res - Express response used to return the created event.
 * @returns {Promise<import("express").Response>} JSON response containing the created event or an error.
 */
router.post("/", requireAuth, requireRole("organizer", "admin"), generalWriteRateLimit, async (req, res) => {
  const validation = validateEvent(req.body);

  if (!validation.isValid) {
    return res.status(400).json({ errors: validation.errors });
  }

  const requestBody = validation.data;

  const {
    title,
    description,
    date,
    startTime,
    endTime,
    location,
    category,
    image,
    capacity,
    registrationRequired,
    notes,
    organizerId,
    status
  } = requestBody;

  try {
    const allowedStatuses = getAllowedWriteStatuses(req.user.role);
    const requestedStatus = getEffectiveWriteStatus({
      userRole: req.user.role,
      requestedStatus: status,
      fallbackStatus: "draft",
    });

    if (!allowedStatuses.includes(requestedStatus)) {
      return res.status(403).json({ error: "You are not allowed to use that event status" });
    }

    const categoryId = await resolveCategoryId(category);
    const resolvedOrganizerId = req.user.role === "admin"
      ? await resolveOrganizerId(organizerId)
      : req.user.id;
    const [result] = await pool.query(
      INSERT_EVENT_SQL,
      [
        resolvedOrganizerId,
        categoryId,
        title,
        description,
        date,
        startTime.length === 5 ? `${startTime}:00` : startTime,
        endTime.length === 5 ? `${endTime}:00` : endTime,
        location,
        image || null,
        capacity || null,
        registrationRequired ? 1 : 0,
        requestedStatus,
        notes || null
      ]
    );
    const [rows] = await pool.query(GET_EVENT_BY_ID_SQL, [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error("POST /api/events error:", error);
    return res.status(500).json({ error: error.message === "Unknown category" ? error.message : "Failed to create event" });
  }
});

/**
 * Asynchronously updates an existing event and re-applies moderation rules where required.
 * @param {import("express").Request} req - Authenticated write request containing event updates.
 * @param {import("express").Response} res - Express response used to return the updated event.
 * @returns {Promise<import("express").Response>} JSON response containing the updated event or an error.
 */
router.put("/:id", requireAuth, requireRole("organizer", "admin"), generalWriteRateLimit, async (req, res) => {
  const { id } = req.params;
  const validation = validateEvent(req.body);

  if (!validation.isValid) {
    return res.status(400).json({ errors: validation.errors });
  }

  const requestBody = validation.data;

  const {
    title,
    description,
    date,
    startTime,
    endTime,
    location,
    category,
    image,
    capacity,
    registrationRequired,
    notes,
    status
  } = requestBody;

  try {
    const [existingRows] = await pool.query(
      "SELECT organiser_id, status, capacity FROM events WHERE event_id = ? LIMIT 1",
      [id]
    );

    const existingEvent = existingRows[0];
    if (!existingEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (req.user.role !== "admin" && Number(existingEvent.organiser_id) !== Number(req.user.id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const allowedStatuses = getAllowedWriteStatuses(req.user.role);
    const requestedStatus = getEffectiveWriteStatus({
      userRole: req.user.role,
      existingStatus: existingEvent.status,
      requestedStatus: status,
      fallbackStatus: "draft",
    });

    if (!allowedStatuses.includes(requestedStatus)) {
      return res.status(403).json({ error: "You are not allowed to use that event status" });
    }

    const categoryId = await resolveCategoryId(category);
    const [result] = await pool.query(
      UPDATE_EVENT_SQL,
      [
        categoryId,
        title,
        description,
        date,
        startTime.length === 5 ? `${startTime}:00` : startTime,
        endTime.length === 5 ? `${endTime}:00` : endTime,
        location,
        image || null,
        capacity || null,
        registrationRequired ? 1 : 0,
        requestedStatus,
        notes || null,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (req.user.role !== "admin" && (existingEvent.status === "published" || requestedStatus === "pending")) {
      await pool.query(
        "UPDATE events SET approved_by = NULL, review_notes = NULL, reviewed_at = NULL WHERE event_id = ?",
        [id]
      );
    }

    const previousCapacity = existingEvent.capacity === null || existingEvent.capacity === undefined
      ? null
      : Number(existingEvent.capacity);
    const nextCapacity = capacity === null || capacity === undefined
      ? null
      : Number(capacity);

    if (
      requestedStatus === "published" &&
      nextCapacity !== null &&
      !Number.isNaN(nextCapacity) &&
      (previousCapacity === null || nextCapacity > previousCapacity)
    ) {
      await promoteWaitlistedRegistrations(id);
    }

    const [rows] = await pool.query(GET_EVENT_BY_ID_SQL, [id]);
    return res.json(rows[0]);
  } catch (error) {
    console.error("PUT /api/events/:id error:", error);
    return res.status(500).json({ error: error.message === "Unknown category" ? error.message : "Failed to update event" });
  }
});

/**
 * Asynchronously deletes an event owned by the organizer or targeted by an admin.
 * @param {import("express").Request} req - Authenticated delete request containing the event ID.
 * @param {import("express").Response} res - Express response used to confirm deletion.
 * @returns {Promise<import("express").Response>} JSON response confirming deletion or describing the failure.
 */
router.delete("/:id", requireAuth, requireRole("organizer", "admin"), generalWriteRateLimit, async (req, res) => {
  const { id } = req.params;

  try {
    const ownerId = await getEventOwnerId(id);
    if (!ownerId) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (req.user.role !== "admin" && Number(ownerId) !== Number(req.user.id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const [result] = await pool.query("DELETE FROM events WHERE event_id = ?", [id]);

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
module.exports.canViewEvent = canViewEvent;
module.exports.getEffectiveWriteStatus = getEffectiveWriteStatus;
module.exports.getModerationUpdate = getModerationUpdate;
module.exports.sanitizeEventForViewer = sanitizeEventForViewer;
