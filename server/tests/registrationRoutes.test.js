// ============================================
// File:    registrationRoutes.test.js
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Implements registration Routes.test for the backend.
// ============================================

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  canAccessEventAttendees,
  getRegisteredCountAfterUpsert,
  getRegistrationOutcome,
  shouldSendOrganizerEventFullNotification,
  shouldSendOrganizerFirstRegistrationNotification,
} = require("../routes/registrationRoutes");

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("admins can access any event attendee list", () => {
  assert.equal(
    canAccessEventAttendees({
      eventOrganizerId: 12,
      user: { id: "1", role: "admin" },
    }),
    true
  );
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("organizers can access attendee lists for their own events", () => {
  assert.equal(
    canAccessEventAttendees({
      eventOrganizerId: 12,
      user: { id: "12", role: "organizer" },
    }),
    true
  );
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("organizers cannot access attendee lists for other organizers' events", () => {
  assert.equal(
    canAccessEventAttendees({
      eventOrganizerId: 12,
      user: { id: "8", role: "organizer" },
    }),
    false
  );
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("students cannot access attendee lists", () => {
  assert.equal(
    canAccessEventAttendees({
      eventOrganizerId: 12,
      user: { id: "30", role: "student" },
    }),
    false
  );
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("registration stays registered while capacity remains", () => {
  assert.equal(
    getRegistrationOutcome({ capacity: 10, registrationCount: 9, waitlistIfFull: false }),
    "registered"
  );
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("full events return full when waitlist is not requested", () => {
  assert.equal(
    getRegistrationOutcome({ capacity: 10, registrationCount: 10, waitlistIfFull: false }),
    "full"
  );
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("full events return waitlisted when waitlist is requested", () => {
  assert.equal(
    getRegistrationOutcome({ capacity: 10, registrationCount: 10, waitlistIfFull: true }),
    "waitlisted"
  );
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("getRegisteredCountAfterUpsert increments only for a real new confirmed seat", () => {
  assert.equal(
    getRegisteredCountAfterUpsert({
      previousRegistrationStatus: null,
      registrationCount: 0,
      nextRegistrationStatus: "registered",
    }),
    1
  );

  assert.equal(
    getRegisteredCountAfterUpsert({
      previousRegistrationStatus: "waitlisted",
      registrationCount: 3,
      nextRegistrationStatus: "registered",
    }),
    4
  );

  assert.equal(
    getRegisteredCountAfterUpsert({
      previousRegistrationStatus: "registered",
      registrationCount: 3,
      nextRegistrationStatus: "registered",
    }),
    3
  );

  assert.equal(
    getRegisteredCountAfterUpsert({
      previousRegistrationStatus: null,
      registrationCount: 10,
      nextRegistrationStatus: "waitlisted",
    }),
    10
  );
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("first-registration notification triggers only on a zero-to-one confirmed transition", () => {
  assert.equal(
    shouldSendOrganizerFirstRegistrationNotification({
      previousRegisteredCount: 0,
      currentRegisteredCount: 1,
    }),
    true
  );

  assert.equal(
    shouldSendOrganizerFirstRegistrationNotification({
      previousRegisteredCount: 1,
      currentRegisteredCount: 2,
    }),
    false
  );
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("event-full notification triggers only when a confirmed registration reaches capacity", () => {
  assert.equal(
    shouldSendOrganizerEventFullNotification({
      capacity: 2,
      previousRegisteredCount: 1,
      currentRegisteredCount: 2,
    }),
    true
  );

  assert.equal(
    shouldSendOrganizerEventFullNotification({
      capacity: 2,
      previousRegisteredCount: 2,
      currentRegisteredCount: 2,
    }),
    false
  );

  assert.equal(
    shouldSendOrganizerEventFullNotification({
      capacity: null,
      previousRegisteredCount: 0,
      currentRegisteredCount: 1,
    }),
    false
  );
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("a single confirmed registration can trigger both first-registration and event-full notifications", () => {
  assert.equal(
    shouldSendOrganizerFirstRegistrationNotification({
      previousRegisteredCount: 0,
      currentRegisteredCount: 1,
    }),
    true
  );

  assert.equal(
    shouldSendOrganizerEventFullNotification({
      capacity: 1,
      previousRegisteredCount: 0,
      currentRegisteredCount: 1,
    }),
    true
  );
});
