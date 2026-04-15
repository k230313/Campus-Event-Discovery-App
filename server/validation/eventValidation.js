function validateEvent(data) {
  const errors = [];

  if (!data.title || typeof data.title !== "string") {
    errors.push("title is required");
  }

  if (!data.description || typeof data.description !== "string") {
    errors.push("description is required");
  }

  if (!data.date || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    errors.push("date must use YYYY-MM-DD");
  }

  if (!data.location || typeof data.location !== "string") {
    errors.push("location is required");
  }

  if (!data.category || typeof data.category !== "string") {
    errors.push("category is required");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = validateEvent;
