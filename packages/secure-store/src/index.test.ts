import test from 'node:test';
import assert from 'node:assert';
import { VaultManager, redactSecret, redactObject } from './index.ts';

test('VaultManager encrypts and decrypts correctly', () => {
  const vault = new VaultManager('test-master-secret-1234');
  const plaintext = 'sk-or-v1-9876543210abcdeffedcba';
  
  const encrypted = vault.encrypt(plaintext);
  assert.notStrictEqual(encrypted.ciphertext, plaintext);
  assert.strictEqual(encrypted.algorithm, 'aes-256-gcm');
  assert.strictEqual(typeof encrypted.tag, 'string');
  assert.strictEqual(typeof encrypted.iv, 'string');

  const decrypted = vault.decrypt(encrypted);
  assert.strictEqual(decrypted, plaintext);
});

test('VaultManager fails to decrypt if authentication tag is tampered', () => {
  const vault = new VaultManager('test-master-secret-1234');
  const encrypted = vault.encrypt('super-sensitive-token');
  
  // Tamper ciphertext
  const tampered = { ...encrypted, ciphertext: '00' + encrypted.ciphertext.slice(2) };
  assert.throws(() => {
    vault.decrypt(tampered);
  });
});

test('redactSecret masks middle characters safely', () => {
  assert.strictEqual(redactSecret('sk-1234567890abcdef'), 'sk-****cdef');
  assert.strictEqual(redactSecret('short'), '****');
});

test('redactObject masks sensitive keys recursively', () => {
  const input = {
    apiKey: 'sk-1234567890abcdef',
    provider: 'groq',
    nested: {
      authorization: 'Bearer secret-token-xyz-123456',
      publicInfo: 'hello'
    }
  };

  const redacted = redactObject(input);
  assert.strictEqual(redacted.apiKey, 'sk-****cdef');
  assert.strictEqual(redacted.nested.authorization, 'Bearer ****3456');
  assert.strictEqual(redacted.provider, 'groq');
  assert.strictEqual(redacted.nested.publicInfo, 'hello');
});
