import { handleGitHubStars } from '../_shared/github-stars'

interface PagesContext {
  request: Request
  waitUntil(promise: Promise<unknown>): void
}

export function onRequestGet(context: PagesContext): Promise<Response> {
  return handleGitHubStars(context.request, {
    cache: (caches as CacheStorage & { default: Cache }).default,
    waitUntil: (promise) => context.waitUntil(promise),
  })
}
