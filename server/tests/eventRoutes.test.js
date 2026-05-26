// ============================================
// File:    eventRoutes.test.js
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Implements event Routes.test for the backend.
// ============================================

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getEffectiveWriteStatus,
  organizerCanWriteEventDate,
  canViewEvent,
  getModerationUpdate,
  sanitizeEventForViewer,
} = require("../routes/eventRoutes");

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("public users can only view published events", () => {
  assert.equal(canViewEvent({ status: "published", organizerId: "2" }, null), true);
  assert.equal(canViewEvent({ status: "pending", organizerId: "2" }, null), false);
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("organizers can view their own pending events but not other organizers pending events", () => {
  const organizer = { id: "2", role: "organizer" };
  assert.equal(canViewEvent({ status: "pending", organizerId: "2" }, organizer), true);
  assert.equal(canViewEvent({ status: "pending", organizerId: "9" }, organizer), false);
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("organizer edits to a previously published event are forced back to pending", () => {
  assert.equal(
    getEffectiveWriteStatus({
      userRole: "organizer",
      existingStatus: "published",
      requestedStatus: "cancelled",
      fallbackStatus: "draft",
    }),
    "pending"
  );
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("organizers cannot create or edit events in the past", () => {
  assert.equal(
    organizerCanWriteEventDate("2026-05-25", new Date(2026, 4, 26, 12, 0, 0)),
    false
  );
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("organizers can still create or edit events scheduled for today", () => {
  assert.equal(
    organizerCanWriteEventDate("2026-05-26", new Date(2026, 4, 26, 12, 0, 0)),
    true
  );
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("organizer edits to non-published events keep the requested status", () => {
  assert.equal(
    getEffectiveWriteStatus({
      userRole: "organizer",
      existingStatus: "draft",
      requestedStatus: "cancelled",
      fallbackStatus: "draft",
    }),
    "cancelled"
  );
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("admin edits keep the requested status even for previously published events", () => {
  assert.equal(
    getEffectiveWriteStatus({
      userRole: "admin",
      existingStatus: "published",
      requestedStatus: "cancelled",
      fallbackStatus: "draft",
    }),
    "cancelled"
  );
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("rejected events require a rejection reason", () => {
  assert.throws(
    () => getModerationUpdate({ status: "rejected", reviewNotes: "   ", adminUserId: 1 }),
    /Rejection reason is required/
  );
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("pending status clears prior moderation feedback", () => {
  assert.deepEqual(
    getModerationUpdate({ status: "pending", reviewNotes: "Old note", adminUserId: 1 }),
    {
      status: "pending",
      approvedBy: null,
      reviewNotes: null,
      reviewedAt: null,
    }
  );
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("published status keeps optional approval note and reviewer metadata", () => {
  const update = getModerationUpdate({ status: "published", reviewNotes: "Looks good", adminUserId: 9 });
  assert.equal(update.status, "published");
  assert.equal(update.approvedBy, 9);
  assert.equal(update.reviewNotes, "Looks good");
  assert.ok(update.reviewedAt instanceof Date);
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("public viewers do not receive moderation feedback fields", () => {
  const sanitized = sanitizeEventForViewer(
    { id: "1", status: "published", organizerId: "2", reviewNotes: "Internal note", reviewedAt: "2026-05-20T00:00:00Z", waitlistCount: 4 },
    null
  );
  assert.equal(sanitized.reviewNotes, undefined);
  assert.equal(sanitized.reviewedAt, undefined);
  assert.equal(sanitized.waitlistCount, undefined);
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("owning organizer keeps moderation feedback fields", () => {
  const sanitized = sanitizeEventForViewer(
    { id: "1", status: "rejected", organizerId: "2", reviewNotes: "Needs fixes", reviewedAt: "2026-05-20T00:00:00Z", waitlistCount: 2 },
    { id: "2", role: "organizer" }
  );
  assert.equal(sanitized.reviewNotes, "Needs fixes");
  assert.equal(sanitized.reviewedAt, "2026-05-20T00:00:00Z");
  assert.equal(sanitized.waitlistCount, 2);
});
