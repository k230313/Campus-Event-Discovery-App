// ============================================
// File:    turnstile.js
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Verifies Cloudflare Turnstile tokens for protected public forms.
// ============================================

/**
 * Verifies a Cloudflare Turnstile token with Cloudflare's siteverify API.
 * @param {string} token - Client-side Turnstile token.
 * @param {string} remoteIp - Request IP address forwarded to Turnstile.
 * @returns {Promise<boolean>} True when the token is accepted by Cloudflare.
 */
async function verifyTurnstileToken(token, remoteIp) {
  try {
    const secret = process.env.TURNSTILE_SECRET_KEY;

    if (!secret) {
      throw new Error("TURNSTILE_SECRET_KEY is not configured");
    }

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: remoteIp || "",
      }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return Boolean(data.success);
  } catch (error) {
    console.error("[verifyTurnstileToken] Failed:", error.message);
    throw error;
  }
}

module.exports = {
  verifyTurnstileToken,
};
