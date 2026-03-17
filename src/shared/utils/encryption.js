const crypto = require('crypto');
const { env } = require('../../config');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Encrypt a plaintext string using AES-256-CBC.
 * Used for storing API keys, secret keys, webhook secrets.
 *
 * @param {string} text - Plaintext to encrypt
 * @returns {string} - iv:encrypted (hex encoded)
 */
function encrypt(text) {
  if (!text) return text;

  const key = Buffer.from(env.encryptionKey, 'utf-8').slice(0, 32);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt an AES-256-CBC encrypted string.
 *
 * @param {string} encrypted - iv:encrypted (hex encoded)
 * @returns {string} - Original plaintext
 */
function decrypt(encrypted) {
  if (!encrypted) return encrypted;

  const key = Buffer.from(env.encryptionKey, 'utf-8').slice(0, 32);
  const [ivHex, encryptedText] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

module.exports = { encrypt, decrypt };
