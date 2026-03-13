import rawLanguageConfig from './languageConfig.json'

export type Language =
  | 'en'
  | 'zh'
  | 'zh-Hant'
  | 'ja'
  | 'ko'
  | 'es'
  | 'pt'
  | 'fr'
  | 'de'
  | 'ru'
  | 'it'
  | 'nl'
  | 'pl'
  | 'sv'
  | 'he'
  | 'da'
  | 'nb'
  | 'hi'
  | 'vi'
  | 'tr'
  | 'id'
  | 'fi'
  | 'uk'
  | 'ar'
  | 'th'
  | 'ro'
  | 'cs'
  | 'bn'
  | 'el'
  | 'hu'

export interface LanguageDefinition {
  code: Language
  hreflang: string
  htmlLang: string
  basePath: string
  label: string
  flag: string
  localeFile: string
}

const languageConfig = rawLanguageConfig as {
  siteUrl: string
  defaultLanguage: Language
  languages: LanguageDefinition[]
}

export const SITE_URL = languageConfig.siteUrl
export const DEFAULT_LANGUAGE = languageConfig.defaultLanguage
export const LANGUAGE_CONFIG = languageConfig.languages
export const LANGUAGE_CODES = LANGUAGE_CONFIG.map(({ code }) => code) as Language[]
export const NON_DEFAULT_LANGUAGE_CONFIG = LANGUAGE_CONFIG.filter(
  ({ code }) => code !== DEFAULT_LANGUAGE,
) as LanguageDefinition[]

export const LANGUAGE_BY_CODE = Object.fromEntries(
  LANGUAGE_CONFIG.map((language) => [language.code, language]),
) as Record<Language, LanguageDefinition>

const OPEN_GRAPH_LOCALE_BY_LANGUAGE: Record<Language, string> = {
  en: 'en_US',
  zh: 'zh_CN',
  'zh-Hant': 'zh_TW',
  ja: 'ja_JP',
  ko: 'ko_KR',
  es: 'es_ES',
  pt: 'pt_BR',
  fr: 'fr_FR',
  de: 'de_DE',
  ru: 'ru_RU',
  it: 'it_IT',
  nl: 'nl_NL',
  pl: 'pl_PL',
  sv: 'sv_SE',
  he: 'he_IL',
  da: 'da_DK',
  nb: 'nb_NO',
  hi: 'hi_IN',
  vi: 'vi_VN',
  tr: 'tr_TR',
  id: 'id_ID',
  fi: 'fi_FI',
  uk: 'uk_UA',
  ar: 'ar_SA',
  th: 'th_TH',
  ro: 'ro_RO',
  cs: 'cs_CZ',
  bn: 'bn_BD',
  el: 'el_GR',
  hu: 'hu_HU',
}

const RTL_LANGUAGE_CODES = new Set<Language>(['ar', 'he'])

const supportedLanguageSet = new Set(LANGUAGE_CODES)

function stripTrailingSlash(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1)
  }

  return pathname
}

export function isSupportedLanguage(value: string): value is Language {
  return supportedLanguageSet.has(value as Language)
}

export function getLanguageBasePath(language: Language): string {
  return LANGUAGE_BY_CODE[language].basePath
}

export function getLanguagePathname(language: Language): string {
  const basePath = getLanguageBasePath(language)
  return basePath === '' ? '/' : `${basePath}/`
}

export function getAbsoluteLanguageUrl(language: Language): string {
  return `${SITE_URL}${getLanguagePathname(language)}`
}

export function getLanguageDirection(language: Language): 'ltr' | 'rtl' {
  return RTL_LANGUAGE_CODES.has(language) ? 'rtl' : 'ltr'
}

export function getOpenGraphLocale(language: Language): string {
  return OPEN_GRAPH_LOCALE_BY_LANGUAGE[language]
}

export function detectLanguageFromPathname(pathname: string): Language | null {
  const normalizedPath = stripTrailingSlash(pathname)

  for (const language of NON_DEFAULT_LANGUAGE_CONFIG) {
    if (
      normalizedPath === language.basePath ||
      normalizedPath.startsWith(`${language.basePath}/`)
    ) {
      return language.code
    }
  }

  return null
}
