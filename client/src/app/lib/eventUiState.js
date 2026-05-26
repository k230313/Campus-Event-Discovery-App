/**
 * Returns a copy of a date-like value normalized to local midnight.
 * @param {Date | string | number} value - Date-like value to normalize.
 * @returns {Date} Local-midnight date.
 */
function startOfDay(value) {
  let date;

  if (value instanceof Date) {
    date = new Date(value);
  } else if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    date = new Date(year, month - 1, day);
  } else {
    date = new Date(value);
  }

  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Classifies an event date relative to the current day for list/detail UI logic.
 * @param {string} eventDate - ISO-style event date string.
 * @param {Date} [now=new Date()] - Current time override for deterministic tests.
 * @returns {{ isPast: boolean, isUpcoming: boolean, isThisWeek: boolean, isThisMonth: boolean }}
 */
export function classifyEventTiming(eventDate, now = new Date()) {
  const eventDay = startOfDay(eventDate);
  const today = startOfDay(now);
  const oneWeekFromNow = startOfDay(now);
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
  const oneMonthFromNow = startOfDay(now);
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

  return {
    isPast: eventDay < today,
    isUpcoming: eventDay >= today,
    isThisWeek: eventDay >= today && eventDay <= oneWeekFromNow,
    isThisMonth: eventDay >= today && eventDay <= oneMonthFromNow,
  };
}

/**
 * Applies an event deletion outcome to the related local UI state.
 * @template TEvent
 * @template TBookmark
 * @template TRsvp
 * @param {{ events: TEvent[], bookmarks: TBookmark[], rsvps: TRsvp[] }} state - Current event-related state slices.
 * @param {string} eventId - Event identifier targeted for deletion.
 * @param {boolean} succeeded - Whether the backend confirmed deletion.
 * @returns {{ events: TEvent[], bookmarks: TBookmark[], rsvps: TRsvp[] }} Updated state when successful, otherwise the original state.
 */
export function applyEventDeletionResult(state, eventId, succeeded) {
  if (!succeeded) {
    return state;
  }

  return {
    events: state.events.filter((event) => event.id !== eventId),
    bookmarks: state.bookmarks.filter((bookmark) => bookmark.eventId !== eventId),
    rsvps: state.rsvps.filter((rsvp) => rsvp.eventId !== eventId),
  };
}
