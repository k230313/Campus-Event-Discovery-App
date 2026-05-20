function getErrorStatus(err) {
  if (err?.code === "EBADCSRFTOKEN") {
    return 403;
  }

  return err?.status || 500;
}

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
