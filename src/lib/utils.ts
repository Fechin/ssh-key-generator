import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const mergeClasses = extendTailwindMerge({
  extend: {
    theme: {
      text: ['caption', 'support', 'ui', 'body', 'control', 'code', 'prose', 'lead', 'panel', 'subheading', 'section', 'page-title'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return mergeClasses(clsx(inputs))
}
