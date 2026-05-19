const { Resend } = require("resend");

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

function getEmailFrom() {
  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM is not configured");
  }

  return `CEDA <${process.env.EMAIL_FROM}>`;
}

function formatEventDate(dateString) {
  const [year, month, day] = String(dateString).split("-").map(Number);
  const date = new Date(Date.UTC(year, (month || 1) - 1, day || 1));
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatEventTime(timeString) {
  const [hour = "00", minute = "00"] = String(timeString).split(":");
  const date = new Date(Date.UTC(2000, 0, 1, Number(hour), Number(minute), 0));
  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date);
}

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

module.exports = {
  formatEventDate,
  formatEventTime,
  sendBookingConfirmationEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
};
