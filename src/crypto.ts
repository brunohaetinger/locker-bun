// crypto.ts
import { randomBytes, createCipheriv, createDecipheriv, pbkdf2Sync } from "crypto";

export function deriveKey(password: string, salt: Buffer): Buffer {
  return pbkdf2Sync(password, salt, 100_000, 32, "sha256");
}

export function encrypt(data: Buffer, key: Buffer): { iv: Buffer, ciphertext: Buffer } {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", key, iv);
  const ciphertext = Buffer.concat([cipher.update(data), cipher.final()]);
  return { iv, ciphertext };
}

export function decrypt(ciphertext: Buffer, key: Buffer, iv: Buffer): Buffer {
  const decipher = createDecipheriv("aes-256-cbc", key, iv);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

