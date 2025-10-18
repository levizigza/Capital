export class EncryptionService {
  private static encoder = new TextEncoder()
  private static decoder = new TextDecoder()

  private static async getKey(password: string): Promise<CryptoKey> {
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
        salt: this.encoder.encode('financequest-salt-2024'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  }

  static async encrypt(data: string, userId: string): Promise<string> {
    try {
      const key = await this.getKey(userId)
      const iv = crypto.getRandomValues(new Uint8Array(12))
      
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        this.encoder.encode(data)
      )

      const combined = new Uint8Array(iv.length + encryptedData.byteLength)
      combined.set(iv)
      combined.set(new Uint8Array(encryptedData), iv.length)

      return btoa(String.fromCharCode(...combined))
    } catch (error) {
      throw new Error('Failed to encrypt data')
    }
  }

  static async decrypt(encryptedData: string, userId: string): Promise<string> {
    try {
      const key = await this.getKey(userId)
      const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))
      
      const iv = combined.slice(0, 12)
      const data = combined.slice(12)

      const decryptedData = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        data
      )

      return this.decoder.decode(decryptedData)
    } catch (error) {
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
    const msgBuffer = this.encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
}
