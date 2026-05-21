// ============================================
// File:    waitlist.js
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Implements waitlist for the backend.
// ============================================

const pool = require("../config/db");
const { sendWaitlistPromotionEmail } = require("../services/emailService");

/**
 * Executes the get available promotion slots logic.
 * @param {object} params - Function parameters.
 * @returns {*} Returns the resulting value.
 */
function getAvailablePromotionSlots({ capacity, confirmedCount }) {
  const numericCapacity = capacity === null || capacity === undefined ? null : Number(capacity);

  if (numericCapacity === null || Number.isNaN(numericCapacity) || numericCapacity <= 0) {
    return 0;
  }

  return Math.max(0, numericCapacity - Number(confirmedCount || 0));
}

/**
 * Asynchronously executes the promote waitlisted registrations logic.
 * @param {*} eventId - Represents the eventId input.
 * @returns {*} Returns the resulting value.
 */
async function promoteWaitlistedRegistrations(eventId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [eventRows] = await connection.query(
      `SELECT event_id, title, event_date, start_time, end_time, location, capacity, status
       FROM events
       WHERE event_id = ?
       LIMIT 1`,
      [eventId]
    );

    const event = eventRows[0];
    if (!event || event.status !== "published") {
      await connection.rollback();
      return [];
    }

    const [countRows] = await connection.query(
      "SELECT COUNT(*) AS count FROM registrations WHERE event_id = ? AND status = 'registered'",
      [eventId]
    );

    const availableSlots = getAvailablePromotionSlots({
      capacity: event.capacity,
      confirmedCount: countRows[0]?.count || 0,
    });

    if (availableSlots <= 0) {
      await connection.rollback();
      return [];
    }

    const [waitlistRows] = await connection.query(
      `SELECT registration_id, student_id, registered_at
       FROM registrations
       WHERE event_id = ? AND status = 'waitlisted'
       ORDER BY registered_at ASC
       LIMIT ?`,
      [eventId, availableSlots]
    );

    if (!waitlistRows.length) {
      await connection.rollback();
      return [];
    }

    const registrationIds = waitlistRows.map((row) => row.registration_id);
    await connection.query(
      `UPDATE registrations
       SET status = 'registered', updated_at = CURRENT_TIMESTAMP
       WHERE registration_id IN (?)`,
      [registrationIds]
    );

    const [promotedRows] = await connection.query(
      `SELECT
         CAST(r.student_id AS CHAR) AS userId,
         u.full_name AS attendeeName,
         u.email
       FROM registrations r
       INNER JOIN users u ON u.user_id = r.student_id
       WHERE r.registration_id IN (?)
       ORDER BY r.registered_at ASC`,
      [registrationIds]
    );

    await connection.commit();

    const eventDetails = {
      id: event.event_id,
      title: event.title,
      date: event.event_date,
      startTime: event.start_time,
      endTime: event.end_time,
      location: event.location,
    };

    await Promise.allSettled(
      promotedRows.map(async (row) => {
        try {
          console.log(
            `WAITLIST promotion email attempt: user=${row.userId} event=${event.event_id} to=${row.email}`
          );

          const { error } = await sendWaitlistPromotionEmail({
            to: row.email,
            attendeeName: row.attendeeName,
            event: eventDetails,
            idempotencyKey: `waitlist-promotion/${row.userId}/${event.event_id}/${Date.now()}`,
          });

          if (error) {
            console.error("WAITLIST promotion email error:", error?.message || error);
            return;
          }

          console.log(
            `WAITLIST promotion email sent: user=${row.userId} event=${event.event_id} to=${row.email}`
          );
        } catch (emailError) {
          console.error("WAITLIST promotion email failed:", emailError);
        }
      })
    );

    return promotedRows;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getAvailablePromotionSlots,
  promoteWaitlistedRegistrations,
};
