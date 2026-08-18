const PBKDF2_ITERATIONS = 600_000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

export interface VaultBlob {
  salt: Uint8Array;
  iv: Uint8Array;
  ciphertext: Uint8Array;
}

function encodeBlob(blob: VaultBlob): ArrayBuffer {
  const total = SALT_LENGTH + IV_LENGTH + blob.ciphertext.byteLength;
  const buf = new Uint8Array(total);
  buf.set(blob.salt, 0);
  buf.set(blob.iv, SALT_LENGTH);
  buf.set(blob.ciphertext, SALT_LENGTH + IV_LENGTH);
  return buf.buffer;
}

function decodeBlob(buf: ArrayBuffer): VaultBlob {
  const arr = new Uint8Array(buf);
  return {
    salt: arr.slice(0, SALT_LENGTH),
    iv: arr.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH),
    ciphertext: arr.slice(SALT_LENGTH + IV_LENGTH),
  };
}

async function deriveKey(
  passphrase: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encrypt(
  plaintext: string,
  passphrase: string,
): Promise<ArrayBuffer> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(passphrase, salt);
  const enc = new TextEncoder();
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, enc.encode(plaintext)),
  );
  return encodeBlob({ salt, iv, ciphertext });
}

export async function decrypt(
  buf: ArrayBuffer,
  passphrase: string,
): Promise<string> {
  const { salt, iv, ciphertext } = decodeBlob(buf);
  const key = await deriveKey(passphrase, salt);
  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    ciphertext as BufferSource,
  );
  return new TextDecoder().decode(plainBuf);
}
