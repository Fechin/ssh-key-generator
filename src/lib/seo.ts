import {
  DEFAULT_LANGUAGE,
  LANGUAGE_BY_CODE,
  SITE_URL,
  getAbsoluteLanguageUrl,
  getOpenGraphLocale,
  type Language,
} from '@/i18n/languageConfig'

type TranslationFn = (key: string, params?: Record<string, string | number>) => string

type JsonLdValue = Record<string, unknown>

export interface PageMetadata {
  title: string
  description: string
  canonicalUrl: string
  robots: string
  ogType: 'website'
  structuredData: {
    website: JsonLdValue
    page: JsonLdValue
    faq: JsonLdValue | null
    howTo: JsonLdValue | null
    organization: JsonLdValue
  }
}

const SITE_NAME = 'SSH Key Generator'
const DEFAULT_TITLE = 'SSH Key Generator Online - Free Secure Key Generation'
const DEFAULT_DESCRIPTION =
  'Generate SSH keys securely in your browser. Support Ed25519, RSA. Works with GitHub, GitLab, Bitbucket. 100% client-side, no data sent to servers.'
const SOCIAL_IMAGE_URL = `${SITE_URL}/og.webp`
const ORGANIZATION_ID = `${SITE_URL}#organization`
const WEBSITE_ID = `${SITE_URL}#website`

const FAQ_KEYS = [
  'safe',
  'ed25519VsRsa',
  'github',
  'rsaKeySize',
  'offline',
  'passphrase',
  'multipleServers',
  'fingerprint',
  'bestAlgorithm',
  'bestOnlineGenerator',
  'authorizedKeys',
  'permissions',
] as const

const HOW_TO_STEP_KEYS = ['step1', 'step2', 'step3', 'step4', 'step5'] as const

function toJsonLd(value: JsonLdValue) {
  return JSON.stringify(value, null, 2).replaceAll('<', '\\u003c')
}

function upsertMetaByName(name: string, content: string) {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null

  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    document.head.appendChild(tag)
  }

  tag.setAttribute('content', content)
}

function upsertMetaByProperty(property: string, content: string) {
  let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null

  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('property', property)
    document.head.appendChild(tag)
  }

  tag.setAttribute('content', content)
}

function upsertCanonicalLink(href: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null

  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }

  link.setAttribute('href', href)
}

function upsertStructuredDataScript(id: string, value: JsonLdValue | null) {
  let script = document.getElementById(id) as HTMLScriptElement | null

  if (!script) {
    script = document.createElement('script')
    script.id = id
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }

  script.textContent = value ? toJsonLd(value) : ''
}

function syncAlternateLinks() {
  document
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((element) => element.remove())

  for (const language of Object.values(LANGUAGE_BY_CODE)) {
    const link = document.createElement('link')
    link.setAttribute('rel', 'alternate')
    link.setAttribute('hreflang', language.hreflang)
    link.setAttribute('href', getAbsoluteLanguageUrl(language.code))
    document.head.appendChild(link)
  }

  const xDefaultLink = document.createElement('link')
  xDefaultLink.setAttribute('rel', 'alternate')
  xDefaultLink.setAttribute('hreflang', 'x-default')
  xDefaultLink.setAttribute('href', getAbsoluteLanguageUrl(DEFAULT_LANGUAGE))
  document.head.appendChild(xDefaultLink)
}

function stripStepLabel(stepText: string) {
  return stepText.split(/:|：/)[0]?.trim() || stepText
}

function normalizeAbsoluteUrl(pathname: string) {
  return new URL(pathname || '/', SITE_URL).toString()
}

function buildFaqEntities(t: TranslationFn) {
  return FAQ_KEYS.map((faqKey) => ({
    '@type': 'Question',
    name: t(`seo.faq.${faqKey}.question`),
    acceptedAnswer: {
      '@type': 'Answer',
      text: t(`seo.faq.${faqKey}.answer`),
    },
  }))
}

function buildHowToSteps(t: TranslationFn, canonicalUrl: string) {
  return HOW_TO_STEP_KEYS.map((stepKey, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: stripStepLabel(t(`seo.howTo.${stepKey}`)),
    text: t(`seo.howTo.${stepKey}`),
    url: `${canonicalUrl}#how-to-step-${index + 1}`,
  }))
}

function buildWebsiteSchema(language: Language): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: LANGUAGE_BY_CODE[language].hreflang,
    publisher: {
      '@id': ORGANIZATION_ID,
    },
  }
}

function buildOrganizationSchema(): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon/android-chrome-512x512.png`,
    sameAs: [
      'https://github.com/Fechin/ssh-key-generator',
    ],
  }
}

function buildSoftwareApplicationSchema(
  language: Language,
  title: string,
  description: string,
  canonicalUrl: string,
  t: TranslationFn,
): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${canonicalUrl}#software-application`,
    name: SITE_NAME,
    alternateName: title,
    description,
    url: canonicalUrl,
    image: SOCIAL_IMAGE_URL,
    screenshot: SOCIAL_IMAGE_URL,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires a modern browser with Web Crypto API support.',
    inLanguage: LANGUAGE_BY_CODE[language].hreflang,
    isAccessibleForFree: true,
    featureList: [
      t('algorithms.ed25519'),
      t('algorithms.rsa4096'),
      t('generator.securityTitle'),
      t('commands.title'),
      t('sshConfig.title'),
      t('guides.title'),
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@id': ORGANIZATION_ID,
    },
  }
}

function buildWebPageSchema(
  language: Language,
  title: string,
  description: string,
  canonicalUrl: string,
): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: title,
    description,
    inLanguage: LANGUAGE_BY_CODE[language].hreflang,
    isPartOf: {
      '@id': WEBSITE_ID,
    },
  }
}

function buildFaqSchema(language: Language, t: TranslationFn, canonicalUrl: string): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${canonicalUrl}#faq`,
    url: canonicalUrl,
    inLanguage: LANGUAGE_BY_CODE[language].hreflang,
    mainEntity: buildFaqEntities(t),
  }
}

function buildHowToSchema(
  language: Language,
  title: string,
  description: string,
  canonicalUrl: string,
  t: TranslationFn,
): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${canonicalUrl}#how-to`,
    name: title,
    description,
    image: SOCIAL_IMAGE_URL,
    totalTime: 'PT1M',
    inLanguage: LANGUAGE_BY_CODE[language].hreflang,
    tool: [
      {
        '@type': 'HowToTool',
        name: 'Web browser (Chrome, Firefox, Safari, Edge)',
      },
    ],
      step: buildHowToSteps(t, canonicalUrl),
  }
}

export function buildHomePageMetadata(language: Language, t: TranslationFn): PageMetadata {
  const canonicalUrl = getAbsoluteLanguageUrl(language)
  const title = language === DEFAULT_LANGUAGE ? DEFAULT_TITLE : `${t('hero.title')} | ${SITE_NAME}`
  const description = language === DEFAULT_LANGUAGE ? DEFAULT_DESCRIPTION : t('hero.subtitle')

  return {
    title,
    description,
    canonicalUrl,
    robots: 'index, follow',
    ogType: 'website',
    structuredData: {
      website: buildWebsiteSchema(language),
      page: buildSoftwareApplicationSchema(language, title, description, canonicalUrl, t),
      faq: buildFaqSchema(language, t, canonicalUrl),
      howTo: buildHowToSchema(language, t('seo.howTo.title'), description, canonicalUrl, t),
      organization: buildOrganizationSchema(),
    },
  }
}

export function buildNotFoundPageMetadata(
  language: Language,
  pathname: string,
  t: TranslationFn,
): PageMetadata {
  const canonicalUrl = normalizeAbsoluteUrl(pathname)
  const title = `${t('notFound.code')} | ${t('notFound.title')} | ${SITE_NAME}`
  const description = t('notFound.description')

  return {
    title,
    description,
    canonicalUrl,
    robots: 'noindex, nofollow',
    ogType: 'website',
    structuredData: {
      website: buildWebsiteSchema(language),
      page: buildWebPageSchema(language, title, description, canonicalUrl),
      faq: null,
      howTo: null,
      organization: buildOrganizationSchema(),
    },
  }
}

export function syncPageMetadata(language: Language, metadata: PageMetadata) {
  const { title, description, canonicalUrl, robots, ogType, structuredData } = metadata

  document.title = title

  upsertMetaByName('title', title)
  upsertMetaByName('description', description)
  upsertMetaByName('robots', robots)
  upsertMetaByProperty('og:type', ogType)
  upsertMetaByProperty('og:url', canonicalUrl)
  upsertMetaByProperty('og:title', title)
  upsertMetaByProperty('og:description', description)
  upsertMetaByProperty('og:image', SOCIAL_IMAGE_URL)
  upsertMetaByProperty('og:site_name', SITE_NAME)
  upsertMetaByProperty('og:locale', getOpenGraphLocale(language))
  upsertMetaByProperty('twitter:url', canonicalUrl)
  upsertMetaByProperty('twitter:title', title)
  upsertMetaByProperty('twitter:description', description)
  upsertMetaByProperty('twitter:image', SOCIAL_IMAGE_URL)
  upsertCanonicalLink(canonicalUrl)
  syncAlternateLinks()
  upsertStructuredDataScript('structured-data-website', structuredData.website)
  upsertStructuredDataScript('structured-data-page', structuredData.page)
  upsertStructuredDataScript('structured-data-faq', structuredData.faq)
  upsertStructuredDataScript('structured-data-howto', structuredData.howTo)
  upsertStructuredDataScript('structured-data-organization', structuredData.organization)
}
