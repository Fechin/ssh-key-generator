import { create } from 'zustand'

export type Language = 'en' | 'zh' | 'zh-Hant' | 'ja' | 'ko' | 'es' | 'pt' | 'fr' | 'de' | 'ru' | 'it' | 'nl' | 'pl'

interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
}

const detectLanguageFromPath = (): Language | null => {
  if (typeof window === 'undefined') return null

  const path = window.location.pathname
  if (path.startsWith('/zh-Hans')) return 'zh'
  if (path.startsWith('/zh-Hant')) return 'zh-Hant'
  if (path.startsWith('/ja')) return 'ja'
  if (path.startsWith('/ko')) return 'ko'
  if (path.startsWith('/es')) return 'es'
  if (path.startsWith('/pt')) return 'pt'
  if (path.startsWith('/fr')) return 'fr'
  if (path.startsWith('/de')) return 'de'
  if (path.startsWith('/ru')) return 'ru'
  if (path.startsWith('/it')) return 'it'
  if (path.startsWith('/nl')) return 'nl'
  if (path.startsWith('/pl')) return 'pl'
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
  if (langParam === 'zh' || langParam === 'zh-CN') return 'zh'
  if (langParam === 'zh-TW' || langParam === 'zh-HK' || langParam === 'zh-Hant') return 'zh-Hant'
  if (langParam === 'ja') return 'ja'
  if (langParam === 'ko') return 'ko'
  if (langParam === 'es') return 'es'
  if (langParam === 'pt') return 'pt'
  if (langParam === 'fr') return 'fr'
  if (langParam === 'de') return 'de'
  if (langParam === 'ru') return 'ru'
  if (langParam === 'it') return 'it'
  if (langParam === 'nl') return 'nl'
  if (langParam === 'pl') return 'pl'
  if (langParam === 'en') return 'en'

  // Then check browser language
  const browserLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || 'en'
  if (browserLang.startsWith('zh-TW') || browserLang.startsWith('zh-HK') || browserLang.startsWith('zh-Hant')) return 'zh-Hant'
  if (browserLang.startsWith('zh')) return 'zh'
  if (browserLang.startsWith('ja')) return 'ja'
  if (browserLang.startsWith('ko')) return 'ko'
  if (browserLang.startsWith('es')) return 'es'
  if (browserLang.startsWith('pt')) return 'pt'
  if (browserLang.startsWith('fr')) return 'fr'
  if (browserLang.startsWith('de')) return 'de'
  if (browserLang.startsWith('ru')) return 'ru'
  if (browserLang.startsWith('it')) return 'it'
  if (browserLang.startsWith('nl')) return 'nl'
  if (browserLang.startsWith('pl')) return 'pl'

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
    if (stored && ['en', 'zh', 'zh-Hant', 'ja', 'ko', 'es', 'pt', 'fr', 'de', 'ru', 'it', 'nl', 'pl'].includes(stored)) {
      return stored as Language
    }
  } catch {
    // Ignore localStorage errors
  }
  return detectBrowserLanguage()
}

const applyLanguage = (language: Language) => {
  const langMap: Record<Language, string> = {
    'en': 'en',
    'zh': 'zh-CN',
    'zh-Hant': 'zh-TW',
    'ja': 'ja',
    'ko': 'ko',
    'es': 'es',
    'pt': 'pt',
    'fr': 'fr',
    'de': 'de',
    'ru': 'ru',
    'it': 'it',
    'nl': 'nl',
    'pl': 'pl'
  }
  document.documentElement.lang = langMap[language]
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
  const paths: Record<Language, string> = {
    'en': '',
    'zh': '/zh-Hans',
    'zh-Hant': '/zh-Hant',
    'ja': '/ja',
    'ko': '/ko',
    'es': '/es',
    'pt': '/pt',
    'fr': '/fr',
    'de': '/de',
    'ru': '/ru',
    'it': '/it',
    'nl': '/nl',
    'pl': '/pl'
  }
  return paths[language]
}
