import languageConfig from '@/i18n/languageConfig.json'
import type { Language } from '@/i18n/languageConfig'
import type { KeyAlgorithm } from '@/types/keys'

export const TOOL_ANALYTICS_EVENT = 'ssh-tool-event'

export type ToolEventName =
  | 'generation_success'
  | 'generation_error'
  | 'key_copy'
  | 'key_download'
  | 'command_copy'
  | 'article_code_copy'
  | 'guide_to_tool'
  | 'tool_mode_change'

export type ToolEventTarget =
  | 'public_key'
  | 'private_key'
  | 'fingerprint'
  | 'command'
  | 'article_code'
  | 'ssh_config'

export interface ToolEventParams {
  algorithm?: KeyAlgorithm
  language?: Language
  target?: ToolEventTarget
  mode?: 'generate' | 'commands' | 'config' | 'guides'
  origin?: 'home' | 'article' | 'result'
  error_code?: 'unsupported_browser' | 'generation_failed' | 'clipboard_failed'
}

export type ToolAnalyticsContext = Pick<ToolEventParams, 'algorithm' | 'origin'> & {
  target: ToolEventTarget
}

const eventNames: readonly ToolEventName[] = [
  'generation_success', 'generation_error', 'key_copy', 'key_download',
  'command_copy', 'article_code_copy', 'guide_to_tool', 'tool_mode_change',
]

const parameterValues: Readonly<Record<keyof ToolEventParams, readonly string[]>> = {
  algorithm: ['ed25519', 'rsa-2048', 'rsa-4096'],
  language: languageConfig.languages.map(({ code }) => code),
  target: ['public_key', 'private_key', 'fingerprint', 'command', 'article_code', 'ssh_config'],
  mode: ['generate', 'commands', 'config', 'guides'],
  origin: ['home', 'article', 'result'],
  error_code: ['unsupported_browser', 'generation_failed', 'clipboard_failed'],
}

/** Send only fixed categorical values. Never pass keys, commands, or user input. */
export function trackToolEvent(name: ToolEventName, params: ToolEventParams = {}): void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return

  try {
    const privacy = navigator as Navigator & { globalPrivacyControl?: boolean }
    const legacyWindow = window as Window & { doNotTrack?: string }
    if (
      privacy.globalPrivacyControl === true ||
      ['1', 'yes'].includes(navigator.doNotTrack ?? '') ||
      ['1', 'yes'].includes(legacyWindow.doNotTrack ?? '') ||
      !eventNames.includes(name)
    ) return

    const safeParams: Record<string, string> = {}
    if (params && typeof params === 'object') {
      for (const key of Object.keys(parameterValues) as (keyof ToolEventParams)[]) {
        if (!Object.prototype.hasOwnProperty.call(params, key)) continue
        const value = params[key]
        if (typeof value === 'string' && parameterValues[key].includes(value)) {
          safeParams[key] = value
        }
      }
    }

    // The head bootstrap validates again and queues gtag commands before loading GA.
    window.dispatchEvent(new CustomEvent(TOOL_ANALYTICS_EVENT, {
      detail: { name, params: safeParams },
    }))
  } catch {
    // Measurement must never interrupt key generation, copying, or downloading.
  }
}
