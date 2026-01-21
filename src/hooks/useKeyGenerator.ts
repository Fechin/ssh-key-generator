import { useState, useCallback } from 'react'
import { generateKeyPair } from '@/crypto/generators'
import type { KeyPair, KeyGenerationOptions, KeyGenerationProgress } from '@/types/keys'

interface UseKeyGeneratorReturn {
  keyPair: KeyPair | null
  isGenerating: boolean
  progress: KeyGenerationProgress | null
  error: string | null
  generate: (options: KeyGenerationOptions) => Promise<KeyPair | null>
  clear: () => void
}

export function useKeyGenerator(): UseKeyGeneratorReturn {
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<KeyGenerationProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (options: KeyGenerationOptions): Promise<KeyPair | null> => {
    setIsGenerating(true)
    setError(null)
    setProgress({ stage: 'generating', message: 'Generating key pair...' })

    try {
      const result = await generateKeyPair(options)
      setProgress({ stage: 'complete', message: 'Key pair generated successfully' })
      setKeyPair(result)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate key pair'
      setError(message)
      setProgress(null)
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const clear = useCallback(() => {
    setKeyPair(null)
    setProgress(null)
    setError(null)
  }, [])

  return {
    keyPair,
    isGenerating,
    progress,
    error,
    generate,
    clear
  }
}
