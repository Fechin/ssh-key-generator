import { useLanguageStore, type Language } from './languageStore'
import en from './locales/en.json'
import zh from './locales/zh.json'
import zhHant from './locales/zh-Hant.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'
import es from './locales/es.json'
import pt from './locales/pt.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import ru from './locales/ru.json'
import it from './locales/it.json'
import nl from './locales/nl.json'
import pl from './locales/pl.json'

type TranslationValue = string | { [key: string]: TranslationValue }
type Translations = { [key: string]: TranslationValue }

const translations: Record<Language, Translations> = {
  en,
  zh,
  'zh-Hant': zhHant,
  ja,
  ko,
  es,
  pt,
  fr,
  de,
  ru,
  it,
  nl,
  pl
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

  const t = (key: string, params?: Record<string, string | number>): string => {
    // Try current language first
    let value = getNestedValue(translations[language], key)

    // Fallback to English if not found and not already English
    if (value === key && language !== 'en') {
      value = getNestedValue(translations.en, key)
    }

    return interpolate(value, params)
  }

  return { t, language }
}
