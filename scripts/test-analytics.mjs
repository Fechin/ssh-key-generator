import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'

const root = new URL('../', import.meta.url)
const require = createRequire(import.meta.url)
const config = JSON.parse(readFileSync(new URL('src/i18n/languageConfig.json', root), 'utf8'))
const analyticsSource = readFileSync(new URL('src/lib/analytics.ts', root), 'utf8')
const compiled = ts.transpileModule(analyticsSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText
const html = readFileSync(new URL('index.html', root), 'utf8')
const bootstrap = html.match(/<script id="analytics-bootstrap">([\s\S]*?)<\/script>/)?.[1]
assert.ok(bootstrap, 'Analytics bootstrap must be independently identifiable')

function loadAnalytics(globals = {}) {
  const module = { exports: {} }
  vm.runInNewContext(compiled, {
    module, exports: module.exports,
    require(name) {
      assert.equal(name, '@/i18n/languageConfig.json')
      return require(fileURLToPath(new URL('src/i18n/languageConfig.json', root)))
    },
    ...globals,
  })
  return module.exports
}

function target() {
  const listeners = new Map()
  return {
    addEventListener(name, callback) {
      if (!listeners.has(name)) listeners.set(name, new Set())
      listeners.get(name).add(callback)
    },
    removeEventListener(name, callback) { listeners.get(name)?.delete(callback) },
    dispatchEvent(event) {
      for (const callback of [...(listeners.get(event.type) ?? [])]) callback(event)
      return true
    },
  }
}

class CustomEvent {
  constructor(type, { detail } = {}) { this.type = type; this.detail = detail }
}

function browser({ hostname = 'sshkeygenerator.com', readyState = 'loading', idleSupport = true, privacy = {} } = {}) {
  let timerId = 0
  const timers = new Map()
  const idles = new Map()
  const scripts = []
  const navigator = { doNotTrack: null, ...privacy }
  const window = {
    ...target(), location: { hostname }, navigator,
    setTimeout(callback, delay) { const id = ++timerId; timers.set(id, { callback, delay }); return id },
    clearTimeout(id) { timers.delete(id) },
  }
  if (idleSupport) {
    window.requestIdleCallback = (callback, options) => { const id = ++timerId; idles.set(id, { callback, options }); return id }
    window.cancelIdleCallback = (id) => idles.delete(id)
  }
  const document = {
    ...target(), readyState,
    createElement(tag) { assert.equal(tag, 'script'); return {} },
    head: { appendChild(script) { scripts.push(script) } },
  }
  const globals = { window, document, navigator, CustomEvent }
  const runBootstrap = () => vm.runInNewContext(bootstrap, globals)
  const queue = () => Array.from(window.dataLayer ?? [], entry => Array.from(entry))
  return { ...globals, scripts, timers, idles, runBootstrap, queue }
}

const safe = value => JSON.parse(JSON.stringify(value))
const names = ['generation_success', 'generation_error', 'key_copy', 'key_download', 'command_copy', 'article_code_copy', 'guide_to_tool', 'tool_mode_change']

test('SSR imports and event calls need no browser globals', () => {
  const analytics = loadAnalytics()
  for (const name of names) assert.doesNotThrow(() => analytics.trackToolEvent(name, { language: 'en' }))
})

test('typed API strips unknown keys and free-text values before dispatch', () => {
  const b = browser()
  const captured = []
  const analytics = loadAnalytics(b)
  b.window.addEventListener(analytics.TOOL_ANALYTICS_EVENT, event => captured.push(event.detail))
  analytics.trackToolEvent('generation_success', {
    algorithm: 'ed25519', language: 'en', target: 'private_key', mode: 'generate', origin: 'result', error_code: 'generation_failed',
    private_key: 'SECRET-MATERIAL', passphrase: 'SECRET-MATERIAL', comment: 'SECRET-MATERIAL', filename: 'SECRET-MATERIAL',
    host: 'SECRET-MATERIAL', content: 'SECRET-MATERIAL', error: 'SECRET-MATERIAL', send_to: 'SECRET-MATERIAL',
  })
  assert.deepEqual(safe(captured), [{ name: 'generation_success', params: {
    algorithm: 'ed25519', language: 'en', target: 'private_key', mode: 'generate', origin: 'result', error_code: 'generation_failed',
  } }])
  analytics.trackToolEvent('key_copy', { algorithm: 'SECRET-MATERIAL', language: 'SECRET-MATERIAL', target: {}, mode: 42, origin: null, error_code: new Error('SECRET-MATERIAL') })
  assert.deepEqual(safe(captured[1]), { name: 'key_copy', params: {} })
  assert.ok(!JSON.stringify(captured).includes('SECRET-MATERIAL'))
})

test('unknown event names and inherited parameters cannot enter the event stream', () => {
  const b = browser()
  const captured = []
  const analytics = loadAnalytics(b)
  b.window.addEventListener(analytics.TOOL_ANALYTICS_EVENT, event => captured.push(event.detail))
  analytics.trackToolEvent('SECRET-MATERIAL', { language: 'en' })
  analytics.trackToolEvent('key_copy', Object.create({ target: 'private_key', origin: 'result' }))
  assert.deepEqual(safe(captured), [{ name: 'key_copy', params: {} }])
})

test('every closed event name is supported', () => {
  const b = browser()
  const captured = []
  const analytics = loadAnalytics(b)
  b.window.addEventListener(analytics.TOOL_ANALYTICS_EVENT, event => captured.push(event.detail.name))
  for (const name of names) analytics.trackToolEvent(name)
  assert.deepEqual(captured, names)
})

test('browser privacy signals opt out of both event dispatch and bootstrap', () => {
  for (const privacy of [{ doNotTrack: '1' }, { doNotTrack: 'yes' }, { globalPrivacyControl: true }]) {
    const b = browser({ privacy })
    b.runBootstrap()
    let events = 0
    b.window.addEventListener('ssh-tool-event', () => events++)
    loadAnalytics(b).trackToolEvent('key_copy', { target: 'private_key' })
    b.window.dispatchEvent(new CustomEvent('pointerdown'))
    assert.equal(events, 0)
    assert.equal(b.scripts.length, 0)
    assert.equal(b.timers.size, 0)
    assert.equal(b.window.dataLayer, undefined)
  }
})

test('measurement failures or hostile parameter getters never interrupt tools', () => {
  const b = browser()
  const analytics = loadAnalytics(b)
  b.window.dispatchEvent = () => { throw new Error('SECRET-MATERIAL') }
  assert.doesNotThrow(() => analytics.trackToolEvent('key_copy', { target: 'public_key' }))
  assert.doesNotThrow(() => analytics.trackToolEvent('key_copy', { get target() { throw new Error('SECRET-MATERIAL') } }))
})

test('idle loading has a two-second hard bound without an interaction', () => {
  const b = browser()
  b.runBootstrap()
  assert.equal(b.scripts.length, 0)
  const deadline = [...b.timers.values()].find(timer => timer.delay === 2000)
  assert.ok(deadline)
  deadline.callback()
  assert.equal(b.scripts.length, 1)
  assert.equal(b.scripts[0].async, true)
  assert.equal(b.scripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-WDT5Z7444Q')
  assert.deepEqual(b.queue().map(entry => entry[0]), ['js', 'config'])
})

test('DOM readiness schedules bounded idle work; fallback starts when DOM is ready', () => {
  const b = browser()
  b.runBootstrap()
  b.document.dispatchEvent(new CustomEvent('DOMContentLoaded'))
  const idle = [...b.idles.values()][0]
  assert.equal(idle.options.timeout, 1500)
  assert.equal(b.scripts.length, 0)
  idle.callback()
  assert.equal(b.scripts.length, 1)
  assert.equal(b.timers.size, 0)

  const fallback = browser({ idleSupport: false })
  fallback.runBootstrap()
  fallback.document.dispatchEvent(new CustomEvent('DOMContentLoaded'))
  assert.equal(fallback.scripts.length, 1)
})

test('first interaction starts analytics immediately and repeated triggers initialize once', () => {
  const b = browser()
  b.runBootstrap()
  b.window.dispatchEvent(new CustomEvent('pointerdown'))
  b.window.dispatchEvent(new CustomEvent('keydown'))
  b.document.dispatchEvent(new CustomEvent('DOMContentLoaded'))
  b.runBootstrap()
  assert.equal(b.scripts.length, 1)
  assert.equal(b.queue().filter(entry => entry[0] === 'config').length, 1)
  assert.equal(b.timers.size, 0)
  const settings = safe(b.queue().find(entry => entry[0] === 'config')[2])
  assert.deepEqual(settings, { anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false, transport_type: 'beacon' })
})

test('early business events queue after config even before GA script loads', () => {
  const b = browser()
  b.runBootstrap()
  const analytics = loadAnalytics(b)
  analytics.trackToolEvent('generation_success', { algorithm: 'rsa-4096', language: 'ja', origin: 'home' })
  assert.equal(b.scripts.length, 1)
  assert.deepEqual(b.queue().map(entry => entry[0]), ['js', 'config', 'event'])
  assert.deepEqual(safe(b.queue()[2]), ['event', 'generation_success', { algorithm: 'rsa-4096', language: 'ja', origin: 'home' }])
  analytics.trackToolEvent('key_download', { target: 'private_key', algorithm: 'rsa-4096', origin: 'result' })
  assert.equal(b.queue().filter(entry => entry[0] === 'config').length, 1)
  assert.equal(b.queue().filter(entry => entry[0] === 'event').length, 2)
})

test('bootstrap validates raw custom events again before sending anything to GA', () => {
  const b = browser()
  b.runBootstrap()
  b.window.dispatchEvent(new CustomEvent('ssh-tool-event', { detail: { name: 'SECRET-MATERIAL', params: { language: 'en' } } }))
  assert.equal(b.scripts.length, 0)
  b.window.dispatchEvent(new CustomEvent('ssh-tool-event', { detail: { name: 'command_copy', params: {
    target: 'command', language: 'en', origin: 'SECRET-MATERIAL', content: 'SECRET-MATERIAL', command: 'SECRET-MATERIAL',
  } } }))
  assert.deepEqual(safe(b.queue()[2]), ['event', 'command_copy', { language: 'en', target: 'command' }])
  assert.ok(!JSON.stringify(b.queue()).includes('SECRET-MATERIAL'))
})

test('all thirty configured locales survive both validation boundaries', () => {
  const b = browser()
  b.runBootstrap()
  const analytics = loadAnalytics(b)
  for (const language of config.languages) analytics.trackToolEvent('tool_mode_change', { language: language.code, mode: 'commands' })
  assert.deepEqual(b.queue().filter(entry => entry[0] === 'event').map(entry => entry[2].language), config.languages.map(language => language.code))
})

test('a changing getter cannot bypass the bootstrap whitelist after validation', () => {
  const b = browser()
  b.runBootstrap()
  let nameReads = 0
  let languageReads = 0
  b.window.dispatchEvent(new CustomEvent('ssh-tool-event', { detail: {
    get name() { return nameReads++ === 0 ? 'command_copy' : 'SECRET-MATERIAL' },
    params: { get language() { return languageReads++ < 2 ? 'en' : 'SECRET-MATERIAL' } },
  } }))
  assert.deepEqual(safe(b.queue()[2]), ['event', 'command_copy', { language: 'en' }])
  assert.equal(nameReads, 1)
  assert.equal(languageReads, 1)
  assert.ok(!JSON.stringify(b.queue()).includes('SECRET-MATERIAL'))
})

test('later privacy opt-out suppresses additional events', () => {
  const b = browser()
  b.runBootstrap()
  const analytics = loadAnalytics(b)
  analytics.trackToolEvent('key_copy', { target: 'public_key' })
  b.navigator.globalPrivacyControl = true
  analytics.trackToolEvent('key_copy', { target: 'private_key' })
  b.window.dispatchEvent(new CustomEvent('ssh-tool-event', { detail: { name: 'key_copy', params: { target: 'private_key' } } }))
  assert.equal(b.queue().filter(entry => entry[0] === 'event').length, 1)
})

test('preview and local pages do not load production analytics', () => {
  for (const hostname of ['localhost', '127.0.0.1', 'preview.ssh-key-generator.pages.dev']) {
    const b = browser({ hostname, readyState: 'complete' })
    b.runBootstrap()
    loadAnalytics(b).trackToolEvent('generation_success', { language: 'en' })
    b.window.dispatchEvent(new CustomEvent('pointerdown'))
    assert.equal(b.scripts.length, 0)
    assert.equal(b.window.dataLayer, undefined)
  }
})
