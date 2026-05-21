// ============================================
// File:    contactRoutes.test.js
// Author:  Mahak
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Tests contact form validation and error handling for the backend.
// ============================================

const test = require("node:test");
const assert = require("node:assert/strict");

const { getContactSubmissionErrorMessage } = require("../routes/contactRoutes");
const { contactSchema } = require("../validation/schemas");

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("contactSchema accepts a valid contact form payload", () => {
  const result = contactSchema.safeParse({
    name: " Student Name ",
    email: "Student@Example.com ",
    subject: " Need Help ",
    message: " I need help with my booking. ",
  });

  assert.equal(result.success, true);
  assert.equal(result.data.name, "Student Name");
  assert.equal(result.data.email, "student@example.com");
  assert.equal(result.data.subject, "Need Help");
  assert.equal(result.data.message, "I need help with my booking.");
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("contactSchema rejects an empty message", () => {
  const result = contactSchema.safeParse({
    name: "Student Name",
    email: "student@example.com",
    subject: "Need Help",
    message: "   ",
  });

  assert.equal(result.success, false);
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("contact route returns a safe configuration error message", () => {
  assert.equal(
    getContactSubmissionErrorMessage(new Error("CONTACT_EMAIL_TO is not configured")),
    "Contact form is not configured right now. Please try again later."
  );
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("contact route returns a generic delivery error message for runtime failures", () => {
  assert.equal(
    getContactSubmissionErrorMessage(new Error("upstream failure")),
    "We could not send your message right now. Please try again later."
  );
});
