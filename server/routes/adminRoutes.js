const express = require("express");
const pool = require("../config/db");
const { ADMIN_UNLOCK_TTL_MS, requireAuth, requireRole } = require("../middleware/auth");
const { adminRateLimit } = require("../middleware/security");
const { verifyPassword } = require("../utils/passwords");
const { createAuthToken } = require("../utils/authTokens");

const router = express.Router();

router.post("/unlock", requireAuth, requireRole("admin"), adminRateLimit, async (req, res) => {
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

module.exports = router;
