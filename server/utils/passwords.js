const crypto = require("crypto");

const SCRYPT_KEYLEN = 64;

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

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt);
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

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
