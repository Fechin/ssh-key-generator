export type KeyAlgorithm = 'ed25519' | 'rsa-2048' | 'rsa-4096'

export interface KeyPair {
  publicKey: string
  privateKey: string
  algorithm: KeyAlgorithm
  comment: string
  fingerprint: string
  fingerprintMd5: string
  randomart: string
  createdAt: number
}

export interface KeyGenerationOptions {
  algorithm: KeyAlgorithm
  comment: string
  passphrase?: string
}

export interface KeyGenerationProgress {
  stage: 'generating' | 'formatting' | 'complete'
  message: string
}

export interface WorkerMessage {
  type: 'generate' | 'cancel'
  options?: KeyGenerationOptions
}

export interface WorkerResponse {
  type: 'progress' | 'success' | 'error'
  data?: KeyPair
  progress?: KeyGenerationProgress
  error?: string
}
