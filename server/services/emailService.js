// ============================================
// File:    emailService.js
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Implements email Service for the backend.
// ============================================

const { Resend } = require("resend");

/**
 * Executes the create resend client logic.
 * @param {*} overrideClient - Represents the overrideClient input.
 * @returns {*} Returns the resulting value.
 */
function createResendClient(overrideClient) {
  if (overrideClient) {
    return overrideClient;
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  return new Resend(apiKey);
}

/**
 * Executes the get email from logic.
 * @returns {*} Returns the resulting value.
 */
function getEmailFrom() {
  const from = process.env.EMAIL_FROM?.trim();
  if (!from) {
    throw new Error("EMAIL_FROM is not configured");
  }

  if (from.includes("<") && from.includes(">")) {
    return from.startsWith("CEDA ") ? from : `CEDA ${from}`;
  }

  return `CEDA <${from}>`;
}

/**
 * Resolves the destination inbox for contact form submissions.
 * @returns {string} Configured destination email address.
 */
function getContactEmailTo() {
  const to = process.env.CONTACT_EMAIL_TO?.trim();
  if (!to) {
    throw new Error("CONTACT_EMAIL_TO is not configured");
  }

  return to;
}

/**
 * Escapes untrusted text before it is embedded into an HTML email body.
 * @param {*} value - Raw user-supplied string content.
 * @returns {string} HTML-safe string.
 */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Executes the format event date logic.
 * @param {*} dateValue - Represents the dateValue input.
 * @returns {*} Returns the resulting value.
 */
function formatEventDate(dateValue) {
  let date;

  if (dateValue instanceof Date) {
    date = new Date(Date.UTC(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate()));
  } else if (typeof dateValue === "string") {
    const normalized = dateValue.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      const [year, month, day] = normalized.split("-").map(Number);
      date = new Date(Date.UTC(year, month - 1, day));
    } else {
      date = new Date(normalized);
    }
  } else {
    date = new Date(dateValue);
  }

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid event date value: ${dateValue}`);
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Executes the normalize time parts logic.
 * @param {*} timeValue - Represents the timeValue input.
 * @returns {*} Returns the resulting value.
 */
function normalizeTimeParts(timeValue) {
  if (timeValue == null) {
    return { hour: 0, minute: 0 };
  }

  if (timeValue instanceof Date) {
    if (Number.isNaN(timeValue.getTime())) {
      throw new Error(`Invalid event time value: ${timeValue}`);
    }

    return {
      hour: timeValue.getUTCHours(),
      minute: timeValue.getUTCMinutes(),
    };
  }

  if (typeof timeValue === "object" && "hours" in timeValue) {
    return {
      hour: Number(timeValue.hours) || 0,
      minute: Number(timeValue.minutes) || 0,
    };
  }

  const text = String(timeValue).trim();
  const match = text.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    return { hour: Number(match[1]), minute: Number(match[2]) };
  }

  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    return {
      hour: parsed.getUTCHours(),
      minute: parsed.getUTCMinutes(),
    };
  }

  throw new Error(`Invalid event time value: ${timeValue}`);
}

/**
 * Executes the format event time logic.
 * @param {*} timeValue - Represents the timeValue input.
 * @returns {*} Returns the resulting value.
 */
function formatEventTime(timeValue) {
  const { hour, minute } = normalizeTimeParts(timeValue);
  const date = new Date(Date.UTC(2000, 0, 1, hour, minute, 0));
  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date);
}

/**
 * Asynchronously executes the send password reset email logic.
 * @param {object} params - Function parameters.
 * @returns {*} Returns the resulting value.
 */
async function sendPasswordResetEmail({ to, resetUrl, idempotencyKey }) {
  const resend = createResendClient();

  return resend.emails.send({
    from: getEmailFrom(),
    to: [to],
    subject: "Reset your CEDA password",
    html: `
      <p>You requested a password reset for your CEDA account.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
    idempotencyKey,
  });
}

/**
 * Asynchronously executes the send verification email logic.
 * @param {object} params - Function parameters.
 * @returns {*} Returns the resulting value.
 */
async function sendVerificationEmail({ to, verificationUrl, idempotencyKey }) {
  const resend = createResendClient();

  return resend.emails.send({
    from: getEmailFrom(),
    to: [to],
    subject: "Verify your CEDA email address",
    html: `
      <p>Welcome to CEDA.</p>
      <p><a href="${verificationUrl}">Verify your email address</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not create this account, you can ignore this email.</p>
    `,
    idempotencyKey,
  });
}

async function sendBookingConfirmationEmail({
  resend,
  to,
  attendeeName,
  event,
  idempotencyKey,
}) {
  const client = createResendClient(resend);
  const eventDate = formatEventDate(event.date);
  const startTime = formatEventTime(event.startTime);
  const endTime = formatEventTime(event.endTime);

  return client.emails.send({
    from: getEmailFrom(),
    to: [to],
    subject: "Your CEDA booking is confirmed",
    html: `
      <p>Hello ${attendeeName},</p>
      <p>Your booking for <strong>${event.title}</strong> is confirmed.</p>
      <p><strong>Date:</strong> ${eventDate}</p>
      <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <p>You can view your registered events in your CEDA dashboard at any time.</p>
    `,
    idempotencyKey,
  });
}

async function sendWaitlistPromotionEmail({
  resend,
  to,
  attendeeName,
  event,
  idempotencyKey,
}) {
  const client = createResendClient(resend);
  const eventDate = formatEventDate(event.date);
  const startTime = formatEventTime(event.startTime);
  const endTime = formatEventTime(event.endTime);

  return client.emails.send({
    from: getEmailFrom(),
    to: [to],
    subject: "Your CEDA waitlist spot is now confirmed",
    html: `
      <p>Hello ${attendeeName},</p>
      <p>Good news. A seat has opened up and your waitlist entry for <strong>${event.title}</strong> is now a confirmed registration.</p>
      <p><strong>Date:</strong> ${eventDate}</p>
      <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <p>You can view your updated registration in your CEDA dashboard at any time.</p>
    `,
    idempotencyKey,
  });
}

async function sendOrganizerFirstRegistrationEmail({
  resend,
  to,
  organizerName,
  event,
  idempotencyKey,
}) {
  const client = createResendClient(resend);
  const eventDate = formatEventDate(event.date);
  const startTime = formatEventTime(event.startTime);
  const endTime = formatEventTime(event.endTime);

  return client.emails.send({
    from: getEmailFrom(),
    to: [to],
    subject: "Your event has its first registration",
    html: `
      <p>Hello ${organizerName},</p>
      <p>Your event <strong>${event.title}</strong> has received its first registration.</p>
      <p><strong>Date:</strong> ${eventDate}</p>
      <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
      <p><strong>Location:</strong> ${event.location}</p>
    `,
    idempotencyKey,
  });
}

async function sendOrganizerEventFullEmail({
  resend,
  to,
  organizerName,
  event,
  idempotencyKey,
}) {
  const client = createResendClient(resend);
  const eventDate = formatEventDate(event.date);
  const startTime = formatEventTime(event.startTime);
  const endTime = formatEventTime(event.endTime);

  return client.emails.send({
    from: getEmailFrom(),
    to: [to],
    subject: "Your event is now full",
    html: `
      <p>Hello ${organizerName},</p>
      <p>Your event <strong>${event.title}</strong> has reached its capacity of <strong>${event.capacity}</strong> registrations.</p>
      <p><strong>Date:</strong> ${eventDate}</p>
      <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
      <p><strong>Location:</strong> ${event.location}</p>
    `,
    idempotencyKey,
  });
}

/**
 * Sends a contact form submission to the configured project inbox.
 * @param {object} params - Contact email payload.
 * @param {*} params.resend - Optional Resend client override for tests.
 * @param {string} params.name - Sender display name.
 * @param {string} params.email - Sender email address.
 * @param {string} params.subject - Contact form subject line.
 * @param {string} params.message - Contact form message body.
 * @returns {Promise<object>} Resend API response.
 */
async function sendContactMessageEmail({
  resend,
  name,
  email,
  subject,
  message,
}) {
  const client = createResendClient(resend);
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br />");

  return client.emails.send({
    from: getEmailFrom(),
    to: [getContactEmailTo()],
    replyTo: email,
    subject: `CEDA contact form: ${subject}`,
    html: `
      <p>A new contact form submission was received.</p>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Subject:</strong> ${safeSubject}</p>
      <p><strong>Message:</strong><br />${safeMessage}</p>
    `,
  });
}

module.exports = {
  escapeHtml,
  formatEventDate,
  formatEventTime,
  sendBookingConfirmationEmail,
  sendContactMessageEmail,
  sendOrganizerEventFullEmail,
  sendOrganizerFirstRegistrationEmail,
  sendPasswordResetEmail,
  sendWaitlistPromotionEmail,
  sendVerificationEmail,
};
