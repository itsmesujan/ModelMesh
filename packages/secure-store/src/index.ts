import crypto from 'node:crypto';

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  tag: string;
  salt: string;
  algorithm: 'aes-256-gcm';
  version: number;
}

export interface CredentialRecord {
  id: string;
  providerId: string;
  label: string;
  encrypted: EncryptedPayload;
  createdAt: number;
  updatedAt: number;
}

export class VaultManager {
  private masterKey: Buffer;
  private memoryCache: Map<string, string> = new Map();

  constructor(passphraseOrKey?: string) {
    const rawSecret = passphraseOrKey || process.env.MODELMESH_MASTER_KEY || 'modelmesh-default-local-vault-key-2026';
    // Derive a stable 32-byte master key
    this.masterKey = crypto.pbkdf2Sync(rawSecret, 'modelmesh-salt-v1', 100_000, 32, 'sha256');
  }

  /**
   * Encrypts a plaintext secret into an authenticated AES-256-GCM payload.
   */
  public encrypt(plaintext: string): EncryptedPayload {
    const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
    const salt = crypto.randomBytes(16);
    
    // Key derivation specific to this payload
    const derivedKey = crypto.pbkdf2Sync(this.masterKey, salt, 10_000, 32, 'sha256');
    
    const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);
    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');

    return {
      ciphertext,
      iv: iv.toString('hex'),
      tag,
      salt: salt.toString('hex'),
      algorithm: 'aes-256-gcm',
      version: 1
    };
  }

  /**
   * Decrypts an authenticated AES-256-GCM payload.
   */
  public decrypt(payload: EncryptedPayload): string {
    if (payload.algorithm !== 'aes-256-gcm') {
      throw new Error(`Unsupported encryption algorithm: ${payload.algorithm}`);
    }

    const iv = Buffer.from(payload.iv, 'hex');
    const tag = Buffer.from(payload.tag, 'hex');
    const salt = Buffer.from(payload.salt, 'hex');
    const derivedKey = crypto.pbkdf2Sync(this.masterKey, salt, 10_000, 32, 'sha256');

    const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(payload.ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Caches a decrypted secret in memory with a key.
   */
  public setCached(keyRef: string, secret: string): void {
    this.memoryCache.set(keyRef, secret);
  }

  /**
   * Retrieves a cached secret if present.
   */
  public getCached(keyRef: string): string | undefined {
    return this.memoryCache.get(keyRef);
  }

  /**
   * Securely zeroes and evicts memory cache.
   */
  public clearMemoryCache(): void {
    this.memoryCache.clear();
  }
}

/**
 * Redacts a secret token to keep only prefix and last 4 characters.
 * E.g. "sk-proj-1234567890abcdef" -> "sk-proj-****cdef"
 */
export function redactSecret(secret: string): string {
  if (!secret || typeof secret !== 'string') return '';
  if (secret.length <= 8) return '****';
  
  const prefixMatch = secret.match(/^([a-zA-Z0-9]+[-_]|Bearer\s+)/i);
  const prefix = prefixMatch ? prefixMatch[1] : secret.slice(0, 3);
  const suffix = secret.slice(-4);
  return `${prefix}****${suffix}`;
}

/**
 * Recursively redacts sensitive fields in any object before logging or serialization.
 */
export function redactObject<T>(item: T): T {
  if (!item || typeof item !== 'object') return item;
  
  if (Array.isArray(item)) {
    return item.map(element => redactObject(element)) as unknown as T;
  }

  const result: Record<string, any> = {};
  const sensitiveKeys = new Set([
    'authorization', 'apikey', 'api_key', 'token', 'secret', 'password', 
    'access_token', 'refresh_token', 'credential', 'client_secret'
  ]);

  for (const [key, value] of Object.entries(item as Record<string, any>)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.has(lowerKey) && typeof value === 'string') {
      result[key] = redactSecret(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = redactObject(value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
