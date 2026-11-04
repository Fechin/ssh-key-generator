import { getLanguagePathname, type Language } from '@/i18n/languageConfig'

export type ToolMode = 'generate' | 'commands' | 'config' | 'guides'

const TOOL_MODES: ToolMode[] = ['generate', 'commands', 'config', 'guides']

export function parseToolMode(hash: string): ToolMode | null {
  const value = hash.replace(/^#/, '')
  return TOOL_MODES.find((mode) => mode === value) ?? null
}

// Fragments select a tool without creating another indexable page URL.
export function getToolHref(language: Language, mode: ToolMode): string {
  return `${getLanguagePathname(language)}#${mode}`
}
