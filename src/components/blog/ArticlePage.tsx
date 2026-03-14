import { lazy, Suspense, useEffect, type LazyExoticComponent, type ComponentType } from 'react'
import { MDXProvider } from '@mdx-js/react'
import { ArticleLayout } from './ArticleLayout'
import { mdxComponents } from './MDXComponents'
import { getArticleMeta, type ArticleSlug } from '@/content/articles'
import { buildArticlePageMetadata, syncPageMetadata } from '@/lib/seo'
import { getLanguagePathname } from '@/i18n'
import type { Language } from '@/i18n'

type LazyMDX = LazyExoticComponent<ComponentType<Record<string, unknown>>>

// Vite registers all MDX files for code splitting via glob; keys are relative to this file
const contentModules = import.meta.glob<{ default: ComponentType<Record<string, unknown>> }>(
  '../../content/**/*.mdx',
)

// Module-level cache ensures each lazy component is created only once (React requirement)
const lazyCache = new Map<string, LazyMDX>()

function getContent(lang: Language, slug: ArticleSlug): LazyMDX {
  const key = `${lang}/${slug}`
  if (!lazyCache.has(key)) {
    const path = `../../content/${lang}/${slug}.mdx`
    const loader = contentModules[path] ?? contentModules[`../../content/en/${slug}.mdx`]
    lazyCache.set(
      key,
      lazy(loader as () => Promise<{ default: ComponentType<Record<string, unknown>> }>),
    )
  }
  return lazyCache.get(key)!
}

interface Props {
  slug: ArticleSlug
  lang: Language
}

export function ArticlePage({ slug, lang }: Props) {
  const meta = getArticleMeta(slug, lang)
  const basePath = getLanguagePathname(lang).replace(/\/$/, '')
  const Content = getContent(lang, slug)

  useEffect(() => {
    syncPageMetadata(lang, buildArticlePageMetadata(slug, lang, meta))
  }, [slug, lang, meta])

  return (
    <ArticleLayout backHref={`${basePath}/`} backLabel="SSH Key Generator">
      <MDXProvider components={mdxComponents}>
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <Content />
        </Suspense>
      </MDXProvider>
    </ArticleLayout>
  )
}
