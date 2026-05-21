// ============================================
// File:    contactRoutes.js
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Handles public contact form submissions for the backend.
// ============================================

const express = require("express");
const { contactRateLimit } = require("../middleware/security");
const { validateBody } = require("../middleware/validate");
const { sendContactMessageEmail } = require("../services/emailService");
const { contactSchema } = require("../validation/schemas");

const router = express.Router();

/**
 * Normalizes downstream contact delivery failures into a safe API response message.
 * @param {*} error - Email delivery error thrown by Resend or configuration checks.
 * @returns {string} Safe error message for the client.
 */
function getContactSubmissionErrorMessage(error) {
  if (error?.message === "CONTACT_EMAIL_TO is not configured" || error?.message === "EMAIL_FROM is not configured" || error?.message === "RESEND_API_KEY is not configured") {
    return "Contact form is not configured right now. Please try again later.";
  }

  return "We could not send your message right now. Please try again later.";
}

/**
 * Accepts a public contact form submission and relays it to the configured inbox.
 * @param {*} req - Express request object.
 * @param {*} res - Express response object.
 * @returns {Promise<import('express').Response>} JSON success or failure response.
 */
router.post("/", contactRateLimit, validateBody(contactSchema), async (req, res) => {
  const {
    name,
    email,
    subject,
    message,
  } = req.body;

  try {
    await sendContactMessageEmail({
      name,
      email,
      subject,
      message,
    });

    return res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("POST /api/contact error:", error);
    return res.status(500).json({ error: getContactSubmissionErrorMessage(error) });
  }
});

module.exports = router;
module.exports.getContactSubmissionErrorMessage = getContactSubmissionErrorMessage;
