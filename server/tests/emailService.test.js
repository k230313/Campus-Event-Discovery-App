// ============================================
// File:    emailService.test.js
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Implements email Service.test for the backend.
// ============================================

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  sendContactMessageEmail,
  sendBookingConfirmationEmail,
  sendOrganizerEventFullEmail,
  sendOrganizerFirstRegistrationEmail,
} = require("../services/emailService");

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("sendBookingConfirmationEmail sends booking details through Resend", async () => {
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalEmailFrom = process.env.EMAIL_FROM;

  process.env.RESEND_API_KEY = "test-api-key";
  process.env.EMAIL_FROM = "noreply@example.com";

  const sentPayloads = [];
  const resend = {
    emails: {
      /**
       * Asynchronously executes the send logic.
       * @param {*} payload - Represents the payload input.
       * @returns {*} Returns the resulting value.
       */
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

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("sendBookingConfirmationEmail supports Date objects for event times from MySQL", async () => {
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalEmailFrom = process.env.EMAIL_FROM;

  process.env.RESEND_API_KEY = "test-api-key";
  process.env.EMAIL_FROM = "noreply@example.com";

  const sentPayloads = [];
  const resend = {
    emails: {
      /**
       * Asynchronously executes the send logic.
       * @param {*} payload - Represents the payload input.
       * @returns {*} Returns the resulting value.
       */
      send: async (payload) => {
        sentPayloads.push(payload);
        return { data: { id: "email_789" }, error: null };
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
        startTime: new Date("1970-01-01T09:00:00.000Z"),
        endTime: new Date("1970-01-01T15:00:00.000Z"),
        location: "Main Hall, Building A",
      },
      idempotencyKey: "booking/1/42/time-date",
    });

    assert.equal(result.error, null);
    assert.equal(sentPayloads.length, 1);
    assert.match(sentPayloads[0].html, /9:00 am/);
    assert.match(sentPayloads[0].html, /3:00 pm/);
  } finally {
    process.env.RESEND_API_KEY = originalApiKey;
    process.env.EMAIL_FROM = originalEmailFrom;
  }
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("sendBookingConfirmationEmail supports Date objects for event dates", async () => {
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalEmailFrom = process.env.EMAIL_FROM;

  process.env.RESEND_API_KEY = "test-api-key";
  process.env.EMAIL_FROM = "noreply@example.com";

  const sentPayloads = [];
  const resend = {
    emails: {
      /**
       * Asynchronously executes the send logic.
       * @param {*} payload - Represents the payload input.
       * @returns {*} Returns the resulting value.
       */
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

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("sendOrganizerFirstRegistrationEmail sends the organizer a first-booking summary", async () => {
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalEmailFrom = process.env.EMAIL_FROM;

  process.env.RESEND_API_KEY = "test-api-key";
  process.env.EMAIL_FROM = "noreply@example.com";

  const sentPayloads = [];
  const resend = {
    emails: {
      /**
       * Asynchronously executes the send logic.
       * @param {*} payload - Represents the payload input.
       * @returns {*} Returns the resulting value.
       */
      send: async (payload) => {
        sentPayloads.push(payload);
        return { data: { id: "email_111" }, error: null };
      },
    },
  };

  try {
    const result = await sendOrganizerFirstRegistrationEmail({
      resend,
      to: "organizer@example.com",
      organizerName: "Organizer Name",
      event: {
        id: 42,
        title: "Career Fair 2026",
        date: "2026-06-15",
        startTime: "09:00:00",
        endTime: "15:00:00",
        location: "Main Hall, Building A",
      },
      idempotencyKey: "organizer-first/1/42",
    });

    assert.equal(result.error, null);
    assert.equal(sentPayloads.length, 1);
    assert.equal(sentPayloads[0].subject, "Your event has its first registration");
    assert.equal(sentPayloads[0].to[0], "organizer@example.com");
    assert.match(sentPayloads[0].html, /Career Fair 2026/);
    assert.match(sentPayloads[0].html, /15 June 2026/);
  } finally {
    process.env.RESEND_API_KEY = originalApiKey;
    process.env.EMAIL_FROM = originalEmailFrom;
  }
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("sendOrganizerEventFullEmail sends the organizer a capacity-reached summary", async () => {
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalEmailFrom = process.env.EMAIL_FROM;

  process.env.RESEND_API_KEY = "test-api-key";
  process.env.EMAIL_FROM = "noreply@example.com";

  const sentPayloads = [];
  const resend = {
    emails: {
      /**
       * Asynchronously executes the send logic.
       * @param {*} payload - Represents the payload input.
       * @returns {*} Returns the resulting value.
       */
      send: async (payload) => {
        sentPayloads.push(payload);
        return { data: { id: "email_222" }, error: null };
      },
    },
  };

  try {
    const result = await sendOrganizerEventFullEmail({
      resend,
      to: "organizer@example.com",
      organizerName: "Organizer Name",
      event: {
        id: 42,
        title: "Career Fair 2026",
        date: "2026-06-15",
        startTime: "09:00:00",
        endTime: "15:00:00",
        location: "Main Hall, Building A",
        capacity: 250,
      },
      idempotencyKey: "organizer-full/1/42",
    });

    assert.equal(result.error, null);
    assert.equal(sentPayloads.length, 1);
    assert.equal(sentPayloads[0].subject, "Your event is now full");
    assert.equal(sentPayloads[0].to[0], "organizer@example.com");
    assert.match(sentPayloads[0].html, /Career Fair 2026/);
    assert.match(sentPayloads[0].html, /15 June 2026/);
    assert.match(sentPayloads[0].html, /250/);
  } finally {
    process.env.RESEND_API_KEY = originalApiKey;
    process.env.EMAIL_FROM = originalEmailFrom;
  }
});

/**
 * Executes the test case logic.
 * @returns {*} Returns the resulting value.
 */
test("sendContactMessageEmail sends the message to the configured inbox and escapes HTML", async () => {
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalEmailFrom = process.env.EMAIL_FROM;
  const originalContactEmailTo = process.env.CONTACT_EMAIL_TO;

  process.env.RESEND_API_KEY = "test-api-key";
  process.env.EMAIL_FROM = "noreply@example.com";
  process.env.CONTACT_EMAIL_TO = "school@example.edu";

  const sentPayloads = [];
  const resend = {
    emails: {
      /**
       * Asynchronously executes the send logic.
       * @param {*} payload - Represents the payload input.
       * @returns {*} Returns the resulting value.
       */
      send: async (payload) => {
        sentPayloads.push(payload);
        return { data: { id: "email_333" }, error: null };
      },
    },
  };

  try {
    const result = await sendContactMessageEmail({
      resend,
      name: "<Admin>",
      email: "student@example.com",
      subject: "Need <help>",
      message: "Hello\n<script>alert('x')</script>",
    });

    assert.equal(result.error, null);
    assert.equal(sentPayloads.length, 1);
    assert.equal(sentPayloads[0].to[0], "school@example.edu");
    assert.equal(sentPayloads[0].replyTo, "student@example.com");
    assert.equal(sentPayloads[0].subject, "CEDA contact form: Need <help>");
    assert.match(sentPayloads[0].html, /&lt;Admin&gt;/);
    assert.match(sentPayloads[0].html, /&lt;script&gt;alert\(&#39;x&#39;\)&lt;\/script&gt;/);
    assert.match(sentPayloads[0].html, /<br \/>/);
  } finally {
    process.env.RESEND_API_KEY = originalApiKey;
    process.env.EMAIL_FROM = originalEmailFrom;
    process.env.CONTACT_EMAIL_TO = originalContactEmailTo;
  }
});
