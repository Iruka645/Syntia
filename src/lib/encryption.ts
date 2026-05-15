import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET; // Must be 256 bits (32 characters)

export function encrypt(text: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_SECRET is not defined in environment variables');
  }

  if (ENCRYPTION_KEY.length !== 32) {
    throw new Error('ENCRYPTION_SECRET must be exactly 32 characters long');
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(text: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_SECRET is not defined in environment variables');
  }

  if (ENCRYPTION_KEY.length !== 32) {
    throw new Error('ENCRYPTION_SECRET must be exactly 32 characters long');
  }

  const parts = text.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encryptedText = parts[2];

  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
