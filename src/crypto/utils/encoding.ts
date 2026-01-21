/**
 * Base64 encoding/decoding utilities
 */

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return bytes
}

/**
 * Concatenate multiple Uint8Arrays
 */
export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const arr of arrays) {
    result.set(arr, offset)
    offset += arr.length
  }
  return result
}

/**
 * Encode a 32-bit unsigned integer in big-endian format
 */
export function encodeUint32BE(value: number): Uint8Array {
  const result = new Uint8Array(4)
  result[0] = (value >>> 24) & 0xff
  result[1] = (value >>> 16) & 0xff
  result[2] = (value >>> 8) & 0xff
  result[3] = value & 0xff
  return result
}

/**
 * Encode a string with length prefix (OpenSSH format)
 */
export function encodeString(str: string): Uint8Array {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(str)
  return concatBytes(encodeUint32BE(bytes.length), bytes)
}

/**
 * Encode bytes with length prefix (OpenSSH format)
 */
export function encodeBytes(bytes: Uint8Array): Uint8Array {
  return concatBytes(encodeUint32BE(bytes.length), bytes)
}
