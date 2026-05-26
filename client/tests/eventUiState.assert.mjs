import assert from "node:assert/strict";

import {
  applyEventDeletionResult,
  classifyEventTiming,
} from "../src/app/lib/eventUiState.js";

{
  const state = {
    events: [{ id: "1" }, { id: "2" }],
    bookmarks: [{ eventId: "1" }, { eventId: "3" }],
    rsvps: [{ eventId: "1" }, { eventId: "4" }],
  };

  assert.deepEqual(applyEventDeletionResult(state, "1", false), state);
  assert.deepEqual(applyEventDeletionResult(state, "1", true), {
    events: [{ id: "2" }],
    bookmarks: [{ eventId: "3" }],
    rsvps: [{ eventId: "4" }],
  });
}

{
  assert.equal(
    classifyEventTiming("2026-05-26", new Date(2026, 4, 26, 20, 0, 0)).isPast,
    false,
  );
  assert.equal(
    classifyEventTiming("2026-05-25", new Date(2026, 4, 26, 20, 0, 0)).isPast,
    true,
  );
}

console.log("eventUiState assertions passed");
