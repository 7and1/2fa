const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

type Base32Secret = string;

function sanitize(secret: string): Base32Secret {
  return secret.toUpperCase().replace(/[^A-Z2-7]/g, '');
}

export function base32ToBytes(secret: string): Uint8Array {
  if (!secret) {
    throw new Error('Secret is required');
  }
  const clean = sanitize(secret);
  let bits = 0;
  let value = 0;
  const output: number[] = [];
  for (let i = 0; i < clean.length; i += 1) {
    const idx = ALPHABET.indexOf(clean[i]);
    if (idx === -1) {
      throw new Error(`Invalid Base32 character: ${clean[i]}`);
    }
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(output);
}

export function bytesToBase32(bytes: ArrayLike<number> | Uint8Array): string {
  if (!bytes || !bytes.length) {
    return '';
  }
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < bytes.length; i += 1) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      const index = (value >>> (bits - 5)) & 31;
      bits -= 5;
      output += ALPHABET[index];
    }
  }
  if (bits > 0) {
    output += ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

export function randomBase32(length = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return bytesToBase32(bytes).slice(0, length);
}
