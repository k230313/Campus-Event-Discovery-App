// ============================================
// File:    chatRoutes.test.js
// Author:  Mahak
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Verifies chatbot fallback behavior when the AI provider is unavailable.
// ============================================

const test = require("node:test");
const assert = require("node:assert/strict");

const chatRoutes = require("../routes/chatRoutes");

const { buildFallbackReply, shouldUseFallbackMode } = chatRoutes._test;

/**
 * Verifies that fallback replies include relevant events when the AI provider is degraded.
 * @returns {void} Does not return a value.
 */
test("buildFallbackReply includes related events when available", () => {
  const reply = buildFallbackReply([
    { id: "1", title: "Career Fair", date: "2026-06-15" },
    { id: "2", title: "Research Forum", date: "2026-06-20" },
  ]);

  assert.match(reply, /limited mode/i);
  assert.match(reply, /Career Fair/);
  assert.match(reply, /Research Forum/);
});

/**
 * Verifies that fallback mode is enabled for quota and configuration failures.
 * @returns {void} Does not return a value.
 */
test("shouldUseFallbackMode returns true for quota and API key failures", () => {
  assert.equal(
    shouldUseFallbackMode({ status: 429, message: "Quota exceeded" }),
    true
  );

  assert.equal(
    shouldUseFallbackMode({ status: 400, message: "API Key not found" }),
    true
  );
});

/**
 * Verifies that fallback mode is not enabled for unrelated unknown failures.
 * @returns {void} Does not return a value.
 */
test("shouldUseFallbackMode returns false for unrelated failures", () => {
  assert.equal(
    shouldUseFallbackMode({ status: 418, message: "Unexpected teapot issue" }),
    false
  );
});
