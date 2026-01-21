import { create } from 'zustand'

export type Language = 'en' | 'zh'

interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
}

const detectLanguageFromPath = (): Language | null => {
  if (typeof window === 'undefined') return null

  const path = window.location.pathname
  if (path.startsWith('/zh-Hans')) {
    return 'zh'
  }
  return null
}

const detectBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en'

  // Check URL path first (highest priority)
  const pathLang = detectLanguageFromPath()
  if (pathLang) {
    return pathLang
  }

  // Check URL parameter (for backwards compatibility)
  const urlParams = new URLSearchParams(window.location.search)
  const langParam = urlParams.get('lang')
  if (langParam === 'zh' || langParam === 'zh-CN' || langParam === 'zh-TW') {
    return 'zh'
  }
  if (langParam === 'en') {
    return 'en'
  }

  // Then check browser language
  const browserLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || 'en'
  if (browserLang.startsWith('zh')) {
    return 'zh'
  }

  return 'en'
}

const getStoredLanguage = (): Language => {
  // Path-based language takes precedence
  const pathLang = detectLanguageFromPath()
  if (pathLang) {
    return pathLang
  }

  try {
    const stored = localStorage.getItem('ssh-key-generator-language')
    if (stored && ['en', 'zh'].includes(stored)) {
      return stored as Language
    }
  } catch {
    // Ignore localStorage errors
  }
  return detectBrowserLanguage()
}

const applyLanguage = (language: Language) => {
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
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
export const getLanguageBasePath = (language: Language): string => {
  return language === 'zh' ? '/zh-Hans' : ''
}
