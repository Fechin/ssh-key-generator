import { useSyncExternalStore } from 'react'

interface GitHubStarsSnapshot {
  stars?: number
  updatedAt?: string
  stale: boolean
  loading: boolean
}

const REFRESH_INTERVAL = 10 * 60 * 1000
const initialSnapshot: GitHubStarsSnapshot = { stale: false, loading: false }
let snapshot = initialSnapshot
let lastAttempt = -Infinity
let pending: Promise<void> | undefined
const listeners = new Set<() => void>()

function publish(next: GitHubStarsSnapshot) {
  snapshot = next
  listeners.forEach((listener) => listener())
}

/** Shared across labels: one same-origin request, with the last valid count kept on failure. */
export function refreshGitHubStars(force = false): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (pending) return pending
  if (!force && Date.now() - lastAttempt < REFRESH_INTERVAL) return Promise.resolve()
  lastAttempt = Date.now()
  publish({ ...snapshot, loading: true })

  pending = (async () => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 8000)
    try {
      const response = await fetch('/api/github-stars', {
        signal: controller.signal,
        credentials: 'omit',
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) throw new Error('Repository data unavailable')
      const data: unknown = await response.json()
      if (typeof data !== 'object' || data === null) throw new Error('Invalid repository data')
      const { stars, updatedAt, stale } = data as Record<string, unknown>
      if (typeof stars !== 'number' || !Number.isSafeInteger(stars) || stars < 0
        || typeof updatedAt !== 'string' || !Number.isFinite(Date.parse(updatedAt))
        || (stale !== undefined && typeof stale !== 'boolean')) {
        throw new Error('Invalid repository data')
      }
      publish({ stars, updatedAt, stale: stale === true, loading: false })
    } catch {
      // A missing count stays absent; an existing valid count survives a transient failure.
      publish({ ...snapshot, stale: snapshot.stars !== undefined, loading: false })
    } finally {
      window.clearTimeout(timeout)
      pending = undefined
    }
  })()
  return pending
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const refreshWhenVisible = () => {
    if (document.visibilityState === 'visible') void refreshGitHubStars()
  }
  const interval = window.setInterval(refreshWhenVisible, REFRESH_INTERVAL)
  window.addEventListener('focus', refreshWhenVisible)
  document.addEventListener('visibilitychange', refreshWhenVisible)
  queueMicrotask(() => { void refreshGitHubStars() })
  return () => {
    listeners.delete(listener)
    window.clearInterval(interval)
    window.removeEventListener('focus', refreshWhenVisible)
    document.removeEventListener('visibilitychange', refreshWhenVisible)
  }
}

export function useGitHubStars(): GitHubStarsSnapshot {
  return useSyncExternalStore(subscribe, () => snapshot, () => initialSnapshot)
}
