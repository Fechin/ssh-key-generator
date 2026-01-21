import { sha256 } from '@noble/hashes/sha2.js'
import { md5 } from '@noble/hashes/legacy.js'
import { bytesToBase64, base64ToBytes } from './encoding'

/**
 * Calculate SHA256 fingerprint of an OpenSSH public key
 */
export function calculateFingerprint(publicKeyBase64: string): string {
  const publicKeyBytes = base64ToBytes(publicKeyBase64)
  const hash = sha256(publicKeyBytes)
  return `SHA256:${bytesToBase64(hash).replace(/=+$/, '')}`
}

/**
 * Calculate MD5 fingerprint of an OpenSSH public key (legacy format)
 */
export function calculateFingerprintMd5(publicKeyBase64: string): string {
  const publicKeyBytes = base64ToBytes(publicKeyBase64)
  const hash = md5(publicKeyBytes)
  const hexParts: string[] = []
  for (let i = 0; i < hash.length; i++) {
    hexParts.push(hash[i].toString(16).padStart(2, '0'))
  }
  return hexParts.join(':')
}

/**
 * Generate SSH key randomart visualization
 * Based on the "drunken bishop" algorithm used by OpenSSH
 */
export function generateRandomart(publicKeyBase64: string, keyType: string): string {
  const publicKeyBytes = base64ToBytes(publicKeyBase64)
  const hash = sha256(publicKeyBytes)

  // Board dimensions (standard SSH randomart size)
  const width = 17
  const height = 9
  const board: number[][] = Array.from({ length: height }, () => Array(width).fill(0))

  // Start position (center of the board)
  let x = Math.floor(width / 2)
  let y = Math.floor(height / 2)

  // Characters for visualization (increasing "density")
  const chars = ' .o+=*BOX@%&#/^SE'

  // Process each byte of the hash
  for (const byte of hash) {
    // Each byte contains 4 moves (2 bits each)
    for (let shift = 0; shift < 8; shift += 2) {
      const direction = (byte >> shift) & 3

      // Move based on direction (2-bit value)
      // 0: up-left, 1: up-right, 2: down-left, 3: down-right
      const dx = (direction & 1) ? 1 : -1
      const dy = (direction & 2) ? 1 : -1

      x = Math.max(0, Math.min(width - 1, x + dx))
      y = Math.max(0, Math.min(height - 1, y + dy))

      board[y][x]++
    }
  }

  // Mark start and end positions
  const startX = Math.floor(width / 2)
  const startY = Math.floor(height / 2)

  // Build the randomart string
  const lines: string[] = []
  const topBorder = `+---[${keyType}]`.padEnd(width + 1, '-') + '+'
  lines.push(topBorder)

  for (let row = 0; row < height; row++) {
    let line = '|'
    for (let col = 0; col < width; col++) {
      if (row === startY && col === startX) {
        line += 'S' // Start position
      } else if (row === y && col === x) {
        line += 'E' // End position
      } else {
        const value = Math.min(board[row][col], chars.length - 1)
        line += chars[value]
      }
    }
    line += '|'
    lines.push(line)
  }

  lines.push('+' + '-'.repeat(width) + '+')

  return lines.join('\n')
}
