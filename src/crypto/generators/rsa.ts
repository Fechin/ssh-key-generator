import { formatRsaPublicKey, formatRsaPrivateKey, extractPublicKeyBlob } from '../formatters/openssh'
import { calculateFingerprint, calculateFingerprintMd5, generateRandomart } from '../utils/fingerprint'
import type { KeyPair, KeyGenerationOptions, KeyAlgorithm } from '@/types/keys'

/**
 * Convert a base64url string to a Uint8Array
 */
function base64urlToBytes(base64url: string): Uint8Array {
  // Convert base64url to base64
  const base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(base64url.length + (4 - base64url.length % 4) % 4, '=')

  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Remove leading zeros from a byte array (except if it would make it empty or negative)
 */
function trimLeadingZeros(bytes: Uint8Array): Uint8Array {
  let i = 0
  while (i < bytes.length - 1 && bytes[i] === 0 && !(bytes[i + 1] & 0x80)) {
    i++
  }
  return bytes.slice(i)
}

/**
 * Get RSA key size from algorithm string
 */
function getKeySize(algorithm: KeyAlgorithm): number {
  switch (algorithm) {
    case 'rsa-2048':
      return 2048
    case 'rsa-4096':
      return 4096
    default:
      throw new Error(`Invalid RSA algorithm: ${algorithm}`)
  }
}

/**
 * Generate an RSA SSH key pair using WebCrypto API
 */
export async function generateRsaKeyPair(options: KeyGenerationOptions): Promise<KeyPair> {
  const { algorithm, comment, passphrase } = options
  const keySize = getKeySize(algorithm)

  // Generate RSA key pair using WebCrypto
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: keySize,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
      hash: 'SHA-256'
    },
    true, // extractable
    ['encrypt', 'decrypt']
  )

  // Export the private key in JWK format to get all components
  const privateJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey)

  if (!privateJwk.n || !privateJwk.e || !privateJwk.d ||
      !privateJwk.p || !privateJwk.q || !privateJwk.dp ||
      !privateJwk.dq || !privateJwk.qi) {
    throw new Error('Failed to extract RSA key components')
  }

  // Convert JWK components to Uint8Arrays
  const n = trimLeadingZeros(base64urlToBytes(privateJwk.n))
  const e = trimLeadingZeros(base64urlToBytes(privateJwk.e))
  const d = trimLeadingZeros(base64urlToBytes(privateJwk.d))
  const p = trimLeadingZeros(base64urlToBytes(privateJwk.p))
  const q = trimLeadingZeros(base64urlToBytes(privateJwk.q))
  const dp = trimLeadingZeros(base64urlToBytes(privateJwk.dp))
  const dq = trimLeadingZeros(base64urlToBytes(privateJwk.dq))
  const qi = trimLeadingZeros(base64urlToBytes(privateJwk.qi))

  // Format keys in OpenSSH format
  const publicKeyString = formatRsaPublicKey(e, n, comment)
  const privateKeyString = await formatRsaPrivateKey(n, e, d, p, q, dp, dq, qi, comment, passphrase)

  // Calculate fingerprints
  const publicKeyBlob = extractPublicKeyBlob(publicKeyString)
  const fingerprint = calculateFingerprint(publicKeyBlob)
  const fingerprintMd5 = calculateFingerprintMd5(publicKeyBlob)
  const randomart = generateRandomart(publicKeyBlob, `RSA ${keySize}`)

  return {
    publicKey: publicKeyString,
    privateKey: privateKeyString,
    algorithm,
    comment,
    fingerprint,
    fingerprintMd5,
    randomart,
    createdAt: Date.now()
  }
}
