import { createContext, type RefObject } from 'react'
import type { ArticleSlug } from '@/content/articles'
import type { Language } from '@/i18n'

export const ArticleContext = createContext<{
  slug: ArticleSlug
  language: Language
  bodyRef: RefObject<HTMLDivElement | null>
} | null>(null)
