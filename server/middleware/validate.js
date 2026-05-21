// ============================================
// File:    validate.js
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Implements validate for the backend.
// ============================================

/**
 * Executes the format issues logic.
 * @param {*} issues - Represents the issues input.
 * @returns {*} Returns the resulting value.
 */
function formatIssues(issues) {
  return issues.map((issue) => {
    const path = issue.path.length ? `${issue.path.join(".")} ` : "";
    return `${path}${issue.message}`.trim();
  });
}

/**
 * Executes the validate body logic.
 * @param {*} schema - Represents the schema input.
 * @returns {*} Returns the resulting value.
 */
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: formatIssues(result.error.issues) });
    }

    req.body = result.data;
    return next();
  };
}

module.exports = {
  validateBody,
};
