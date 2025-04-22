import crypto from "crypto";

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// Generate a secure key from the environment variable
const getKey = (): Buffer => {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error('ENCRYPTION_SECRET environment variable is required');
  }
  return crypto.pbkdf2Sync(secret, 'salt', 100000, KEY_LENGTH, 'sha512');
};

export const encrypt = async (data: string): Promise<string> => {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(data, 'utf8'),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  // Combine salt, iv, encrypted data, and tag
  const result = Buffer.concat([salt, iv, encrypted, tag]);

  return result.toString('base64');
};

export const decrypt = async (encryptedData: string): Promise<string> => {
  const key = getKey();
  const buffer = Buffer.from(encryptedData, 'base64');

  // Extract components
  const salt = buffer.subarray(0, SALT_LENGTH);
  const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH, -TAG_LENGTH);
  const tag = buffer.subarray(-TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
};
