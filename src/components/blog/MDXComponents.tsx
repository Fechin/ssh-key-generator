import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'
import { ArticleCodeBlock } from './ArticleCodeBlock'
import { ArticleTools } from './ArticleTools'

export const mdxComponents = {
  h1: ({ className, ...props }: ComponentPropsWithoutRef<'h1'>) => (
    <>
      <h1 className={cn('mt-0', className)} {...props} />
      <ArticleTools />
    </>
  ),
  h2: ({ className, ...props }: ComponentPropsWithoutRef<'h2'>) => (
    <h2 className={cn('scroll-mt-20', className)} {...props} />
  ),
  h3: ({ className, ...props }: ComponentPropsWithoutRef<'h3'>) => (
    <h3 className={cn('scroll-mt-20', className)} {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<'p'>) => (
    <p {...props} />
  ),
  code: ({ className, ...props }: ComponentPropsWithoutRef<'code'>) => (
    <code dir="ltr" className={cn('font-mono', className)} {...props} />
  ),
  pre: ArticleCodeBlock,
  a: (props: ComponentPropsWithoutRef<'a'>) => (
    <a {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<'ul'>) => (
    <ul {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<'ol'>) => (
    <ol {...props} />
  ),
  table: ({ className, ...props }: ComponentPropsWithoutRef<'table'>) => (
    <div className="max-w-full overflow-x-auto">
      <table className={cn('w-full border-collapse', className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }: ComponentPropsWithoutRef<'th'>) => (
    <th className={cn('border border-border px-3 py-2 bg-muted text-start', className)} {...props} />
  ),
  td: ({ className, ...props }: ComponentPropsWithoutRef<'td'>) => (
    <td className={cn('border border-border px-3 py-2', className)} {...props} />
  ),
  blockquote: ({ className, ...props }: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote
      className={cn('border-s-4 border-primary/40 ps-4', className)}
      {...props}
    />
  ),
}
