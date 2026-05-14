const { eventWriteSchema } = require("./schemas");

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
