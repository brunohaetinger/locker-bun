<p align="center">
  <img src="assets/locker-bun-logo.png" width="128" alt="Locker Bun Logo" />
</p>

# locker-bun

It's a PoC Password Manager written with Bun

- 🔐 A `logins.json` file (stores encrypted credentials)
- 🗄 A SQLite database (`key.db`) to store the encryption key (which will itself be encrypted)
- 🔑 A master password (used to unlock the encryption key)
- ⚙️ Built with Bun (JavaScript runtime with modern performance and batteries-included)

## Running

### To install dependencies:

```bash
bun install
```

### To run:

```bash
bun run src/index.ts init        # sets master password, generates key
bun run src/index.ts add         # prompts to add a login
bun run src/index.ts get github.com  # fetches login for github.com
```

## Usage flows:

### Init

```mermaid
flowchart TD
    A[Init] -->|Prompt master password| B("keyStorage.createMasterKey(password)")
    B -->|randomBytes| E[encryptionKey]
    B -->|randomBytes| D[salt]
    B --> F[fa:fa-key masterKey]
    D -->|"deriveKey(masterPassword, salt)"| F[fa:fa-key masterKey]
    F --> I["encrypt(masterKey, encryptionKey)"]
    E --> I
    I --> G[iv, ciphertext]
    D --> H[DB: Insert into master_key]
    G --> H
```

### Add flow

```mermaid
flowchart TD
    A[Add] -->|Prompt master password| B("getEncryptionKey(masterPassword)")
    B -->|Prompt Domain, Username and Password| C("encrypt({username, password}, key)")
    D("loadLogins()") --> E("logins[domain] = {iv, data}")
    C --> E
    E --> F("saveLogins(logins)")
```

### Get flow

```mermaid
flowchart TD
    A[Get] -->|Prompt master password| B("getEncryptionKey(masterPassword)")
    B --> Decrypt
    D("loadLogins()") --> E("{iv, data}")
    Domain("domain = argv[3]") --> E
    E --> Decrypt("decrypt(data, key, iv)")
    Decrypt --> Parse
    Parse --> Print("Print username, password")
```


