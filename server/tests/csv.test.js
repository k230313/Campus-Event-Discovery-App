const test = require("node:test");
const assert = require("node:assert/strict");

const { buildCsvFilename, toCsv } = require("../utils/csv");

test("toCsv escapes commas and quotes", () => {
  const csv = toCsv(["Title", "Location"], [["Workshop, Intro", 'Room "A"']]);
  assert.match(csv, /"Workshop, Intro"/);
  assert.match(csv, /"Room ""A"""/);
});

test("buildCsvFilename includes slug and date", () => {
  const filename = buildCsvFilename("event-summary");
  assert.match(filename, /^ceda-event-summary-\d{4}-\d{2}-\d{2}\.csv$/);
});
