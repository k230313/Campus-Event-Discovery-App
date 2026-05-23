// ============================================
// File:    adminRoutes.js
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Implements admin Routes for the backend.
// ============================================

const express = require("express");
const pool = require("../config/db");
const { ADMIN_UNLOCK_TTL_MS, requireAuth, requireRole } = require("../middleware/auth");
const { adminRateLimit } = require("../middleware/security");
const { validateBody } = require("../middleware/validate");
const { verifyPassword } = require("../utils/passwords");
const { createAuthToken } = require("../utils/authTokens");
const { adminUnlockSchema } = require("../validation/schemas");
const { sendCsv } = require("../utils/csv");

const router = express.Router();

const REPORT_TYPES = new Set([
  "event-summary",
  "user-engagement",
  "category-performance",
  "operational-snapshot",
]);

/**
 * Asynchronously executes the route handler logic.
 * @param {*} req - Represents the req input.
 * @param {*} res - Represents the res input.
 * @returns {*} Returns the resulting value.
 */
router.post("/unlock", requireAuth, requireRole("admin"), adminRateLimit, validateBody(adminUnlockSchema), async (req, res) => {
  if (!process.env.MASTER_PASSWORD_HASH) {
    console.error("[ADMIN] MASTER_PASSWORD_HASH env var not set");
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const { masterPassword } = req.body || {};
  const storedHash = process.env.MASTER_PASSWORD_HASH;

  if (!masterPassword) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  try {
    const isValid = await verifyPassword(masterPassword, storedHash);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const issuedAt = Date.now();
    const unlockToken = createAuthToken({
      adminUnlock: true,
      type: "adminUnlock",
      iat: issuedAt,
    }, Math.floor(ADMIN_UNLOCK_TTL_MS / 1000));
    return res.json({ unlockToken });
  } catch (error) {
    console.error("POST /api/admin/unlock error:", error);
    return res.status(401).json({ error: "Invalid credentials" });
  }
});

/**
 * Asynchronously executes the route handler logic.
 * @param {*} req - Represents the req input.
 * @param {*} res - Represents the res input.
 * @returns {*} Returns the resulting value.
 */
router.get("/overview", requireAuth, requireRole("admin"), adminRateLimit, async (_req, res) => {
  try {
    const [[userCounts]] = await pool.query(
      `SELECT
         COUNT(*) AS totalUsers,
         SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) AS totalStudents,
         SUM(CASE WHEN role = 'organiser' THEN 1 ELSE 0 END) AS totalOrganizers,
         SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS totalAdmins
       FROM users`
    );

    const [[eventCounts]] = await pool.query(
      `SELECT
         COUNT(*) AS totalEvents,
         SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS publishedEvents,
         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingEvents,
         SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draftEvents,
         SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejectedEvents,
         SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelledEvents
       FROM events`
    );

    const [[registrationCounts]] = await pool.query(
      `SELECT COUNT(*) AS totalRegistrations
       FROM registrations
       WHERE status = 'registered'`
    );

    const [[bookmarkCounts]] = await pool.query(
      `SELECT COUNT(*) AS totalBookmarks FROM bookmarks`
    );

    const [recentEvents] = await pool.query(
      `SELECT
         e.event_id AS id,
         e.title,
         c.name AS category,
         e.status,
         DATE_FORMAT(e.created_at, '%Y-%m-%dT%H:%i:%sZ') AS createdAt,
         (
           SELECT COUNT(*)
           FROM registrations r
           WHERE r.event_id = e.event_id AND r.status = 'registered'
         ) AS rsvpCount
       FROM events e
       INNER JOIN categories c ON c.category_id = e.category_id
       ORDER BY e.created_at DESC
       LIMIT 5`
    );

    const [categoryDistribution] = await pool.query(
      `SELECT
         CAST(c.category_id AS CHAR) AS id,
         c.name,
         COUNT(e.event_id) AS eventCount
       FROM categories c
       LEFT JOIN events e ON e.category_id = c.category_id
       GROUP BY c.category_id, c.name
       ORDER BY eventCount DESC, c.name ASC`
    );

    const [topEvents] = await pool.query(
      `SELECT
         e.event_id AS id,
         e.title,
         c.name AS category,
         COUNT(r.registration_id) AS rsvpCount
       FROM events e
       INNER JOIN categories c ON c.category_id = e.category_id
       LEFT JOIN registrations r
         ON r.event_id = e.event_id
        AND r.status = 'registered'
       GROUP BY e.event_id, e.title, c.name
       ORDER BY rsvpCount DESC, e.created_at DESC
       LIMIT 5`
    );

    return res.json({
      totals: {
        totalUsers: Number(userCounts.totalUsers || 0),
        totalStudents: Number(userCounts.totalStudents || 0),
        totalOrganizers: Number(userCounts.totalOrganizers || 0),
        totalAdmins: Number(userCounts.totalAdmins || 0),
        totalEvents: Number(eventCounts.totalEvents || 0),
        publishedEvents: Number(eventCounts.publishedEvents || 0),
        pendingEvents: Number(eventCounts.pendingEvents || 0),
        draftEvents: Number(eventCounts.draftEvents || 0),
        rejectedEvents: Number(eventCounts.rejectedEvents || 0),
        cancelledEvents: Number(eventCounts.cancelledEvents || 0),
        totalRegistrations: Number(registrationCounts.totalRegistrations || 0),
        totalBookmarks: Number(bookmarkCounts.totalBookmarks || 0),
      },
      recentEvents: recentEvents.map((event) => ({
        ...event,
        rsvpCount: Number(event.rsvpCount || 0),
      })),
      categoryDistribution: categoryDistribution.map((category) => ({
        ...category,
        eventCount: Number(category.eventCount || 0),
      })),
      topEvents: topEvents.map((event) => ({
        ...event,
        rsvpCount: Number(event.rsvpCount || 0),
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/overview error:", error);
    return res.status(500).json({ error: "Failed to load admin overview" });
  }
});

router.get("/reports/:reportType", requireAuth, requireRole("admin"), adminRateLimit, async (req, res) => {
  const { reportType } = req.params;

  if (!REPORT_TYPES.has(reportType)) {
    return res.status(400).json({ error: "Invalid report type" });
  }

  try {
    if (reportType === "event-summary") {
      const [rows] = await pool.query(
        `SELECT
           CAST(e.event_id AS CHAR) AS id,
           e.title,
           c.name AS category,
           u.full_name AS organiser_name,
           e.status,
           DATE_FORMAT(e.event_date, '%Y-%m-%d') AS event_date,
           TIME_FORMAT(e.start_time, '%H:%i') AS start_time,
           TIME_FORMAT(e.end_time, '%H:%i') AS end_time,
           e.location,
           e.capacity,
           (
             SELECT COUNT(*)
             FROM registrations r
             WHERE r.event_id = e.event_id AND r.status = 'registered'
           ) AS registrations
         FROM events e
         INNER JOIN categories c ON c.category_id = e.category_id
         INNER JOIN users u ON u.user_id = e.organiser_id
         ORDER BY e.event_date DESC, e.title ASC`
      );

      return sendCsv(
        res,
        reportType,
        [
          "Event ID",
          "Title",
          "Category",
          "Organiser",
          "Status",
          "Event Date",
          "Start Time",
          "End Time",
          "Location",
          "Capacity",
          "Registrations",
        ],
        rows.map((row) => [
          row.id,
          row.title,
          row.category,
          row.organiser_name,
          row.status,
          row.event_date,
          row.start_time,
          row.end_time,
          row.location,
          row.capacity ?? "Unlimited",
          Number(row.registrations || 0),
        ])
      );
    }

    if (reportType === "user-engagement") {
      const [rows] = await pool.query(
        `SELECT
           CAST(e.event_id AS CHAR) AS id,
           e.title,
           c.name AS category,
           e.status,
           COALESCE(reg.registrations, 0) AS registrations,
           COALESCE(bm.bookmarks, 0) AS bookmarks
         FROM events e
         INNER JOIN categories c ON c.category_id = e.category_id
         LEFT JOIN (
           SELECT event_id, COUNT(*) AS registrations
           FROM registrations
           WHERE status = 'registered'
           GROUP BY event_id
         ) reg ON reg.event_id = e.event_id
         LEFT JOIN (
           SELECT event_id, COUNT(*) AS bookmarks
           FROM bookmarks
           GROUP BY event_id
         ) bm ON bm.event_id = e.event_id
         ORDER BY registrations DESC, bookmarks DESC, e.title ASC`
      );

      return sendCsv(
        res,
        reportType,
        ["Event ID", "Title", "Category", "Status", "Registrations", "Bookmarks"],
        rows.map((row) => [
          row.id,
          row.title,
          row.category,
          row.status,
          Number(row.registrations || 0),
          Number(row.bookmarks || 0),
        ])
      );
    }

    if (reportType === "category-performance") {
      const [rows] = await pool.query(
        `SELECT
           c.name AS category,
           COUNT(e.event_id) AS event_count,
           SUM(CASE WHEN e.status = 'published' THEN 1 ELSE 0 END) AS published_events,
           COALESCE(SUM(reg.registrations), 0) AS total_registrations
         FROM categories c
         LEFT JOIN events e ON e.category_id = c.category_id
         LEFT JOIN (
           SELECT event_id, COUNT(*) AS registrations
           FROM registrations
           WHERE status = 'registered'
           GROUP BY event_id
         ) reg ON reg.event_id = e.event_id
         GROUP BY c.category_id, c.name
         ORDER BY event_count DESC, c.name ASC`
      );

      return sendCsv(
        res,
        reportType,
        ["Category", "Total Events", "Published Events", "Total Registrations"],
        rows.map((row) => [
          row.category,
          Number(row.event_count || 0),
          Number(row.published_events || 0),
          Number(row.total_registrations || 0),
        ])
      );
    }

    const [[userCounts]] = await pool.query(
      `SELECT
         COUNT(*) AS totalUsers,
         SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) AS totalStudents,
         SUM(CASE WHEN role = 'organiser' THEN 1 ELSE 0 END) AS totalOrganizers,
         SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS totalAdmins
       FROM users`
    );

    const [[eventCounts]] = await pool.query(
      `SELECT
         COUNT(*) AS totalEvents,
         SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS publishedEvents,
         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingEvents,
         SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draftEvents,
         SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejectedEvents,
         SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelledEvents
       FROM events`
    );

    const [[registrationCounts]] = await pool.query(
      `SELECT COUNT(*) AS totalRegistrations
       FROM registrations
       WHERE status = 'registered'`
    );

    const [[bookmarkCounts]] = await pool.query(
      `SELECT COUNT(*) AS totalBookmarks FROM bookmarks`
    );

    return sendCsv(
      res,
      reportType,
      ["Metric", "Count"],
      [
        ["Total Users", Number(userCounts.totalUsers || 0)],
        ["Students", Number(userCounts.totalStudents || 0)],
        ["Organizers", Number(userCounts.totalOrganizers || 0)],
        ["Admins", Number(userCounts.totalAdmins || 0)],
        ["Total Events", Number(eventCounts.totalEvents || 0)],
        ["Published Events", Number(eventCounts.publishedEvents || 0)],
        ["Pending Events", Number(eventCounts.pendingEvents || 0)],
        ["Draft Events", Number(eventCounts.draftEvents || 0)],
        ["Rejected Events", Number(eventCounts.rejectedEvents || 0)],
        ["Cancelled Events", Number(eventCounts.cancelledEvents || 0)],
        ["Total Registrations", Number(registrationCounts.totalRegistrations || 0)],
        ["Total Bookmarks", Number(bookmarkCounts.totalBookmarks || 0)],
      ]
    );
  } catch (error) {
    console.error(`GET /api/admin/reports/${reportType} error:`, error);
    return res.status(500).json({ error: "Failed to export report" });
  }
});

module.exports = router;
