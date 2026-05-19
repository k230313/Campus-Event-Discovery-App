const test = require("node:test");
const assert = require("node:assert/strict");

const { sendBookingConfirmationEmail } = require("../services/emailService");

test("sendBookingConfirmationEmail sends booking details through Resend", async () => {
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalEmailFrom = process.env.EMAIL_FROM;

  process.env.RESEND_API_KEY = "test-api-key";
  process.env.EMAIL_FROM = "noreply@example.com";

  const sentPayloads = [];
  const resend = {
    emails: {
      send: async (payload) => {
        sentPayloads.push(payload);
        return { data: { id: "email_123" }, error: null };
      },
    },
  };

  try {
    const result = await sendBookingConfirmationEmail({
      resend,
      to: "student@example.com",
      attendeeName: "Student Name",
      event: {
        id: 42,
        title: "Career Fair 2026",
        date: "2026-06-15",
        startTime: "09:00:00",
        endTime: "15:00:00",
        location: "Main Hall, Building A",
      },
      idempotencyKey: "booking/1/42",
    });

    assert.equal(result.error, null);
    assert.equal(sentPayloads.length, 1);
    assert.equal(sentPayloads[0].subject, "Your CEDA booking is confirmed");
    assert.equal(sentPayloads[0].to[0], "student@example.com");
    assert.match(sentPayloads[0].html, /Career Fair 2026/);
    assert.match(sentPayloads[0].html, /Main Hall, Building A/);
    assert.match(sentPayloads[0].html, /15 June 2026/);
  } finally {
    process.env.RESEND_API_KEY = originalApiKey;
    process.env.EMAIL_FROM = originalEmailFrom;
  }
});

test("sendBookingConfirmationEmail supports Date objects for event dates", async () => {
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalEmailFrom = process.env.EMAIL_FROM;

  process.env.RESEND_API_KEY = "test-api-key";
  process.env.EMAIL_FROM = "noreply@example.com";

  const sentPayloads = [];
  const resend = {
    emails: {
      send: async (payload) => {
        sentPayloads.push(payload);
        return { data: { id: "email_456" }, error: null };
      },
    },
  };

  try {
    const result = await sendBookingConfirmationEmail({
      resend,
      to: "student@example.com",
      attendeeName: "Student Name",
      event: {
        id: 42,
        title: "Career Fair 2026",
        date: new Date("2026-06-15"),
        startTime: "09:00:00",
        endTime: "15:00:00",
        location: "Main Hall, Building A",
      },
      idempotencyKey: "booking/1/42",
    });

    assert.equal(result.error, null);
    assert.equal(sentPayloads.length, 1);
    assert.equal(sentPayloads[0].subject, "Your CEDA booking is confirmed");
    assert.equal(sentPayloads[0].to[0], "student@example.com");
    assert.match(sentPayloads[0].html, /Career Fair 2026/);
    assert.match(sentPayloads[0].html, /Main Hall, Building A/);
    assert.match(sentPayloads[0].html, /15 June 2026/);
  } finally {
    process.env.RESEND_API_KEY = originalApiKey;
    process.env.EMAIL_FROM = originalEmailFrom;
  }
});
