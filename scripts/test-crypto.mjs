import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { randomBytes, webcrypto } from 'node:crypto'
import { chmod, mkdtemp, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('../', import.meta.url))
if (!globalThis.crypto) globalThis.crypto = webcrypto
let server
let directory
let generateKeyPair
let bcryptPbkdf
let deriveKeyAndIv
let sequence = 0
const fixturePassphrase = randomBytes(24).toString('hex')
const fixtureComment = 'disposable-regression-fixture'
const pairs = new Map()

before(async () => {
  const available = spawnSync('ssh-keygen', ['-?'], { stdio: 'ignore' })
  assert.ok(!available.error, 'OpenSSH ssh-keygen is required for interoperability tests')
  directory = await mkdtemp(path.join(tmpdir(), 'ssh-key-generator-test-'))
  await chmod(directory, 0o700)
  server = await createServer({ root, logLevel: 'error', server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  ;({ generateKeyPair } = await server.ssrLoadModule('/src/crypto/generators/index.ts'))
  ;({ bcryptPbkdf, deriveKeyAndIv } = await server.ssrLoadModule('/src/crypto/utils/encryption.ts'))
})

after(async () => {
  await server?.close()
  if (directory) await rm(directory, { recursive: true, force: true })
})

function ssh(args) {
  const result = spawnSync('ssh-keygen', args, {
    encoding: 'utf8', timeout: 30000,
    env: { ...process.env, LC_ALL: 'C', SSH_ASKPASS_REQUIRE: 'never' },
  })
  // Never throw spawn errors containing argv: passphrases are command arguments.
  assert.ok(!result.error, 'OpenSSH subprocess could not complete')
  return result
}

function keyIdentity(publicKey) {
  return publicKey.trim().split(/\s+/).slice(0, 2).join(' ')
}

async function privateFile(pair) {
  const file = path.join(directory, `key-${++sequence}`)
  await writeFile(file, pair.privateKey, { mode: 0o600 })
  assert.ok(((await stat(file)).mode & 0o777) === 0o600, 'Private fixture must be chmod600')
  return file
}

async function pairFor(algorithm, encrypted) {
  const id = `${algorithm}-${encrypted}`
  if (!pairs.has(id)) pairs.set(id, await generateKeyPair({
    algorithm, comment: fixtureComment, passphrase: encrypted ? fixturePassphrase : undefined,
  }))
  return pairs.get(id)
}

function checkOpenSsh(file, passphrase, pair) {
  const result = ssh(['-y', '-P', passphrase, '-f', file])
  assert.ok(result.status === 0, 'OpenSSH rejected a generated key with its correct passphrase')
  assert.ok(keyIdentity(result.stdout) === keyIdentity(pair.publicKey), 'OpenSSH derived a different public key')
}

function reader(buffer) {
  let position = 0
  return {
    uint32() {
      assert.ok(position + 4 <= buffer.length, 'Truncated SSH uint32')
      const value = buffer.readUInt32BE(position)
      position += 4
      return value
    },
    bytes() {
      const length = this.uint32()
      assert.ok(position + length <= buffer.length, 'Truncated SSH string')
      const bytes = buffer.subarray(position, position + length)
      position += length
      return bytes
    },
    remaining() { return buffer.subarray(position) },
  }
}

function envelope(privateKey) {
  assert.ok(privateKey.startsWith('-----BEGIN OPENSSH PRIVATE KEY-----\n'), 'Missing OpenSSH PEM header')
  assert.ok(privateKey.endsWith('-----END OPENSSH PRIVATE KEY-----\n'), 'Missing OpenSSH PEM footer or final newline')
  const buffer = Buffer.from(privateKey.trim().split('\n').slice(1, -1).join(''), 'base64')
  const magic = Buffer.from('openssh-key-v1\0')
  assert.ok(buffer.subarray(0, magic.length).equals(magic), 'Incorrect OpenSSH key magic')
  const fields = reader(buffer.subarray(magic.length))
  const result = { cipher: fields.bytes().toString(), kdf: fields.bytes().toString(), kdfOptions: fields.bytes() }
  assert.ok(fields.uint32() === 1, 'Expected exactly one key per OpenSSH file')
  result.publicBlob = fields.bytes()
  result.payload = fields.bytes()
  assert.ok(fields.remaining().length === 0, 'Unexpected bytes after OpenSSH envelope')
  return result
}

function checkFormat(pair, encrypted) {
  const parsed = envelope(pair.privateKey)
  assert.equal(parsed.cipher, encrypted ? 'aes256-ctr' : 'none')
  assert.equal(parsed.kdf, encrypted ? 'bcrypt' : 'none')
  assert.ok(parsed.publicBlob.equals(Buffer.from(pair.publicKey.split(/\s+/)[1], 'base64')), 'Envelope public key differs from exported public key')
  assert.ok(parsed.payload.length % (encrypted ? 16 : 8) === 0, 'Private section has incorrect block alignment')
  if (encrypted) {
    const options = reader(parsed.kdfOptions)
    assert.ok(options.bytes().length === 16, 'bcrypt salt must contain16bytes')
    assert.ok(options.uint32() === 16, 'Application bcrypt round count changed unexpectedly')
    assert.ok(options.remaining().length === 0, 'Unexpected bcrypt KDF options')
  } else {
    assert.ok(parsed.kdfOptions.length === 0, 'Unencrypted key has KDF parameters')
    const privateFields = reader(parsed.payload)
    assert.ok(privateFields.uint32() === privateFields.uint32(), 'Unencrypted checkints differ')
    const type = privateFields.bytes().toString()
    assert.equal(type, pair.algorithm === 'ed25519' ? 'ssh-ed25519' : 'ssh-rsa')
    const count = type === 'ssh-ed25519' ? 2 : 6
    for (let i = 0; i < count; i++) privateFields.bytes()
    privateFields.bytes() // Comment is deliberately never logged.
    const padding = privateFields.remaining()
    assert.ok(padding.length <= 8 && padding.every((byte, i) => byte === i + 1), 'Invalid unencrypted padding')
  }
}

// Public known-answer data from OpenBSD's own bcrypt_pbkdf regression suite:
// https://github.com/openbsd/src/blob/master/regress/lib/libutil/bcrypt_pbkdf/bcrypt_pbkdf_test.c
// Password inputs below are public test vectors; generated interoperability
// passphrases above are random and never logged.
/*
 * Copyright (c) 2013 Ted Unangst <tedu@openbsd.org>
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
const utf8 = text => new TextEncoder().encode(text)
const hex = text => Buffer.from(text, 'hex')
const basic32 = '5bbf0cc293587f1c3635555c27796598d47e579071bf427e9d8fbe842aba34d9'
const larger64 = [
  'e1367ec5151a33faac4cc1c144cd23fa',
  '15d5548493ecc99b9b5d9c0d3b27bec7',
  '6227ea66088b849b20ab7aa478010246',
  'e74bba51723fefa9f9474d6508845e8d',
].join('')
const binaryPassword = hex('0db3ac94b3ee53284f4a22893b3c24ae')
const binarySalt = hex('3a62f0f0dbcef823cfcc854856ea1028')
const longPassword = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do ' +
  'eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut ' +
  'enim ad minim veniam, quis nostrud exercitation ullamco laboris ' +
  'nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor ' +
  'in reprehenderit in voluptate velit esse cillum dolore eu fugiat ' +
  'nulla pariatur. Excepteur sint occaecat cupidatat non proident, ' +
  'sunt in culpa qui officia deserunt mollit anim id est laborum.'
const large256 = [
  '2054b9fff34e3721440334746828e9ed38de4b72e0a69adc170a13b5e8d64638',
  '5ea4034ae6d26600ee2332c5ed40ad557c86e3403fbb30e4e1dc1ae06b99a071',
  '368f518d2c426651c9e7e437fd6c915b1bbfc3a4cea71491490ea7afb7dd0290',
  'a678a4f441128db1792eab2776b21eb4238e0715add4127dff44e4b3e4cc4c4f',
  '9970083f3f74bd698873fdf648844f75c9bf7f9e0c4d9e5d89a7783997492966',
  '616707611cb901de31a19726b6e08c3a8001661f2d5c9dcc33b4aa072f90dd0b',
  '3f548d5eeba4211397e2fb062e526e1d68f46a4ce256185b4badc2685fbe78e1',
  'c7657b59f83ab9ab80cf9318d6add1f5933f12d6f36182c8e8115f68030a1244',
].join('')
const vectors = [
  [utf8('password'), utf8('salt'), 32, 4, basic32],
  [utf8('password'), Uint8Array.of(0), 16, 4, 'c12b566235eee04c212598970a579a67'],
  [Uint8Array.of(0), utf8('salt'), 16, 4, '6051be18c2f4f82cbf0efee5471b4bb9'],
  [utf8('password\0'), utf8('salt\0'), 32, 4, '7410e44cf4fa07bfaac8a928b1727fac001375e7bf7384370f48efd121743050'],
  [utf8('pass\0word').slice(0, 8), utf8('sa\0lt').slice(0, 4), 16, 4, 'c2bffd9db38f6569efef4372f4de83c0'],
  [utf8('pass\0word'), utf8('sa\0lt'), 16, 4, '4ba4ac3925c0e8d7f0cdb6bb1684a56f'],
  [utf8('password'), utf8('salt'), 64, 8, larger64],
  [utf8('password'), utf8('salt'), 16, 42, '833cf0dcf56db65608e8f0dc0ce882bd'],
  [utf8(longPassword), utf8('salis\0'), 16, 8, '10978b07253df57f71a162eb0e8ad30a'],
  [binaryPassword, binarySalt, 16, 8, '204438175eee7ce136c91b49a67923ff'],
  [binaryPassword, binarySalt, 256, 8, large256],
]
for (const [index, [password, salt, length, rounds, expected]] of vectors.entries()) {
  test(`OpenBSD bcrypt-PBKDF known-answer vector${index + 1}`, async () => {
    const actual = await bcryptPbkdf(password, salt, length, rounds)
    assert.ok(Buffer.from(actual).equals(hex(expected)), `OpenBSD known-answer vector${index + 1} does not match`)
  })
}

test('nonlinear bcrypt output remains correct around32/48/64-byte boundaries', async () => {
  for (const length of [1, 2, 15, 16, 31, 32]) {
    assert.ok(Buffer.from(await bcryptPbkdf(utf8('password'), utf8('salt'), length, 4)).equals(hex(basic32).subarray(0, length)), 'Single-stride output mismatch')
  }
  for (const length of [33, 47, 48, 49, 63, 64]) {
    assert.ok(Buffer.from(await bcryptPbkdf(utf8('password'), utf8('salt'), length, 8)).equals(hex(larger64).subarray(0, length)), 'Two-stride output mismatch')
  }
})

test('AES key and IV use the correct48-byte bcrypt output', async () => {
  const result = await deriveKeyAndIv('password', utf8('salt'), 8)
  assert.ok(result.key.length === 32 && result.iv.length === 16, 'Incorrect AES key or IV length')
  assert.ok(Buffer.concat([result.key, result.iv]).equals(hex(larger64).subarray(0, 48)), 'AES key and IV differ from OpenBSD known-answer material')
})

test('bcrypt rejects invalid numeric parameters, empty inputs and oversized salt', () => {
  const password = utf8('password')
  const salt = utf8('salt')
  const rangeError = { name: 'RangeError' }
  for (const rounds of [0, -1, 0.5, 1.5, NaN, Infinity, -Infinity, 0x100000000, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => bcryptPbkdf(password, salt, 48, rounds), rangeError)
  }
  for (const length of [0, -1, 0.5, 1.5, NaN, Infinity, -Infinity, 1025, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => bcryptPbkdf(password, salt, length, 1), rangeError)
  }
  assert.throws(() => bcryptPbkdf(new Uint8Array(0), salt, 48, 1), rangeError)
  assert.throws(() => bcryptPbkdf(password, new Uint8Array(0), 48, 1), rangeError)
  assert.throws(() => bcryptPbkdf(password, new Uint8Array((1 << 20) + 1), 48, 1), rangeError)
})

for (const algorithm of ['ed25519', 'rsa-2048', 'rsa-4096']) {
  test(`${algorithm}: unencrypted output is accepted and matches its public key`, async () => {
    const pair = await pairFor(algorithm, false)
    checkFormat(pair, false)
    checkOpenSsh(await privateFile(pair), '', pair)
  })
  test(`${algorithm}: encrypted output accepts correct input and rejects incorrect input`, async () => {
    const pair = await pairFor(algorithm, true)
    checkFormat(pair, true)
    const file = await privateFile(pair)
    checkOpenSsh(file, fixturePassphrase, pair)
    const wrong = ssh(['-y', '-P', randomBytes(24).toString('hex'), '-f', file])
    assert.ok(wrong.status !== 0, 'Incorrect passphrase unexpectedly decrypted a key')
  })
  test(`${algorithm}: native passphrase change, removal and re-encryption preserve identity`, async () => {
    const pair = await pairFor(algorithm, true)
    const file = await privateFile(pair)
    const changed = String.fromCodePoint(0x5bc6, 0x94a5, 0x1f511) + randomBytes(12).toString('hex')
    assert.ok(ssh(['-p', '-q', '-a', '4', '-P', fixturePassphrase, '-N', changed, '-f', file]).status === 0, 'OpenSSH could not change the generated key passphrase')
    checkOpenSsh(file, changed, pair)
    assert.ok(ssh(['-y', '-P', fixturePassphrase, '-f', file]).status !== 0, 'Previous passphrase still decrypts after a change')
    assert.ok(ssh(['-p', '-q', '-P', changed, '-N', '', '-f', file]).status === 0, 'OpenSSH could not remove the passphrase')
    checkOpenSsh(file, '', pair)
    assert.ok(ssh(['-p', '-q', '-a', '4', '-P', '', '-N', fixturePassphrase, '-f', file]).status === 0, 'OpenSSH could not re-encrypt the generated key')
    checkOpenSsh(file, fixturePassphrase, pair)
  })
}

const passphraseCases = [
  ['single-character', () => String.fromCharCode(97)],
  ['72-character', () => randomBytes(36).toString('hex')],
  ['73-character', () => randomBytes(36).toString('hex') + 'z'],
  ['256-character', () => randomBytes(128).toString('hex')],
  ['Unicode', () => String.fromCodePoint(0x5bc6, 0x94a5, 0x1f511, 0xe9) + randomBytes(8).toString('hex')],
  ['surrounding-whitespace', () => ' ' + randomBytes(8).toString('hex') + '  '],
]
for (const [label, makePassphrase] of passphraseCases) {
  test(`Ed25519 encrypted interoperability with ${label} input`, async () => {
    const passphrase = makePassphrase()
    const pair = await generateKeyPair({ algorithm: 'ed25519', comment: fixtureComment, passphrase })
    const file = await privateFile(pair)
    checkOpenSsh(file, passphrase, pair)
    // Mutate the suffix to catch implementations that truncate long input.
    const wrong = passphrase.slice(0, -1) + (passphrase.endsWith('x') ? 'y' : 'x')
    assert.ok(ssh(['-y', '-P', wrong, '-f', file]).status !== 0, 'A changed passphrase suffix unexpectedly decrypted a key')
  })
}

test('encrypted Ed25519 comment lengths and Unicode preserve OpenSSH block padding', async () => {
  for (const length of [0, 1, 7, 15, 16, 31, 32, 70, 127]) {
    const pair = await generateKeyPair({ algorithm: 'ed25519', comment: 'x'.repeat(length), passphrase: fixturePassphrase })
    checkFormat(pair, true)
    checkOpenSsh(await privateFile(pair), fixturePassphrase, pair)
  }
  const pair = await generateKeyPair({ algorithm: 'ed25519', comment: String.fromCodePoint(0x5bc6, 0x94a5, 0x1f511), passphrase: fixturePassphrase })
  checkOpenSsh(await privateFile(pair), fixturePassphrase, pair)
})

test('an explicitly empty passphrase remains standard unencrypted OpenSSH output', async () => {
  const pair = await generateKeyPair({ algorithm: 'ed25519', comment: fixtureComment, passphrase: '' })
  checkFormat(pair, false)
  checkOpenSsh(await privateFile(pair), '', pair)
})
