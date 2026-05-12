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

  if (!data.startTime || !/^\d{2}:\d{2}(:\d{2})?$/.test(data.startTime)) {
    errors.push("startTime must use HH:MM or HH:MM:SS");
  }

  if (!data.endTime || !/^\d{2}:\d{2}(:\d{2})?$/.test(data.endTime)) {
    errors.push("endTime must use HH:MM or HH:MM:SS");
  }

  if (!data.location || typeof data.location !== "string") {
    errors.push("location is required");
  }

  if (!data.category || typeof data.category !== "string") {
    errors.push("category is required");
  }

  if (data.capacity !== undefined && data.capacity !== null) {
    const capacity = Number(data.capacity);
    if (!Number.isInteger(capacity) || capacity <= 0) {
      errors.push("capacity must be a positive whole number when provided");
    }
  }

  if (data.startTime && data.endTime) {
    const start = data.startTime.length === 5 ? `${data.startTime}:00` : data.startTime;
    const end = data.endTime.length === 5 ? `${data.endTime}:00` : data.endTime;
    if (end <= start) {
      errors.push("endTime must be later than startTime");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = validateEvent;
