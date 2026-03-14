import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const configPath = path.join(projectRoot, 'src', 'i18n', 'languageConfig.json')
const articleMetaDirectory = path.join(projectRoot, 'src', 'content', 'meta')
const publicSitemapPath = path.join(projectRoot, 'public', 'sitemap.xml')
const distDirectory = path.join(projectRoot, 'dist')
const distIndexPath = path.join(distDirectory, 'index.html')

const rawConfig = JSON.parse(await fs.readFile(configPath, 'utf8'))
const siteUrl = rawConfig.siteUrl
const defaultLanguageCode = rawConfig.defaultLanguage
const languages = rawConfig.languages
const defaultLanguage = languages.find((language) => language.code === defaultLanguageCode)
const today = new Date().toISOString().slice(0, 10)
const mode = process.argv.includes('--dist') ? 'dist' : 'source'

const defaultTitle = 'SSH Key Generator Online - Free Secure Key Generation'
const defaultDescription =
  'Generate SSH keys securely in your browser. Support Ed25519, RSA. Works with GitHub, GitLab, Bitbucket. 100% client-side, no data sent to servers.'
const socialImageUrl = `${siteUrl}/og.webp`
const organizationId = `${siteUrl}#organization`
const websiteId = `${siteUrl}#website`
const rtlLanguageCodes = new Set(['ar', 'he'])

const openGraphLocaleByCode = {
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

const faqKeys = [
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
]

const howToStepKeys = ['step1', 'step2', 'step3', 'step4', 'step5']
const articleSlugs = ['what-is-ssh', 'what-is-an-ssh-key', 'ssh-command', 'how-to-set-up-ssh']

const englishTranslations = JSON.parse(
  await fs.readFile(path.join(projectRoot, 'src', 'i18n', 'locales', defaultLanguage.localeFile), 'utf8'),
)
const articleMeta = await loadArticleMeta()

const crawlableLinksStartMarker = '<!-- SEO_CRAWLABLE_LINKS_START -->'
const crawlableLinksEndMarker = '<!-- SEO_CRAWLABLE_LINKS_END -->'

function getPathname(language) {
  return language.basePath === '' ? '/' : `${language.basePath}/`
}

function getAbsoluteUrl(language) {
  return `${siteUrl}${getPathname(language)}`
}

function getArticlePathname(language, slug) {
  return `${getPathname(language)}${slug}`
}

function getArticleAbsoluteUrl(language, slug) {
  return new URL(getArticlePathname(language, slug), siteUrl).toString()
}

function getLocalizedPageUrl(language, alternatePath = '') {
  return alternatePath ? getArticleAbsoluteUrl(language, alternatePath) : getAbsoluteUrl(language)
}

function getTextDirection(language) {
  return rtlLanguageCodes.has(language.code) ? 'rtl' : 'ltr'
}

function getOpenGraphLocale(language) {
  return openGraphLocaleByCode[language.code]
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function escapeAttribute(value) {
  return escapeHtml(value)
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function toJsonLd(value) {
  return JSON.stringify(value, null, 2).replaceAll('<', '\\u003c')
}

function getNestedValue(object, keyPath) {
  return keyPath.split('.').reduce((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return current[key]
    }

    return undefined
  }, object)
}

function createTranslator(translations) {
  return (key) => {
    const localized = getNestedValue(translations, key)
    if (typeof localized === 'string') {
      return localized
    }

    const english = getNestedValue(englishTranslations, key)
    return typeof english === 'string' ? english : key
  }
}

function stripStepLabel(stepText) {
  return stepText.split(/:|：/)[0]?.trim() || stepText
}

function buildHtmlAlternateLinks(alternatePath = '') {
  const links = languages.map(
    (language) =>
      `    <link rel="alternate" hreflang="${language.hreflang}" href="${escapeAttribute(
        getLocalizedPageUrl(language, alternatePath),
      )}" />`,
  )

  links.push(
    `    <link rel="alternate" hreflang="x-default" href="${escapeAttribute(
      getLocalizedPageUrl(defaultLanguage, alternatePath),
    )}" />`,
  )

  return links.join('\n')
}

function buildSitemapAlternateLinks(alternatePath = '') {
  const links = languages.map(
    (language) =>
      `    <xhtml:link rel="alternate" hreflang="${language.hreflang}" href="${escapeAttribute(
        getLocalizedPageUrl(language, alternatePath),
      )}"/>`,
  )

  links.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeAttribute(
      getLocalizedPageUrl(defaultLanguage, alternatePath),
    )}"/>`,
  )

  return links.join('\n')
}

function buildSitemapXml() {
  const homeAlternateLinks = buildSitemapAlternateLinks()
  const homeUrls = languages
    .map((language, index) => `  <url>
    <loc>${escapeHtml(getAbsoluteUrl(language))}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${index === 0 ? '1.0' : '0.8'}</priority>
${homeAlternateLinks}
  </url>`)
    .join('\n\n')

  const articleUrls = articleSlugs
    .flatMap((slug) =>
      languages.map((language) => `  <url>
    <loc>${escapeHtml(getArticleAbsoluteUrl(language, slug))}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
${buildSitemapAlternateLinks(slug)}
  </url>`),
    )
    .join('\n\n')

  const urls = [homeUrls, articleUrls].filter(Boolean).join('\n\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`
}

async function loadTranslations(language) {
  const translationPath = path.join(projectRoot, 'src', 'i18n', 'locales', language.localeFile)
  return JSON.parse(await fs.readFile(translationPath, 'utf8'))
}

async function loadArticleMeta() {
  const fileNames = (await fs.readdir(articleMetaDirectory))
    .filter((fileName) => fileName.endsWith('.json'))
    .sort()

  const merged = Object.fromEntries(articleSlugs.map((slug) => [slug, {}]))

  for (const fileName of fileNames) {
    const batch = JSON.parse(await fs.readFile(path.join(articleMetaDirectory, fileName), 'utf8'))

    for (const [languageCode, localizedArticles] of Object.entries(batch)) {
      if (!localizedArticles || typeof localizedArticles !== 'object') {
        continue
      }

      for (const [slug, meta] of Object.entries(localizedArticles)) {
        if (!articleSlugs.includes(slug)) {
          throw new Error(`Unknown article slug "${slug}" in ${fileName}`)
        }

        merged[slug][languageCode] = meta
      }
    }
  }

  for (const slug of articleSlugs) {
    if (!merged[slug].en) {
      throw new Error(`Missing English article metadata for "${slug}"`)
    }
  }

  return merged
}

function getArticleMeta(slug, language) {
  return articleMeta[slug][language.code] ?? articleMeta[slug][defaultLanguage.code]
}

function buildFaqEntities(t) {
  return faqKeys.map((faqKey) => ({
    '@type': 'Question',
    name: t(`seo.faq.${faqKey}.question`),
    acceptedAnswer: {
      '@type': 'Answer',
      text: t(`seo.faq.${faqKey}.answer`),
    },
  }))
}

function buildHowToSteps(t, canonicalUrl) {
  return howToStepKeys.map((stepKey, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: stripStepLabel(t(`seo.howTo.${stepKey}`)),
    text: t(`seo.howTo.${stepKey}`),
    url: `${canonicalUrl}#how-to-step-${index + 1}`,
  }))
}

function buildHomeMetadata(language, translations) {
  const t = createTranslator(translations)
  const canonicalUrl = getAbsoluteUrl(language)
  const title = language.code === defaultLanguage.code ? defaultTitle : `${t('hero.title')} | SSH Key Generator`
  const description = language.code === defaultLanguage.code ? defaultDescription : t('hero.subtitle')

  return {
    title,
    description,
    canonicalUrl,
    alternatePath: '',
    robots: 'index, follow',
    ogType: 'website',
    ogLocale: getOpenGraphLocale(language),
    structuredData: {
      website: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': websiteId,
        url: `${siteUrl}/`,
        name: 'SSH Key Generator',
        inLanguage: language.hreflang,
        publisher: {
          '@id': organizationId,
        },
      },
      page: {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        '@id': `${canonicalUrl}#software-application`,
        name: 'SSH Key Generator',
        alternateName: title,
        description,
        url: canonicalUrl,
        image: socialImageUrl,
        screenshot: socialImageUrl,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web Browser',
        browserRequirements: 'Requires a modern browser with Web Crypto API support.',
        inLanguage: language.hreflang,
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
          '@id': organizationId,
        },
      },
      faq: {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${canonicalUrl}#faq`,
        url: canonicalUrl,
        inLanguage: language.hreflang,
        mainEntity: buildFaqEntities(t),
      },
      howTo: {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        '@id': `${canonicalUrl}#how-to`,
        name: t('seo.howTo.title'),
        description,
        image: socialImageUrl,
        totalTime: 'PT1M',
        inLanguage: language.hreflang,
        tool: [
          {
            '@type': 'HowToTool',
            name: 'Web browser (Chrome, Firefox, Safari, Edge)',
          },
        ],
        step: buildHowToSteps(t, canonicalUrl),
      },
      organization: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': organizationId,
        name: 'SSH Key Generator',
        url: siteUrl,
        logo: `${siteUrl}/favicon/android-chrome-512x512.png`,
        sameAs: [
          'https://github.com/Fechin/ssh-key-generator',
        ],
      },
    },
  }
}

function buildArticleMetadata(language, slug) {
  const meta = getArticleMeta(slug, language)
  const canonicalUrl = getArticleAbsoluteUrl(language, slug)

  return {
    title: meta.title,
    description: meta.description,
    canonicalUrl,
    alternatePath: slug,
    robots: 'index, follow',
    ogType: 'article',
    ogLocale: getOpenGraphLocale(language),
    structuredData: {
      website: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': websiteId,
        url: `${siteUrl}/`,
        name: 'SSH Key Generator',
        inLanguage: language.hreflang,
        publisher: {
          '@id': organizationId,
        },
      },
      page: {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        '@id': `${canonicalUrl}#article`,
        headline: meta.title,
        description: meta.description,
        datePublished: meta.publishDate,
        dateModified: meta.publishDate,
        image: socialImageUrl,
        url: canonicalUrl,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
        keywords: meta.keywords.join(', '),
        author: {
          '@id': organizationId,
        },
        publisher: {
          '@id': organizationId,
        },
        inLanguage: language.hreflang,
      },
      faq: null,
      howTo: null,
      organization: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': organizationId,
        name: 'SSH Key Generator',
        url: siteUrl,
        logo: `${siteUrl}/favicon/android-chrome-512x512.png`,
        sameAs: [
          'https://github.com/Fechin/ssh-key-generator',
        ],
      },
    },
  }
}

function buildGuideLinksMarkup(language) {
  return articleSlugs
    .map((slug) => {
      const meta = getArticleMeta(slug, language)
      return `<a href="${escapeAttribute(getArticlePathname(language, slug))}">${escapeHtml(meta.title)}</a>`
    })
    .join('\n        ')
}

function buildResourceLinksMarkup(translations) {
  return [
    {
      href: 'https://docs.github.com/en/authentication/connecting-to-github-with-ssh',
      label: translations.footer?.sshKeyGuide ?? 'GitHub SSH Docs',
    },
    {
      href: 'https://docs.gitlab.com/ee/user/ssh.html',
      label: translations.footer?.githubSetup ?? 'GitLab SSH Docs',
    },
    {
      href: 'https://www.ssh.com/academy/ssh',
      label: translations.footer?.bestPractices ?? 'SSH Academy',
    },
    {
      href: 'https://cheatsheets.zip/ssh',
      label: translations.footer?.sshCheatSheet ?? 'SSH Cheat Sheet',
    },
  ]
    .map(
      ({ href, label }) =>
        `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`,
    )
    .join('\n        ')
}

function buildHomeCrawlableLinksMarkup(language, translations) {
  const languageLinks = languages
    .map(
      (candidate) =>
        `<a href="${escapeAttribute(getPathname(candidate))}">${escapeHtml(candidate.label)}</a>`,
    )
    .join('\n        ')

  return `  <div id="seo-crawlable-links">
    <p class="seo-crawlable-links__summary">${escapeHtml(
      translations.hero?.subtitle ?? 'Generate secure SSH keys in your browser.',
    )}</p>
    <nav aria-label="Language versions" class="seo-crawlable-links__group">
      <strong>${escapeHtml(translations.header?.title ?? 'SSH Key Generator')}</strong>
      <div class="seo-crawlable-links__list">
        ${languageLinks}
      </div>
    </nav>
    <nav aria-label="SSH guides" class="seo-crawlable-links__group">
      <strong>${escapeHtml(translations.guides?.title ?? 'SSH Guides')}</strong>
      <div class="seo-crawlable-links__list">
        ${buildGuideLinksMarkup(language)}
      </div>
    </nav>
    <nav aria-label="SSH resources" class="seo-crawlable-links__group">
      <strong>${escapeHtml(translations.footer?.resources ?? 'Resources')}</strong>
      <div class="seo-crawlable-links__list">
        ${buildResourceLinksMarkup(translations)}
      </div>
    </nav>
    <a class="seo-crawlable-links__canonical" href="${escapeAttribute(
      getAbsoluteUrl(language),
    )}">${escapeHtml(translations.hero?.title ?? 'SSH Key Generator Online')}</a>
  </div>`
}

function buildArticleCrawlableLinksMarkup(language, slug, translations) {
  const meta = getArticleMeta(slug, language)
  const languageLinks = languages
    .map(
      (candidate) =>
        `<a href="${escapeAttribute(getArticlePathname(candidate, slug))}">${escapeHtml(candidate.label)}</a>`,
    )
    .join('\n        ')

  return `  <div id="seo-crawlable-links">
    <h1 class="seo-crawlable-links__title">${escapeHtml(meta.title)}</h1>
    <p class="seo-crawlable-links__summary">${escapeHtml(meta.description)}</p>
    <nav aria-label="SSH guides" class="seo-crawlable-links__group">
      <strong>${escapeHtml(translations.guides?.title ?? 'SSH Guides')}</strong>
      <div class="seo-crawlable-links__list">
        ${buildGuideLinksMarkup(language)}
      </div>
    </nav>
    <nav aria-label="Article languages" class="seo-crawlable-links__group">
      <strong>${escapeHtml(translations.header?.title ?? 'Language versions')}</strong>
      <div class="seo-crawlable-links__list">
        ${languageLinks}
      </div>
    </nav>
    <nav aria-label="SSH resources" class="seo-crawlable-links__group">
      <strong>${escapeHtml(translations.footer?.resources ?? 'Resources')}</strong>
      <div class="seo-crawlable-links__list">
        ${buildResourceLinksMarkup(translations)}
      </div>
    </nav>
    <a class="seo-crawlable-links__canonical" href="${escapeAttribute(
      getArticleAbsoluteUrl(language, slug),
    )}">${escapeHtml(meta.title)}</a>
    <a class="seo-crawlable-links__home" href="${escapeAttribute(
      getPathname(language),
    )}">${escapeHtml(translations.hero?.title ?? 'SSH Key Generator Online')}</a>
  </div>`
}

function injectCrawlableLinksHead(html) {
  if (html.includes('id="seo-crawlable-links-style"')) {
    return html
  }

  const snippet = `    <script id="seo-crawlable-links-script">document.documentElement.classList.add('js')</script>
    <style id="seo-crawlable-links-style">
      html.js #seo-crawlable-links { display: none; }
      #seo-crawlable-links {
        border-top: 1px solid #e5e7eb;
        color: #0f172a;
        font: 400 14px/1.6 system-ui, sans-serif;
        margin: 2rem auto 0;
        max-width: 960px;
        padding: 1.5rem 1rem 2rem;
      }
      #seo-crawlable-links a {
        color: #2563eb;
        text-decoration: none;
      }
      #seo-crawlable-links a:hover {
        text-decoration: underline;
      }
      .seo-crawlable-links__summary {
        margin: 0 0 1rem;
      }
      .seo-crawlable-links__title {
        font-size: 1.5rem;
        font-weight: 600;
        line-height: 1.25;
        margin: 0 0 0.75rem;
      }
      .seo-crawlable-links__group + .seo-crawlable-links__group {
        margin-top: 1rem;
      }
      .seo-crawlable-links__list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem 0.875rem;
        margin-top: 0.375rem;
      }
      .seo-crawlable-links__canonical {
        display: inline-block;
        margin-top: 1rem;
      }
      .seo-crawlable-links__home {
        display: inline-block;
        margin-left: 1rem;
        margin-top: 1rem;
      }
    </style>
`

  return html.replace('</head>', `${snippet}</head>`)
}

function upsertCrawlableLinksMarkup(html, markup) {
  const wrappedMarkup = `${crawlableLinksStartMarker}
${markup}
${crawlableLinksEndMarker}`

  if (html.includes(crawlableLinksStartMarker) && html.includes(crawlableLinksEndMarker)) {
    return html.replace(
      /<!-- SEO_CRAWLABLE_LINKS_START -->[\s\S]*?<!-- SEO_CRAWLABLE_LINKS_END -->/,
      wrappedMarkup,
    )
  }

  if (html.includes('id="seo-crawlable-links"')) {
    return html.replace(/<div id="seo-crawlable-links">[\s\S]*?<\/body>/, `${wrappedMarkup}\n</body>`)
  }

  return html.replace('</body>', `${wrappedMarkup}\n</body>`)
}

function replaceTag(html, matcher, replacement) {
  return matcher.test(html) ? html.replace(matcher, replacement) : html
}

function replaceMetaContentById(html, id, content) {
  const matcher = new RegExp(`(<meta[^>]*id="${id}"[^>]*content=")([^"]*)(".*?>)`)
  return replaceTag(html, matcher, `$1${escapeAttribute(content)}$3`)
}

function replaceLinkHrefById(html, id, href) {
  const matcher = new RegExp(`(<link[^>]*id="${id}"[^>]*href=")([^"]*)(".*?>)`)
  return replaceTag(html, matcher, `$1${escapeAttribute(href)}$3`)
}

function replaceScriptById(html, id, value) {
  const matcher = new RegExp(`(<script[^>]*id="${id}"[^>]*>)([\\s\\S]*?)(</script>)`)
  const scriptContent = value === null ? '' : `\n${toJsonLd(value)}\n    `
  return replaceTag(html, matcher, `$1${scriptContent}$3`)
}

function normalizeHead(html, language, metadata) {
  const alternateLinks = buildHtmlAlternateLinks(metadata.alternatePath)
  let nextHtml = html
  nextHtml = replaceTag(
    nextHtml,
    /<html[^>]*lang="[^"]*"[^>]*>/,
    `<html lang="${escapeAttribute(language.htmlLang)}" dir="${getTextDirection(language)}">`,
  )
  nextHtml = replaceTag(
    nextHtml,
    /<title>[\s\S]*?<\/title>/,
    `<title>${escapeHtml(metadata.title)}</title>`,
  )
  nextHtml = replaceMetaContentById(nextHtml, 'meta-title', metadata.title)
  nextHtml = replaceMetaContentById(nextHtml, 'meta-description', metadata.description)
  nextHtml = replaceMetaContentById(nextHtml, 'meta-robots', metadata.robots)
  nextHtml = replaceLinkHrefById(nextHtml, 'link-canonical', metadata.canonicalUrl)
  nextHtml = replaceTag(
    nextHtml,
    /<!-- Language alternates -->[\s\S]*?<!-- Open Graph \/ Facebook -->/,
    `<!-- Language alternates -->
${alternateLinks}

    <!-- Open Graph / Facebook -->`,
  )
  nextHtml = replaceMetaContentById(nextHtml, 'meta-og-type', metadata.ogType)
  nextHtml = replaceMetaContentById(nextHtml, 'meta-og-url', metadata.canonicalUrl)
  nextHtml = replaceMetaContentById(nextHtml, 'meta-og-title', metadata.title)
  nextHtml = replaceMetaContentById(nextHtml, 'meta-og-description', metadata.description)
  nextHtml = replaceMetaContentById(nextHtml, 'meta-og-image', socialImageUrl)
  nextHtml = replaceMetaContentById(nextHtml, 'meta-og-site-name', 'SSH Key Generator')
  nextHtml = replaceMetaContentById(nextHtml, 'meta-og-locale', metadata.ogLocale)
  nextHtml = replaceMetaContentById(nextHtml, 'meta-twitter-url', metadata.canonicalUrl)
  nextHtml = replaceMetaContentById(nextHtml, 'meta-twitter-title', metadata.title)
  nextHtml = replaceMetaContentById(nextHtml, 'meta-twitter-description', metadata.description)
  nextHtml = replaceMetaContentById(nextHtml, 'meta-twitter-image', socialImageUrl)
  nextHtml = replaceScriptById(nextHtml, 'structured-data-website', metadata.structuredData.website)
  nextHtml = replaceScriptById(nextHtml, 'structured-data-page', metadata.structuredData.page)
  nextHtml = replaceScriptById(nextHtml, 'structured-data-faq', metadata.structuredData.faq)
  nextHtml = replaceScriptById(nextHtml, 'structured-data-howto', metadata.structuredData.howTo)
  nextHtml = replaceScriptById(nextHtml, 'structured-data-organization', metadata.structuredData.organization)
  return injectCrawlableLinksHead(nextHtml)
}

async function writeSourceAssets() {
  await fs.writeFile(publicSitemapPath, buildSitemapXml(), 'utf8')
}

function getDistOutputPath(language, slug = '') {
  if (language.basePath === '') {
    return slug ? path.join(distDirectory, slug, 'index.html') : distIndexPath
  }

  return slug
    ? path.join(distDirectory, language.basePath.slice(1), slug, 'index.html')
    : path.join(distDirectory, language.basePath.slice(1), 'index.html')
}

async function writeDistAssets() {
  const htmlTemplate = await fs.readFile(distIndexPath, 'utf8')

  for (const language of languages) {
    const translations = await loadTranslations(language)
    const localizedHtml = upsertCrawlableLinksMarkup(
      normalizeHead(htmlTemplate, language, buildHomeMetadata(language, translations)),
      buildHomeCrawlableLinksMarkup(language, translations),
    )
    const outputPath = getDistOutputPath(language)

    await fs.mkdir(path.dirname(outputPath), { recursive: true })
    await fs.writeFile(outputPath, localizedHtml, 'utf8')

    for (const slug of articleSlugs) {
      const articleHtml = upsertCrawlableLinksMarkup(
        normalizeHead(htmlTemplate, language, buildArticleMetadata(language, slug)),
        buildArticleCrawlableLinksMarkup(language, slug, translations),
      )
      const articleOutputPath = getDistOutputPath(language, slug)

      await fs.mkdir(path.dirname(articleOutputPath), { recursive: true })
      await fs.writeFile(articleOutputPath, articleHtml, 'utf8')
    }
  }
}

if (mode === 'dist') {
  await writeDistAssets()
} else {
  await writeSourceAssets()
}
