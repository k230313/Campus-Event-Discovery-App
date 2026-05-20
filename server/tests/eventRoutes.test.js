const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getEffectiveWriteStatus,
  canViewEvent,
} = require("../routes/eventRoutes");

test("public users can only view published events", () => {
  assert.equal(canViewEvent({ status: "published", organizerId: "2" }, null), true);
  assert.equal(canViewEvent({ status: "pending", organizerId: "2" }, null), false);
});

test("organizers can view their own pending events but not other organizers pending events", () => {
  const organizer = { id: "2", role: "organizer" };
  assert.equal(canViewEvent({ status: "pending", organizerId: "2" }, organizer), true);
  assert.equal(canViewEvent({ status: "pending", organizerId: "9" }, organizer), false);
});

test("organizer edits to a previously published event are forced back to pending", () => {
  assert.equal(
    getEffectiveWriteStatus({
      userRole: "organizer",
      existingStatus: "published",
      requestedStatus: "cancelled",
      fallbackStatus: "draft",
    }),
    "pending"
  );
});

test("organizer edits to non-published events keep the requested status", () => {
  assert.equal(
    getEffectiveWriteStatus({
      userRole: "organizer",
      existingStatus: "draft",
      requestedStatus: "cancelled",
      fallbackStatus: "draft",
    }),
    "cancelled"
  );
});

test("admin edits keep the requested status even for previously published events", () => {
  assert.equal(
    getEffectiveWriteStatus({
      userRole: "admin",
      existingStatus: "published",
      requestedStatus: "cancelled",
      fallbackStatus: "draft",
    }),
    "cancelled"
  );
});
