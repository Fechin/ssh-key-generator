import * as ed25519 from '@noble/ed25519'
import { sha512 } from '@noble/hashes/sha2.js'
import { formatEd25519PublicKey, formatEd25519PrivateKey, extractPublicKeyBlob } from '../formatters/openssh'
import { calculateFingerprint, calculateFingerprintMd5, generateRandomart } from '../utils/fingerprint'
import type { KeyPair, KeyGenerationOptions } from '@/types/keys'

// Configure ed25519 to use sha512
ed25519.hashes.sha512 = (message: Uint8Array) => sha512(message)

/**
 * Generate an Ed25519 SSH key pair
 */
export async function generateEd25519KeyPair(options: KeyGenerationOptions): Promise<KeyPair> {
  const { comment, passphrase } = options

  // Generate 32-byte private key (seed)
  const privateKeySeed = ed25519.utils.randomSecretKey()

  // Derive public key from private key seed
  const publicKey = await ed25519.getPublicKeyAsync(privateKeySeed)

  // Create the 64-byte private key (seed + public key) as used by OpenSSH
  const privateKeyFull = new Uint8Array(64)
  privateKeyFull.set(privateKeySeed, 0)
  privateKeyFull.set(publicKey, 32)

  // Format keys in OpenSSH format
  const publicKeyString = formatEd25519PublicKey(publicKey, comment)
  const privateKeyString = await formatEd25519PrivateKey(publicKey, privateKeyFull, comment, passphrase)

  // Calculate fingerprints
  const publicKeyBlob = extractPublicKeyBlob(publicKeyString)
  const fingerprint = calculateFingerprint(publicKeyBlob)
  const fingerprintMd5 = calculateFingerprintMd5(publicKeyBlob)
  const randomart = generateRandomart(publicKeyBlob, 'ED25519 256')

  return {
    publicKey: publicKeyString,
    privateKey: privateKeyString,
    algorithm: 'ed25519',
    comment,
    fingerprint,
    fingerprintMd5,
    randomart,
    createdAt: Date.now()
  }
}
