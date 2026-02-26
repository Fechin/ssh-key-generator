import { create } from 'zustand'

export type Language = 'en' | 'zh' | 'zh-Hant' | 'ja' | 'ko' | 'es' | 'pt' | 'fr' | 'de' | 'ru' | 'it' | 'nl' | 'pl' | 'sv' | 'he' | 'da' | 'nb' | 'hi' | 'vi' | 'tr' | 'id' | 'fi' | 'uk' | 'ar' | 'th' | 'ro' | 'cs' | 'bn' | 'el' | 'hu'

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
  if (path.startsWith('/sv')) return 'sv'
  if (path.startsWith('/he')) return 'he'
  if (path.startsWith('/da')) return 'da'
  if (path.startsWith('/nb')) return 'nb'
  if (path.startsWith('/hi')) return 'hi'
  if (path.startsWith('/vi')) return 'vi'
  if (path.startsWith('/tr')) return 'tr'
  if (path.startsWith('/id')) return 'id'
  if (path.startsWith('/fi')) return 'fi'
  if (path.startsWith('/uk')) return 'uk'
  if (path.startsWith('/ar')) return 'ar'
  if (path.startsWith('/th')) return 'th'
  if (path.startsWith('/ro')) return 'ro'
  if (path.startsWith('/cs')) return 'cs'
  if (path.startsWith('/bn')) return 'bn'
  if (path.startsWith('/el')) return 'el'
  if (path.startsWith('/hu')) return 'hu'
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
  if (langParam === 'sv') return 'sv'
  if (langParam === 'he') return 'he'
  if (langParam === 'da') return 'da'
  if (langParam === 'nb' || langParam === 'no' || langParam === 'nn') return 'nb'
  if (langParam === 'hi') return 'hi'
  if (langParam === 'vi') return 'vi'
  if (langParam === 'tr') return 'tr'
  if (langParam === 'id') return 'id'
  if (langParam === 'fi') return 'fi'
  if (langParam === 'uk') return 'uk'
  if (langParam === 'ar') return 'ar'
  if (langParam === 'th') return 'th'
  if (langParam === 'ro') return 'ro'
  if (langParam === 'cs') return 'cs'
  if (langParam === 'bn') return 'bn'
  if (langParam === 'el') return 'el'
  if (langParam === 'hu') return 'hu'
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
  if (browserLang.startsWith('sv')) return 'sv'
  if (browserLang.startsWith('he')) return 'he'
  if (browserLang.startsWith('da')) return 'da'
  if (browserLang.startsWith('nb') || browserLang.startsWith('nn') || browserLang === 'no') return 'nb'
  if (browserLang.startsWith('hi')) return 'hi'
  if (browserLang.startsWith('vi')) return 'vi'
  if (browserLang.startsWith('tr')) return 'tr'
  if (browserLang.startsWith('id')) return 'id'
  if (browserLang.startsWith('fi')) return 'fi'
  if (browserLang.startsWith('uk')) return 'uk'
  if (browserLang.startsWith('ar')) return 'ar'
  if (browserLang.startsWith('th')) return 'th'
  if (browserLang.startsWith('ro')) return 'ro'
  if (browserLang.startsWith('cs')) return 'cs'
  if (browserLang.startsWith('bn')) return 'bn'
  if (browserLang.startsWith('el')) return 'el'
  if (browserLang.startsWith('hu')) return 'hu'

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
    if (stored && ['en', 'zh', 'zh-Hant', 'ja', 'ko', 'es', 'pt', 'fr', 'de', 'ru', 'it', 'nl', 'pl', 'sv', 'he', 'da', 'nb', 'hi', 'vi', 'tr', 'id', 'fi', 'uk', 'ar', 'th', 'ro', 'cs', 'bn', 'el', 'hu'].includes(stored)) {
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
    'pl': 'pl',
    'sv': 'sv',
    'he': 'he',
    'da': 'da',
    'nb': 'nb',
    'hi': 'hi',
    'vi': 'vi',
    'tr': 'tr',
    'id': 'id',
    'fi': 'fi',
    'uk': 'uk',
    'ar': 'ar',
    'th': 'th',
    'ro': 'ro',
    'cs': 'cs',
    'bn': 'bn',
    'el': 'el',
    'hu': 'hu'
  }
  document.documentElement.lang = langMap[language]
  // RTL support for Hebrew and Arabic
  document.documentElement.dir = (language === 'he' || language === 'ar') ? 'rtl' : 'ltr'
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
    'pl': '/pl',
    'sv': '/sv',
    'he': '/he',
    'da': '/da',
    'nb': '/nb',
    'hi': '/hi',
    'vi': '/vi',
    'tr': '/tr',
    'id': '/id',
    'fi': '/fi',
    'uk': '/uk',
    'ar': '/ar',
    'th': '/th',
    'ro': '/ro',
    'cs': '/cs',
    'bn': '/bn',
    'el': '/el',
    'hu': '/hu'
  }
  return paths[language]
}
