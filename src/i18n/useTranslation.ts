import { useEffect, useState } from 'react'
import { useLanguageStore, type Language } from './languageStore'
import en from './locales/en.json'

type TranslationValue = string | { [key: string]: TranslationValue }
type Translations = { [key: string]: TranslationValue }

const localeLoaders: Record<Language, () => Promise<Translations>> = {
  en: async () => en,
  zh: async () => (await import('./locales/zh.json')).default as Translations,
  'zh-Hant': async () => (await import('./locales/zh-Hant.json')).default as Translations,
  ja: async () => (await import('./locales/ja.json')).default as Translations,
  ko: async () => (await import('./locales/ko.json')).default as Translations,
  es: async () => (await import('./locales/es.json')).default as Translations,
  pt: async () => (await import('./locales/pt.json')).default as Translations,
  fr: async () => (await import('./locales/fr.json')).default as Translations,
  de: async () => (await import('./locales/de.json')).default as Translations,
  ru: async () => (await import('./locales/ru.json')).default as Translations,
  it: async () => (await import('./locales/it.json')).default as Translations,
  nl: async () => (await import('./locales/nl.json')).default as Translations,
  pl: async () => (await import('./locales/pl.json')).default as Translations,
  sv: async () => (await import('./locales/sv.json')).default as Translations,
  he: async () => (await import('./locales/he.json')).default as Translations,
  da: async () => (await import('./locales/da.json')).default as Translations,
  nb: async () => (await import('./locales/nb.json')).default as Translations,
  hi: async () => (await import('./locales/hi.json')).default as Translations,
  vi: async () => (await import('./locales/vi.json')).default as Translations,
  tr: async () => (await import('./locales/tr.json')).default as Translations,
  id: async () => (await import('./locales/id.json')).default as Translations,
  fi: async () => (await import('./locales/fi.json')).default as Translations,
  uk: async () => (await import('./locales/uk.json')).default as Translations,
  ar: async () => (await import('./locales/ar.json')).default as Translations,
  th: async () => (await import('./locales/th.json')).default as Translations,
  ro: async () => (await import('./locales/ro.json')).default as Translations,
  cs: async () => (await import('./locales/cs.json')).default as Translations,
  bn: async () => (await import('./locales/bn.json')).default as Translations,
  el: async () => (await import('./locales/el.json')).default as Translations,
  hu: async () => (await import('./locales/hu.json')).default as Translations
}

const translationCache: Partial<Record<Language, Translations>> = {
  en
}
const loadingCache = new Map<Language, Promise<Translations>>()

async function loadLanguage(language: Language): Promise<Translations> {
  const cached = translationCache[language]
  if (cached) return cached

  const pending = loadingCache.get(language)
  if (pending) return pending

  const loadPromise = localeLoaders[language]()
    .then((translations) => {
      translationCache[language] = translations
      loadingCache.delete(language)
      return translations
    })
    .catch((error) => {
      loadingCache.delete(language)
      throw error
    })

  loadingCache.set(language, loadPromise)
  return loadPromise
}

function getNestedValue(obj: Translations, path: string): string {
  const keys = path.split('.')
  let current: TranslationValue = obj

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return path // Return the key if not found
    }
  }

  return typeof current === 'string' ? current : path
}

function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) return str

  return str.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key]?.toString() ?? `{${key}}`
  })
}

export function useTranslation() {
  const { language } = useLanguageStore()
  const [, forceRender] = useState(0)

  useEffect(() => {
    if (translationCache[language]) return

    let mounted = true

    loadLanguage(language)
      .then(() => {
        if (mounted) {
          forceRender((value) => value + 1)
        }
      })
      .catch(() => {
        if (mounted && language !== 'en') {
          forceRender((value) => value + 1)
        }
      })

    return () => {
      mounted = false
    }
  }, [language])

  const currentTranslations = translationCache[language] ?? translationCache.en ?? en

  const t = (key: string, params?: Record<string, string | number>): string => {
    // Try current language first
    let value = getNestedValue(currentTranslations, key)

    // Fallback to English if not found and not already English
    if (value === key && language !== 'en') {
      value = getNestedValue(translationCache.en ?? en, key)
    }

    return interpolate(value, params)
  }

  return { t, language }
}
