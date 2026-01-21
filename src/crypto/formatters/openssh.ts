import { bytesToBase64, encodeString, encodeBytes, encodeUint32BE, concatBytes } from '../utils/encoding'
import { deriveKeyAndIv, encryptAes256Ctr } from '../utils/encryption'

const OPENSSH_PRIVATE_KEY_HEADER = '-----BEGIN OPENSSH PRIVATE KEY-----'
const OPENSSH_PRIVATE_KEY_FOOTER = '-----END OPENSSH PRIVATE KEY-----'
const AUTH_MAGIC = 'openssh-key-v1\0'
const BCRYPT_ROUNDS = 16

/**
 * Format Ed25519 public key in OpenSSH format
 * Format: "ssh-ed25519 <base64-encoded-key> <comment>"
 */
export function formatEd25519PublicKey(publicKey: Uint8Array, comment: string): string {
  const keyType = 'ssh-ed25519'

  // Build the key blob: string(key_type) + string(public_key)
  const keyBlob = concatBytes(
    encodeString(keyType),
    encodeBytes(publicKey)
  )

  return `${keyType} ${bytesToBase64(keyBlob)} ${comment}`
}

/**
 * Format Ed25519 private key in OpenSSH format (optionally encrypted)
 */
export async function formatEd25519PrivateKey(
  publicKey: Uint8Array,
  privateKey: Uint8Array, // 64 bytes: 32 private + 32 public
  comment: string,
  passphrase?: string
): Promise<string> {
  const keyType = 'ssh-ed25519'

  // Generate random check bytes (same value for both)
  const checkBytes = new Uint8Array(4)
  crypto.getRandomValues(checkBytes)

  // Build the public key blob
  const publicKeyBlob = concatBytes(
    encodeString(keyType),
    encodeBytes(publicKey)
  )

  // Build the private key section
  // Format: checkint1 + checkint2 + keytype + pubkey + privkey + comment + padding
  const privateSection = concatBytes(
    checkBytes,
    checkBytes, // Same value for both check ints
    encodeString(keyType),
    encodeBytes(publicKey),
    encodeBytes(privateKey), // 64 bytes: seed (32) + public (32)
    encodeString(comment)
  )

  // Block size: 16 for AES, 8 for unencrypted
  const blockSize = passphrase ? 16 : 8
  const paddingLength = blockSize - (privateSection.length % blockSize)
  const actualPaddingLength = paddingLength === 0 ? blockSize : paddingLength
  const padding = new Uint8Array(actualPaddingLength)
  for (let i = 0; i < actualPaddingLength; i++) {
    padding[i] = i + 1 // Padding bytes are 1, 2, 3, ...
  }
  let paddedPrivateSection = concatBytes(privateSection, padding)

  const encoder = new TextEncoder()
  const authMagic = encoder.encode(AUTH_MAGIC)

  let cipherName = 'none'
  let kdfName = 'none'
  let kdfOptions: Uint8Array = new Uint8Array(0)

  // Encrypt if passphrase is provided
  if (passphrase) {
    cipherName = 'aes256-ctr'
    kdfName = 'bcrypt'

    // Generate salt
    const salt = new Uint8Array(16)
    crypto.getRandomValues(salt)

    // Derive key and IV
    const { key, iv } = await deriveKeyAndIv(passphrase, salt, BCRYPT_ROUNDS)

    // Encrypt the private section
    const encrypted = await encryptAes256Ctr(paddedPrivateSection, key, iv)
    paddedPrivateSection = new Uint8Array(encrypted)

    // Build KDF options: salt + rounds
    kdfOptions = new Uint8Array(concatBytes(
      encodeBytes(salt),
      encodeUint32BE(BCRYPT_ROUNDS)
    ))
  }

  // Build the full key blob
  const keyBlob = concatBytes(
    authMagic,
    encodeString(cipherName),
    encodeString(kdfName),
    kdfOptions.length > 0 ? encodeBytes(kdfOptions) : encodeString(''),
    encodeUint32BE(1),    // number of keys
    encodeBytes(publicKeyBlob),
    encodeBytes(paddedPrivateSection)
  )

  // Base64 encode and format with line breaks
  const base64 = bytesToBase64(keyBlob)
  const lines: string[] = [OPENSSH_PRIVATE_KEY_HEADER]

  // Split into 70-character lines
  for (let i = 0; i < base64.length; i += 70) {
    lines.push(base64.slice(i, i + 70))
  }

  lines.push(OPENSSH_PRIVATE_KEY_FOOTER)

  return lines.join('\n')
}

/**
 * Format RSA public key in OpenSSH format
 * Format: "ssh-rsa <base64-encoded-key> <comment>"
 */
export function formatRsaPublicKey(e: Uint8Array, n: Uint8Array, comment: string): string {
  const keyType = 'ssh-rsa'

  // Ensure n has leading zero if MSB is set (to indicate positive number)
  const nWithSign = n[0] & 0x80 ? concatBytes(new Uint8Array([0]), n) : n

  // Build the key blob: string(key_type) + mpint(e) + mpint(n)
  const keyBlob = concatBytes(
    encodeString(keyType),
    encodeBytes(e),
    encodeBytes(nWithSign)
  )

  return `${keyType} ${bytesToBase64(keyBlob)} ${comment}`
}

/**
 * Format RSA private key in OpenSSH format (optionally encrypted)
 */
export async function formatRsaPrivateKey(
  n: Uint8Array,
  e: Uint8Array,
  d: Uint8Array,
  p: Uint8Array,
  q: Uint8Array,
  _dp: Uint8Array, // Not used in OpenSSH format, but kept for compatibility with JWK
  _dq: Uint8Array, // Not used in OpenSSH format, but kept for compatibility with JWK
  qi: Uint8Array,
  comment: string,
  passphrase?: string
): Promise<string> {
  const keyType = 'ssh-rsa'

  // Helper to add sign byte if needed
  const toSignedMpint = (bytes: Uint8Array): Uint8Array => {
    return bytes[0] & 0x80 ? concatBytes(new Uint8Array([0]), bytes) : bytes
  }

  // Generate random check bytes
  const checkBytes = new Uint8Array(4)
  crypto.getRandomValues(checkBytes)

  // Build the public key blob
  const nSigned = toSignedMpint(n)
  const publicKeyBlob = concatBytes(
    encodeString(keyType),
    encodeBytes(e),
    encodeBytes(nSigned)
  )

  // Build the private key section
  // RSA private key format: n, e, d, iqmp, p, q
  const privateSection = concatBytes(
    checkBytes,
    checkBytes,
    encodeString(keyType),
    encodeBytes(nSigned),
    encodeBytes(e),
    encodeBytes(toSignedMpint(d)),
    encodeBytes(toSignedMpint(qi)), // iqmp = q^-1 mod p
    encodeBytes(toSignedMpint(p)),
    encodeBytes(toSignedMpint(q)),
    encodeString(comment)
  )

  // Block size: 16 for AES, 8 for unencrypted
  const blockSize = passphrase ? 16 : 8
  const paddingLength = blockSize - (privateSection.length % blockSize)
  const actualPaddingLength = paddingLength === 0 ? blockSize : paddingLength
  const padding = new Uint8Array(actualPaddingLength)
  for (let i = 0; i < actualPaddingLength; i++) {
    padding[i] = i + 1
  }
  let paddedPrivateSection = concatBytes(privateSection, padding)

  const encoder = new TextEncoder()
  const authMagic = encoder.encode(AUTH_MAGIC)

  let cipherName = 'none'
  let kdfName = 'none'
  let kdfOptions: Uint8Array = new Uint8Array(0)

  // Encrypt if passphrase is provided
  if (passphrase) {
    cipherName = 'aes256-ctr'
    kdfName = 'bcrypt'

    // Generate salt
    const salt = new Uint8Array(16)
    crypto.getRandomValues(salt)

    // Derive key and IV
    const { key, iv } = await deriveKeyAndIv(passphrase, salt, BCRYPT_ROUNDS)

    // Encrypt the private section
    const encrypted = await encryptAes256Ctr(paddedPrivateSection, key, iv)
    paddedPrivateSection = new Uint8Array(encrypted)

    // Build KDF options: salt + rounds
    kdfOptions = new Uint8Array(concatBytes(
      encodeBytes(salt),
      encodeUint32BE(BCRYPT_ROUNDS)
    ))
  }

  // Build the full key blob
  const keyBlob = concatBytes(
    authMagic,
    encodeString(cipherName),
    encodeString(kdfName),
    kdfOptions.length > 0 ? encodeBytes(kdfOptions) : encodeString(''),
    encodeUint32BE(1),
    encodeBytes(publicKeyBlob),
    encodeBytes(paddedPrivateSection)
  )

  // Base64 encode and format
  const base64 = bytesToBase64(keyBlob)
  const lines: string[] = [OPENSSH_PRIVATE_KEY_HEADER]

  for (let i = 0; i < base64.length; i += 70) {
    lines.push(base64.slice(i, i + 70))
  }

  lines.push(OPENSSH_PRIVATE_KEY_FOOTER)

  return lines.join('\n')
}

/**
 * Extract base64-encoded key blob from OpenSSH public key string
 */
export function extractPublicKeyBlob(publicKeyString: string): string {
  const parts = publicKeyString.trim().split(/\s+/)
  if (parts.length < 2) {
    throw new Error('Invalid public key format')
  }
  return parts[1]
}
