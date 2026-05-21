// ============================================
// File:    eventValidation.js
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Implements event Validation for the backend.
// ============================================

const { eventWriteSchema } = require("./schemas");

/**
 * Executes the validate event logic.
 * @param {*} data - Represents the data input.
 * @returns {*} Returns the resulting value.
 */
function validateEvent(data) {
  const result = eventWriteSchema.safeParse(data);

  if (result.success) {
    return {
      isValid: true,
      errors: [],
      data: result.data,
    };
  }

  return {
    isValid: false,
    errors: result.error.issues.map((issue) => {
      const path = issue.path.length ? `${issue.path.join(".")} ` : "";
      return `${path}${issue.message}`.trim();
    }),
  };
}

module.exports = validateEvent;
