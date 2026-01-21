import { create } from 'zustand'
import type { KeyPair, KeyGenerationProgress, KeyAlgorithm } from '@/types/keys'

interface KeyState {
  // Current key pair (not persisted for security)
  keyPair: KeyPair | null
  isGenerating: boolean
  progress: KeyGenerationProgress | null
  error: string | null

  // Actions
  setKeyPair: (keyPair: KeyPair | null) => void
  setIsGenerating: (isGenerating: boolean) => void
  setProgress: (progress: KeyGenerationProgress | null) => void
  setError: (error: string | null) => void
  clear: () => void
}

export const useKeyStore = create<KeyState>((set) => ({
  keyPair: null,
  isGenerating: false,
  progress: null,
  error: null,

  setKeyPair: (keyPair) => set({ keyPair }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error }),
  clear: () => set({ keyPair: null, progress: null, error: null })
}))

// Config store (persisted to localStorage)
interface ConfigState {
  defaultAlgorithm: KeyAlgorithm
  defaultComment: string
  setDefaultAlgorithm: (algorithm: KeyAlgorithm) => void
  setDefaultComment: (comment: string) => void
}

const getStoredConfig = (): Partial<ConfigState> => {
  try {
    const stored = localStorage.getItem('ssh-key-generator-config')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore localStorage errors
  }
  return {}
}

const storedConfig = getStoredConfig()

export const useConfigStore = create<ConfigState>((set, get) => ({
  defaultAlgorithm: (storedConfig.defaultAlgorithm as KeyAlgorithm) || 'ed25519',
  defaultComment: storedConfig.defaultComment || '',

  setDefaultAlgorithm: (algorithm) => {
    set({ defaultAlgorithm: algorithm })
    persistConfig(get())
  },
  setDefaultComment: (comment) => {
    set({ defaultComment: comment })
    persistConfig(get())
  }
}))

function persistConfig(config: ConfigState) {
  try {
    localStorage.setItem('ssh-key-generator-config', JSON.stringify({
      defaultAlgorithm: config.defaultAlgorithm,
      defaultComment: config.defaultComment
    }))
  } catch {
    // Ignore localStorage errors
  }
}
