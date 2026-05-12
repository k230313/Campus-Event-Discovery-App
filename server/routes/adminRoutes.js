const express = require("express");
const pool = require("../config/db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/overview", requireAuth, requireRole("admin"), async (_req, res) => {
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

module.exports = router;
