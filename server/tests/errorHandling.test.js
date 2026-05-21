// ============================================
// File:    errorHandling.test.js
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Implements error Handling.test for the backend.
// ============================================

const test = require("node:test");
const assert = require("node:assert/strict");

const { getErrorStatus, getErrorBody } = require("../utils/errorHandling");

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("maps CSRF errors to 403", () => {
  assert.equal(getErrorStatus({ code: "EBADCSRFTOKEN" }), 403);
  assert.deepEqual(getErrorBody({ code: "EBADCSRFTOKEN" }), {
    error: "Invalid CSRF token",
  });
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("preserves explicit error status codes", () => {
  assert.equal(getErrorStatus({ status: 404 }), 404);
  assert.deepEqual(getErrorBody({ status: 404 }), {
    error: "Internal server error",
  });
});
