// ============================================
// File:    passwords.js
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Implements passwords for the backend.
// ============================================

const crypto = require("crypto");

const SCRYPT_KEYLEN = 64;

/**
 * Executes the scrypt async logic.
 * @param {*} password - Represents the password input.
 * @param {*} salt - Represents the salt input.
 * @returns {*} Returns the resulting value.
 */
function scryptAsync(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, SCRYPT_KEYLEN, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey);
    });
  });
}

/**
 * Asynchronously executes the hash password logic.
 * @param {*} password - Represents the password input.
 * @returns {*} Returns the resulting value.
 */
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt);
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

/**
 * Asynchronously executes the verify password logic.
 * @param {*} password - Represents the password input.
 * @param {*} storedHash - Represents the storedHash input.
 * @returns {*} Returns the resulting value.
 */
async function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.startsWith("scrypt$")) {
    return false;
  }

  const [, salt, expectedHash] = storedHash.split("$");
  if (!salt || !expectedHash) {
    return false;
  }

  const derivedKey = await scryptAsync(password, salt);
  const actualHash = Buffer.from(derivedKey.toString("hex"), "hex");
  const expected = Buffer.from(expectedHash, "hex");

  if (actualHash.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(actualHash, expected);
}

module.exports = {
  hashPassword,
  verifyPassword,
};
