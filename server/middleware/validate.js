function formatIssues(issues) {
  return issues.map((issue) => {
    const path = issue.path.length ? `${issue.path.join(".")} ` : "";
    return `${path}${issue.message}`.trim();
  });
}

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
