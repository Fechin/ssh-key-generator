export interface GitHubStarsPayload {
  stars: number
  /** UTC time when GitHub last confirmed this count, including a 304 revalidation. */
  updatedAt: string
  stale?: true
}

export interface GitHubStarsOptions {
  cache: Pick<Cache, 'match' | 'put'>
  fetcher?: typeof fetch
  now?: () => number
  waitUntil?: (promise: Promise<unknown>) => void
}

interface Snapshot {
  payload: GitHubStarsPayload
  etag?: string
  age: number
}

const REPOSITORY = 'https://api.github.com/repos/Fechin/ssh-key-generator'
const FRESH_MS = 10 * 60 * 1000
const RETAIN_MS = 24 * 60 * 60 * 1000
const UPSTREAM_TIMEOUT_MS = 3000
const MAX_JSON_BYTES = 64 * 1024
const INTERNAL_ETAG = 'X-GitHub-Stars-ETag'

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

function validEtag(value: string | null): string | undefined {
  return value && value.length <= 200 && /^(?:W\/)?"[\x21\x23-\x7e\x80-\xff]*"$/.test(value) ? value : undefined
}

/** Bound JSON reads even if an upstream omits or misstates Content-Length. */
async function readJson(response: Response): Promise<unknown> {
  if (Number(response.headers.get('Content-Length')) > MAX_JSON_BYTES) {
    await response.body?.cancel()
    throw new Error('Oversized JSON')
  }
  if (!response.body) throw new Error('Missing JSON')
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let text = ''
  let bytes = 0
  try {
    while (true) {
      const part = await reader.read()
      if (part.done) break
      bytes += part.value.byteLength
      if (bytes > MAX_JSON_BYTES) {
        await reader.cancel()
        throw new Error('Oversized JSON')
      }
      text += decoder.decode(part.value, { stream: true })
    }
    return JSON.parse(text + decoder.decode())
  } finally {
    reader.releaseLock()
  }
}

async function readSnapshot(cache: GitHubStarsOptions['cache'], key: Request, now: number): Promise<Snapshot | undefined> {
  try {
    const response = await cache.match(key)
    if (!response || response.status !== 200) return undefined
    const value = await readJson(response)
    if (!value || typeof value !== 'object') return undefined
    const data = value as Record<string, unknown>
    if (!isCount(data.stars) || typeof data.updatedAt !== 'string') return undefined
    const timestamp = Date.parse(data.updatedAt)
    if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString() !== data.updatedAt) return undefined
    const age = now - timestamp
    if (age < 0 || age >= RETAIN_MS) return undefined
    return {
      payload: { stars: data.stars, updatedAt: data.updatedAt },
      age,
      etag: validEtag(response.headers.get(INTERNAL_ETAG)),
    }
  } catch {
    // An evicted, malformed or unavailable cache must not break the endpoint.
    return undefined
  }
}

function jsonResponse(body: unknown, status = 200, cacheControl = 'no-store'): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControl,
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex',
    },
  })
}

function publicResponse(snapshot: Snapshot, stale = false): Response {
  // Never let an intermediary extend a fresh entry or the 24-hour stale ceiling.
  const remaining = Math.max(0, Math.floor(((stale ? RETAIN_MS : FRESH_MS) - snapshot.age) / 1000))
  const sharedTtl = Math.min(stale ? 60 : 600, remaining)
  const browserTtl = Math.min(60, sharedTtl)
  return jsonResponse(
    { ...snapshot.payload, ...(stale ? { stale: true } : {}) },
    200,
    `public, max-age=${browserTtl}, s-maxage=${sharedTtl}, must-revalidate`,
  )
}

async function saveSnapshot(
  options: GitHubStarsOptions,
  keys: [Request, Request],
  snapshot: Snapshot,
): Promise<void> {
  const writes = Promise.all(keys.map((key, index) => Promise.resolve().then(() => {
    const response = jsonResponse(snapshot.payload, 200, `public, max-age=${index === 0 ? 600 : 86400}`)
    if (snapshot.etag) response.headers.set(INTERNAL_ETAG, snapshot.etag)
    return options.cache.put(key, response)
  }))).then(() => undefined).catch(() => undefined)
  if (options.waitUntil) options.waitUntil(writes)
  else await writes
}

export async function handleGitHubStars(request: Request, options: GitHubStarsOptions): Promise<Response> {
  if (request.method !== 'GET') {
    const response = jsonResponse({ error: 'method_not_allowed' }, 405)
    response.headers.set('Allow', 'GET')
    return response
  }

  const now = options.now ?? Date.now
  // Deliberately exclude every visitor query/header from the fixed-repository keys.
  const origin = new URL(request.url).origin
  const keys: [Request, Request] = [
    new Request(`${origin}/__github-stars-cache/fresh`),
    new Request(`${origin}/__github-stars-cache/last-valid`),
  ]
  const started = now()
  const cached = await readSnapshot(options.cache, keys[0], started)
  if (cached && cached.age < FRESH_MS) return publicResponse(cached)
  const retained = await readSnapshot(options.cache, keys[1], started)
  const previous = retained && (!cached || retained.age < cached.age) ? retained : cached

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)
  try {
    const headers = new Headers({
      Accept: 'application/vnd.github+json',
      'User-Agent': 'sshkeygenerator.com-stars',
    })
    if (previous?.etag) headers.set('If-None-Match', previous.etag)
    const response = await (options.fetcher ?? fetch)(REPOSITORY, {
      method: 'GET', headers, signal: controller.signal, redirect: 'error',
    })
    let stars: number
    if (response.status === 304 && previous?.etag) {
      stars = previous.payload.stars
    } else {
      if (response.status !== 200) {
        await response.body?.cancel()
        throw new Error('Upstream unavailable')
      }
      const value = await readJson(response)
      if (!value || typeof value !== 'object' || !isCount((value as Record<string, unknown>).stargazers_count)) {
        throw new Error('Invalid upstream count')
      }
      stars = (value as { stargazers_count: number }).stargazers_count
    }
    const snapshot: Snapshot = {
      payload: { stars, updatedAt: new Date(now()).toISOString() },
      age: 0,
      etag: validEtag(response.headers.get('ETag')) ?? (response.status === 304 ? previous?.etag : undefined),
    }
    await saveSnapshot(options, keys, snapshot)
    return publicResponse(snapshot)
  } catch {
    if (previous) {
      const age = now() - Date.parse(previous.payload.updatedAt)
      if (age >= 0 && age < RETAIN_MS) return publicResponse({ ...previous, age }, true)
    }
    // No invented zero, upstream error body, account information or API headers.
    return jsonResponse({ error: 'unavailable' }, 503)
  } finally {
    clearTimeout(timer)
  }
}
