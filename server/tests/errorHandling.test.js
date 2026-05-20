const test = require("node:test");
const assert = require("node:assert/strict");

const { getErrorStatus, getErrorBody } = require("../utils/errorHandling");

test("maps CSRF errors to 403", () => {
  assert.equal(getErrorStatus({ code: "EBADCSRFTOKEN" }), 403);
  assert.deepEqual(getErrorBody({ code: "EBADCSRFTOKEN" }), {
    error: "Invalid CSRF token",
  });
});

test("preserves explicit error status codes", () => {
  assert.equal(getErrorStatus({ status: 404 }), 404);
  assert.deepEqual(getErrorBody({ status: 404 }), {
    error: "Internal server error",
  });
});
