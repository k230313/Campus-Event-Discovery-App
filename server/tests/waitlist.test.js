// ============================================
// File:    waitlist.test.js
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Implements waitlist.test for the backend.
// ============================================

const test = require("node:test");
const assert = require("node:assert/strict");

const { getAvailablePromotionSlots } = require("../utils/waitlist");

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("no promotion slots when capacity is missing", () => {
  assert.equal(getAvailablePromotionSlots({ capacity: null, confirmedCount: 2 }), 0);
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("no promotion slots when confirmed count already meets capacity", () => {
  assert.equal(getAvailablePromotionSlots({ capacity: 10, confirmedCount: 10 }), 0);
  assert.equal(getAvailablePromotionSlots({ capacity: 10, confirmedCount: 11 }), 0);
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("promotion slots equal spare seats", () => {
  assert.equal(getAvailablePromotionSlots({ capacity: 10, confirmedCount: 7 }), 3);
});
