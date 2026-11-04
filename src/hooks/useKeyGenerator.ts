import { useState, useCallback } from 'react'
import { generateKeyPair } from '@/crypto/generators'
import { useLanguageStore } from '@/i18n'
import { trackToolEvent } from '@/lib/analytics'
import type { KeyPair, KeyGenerationOptions, KeyGenerationProgress } from '@/types/keys'

export type KeyGenerationError = 'unsupported_browser' | 'generation_failed'

interface UseKeyGeneratorReturn {
  keyPair: KeyPair | null
  isGenerating: boolean
  progress: KeyGenerationProgress | null
  error: KeyGenerationError | null
  generate: (options: KeyGenerationOptions) => Promise<KeyPair | null>
  clear: () => void
}

export function useKeyGenerator(): UseKeyGeneratorReturn {
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<KeyGenerationProgress | null>(null)
  const [error, setError] = useState<KeyGenerationError | null>(null)
  const { language } = useLanguageStore()

  const generate = useCallback(async (options: KeyGenerationOptions): Promise<KeyPair | null> => {
    setIsGenerating(true)
    setError(null)
    setProgress({ stage: 'generating', message: 'Generating key pair...' })

    try {
      if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) {
        setError('unsupported_browser')
        setProgress(null)
        trackToolEvent('generation_error', {
          algorithm: options.algorithm, language, origin: 'home', error_code: 'unsupported_browser',
        })
        return null
      }
      const result = await generateKeyPair(options)
      setProgress({ stage: 'complete', message: 'Key pair generated successfully' })
      setKeyPair(result)
      trackToolEvent('generation_success', { algorithm: options.algorithm, language, origin: 'home' })
      return result
    } catch (err) {
      const code: KeyGenerationError = err instanceof DOMException && err.name === 'NotSupportedError'
        ? 'unsupported_browser'
        : 'generation_failed'
      setError(code)
      trackToolEvent('generation_error', {
        algorithm: options.algorithm, language, origin: 'home', error_code: code,
      })
      setProgress(null)
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [language])

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
