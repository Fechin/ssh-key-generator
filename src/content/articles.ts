import type { Language } from '@/i18n/languageConfig'

export type ArticleSlug = 'what-is-ssh' | 'what-is-an-ssh-key' | 'ssh-command' | 'how-to-set-up-ssh'

// Re-export for consumers that imported ArticleLang from here
export type ArticleLang = Language

export const ARTICLE_SLUGS: ArticleSlug[] = [
  'what-is-ssh',
  'what-is-an-ssh-key',
  'ssh-command',
  'how-to-set-up-ssh',
]

export interface ArticleMeta {
  title: string
  description: string
  keywords: string[]
  publishDate: string
}

// 'en' is always required as the canonical fallback; all other languages are optional
export type ArticleMetaRecord = { en: ArticleMeta } & Partial<Record<Language, ArticleMeta>>

type ArticleMetaBatch = Partial<Record<Language, Partial<Record<ArticleSlug, ArticleMeta>>>>

const metaModules = import.meta.glob<ArticleMetaBatch>('./meta/*.json', {
  eager: true,
  import: 'default',
})

function mergeArticleMeta() {
  const merged = Object.fromEntries(
    ARTICLE_SLUGS.map((slug) => [slug, {}]),
  ) as Record<ArticleSlug, Partial<Record<Language, ArticleMeta>>>

  for (const batch of Object.values(metaModules)) {
    for (const [language, localizedArticles] of Object.entries(batch) as [
      Language,
      Partial<Record<ArticleSlug, ArticleMeta>>,
    ][]) {
      if (!localizedArticles) {
        continue
      }

      for (const [slug, meta] of Object.entries(localizedArticles) as [ArticleSlug, ArticleMeta][]) {
        merged[slug] = {
          ...merged[slug],
          [language]: meta,
        }
      }
    }
  }

  for (const slug of ARTICLE_SLUGS) {
    if (!merged[slug].en) {
      throw new Error(`Missing English article metadata for "${slug}"`)
    }
  }

  return merged as Record<ArticleSlug, ArticleMetaRecord>
}

export const articleMeta = mergeArticleMeta()

export function getArticleMeta(slug: ArticleSlug, language: Language): ArticleMeta {
  return articleMeta[slug][language] ?? articleMeta[slug].en
}
