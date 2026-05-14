const { Resend } = require("resend");

async function sendPasswordResetEmail({ to, resetUrl, idempotencyKey }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM is not configured");
  }

  const resend = new Resend(apiKey);

  return resend.emails.send({
    from: `CEDA <${process.env.EMAIL_FROM}>`,
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
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM is not configured");
  }

  const resend = new Resend(apiKey);

  return resend.emails.send({
    from: `CEDA <${process.env.EMAIL_FROM}>`,
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

module.exports = {
  sendPasswordResetEmail,
  sendVerificationEmail,
};
