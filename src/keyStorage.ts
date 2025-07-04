// keyStorage.ts
import { Database } from "bun:sqlite";
import { randomBytes } from "crypto";
import { deriveKey, encrypt, decrypt } from "./crypto";

const db = new Database("key.db");

// Create table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS master_key (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    salt TEXT,
    iv TEXT,
    encrypted_key TEXT
  )
`);

export function createMasterKey(masterPassword: string): void {
  const salt = randomBytes(16);
  const encryptionKey = randomBytes(32); // This encrypts logins.json
  const masterKey = deriveKey(masterPassword, salt);
  const { iv, ciphertext } = encrypt(encryptionKey, masterKey);

  db.run(
    "INSERT INTO master_key (salt, iv, encrypted_key) VALUES (?, ?, ?)",
    salt.toString("base64"),
    iv.toString("base64"),
    ciphertext.toString("base64")
  );
}

export function getEncryptionKey(masterPassword: string): Buffer {
  const row = db.query("SELECT * FROM master_key LIMIT 1").get();
  if (!row) throw new Error("Master key not found.");

  const salt = Buffer.from(row.salt, "base64");
  const iv = Buffer.from(row.iv, "base64");
  const encryptedKey = Buffer.from(row.encrypted_key, "base64");

  const masterKey = deriveKey(masterPassword, salt);
  return decrypt(encryptedKey, masterKey, iv);
}
