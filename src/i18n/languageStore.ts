import { create } from 'zustand'
import {
  LANGUAGE_BY_CODE,
  DEFAULT_LANGUAGE,
  detectLanguageFromPathname,
  getLanguageDirection,
  getLanguageBasePath,
  isSupportedLanguage,
  type Language,
} from './languageConfig'
export type { Language } from './languageConfig'

interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
}

const detectLanguageFromPath = (): Language | null => {
  if (typeof window === 'undefined') return null

  return detectLanguageFromPathname(window.location.pathname)
}

const resolveLanguageHint = (hint: string | null): Language | null => {
  if (!hint) return null

  const normalized = hint.trim().toLowerCase()

  if (normalized === 'zh-tw' || normalized === 'zh-hk' || normalized.startsWith('zh-hant')) {
    return 'zh-Hant'
  }

  if (
    normalized === 'zh' ||
    normalized === 'zh-cn' ||
    normalized.startsWith('zh-hans') ||
    normalized.startsWith('zh-')
  ) {
    return 'zh'
  }

  if (
    normalized === 'no' ||
    normalized === 'nn' ||
    normalized === 'nb' ||
    normalized.startsWith('no-') ||
    normalized.startsWith('nn-') ||
    normalized.startsWith('nb-')
  ) {
    return 'nb'
  }

  const baseCode = normalized.split(/[-_]/)[0]
  return isSupportedLanguage(baseCode) ? baseCode : null
}

const detectBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE

  const pathLang = detectLanguageFromPath()
  if (pathLang) {
    return pathLang
  }

  const urlParams = new URLSearchParams(window.location.search)
  const paramLanguage = resolveLanguageHint(urlParams.get('lang'))
  if (paramLanguage) {
    return paramLanguage
  }

  const browserLang =
    navigator.language ||
    (navigator as { userLanguage?: string }).userLanguage ||
    DEFAULT_LANGUAGE

  return resolveLanguageHint(browserLang) ?? DEFAULT_LANGUAGE
}

const getStoredLanguage = (): Language => {
  const pathLang = detectLanguageFromPath()
  if (pathLang) {
    return pathLang
  }

  try {
    const stored = localStorage.getItem('ssh-key-generator-language')
    if (stored && isSupportedLanguage(stored)) {
      return stored
    }
  } catch {
    // Ignore localStorage errors
  }
  return detectBrowserLanguage()
}

const applyLanguage = (language: Language) => {
  document.documentElement.lang = LANGUAGE_BY_CODE[language].htmlLang
  document.documentElement.dir = getLanguageDirection(language)
}

const initialLanguage = getStoredLanguage()
applyLanguage(initialLanguage)

export const useLanguageStore = create<LanguageState>((set) => ({
  language: initialLanguage,

  setLanguage: (language) => {
    applyLanguage(language)
    set({ language })

    try {
      localStorage.setItem('ssh-key-generator-language', language)
    } catch {
      // Ignore localStorage errors
    }
  }
}))

// Function to sync language from URL path (called from App.tsx)
export const syncLanguageFromPath = () => {
  const pathLang = detectLanguageFromPath()
  if (pathLang) {
    const currentLang = useLanguageStore.getState().language
    if (pathLang !== currentLang) {
      useLanguageStore.getState().setLanguage(pathLang)
    }
  }
}

// Get the base path for the current language
export { getLanguageBasePath }
