import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

const source = readFileSync(new URL('../functions/_shared/github-stars.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
const epoch = Date.parse('2026-11-04T06:00:00.000Z')
const minute = 60_000
const day = 24 * 60 * minute
const upstreamUrl = 'https://api.github.com/repos/Fechin/ssh-key-generator'

function loadHandler(overrides = {}) {
  const module = { exports: {} }
  vm.runInNewContext(compiled, {
    module, exports: module.exports, Request, Response, Headers, URL,
    AbortController, TextDecoder, setTimeout, clearTimeout, ...overrides,
  })
  return module.exports.handleGitHubStars
}

class MemoryCache {
  entries = new Map()
  writes = []
  constructor(now) { this.now = now }
  async match(request) {
    const entry = this.entries.get(request.url)
    if (!entry || entry.expiresAt <= this.now()) return undefined
    return entry.response.clone()
  }
  async put(request, response) {
    const seconds = Number(response.headers.get('Cache-Control')?.match(/max-age=(\d+)/)?.[1] ?? 0)
    this.writes.push({ url: request.url, headers: [...request.headers], ttl: seconds })
    this.entries.set(request.url, { response: response.clone(), expiresAt: this.now() + seconds * 1000 })
  }
}

function fixture() {
  const clock = { current: epoch }
  const now = () => clock.current
  return { clock, now, cache: new MemoryCache(now), handler: loadHandler() }
}
function request(query = '', headers = {}) {
  return new Request('https://sshkeygenerator.com/api/github-stars' + query, { headers })
}
function github(stars, headers = {}) {
  return new Response(JSON.stringify({ stargazers_count: stars, owner: { email: 'PRIVATE-UPSTREAM' }, token: 'PRIVATE-UPSTREAM' }), { headers })
}
async function prime(f, stars = 20, headers = {}) {
  return f.handler(request(), { cache: f.cache, now: f.now, fetcher: async () => github(stars, headers) })
}
async function data(response) { return response.json() }

test('returns only validated count and confirmation UTC; caches fresh10min and backup24h', async () => {
  const f = fixture()
  const response = await prime(f, 20, { ETag: '"revision-a"', 'Set-Cookie': 'PRIVATE-UPSTREAM', 'X-Ratelimit-Remaining': '59' })
  assert.equal(response.status, 200)
  assert.deepEqual(await data(response), { stars: 20, updatedAt: new Date(epoch).toISOString() })
  assert.match(response.headers.get('Content-Type'), /^application\/json/)
  assert.match(response.headers.get('Cache-Control'), /max-age=60, s-maxage=600/)
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff')
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex')
  for (const name of ['ETag', 'Set-Cookie', 'X-Ratelimit-Remaining', 'X-GitHub-Stars-ETag']) assert.equal(response.headers.get(name), null)
  assert.deepEqual(f.cache.writes.map(write => write.ttl), [600, 86400])
  for (const write of f.cache.writes) assert.deepEqual(write.headers, [])
})

test('fresh cache avoids upstream calls, and refreshes at the10minute boundary', async () => {
  const f = fixture()
  await prime(f)
  let calls = 0
  const fetcher = async () => { calls++; return github(21) }
  f.clock.current += 10 * minute - 1000
  const cached = await f.handler(request(), { ...f, fetcher })
  assert.equal((await data(cached)).stars, 20)
  assert.equal(calls, 0)
  assert.match(cached.headers.get('Cache-Control'), /max-age=1, s-maxage=1/)
  f.clock.current += 1000
  const refreshed = await f.handler(request(), { ...f, fetcher })
  assert.deepEqual(await data(refreshed), { stars: 21, updatedAt: new Date(f.clock.current).toISOString() })
  assert.equal(calls, 1)
})

test('a real upstream zero is valid; it is never invented on failure', async () => {
  const f = fixture()
  assert.equal((await data(await prime(f, 0))).stars, 0)
  const empty = fixture()
  const failed = await empty.handler(request(), { ...empty, fetcher: async () => { throw new Error('PRIVATE-UPSTREAM') } })
  assert.equal(failed.status, 503)
  assert.deepEqual(await data(failed), { error: 'unavailable' })
  assert.equal(empty.cache.writes.length, 0)
})

test('all query parameters are ignored and visitor cookies/auth/conditional headers are not forwarded', async () => {
  const f = fixture()
  let calls = 0
  const response = await f.handler(request('?repo=other/private&user=someone&token=VISITOR-SECRET', {
    Cookie: 'session=VISITOR-SECRET', Authorization: 'Bearer VISITOR-SECRET', 'If-None-Match': 'VISITOR-SECRET',
  }), { ...f, fetcher: async (url, init) => {
    calls++
    assert.equal(url, upstreamUrl)
    assert.equal(init.method, 'GET')
    assert.equal(init.redirect, 'manual')
    assert.equal(init.headers.get('Accept'), 'application/vnd.github+json')
    assert.equal(init.headers.get('User-Agent'), 'sshkeygenerator.com-stars')
    for (const name of ['Cookie', 'Authorization', 'If-None-Match']) assert.equal(init.headers.get(name), null)
    return github(20)
  } })
  assert.ok(!(await response.text()).includes('SECRET'))
  const second = await f.handler(request('?repo=yet/another'), { ...f, fetcher: async () => { throw new Error('must not fetch') } })
  assert.equal((await data(second)).stars, 20)
  assert.equal(calls, 1)
  for (const write of f.cache.writes) assert.ok(!write.url.includes('?'))
})

test('Workers-compatible fetch can retrieve the fixed upstream without unsupported redirect modes', async () => {
  const f = fixture()
  const calls = []
  const response = await f.handler(request(), { ...f, fetcher: async (url, init) => {
    calls.push({ url, redirect: init.redirect })
    // Workers rejects error before sending a request; Node fetch accepts it.
    if (!['manual', 'follow'].includes(init.redirect)) throw new TypeError('Unsupported redirect mode')
    return github(20)
  } })
  // Assert outside fetcher: the handler deliberately sanitizes thrown errors.
  assert.equal(response.status, 200)
  assert.deepEqual(await data(response), { stars: 20, updatedAt: new Date(epoch).toISOString() })
  assert.deepEqual(calls, [{ url: upstreamUrl, redirect: 'manual' }])
})

test('upstream redirects are returned manually, rejected and never cached or followed', async () => {
  for (const status of [301, 302, 303, 307, 308]) {
    const f = fixture()
    const calls = []
    const response = await f.handler(request(), { ...f, fetcher: async (url, init) => {
      calls.push({ url, redirect: init.redirect })
      return new Response(JSON.stringify({ stargazers_count: 999 }), {
        status, headers: { Location: 'https://redirect.invalid/other-repository', ETag: '"redirect"' },
      })
    } })
    assert.deepEqual(calls, [{ url: upstreamUrl, redirect: 'manual' }])
    assert.equal(response.status, 503)
    assert.deepEqual(await data(response), { error: 'unavailable' })
    assert.equal(response.headers.get('Location'), null)
    assert.equal(response.headers.get('Cache-Control'), 'no-store')
    assert.equal(f.cache.writes.length, 0)
    assert.equal(f.cache.entries.size, 0)
  }
})

test('nonGET requests return405 without reading cache or upstream', async () => {
  const f = fixture()
  const response = await f.handler(new Request('https://sshkeygenerator.com/api/github-stars', { method: 'POST', body: 'PRIVATE-INPUT' }), {
    ...f, fetcher: async () => { throw new Error('must not fetch') },
  })
  assert.equal(response.status, 405)
  assert.equal(response.headers.get('Allow'), 'GET')
  assert.equal(response.headers.get('Cache-Control'), 'no-store')
  assert.equal(f.cache.writes.length, 0)
})

test('upstream error statuses return small503 JSON and never poison either cache', async () => {
  for (const status of [301, 403, 404, 429, 500, 503]) {
    const f = fixture()
    const response = await f.handler(request(), { ...f, fetcher: async () => new Response('PRIVATE-UPSTREAM', {
      status, headers: { 'Set-Cookie': 'PRIVATE-UPSTREAM', 'X-Ratelimit-Reset': 'PRIVATE-UPSTREAM' },
    }) })
    assert.equal(response.status, 503)
    assert.deepEqual(await data(response), { error: 'unavailable' })
    assert.equal(response.headers.get('Cache-Control'), 'no-store')
    assert.equal(response.headers.get('Set-Cookie'), null)
    assert.equal(response.headers.get('X-Ratelimit-Reset'), null)
    assert.equal(f.cache.writes.length, 0)
  }
})

test('malformed JSON and invalid numeric counts cannot be cached', async () => {
  const invalidBodies = ['not-json', '{}', 'null', '[]', '{"stargazers_count":1e309}',
    ...[-1, 2.5, '20', null, true, {}, [], Number.MAX_SAFE_INTEGER + 1].map(stargazers_count => JSON.stringify({ stargazers_count }))]
  for (const body of invalidBodies) {
    const f = fixture()
    const response = await f.handler(request(), { ...f, fetcher: async () => new Response(body) })
    assert.equal(response.status, 503)
    assert.deepEqual(await data(response), { error: 'unavailable' })
    assert.equal(f.cache.writes.length, 0)
  }
})

test('JSON body bounds reject declared and streamed oversized responses', async () => {
  for (const headers of [{ 'Content-Length': '9999999' }, {}]) {
    const f = fixture()
    const response = await f.handler(request(), { ...f, fetcher: async () => new Response('x'.repeat(65537), { headers }) })
    assert.equal(response.status, 503)
    assert.equal(f.cache.writes.length, 0)
  }
})

test('upstream failures preserve last verified value/timestamp, without refreshing its24h retention', async () => {
  const f = fixture()
  await prime(f)
  f.clock.current += 10 * minute
  const writes = f.cache.writes.length
  const response = await f.handler(request(), { ...f, fetcher: async () => new Response('PRIVATE-UPSTREAM', { status: 429 }) })
  assert.equal(response.status, 200)
  assert.deepEqual(await data(response), { stars: 20, updatedAt: new Date(epoch).toISOString(), stale: true })
  assert.match(response.headers.get('Cache-Control'), /max-age=60, s-maxage=60/)
  assert.equal(f.cache.writes.length, writes)
})

test('stale fallback cache TTL cannot extend the last valid value beyond24h', async () => {
  const f = fixture()
  await prime(f)
  f.clock.current = epoch + day - 30_000
  const stale = await f.handler(request(), { ...f, fetcher: async () => { throw new Error('offline') } })
  assert.equal((await data(stale)).stale, true)
  assert.match(stale.headers.get('Cache-Control'), /max-age=30, s-maxage=30/)
  f.clock.current += 30_000
  const expired = await f.handler(request(), { ...f, fetcher: async () => { throw new Error('offline') } })
  assert.equal(expired.status, 503)
  assert.deepEqual(await data(expired), { error: 'unavailable' })
})

test('invalid upstream JSON/counts cannot replace an existing last-known value', async () => {
  const f = fixture()
  await prime(f)
  f.clock.current += 10 * minute
  const response = await f.handler(request(), { ...f, fetcher: async () => github('not-a-count') })
  assert.deepEqual(await data(response), { stars: 20, updatedAt: new Date(epoch).toISOString(), stale: true })
  assert.equal(f.cache.writes.length, 2)
})

test('conditional upstream304 confirms a retained count and renews its verification time', async () => {
  for (const etag of ['"revision-a"', 'W/"revision-a"']) {
    const f = fixture()
    await prime(f, 20, { ETag: etag })
    f.clock.current += 10 * minute
    const response = await f.handler(request(), { ...f, fetcher: async (url, init) => {
      assert.equal(url, upstreamUrl)
      assert.equal(init.headers.get('If-None-Match'), etag)
      return new Response(null, { status: 304 })
    } })
    assert.deepEqual(await data(response), { stars: 20, updatedAt: new Date(f.clock.current).toISOString() })
    assert.equal(response.headers.get('ETag'), null)
    assert.equal(f.cache.writes.length, 4)
  }
})

test('a304 without a validated retained count cannot manufacture a successful response', async () => {
  const f = fixture()
  const response = await f.handler(request(), { ...f, fetcher: async () => new Response(null, { status: 304 }) })
  assert.equal(response.status, 503)
  assert.equal(f.cache.writes.length, 0)
})

test('a200 response with absent or malformed ETag must clear the previous validator', async () => {
  for (const headers of [{}, { ETag: 'unquoted' }, { ETag: '"bad"quote"' }, { ETag: '"' + 'x'.repeat(199) + '"' }]) {
    const f = fixture()
    await prime(f, 20, { ETag: '"revision-a"' })
    f.clock.current += 10 * minute
    await f.handler(request(), { ...f, fetcher: async () => github(21, headers) })
    f.clock.current += 10 * minute
    const response = await f.handler(request(), { ...f, fetcher: async (url, init) => {
      assert.equal(init.headers.get('If-None-Match'), null)
      return github(22)
    } })
    assert.equal((await data(response)).stars, 22)
  }
})

test('only a304 may retain a previous valid validator when its new ETag is malformed', async () => {
  const f = fixture()
  await prime(f, 20, { ETag: '"revision-a"' })
  f.clock.current += 10 * minute
  const revalidated = await f.handler(request(), { ...f, fetcher: async () => new Response(null, { status: 304, headers: { ETag: 'malformed' } }) })
  assert.equal((await data(revalidated)).stars, 20)
  f.clock.current += 10 * minute
  await f.handler(request(), { ...f, fetcher: async (url, init) => {
    assert.equal(init.headers.get('If-None-Match'), '"revision-a"')
    return github(21)
  } })
})

test('corrupted cache records and invalid/future timestamps are ignored', async () => {
  for (const cached of [
    { stars: -1, updatedAt: new Date(epoch).toISOString() },
    { stars: 20, updatedAt: 'invalid' },
    { stars: 20, updatedAt: new Date(epoch + 60_000).toISOString() },
    { stars: 20, updatedAt: new Date(epoch - day).toISOString() },
  ]) {
    const f = fixture()
    await f.cache.put(new Request('https://sshkeygenerator.com/__github-stars-cache/fresh'), new Response(JSON.stringify(cached), { headers: { 'Cache-Control': 'max-age=86400' } }))
    const response = await f.handler(request(), { ...f, fetcher: async () => github(21) })
    assert.deepEqual(await data(response), { stars: 21, updatedAt: new Date(epoch).toISOString() })
  }
})

test('cache outages must not discard a valid upstream response', async () => {
  const f = fixture()
  const broken = { match: async () => { throw new Error('PRIVATE-CACHE') }, put: async () => { throw new Error('PRIVATE-CACHE') } }
  const response = await f.handler(request(), { ...f, cache: broken, fetcher: async () => github(20) })
  assert.equal(response.status, 200)
  assert.deepEqual(await data(response), { stars: 20, updatedAt: new Date(epoch).toISOString() })
})

test('waitUntil schedules safe cache writes without delaying the public response', async () => {
  const f = fixture()
  const jobs = []
  let release
  const gate = new Promise(resolve => { release = resolve })
  const delayed = { match: request => f.cache.match(request), put: async (request, response) => { await gate; await f.cache.put(request, response) } }
  const response = await f.handler(request(), { ...f, cache: delayed, waitUntil: job => jobs.push(job), fetcher: async () => github(20) })
  assert.equal(response.status, 200)
  assert.equal(f.cache.writes.length, 0)
  assert.equal(jobs.length, 1)
  release()
  await Promise.all(jobs)
  assert.equal(f.cache.writes.length, 2)
})

test('three-second upstream timeout aborts the request and returns503 or retained stale data', async () => {
  for (const retained of [false, true]) {
    const f = fixture()
    if (retained) { await prime(f); f.clock.current += 10 * minute }
    let expire
    let resolveStarted
    const started = new Promise(resolve => { resolveStarted = resolve })
    const handler = loadHandler({
      setTimeout(callback, delay) { assert.equal(delay, 3000); expire = callback; return 1 },
      clearTimeout() {},
    })
    const pending = handler(request(), { ...f, fetcher: async (url, init) => {
      resolveStarted()
      return new Promise((resolve, reject) => init.signal.addEventListener('abort', () => reject(new Error('PRIVATE-TIMEOUT'))))
    } })
    await started
    expire()
    const response = await pending
    assert.equal(response.status, retained ? 200 : 503)
    assert.deepEqual(await data(response), retained
      ? { stars: 20, updatedAt: new Date(epoch).toISOString(), stale: true }
      : { error: 'unavailable' })
  }
})

test('Pages adapter uses caches.default and preserves the context waitUntil receiver', async () => {
  const adapter = ts.transpileModule(readFileSync(new URL('../functions/api/github-stars.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const f = fixture()
  const module = { exports: {} }
  let handled = false
  const context = { request: request(), waitUntil(job) { assert.equal(this, context); assert.equal(job, 'sentinel') } }
  vm.runInNewContext(adapter, {
    module, exports: module.exports, caches: { default: f.cache },
    require(name) {
      assert.equal(name, '../_shared/github-stars')
      return { handleGitHubStars(incoming, options) {
        handled = true
        assert.equal(incoming, context.request)
        assert.equal(options.cache, f.cache)
        options.waitUntil('sentinel')
        return Promise.resolve(new Response('{}'))
      } }
    },
  })
  await module.exports.onRequestGet(context)
  assert.equal(handled, true)
})
