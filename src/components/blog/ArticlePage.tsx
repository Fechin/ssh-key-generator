import { lazy, Suspense, useEffect, useMemo, type LazyExoticComponent, type ComponentType } from 'react'
import { MDXProvider } from '@mdx-js/react'
import { ArticleLayout } from './ArticleLayout'
import { mdxComponents } from './MDXComponents'
import { getArticleLanguages, getArticleMeta, type ArticleSlug } from '@/content/articles'
import { buildArticlePageMetadata, syncPageMetadata } from '@/lib/seo'
import { getLanguagePathname } from '@/i18n'
import type { Language } from '@/i18n'

type LazyMDX = LazyExoticComponent<ComponentType<Record<string, unknown>>>

// Vite registers all MDX files for code splitting via glob; keys are relative to this file
const contentModules = import.meta.glob<{ default: ComponentType<Record<string, unknown>> }>(
  '../../content/**/*.mdx',
)

const lazyContentModules = new Map<string, LazyMDX>(
  Object.entries(contentModules).map(([path, loader]) => [
    path.replace('../../content/', '').replace('.mdx', ''),
    lazy(loader as () => Promise<{ default: ComponentType<Record<string, unknown>> }>),
  ]),
)

interface Props {
  slug: ArticleSlug
  lang: Language
}

export function ArticlePage({ slug, lang }: Props) {
  const meta = getArticleMeta(slug, lang)
  const alternateLanguages = useMemo(() => getArticleLanguages(slug), [slug])
  const basePath = getLanguagePathname(lang).replace(/\/$/, '')
  const contentKey = `${lang}/${slug}`
  const Content = lazyContentModules.get(contentKey)

  if (!Content) {
    throw new Error(`Missing article content for ${contentKey}`)
  }

  useEffect(() => {
    syncPageMetadata(lang, buildArticlePageMetadata(slug, lang, meta, alternateLanguages))
  }, [slug, lang, meta, alternateLanguages])

  return (
    <ArticleLayout backHref={`${basePath}/`} backLabel="SSH Key Generator">
      <MDXProvider components={mdxComponents}>
        <Suspense fallback={<div className="min-h-[400px]" />}>
          {/* eslint-disable-next-line react-hooks/static-components -- MDX routes are registered once in lazyContentModules. */}
          <Content />
        </Suspense>
      </MDXProvider>
    </ArticleLayout>
  )
}
