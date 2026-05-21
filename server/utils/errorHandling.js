// ============================================
// File:    errorHandling.js
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Implements error Handling for the backend.
// ============================================

/**
 * Executes the get error status logic.
 * @param {*} err - Represents the err input.
 * @returns {*} Returns the resulting value.
 */
function getErrorStatus(err) {
  if (err?.code === "EBADCSRFTOKEN") {
    return 403;
  }

  return err?.status || 500;
}

/**
 * Executes the get error body logic.
 * @param {*} err - Represents the err input.
 * @returns {*} Returns the resulting value.
 */
function getErrorBody(err) {
  if (err?.code === "EBADCSRFTOKEN") {
    return { error: "Invalid CSRF token" };
  }

  return { error: "Internal server error" };
}

module.exports = {
  getErrorBody,
  getErrorStatus,
};
