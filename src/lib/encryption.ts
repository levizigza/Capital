/**
 * Legacy EncryptionService — upgraded to per-ciphertext random salt.
 * Prefer `@/security` vault for new code. Kept for pipeda / use-encrypted-kv callers.
 */

export class EncryptionService {
  private static encoder = new TextEncoder()
  private static decoder = new TextDecoder()

  private static async getKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      this.encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    )

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 210_000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  }

  private static bytesToB64(bytes: Uint8Array): string {
    let s = ''
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!)
    return btoa(s)
  }

  private static b64ToBytes(b64: string): Uint8Array {
    const s = atob(b64)
    const out = new Uint8Array(s.length)
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i)
    return out
  }

  static async encrypt(data: string, userId: string): Promise<string> {
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16))
      const key = await this.getKey(userId, salt)
      const iv = crypto.getRandomValues(new Uint8Array(12))

      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        this.encoder.encode(data)
      )

      // v2: salt(16) + iv(12) + ciphertext
      const combined = new Uint8Array(16 + 12 + encryptedData.byteLength)
      combined.set(salt, 0)
      combined.set(iv, 16)
      combined.set(new Uint8Array(encryptedData), 28)

      return 'v2:' + this.bytesToB64(combined)
    } catch {
      throw new Error('Failed to encrypt data')
    }
  }

  static async decrypt(encryptedData: string, userId: string): Promise<string> {
    try {
      // Legacy v1: fixed salt, iv(12)+cipher (base64 without prefix)
      if (!encryptedData.startsWith('v2:')) {
        const key = await this.getKey(
          userId,
          this.encoder.encode('financequest-salt-2024')
        )
        const combined = this.b64ToBytes(encryptedData)
        const iv = combined.slice(0, 12)
        const data = combined.slice(12)
        const decryptedData = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          key,
          data
        )
        return this.decoder.decode(decryptedData)
      }

      const combined = this.b64ToBytes(encryptedData.slice(3))
      const salt = combined.slice(0, 16)
      const iv = combined.slice(16, 28)
      const data = combined.slice(28)
      const key = await this.getKey(userId, salt)
      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      )
      return this.decoder.decode(decryptedData)
    } catch {
      throw new Error('Failed to decrypt data')
    }
  }

  static async encryptObject<T>(obj: T, userId: string): Promise<string> {
    const json = JSON.stringify(obj)
    return this.encrypt(json, userId)
  }

  static async decryptObject<T>(encryptedData: string, userId: string): Promise<T> {
    const json = await this.decrypt(encryptedData, userId)
    return JSON.parse(json)
  }

  static async hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      this.encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    )
    const bits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: 210_000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    )
    return `pbkdf2:210000:${this.bytesToB64(salt)}:${this.bytesToB64(new Uint8Array(bits))}`
  }
}
