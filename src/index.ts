// index.ts
import { readFileSync, writeFileSync, existsSync } from "fs";
import { createMasterKey, getEncryptionKey } from "./keyStorage";
import { encrypt, decrypt } from "./crypto";

const jsonPath = "logins.json";

function loadLogins(): any {
  return existsSync(jsonPath) ? JSON.parse(readFileSync(jsonPath, "utf-8")) : {};
}

function saveLogins(data: any) {
  writeFileSync(jsonPath, JSON.stringify(data, null, 2));
}

async function main() {
  const action = process.argv[2]; // 'init', 'add', 'get', etc.

  if (action === "init") {
    const password = prompt("Set master password: ")!;
    createMasterKey(password);
    console.log("Initialized master key.");
    return;
  }

  const masterPassword = prompt("Enter master password: ")!;
  const key = getEncryptionKey(masterPassword);

  if (action === "add") {
    const domain = prompt("Domain: ")!;
    const username = prompt("Username: ")!;
    const password = prompt("Password: ")!;

    const { iv, ciphertext } = encrypt(Buffer.from(JSON.stringify({ username, password })), key);
    const logins = loadLogins();
    logins[domain] = { iv: iv.toString("base64"), data: ciphertext.toString("base64") };
    saveLogins(logins);
    console.log("Stored!");
  }

  if (action === "get") {
    const domain = process.argv[3];
    const logins = loadLogins();
    if (!logins[domain]) {
      console.log("No data for that domain.");
      return;
    }

    const { iv, data } = logins[domain];
    const decrypted = decrypt(Buffer.from(data, "base64"), key, Buffer.from(iv, "base64"));
    const parsed = JSON.parse(decrypted.toString());
    console.log(`Username: ${parsed.username}\nPassword: ${parsed.password}`);
  }
}

main();
