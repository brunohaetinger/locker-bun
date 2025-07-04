// keyStorage.ts
import Database from "better-sqlite3";
import { randomBytes } from "crypto";
import { deriveKey, encrypt, decrypt } from "./crypto";

const db = new Database("key.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS master_key (
    id INTEGER PRIMARY KEY,
    salt BLOB,
    iv BLOB,
    encrypted_key BLOB
  );
`);

export function createMasterKey(masterPassword: string): void {
  const salt = randomBytes(16);
  const encryptionKey = randomBytes(32); // This encrypts the credentials
  const masterKey = deriveKey(masterPassword, salt);
  const { iv, ciphertext } = encrypt(encryptionKey, masterKey);

  const stmt = db.prepare("INSERT INTO master_key (salt, iv, encrypted_key) VALUES (?, ?, ?)");
  stmt.run(salt, iv, ciphertext);
}

export function getEncryptionKey(masterPassword: string): Buffer {
  const row = db.prepare("SELECT * FROM master_key LIMIT 1").get();
  if (!row) throw new Error("Master key not found.");
  const masterKey = deriveKey(masterPassword, row.salt);
  return decrypt(row.encrypted_key, masterKey, row.iv);
}
