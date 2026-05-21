// ============================================
// File:    authTokens.js
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Implements auth Tokens for the backend.
// ============================================

const crypto = require("crypto");

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
const MIN_SECRET_LENGTH = 32;

/**
 * Executes the get secret logic.
 * @returns {*} Returns the resulting value.
 */
function getSecret() {
  const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET or JWT_SECRET must be set");
  }

  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(`AUTH_SECRET or JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters long`);
  }

  return secret;
}

/**
 * Executes the encode logic.
 * @param {*} value - Represents the value input.
 * @returns {*} Returns the resulting value.
 */
function encode(value) {
  return Buffer.from(value).toString("base64url");
}

/**
 * Executes the decode logic.
 * @param {*} value - Represents the value input.
 * @returns {*} Returns the resulting value.
 */
function decode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

/**
 * Executes the sign logic.
 * @param {*} value - Represents the value input.
 * @returns {*} Returns the resulting value.
 */
function sign(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

/**
 * Executes the create auth token logic.
 * @param {*} payload - Represents the payload input.
 * @param {*} expiresInSeconds - Represents the expiresInSeconds input.
 * @returns {*} Returns the resulting value.
 */
function createAuthToken(payload, expiresInSeconds = TOKEN_TTL_SECONDS) {
  const enrichedPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };

  const encodedPayload = encode(JSON.stringify(enrichedPayload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

/**
 * Executes the verify auth token logic.
 * @param {*} token - Represents the token input.
 * @returns {*} Returns the resulting value.
 */
function verifyAuthToken(token) {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  const expectedSignature = sign(encodedPayload);

  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(decode(encodedPayload));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

module.exports = {
  createAuthToken,
  getSecret,
  verifyAuthToken,
};
