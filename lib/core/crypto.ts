const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const DEFAULT_ITERATIONS = 600_000;

function getSubtle(): SubtleCrypto {
  if (globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new Error('Web Crypto API unavailable');
}

function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

function encodeBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeBase64(str: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(str, 'base64'));
  }
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export interface VaultCryptoOptions {
  iterations?: number;
  hash?: string;
  aes?: string;
  keyLength?: number;
}

export interface EncryptionMeta {
  salt?: string;
  version?: number;
}

export interface EncryptionEnvelope {
  salt: string;
  iv: string;
  cipher: string;
  version: number;
  iterations: number;
  hash: string;
  persistedAt?: string;
}

export class VaultCrypto {
  iterations: number;
  hash: string;
  aes: string;
  keyLength: number;

  constructor({
    iterations = DEFAULT_ITERATIONS,
    hash = 'SHA-256',
    aes = 'AES-GCM',
    keyLength = 256,
  }: VaultCryptoOptions = {}) {
    this.iterations = iterations;
    this.hash = hash;
    this.aes = aes;
    this.keyLength = keyLength;
  }

  async deriveKey(password: string, saltBytes: Uint8Array, iterations = this.iterations): Promise<CryptoKey> {
    const subtle = getSubtle();
    const baseKey = await subtle.importKey('raw', textEncoder.encode(password), 'PBKDF2', false, ['deriveKey']);
    const derivedKey = await subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBytes as BufferSource,
        iterations,
        hash: this.hash,
      },
      baseKey,
      { name: this.aes, length: this.keyLength },
      false,
      ['encrypt', 'decrypt'],
    );
    return derivedKey;
  }

  async encrypt<TPayload>(password: string, payload: TPayload, meta: EncryptionMeta = {}): Promise<EncryptionEnvelope> {
    const saltBytes = meta.salt ? decodeBase64(meta.salt) : getRandomBytes(16);
    const key = await this.deriveKey(password, saltBytes);
    const ivBytes = getRandomBytes(12);
    const subtle = getSubtle();
    const encoded = textEncoder.encode(JSON.stringify(payload));
    const cipherBuffer = await subtle.encrypt({ name: this.aes, iv: ivBytes as BufferSource }, key, encoded as BufferSource);
    return {
      salt: encodeBase64(saltBytes),
      iv: encodeBase64(ivBytes),
      cipher: encodeBase64(new Uint8Array(cipherBuffer)),
      version: meta.version ?? 1,
      iterations: this.iterations,
      hash: this.hash,
    };
  }

  async decrypt<TPayload = unknown>(password: string, envelope: EncryptionEnvelope): Promise<TPayload> {
    if (!envelope?.cipher || !envelope?.salt || !envelope?.iv) {
      throw new Error('Invalid encrypted payload');
    }
    const subtle = getSubtle();
    const saltBytes = decodeBase64(envelope.salt);
    const ivBytes = decodeBase64(envelope.iv);
    const cipherBytes = decodeBase64(envelope.cipher);
    const iterationCount = envelope.iterations || this.iterations;
    const key = await this.deriveKey(password, saltBytes, iterationCount);
    const plainBuffer = await subtle.decrypt({ name: this.aes, iv: ivBytes as BufferSource }, key, cipherBytes as BufferSource);
    const text = textDecoder.decode(plainBuffer);
    return JSON.parse(text) as TPayload;
  }

  async calibrateIterations({ targetMs = 250, maxIterations = 1_200_000 }: { targetMs?: number; maxIterations?: number } = {}) {
    if (typeof performance === 'undefined') {
      return { iterations: this.iterations, durationMs: 0 };
    }
    const subtle = getSubtle();
    const salt = getRandomBytes(16);
    const baseKey = await subtle.importKey('raw', textEncoder.encode('2fa2fa-calibrate'), 'PBKDF2', false, ['deriveBits']);
    let testIterations = Math.max(150_000, Math.floor(this.iterations * 0.75));
    let durationMs = 0;

    while (testIterations <= maxIterations) {
      const started = performance.now();
      await subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt as BufferSource,
          iterations: testIterations,
          hash: this.hash,
        },
        baseKey,
        this.keyLength,
      );
      durationMs = performance.now() - started;
      if (durationMs >= targetMs) {
        break;
      }
      testIterations = Math.min(maxIterations, Math.round(testIterations * 1.25));
    }

    this.iterations = Math.max(this.iterations, testIterations);
    return { iterations: this.iterations, durationMs };
  }
}

export const MemoryFootprint = {
  estimateBytes(payload: unknown): number {
    if (!payload) return 0;
    const json = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return textEncoder.encode(json).length;
  },
  format(bytes: number): string {
    if (bytes > 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    if (bytes > 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${bytes} B`;
  },
};
