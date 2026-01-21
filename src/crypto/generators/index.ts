import { generateEd25519KeyPair } from './ed25519'
import { generateRsaKeyPair } from './rsa'
import type { KeyPair, KeyGenerationOptions } from '@/types/keys'

/**
 * Generate an SSH key pair based on the specified algorithm
 */
export async function generateKeyPair(options: KeyGenerationOptions): Promise<KeyPair> {
  switch (options.algorithm) {
    case 'ed25519':
      return generateEd25519KeyPair(options)
    case 'rsa-2048':
    case 'rsa-4096':
      return generateRsaKeyPair(options)
    default:
      throw new Error(`Unsupported algorithm: ${options.algorithm}`)
  }
}

export { generateEd25519KeyPair } from './ed25519'
export { generateRsaKeyPair } from './rsa'
