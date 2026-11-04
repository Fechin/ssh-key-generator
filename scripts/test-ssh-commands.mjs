import assert from 'node:assert/strict'
import { readFile, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir, homedir } from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import ts from 'typescript'

const source = await readFile(new URL('../src/lib/sshCommands.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText
const { generateSSHCommand, generateSSHSetupCommands, generateWindowsAgentCommands, validateSSHCommandOptions } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
const labels = { createDirectory: 'Directory', generateKey: 'Generate', startAgent: 'Agent', addKey: 'Add', permissions: 'Permissions', publicKey: 'Public key' }
const defaults = { algorithm: 'ed25519', comment: 'user@example.com', filename: '' }
let checks = 0

function check(condition, message) { assert.ok(condition, message); checks++ }
function equal(actual, expected, message) { assert.deepEqual(actual, expected, message); checks++ }

// Run the actual POSIX shell parser. The mock only records arguments; it never
// invokes a key generator or writes to the user's .ssh directory.
function posixArgs(options, platform = 'linux') {
  const command = generateSSHCommand(options, platform)
  const result = spawnSync('/bin/zsh', ['-f', '-c', 'function ssh-keygen() { printf "%s\\0" "$@"; }\n' + command], { encoding: 'utf8' })
  equal(result.status, 0, result.stderr)
  return result.stdout.split('\0').slice(0, -1)
}
for (const comment of ['alice@example.com', "Alice's work laptop", 'QA "quoted" label', '$(printf INJECTED); `printf BAD` $HOME', '', 'ends with backslash\\']) {
  for (const filename of ['work key', "alice's key", 'file $(printf INJECTED)']) {
    const options = { ...defaults, comment, filename }
    for (const platform of ['linux', 'macos']) {
      equal(posixArgs(options, platform), ['-t', 'ed25519', '-C', comment, '-f', path.join(homedir(), '.ssh', filename)])
    }
  }
}
for (const [algorithm, bits] of [['rsa-2048', '2048'], ['rsa-4096', '4096']]) {
  equal(posixArgs({ ...defaults, algorithm }), ['-t', 'rsa', '-b', bits, '-C', defaults.comment, '-f', path.join(homedir(), '.ssh/id_rsa')])
}
for (const filename of ['../escape', 'folder/key', 'folder\\key', '.', '..', 'key\nnext', 'key\0name']) {
  for (const platform of ['linux', 'macos', 'windows']) {
    equal(validateSSHCommandOptions({ ...defaults, filename }, platform), 'filename')
    assert.throws(() => generateSSHCommand({ ...defaults, filename }, platform)); checks++
  }
}
for (const filename of ['bad"name', 'bad:name', 'bad*name', 'key.', 'key ', 'CON', 'nul.pub', 'COM1', 'LPT²']) {
  equal(validateSSHCommandOptions({ ...defaults, filename }, 'windows'), 'filename')
}
for (const comment of ['line\nnext', 'line\rnext', 'label\0rest', 'line\u2028next']) {
  equal(validateSSHCommandOptions({ ...defaults, comment }, 'windows'), 'comment')
}
const windowsDefault = generateSSHCommand(defaults, 'windows')
check(windowsDefault.startsWith('ssh-keygen -t ed25519 -C '), 'Default PowerShell command remains recognizable')
check(windowsDefault.includes('(Join-Path $HOME '), 'PowerShell path expression')
check(!windowsDefault.includes('%USERPROFILE%'), 'No CMD expansion')
const windowsApostrophe = generateSSHCommand({ ...defaults, filename: "Alice's key", comment: "Alice's work laptop" }, 'windows')
check(windowsApostrophe.includes("'Alice''s work laptop'"), 'PowerShell apostrophe escaping')
check(windowsApostrophe.includes("'.ssh\\Alice''s key'"), 'PowerShell quoted file name')

// Parse Microsoft C argv quoting rules independently of the generator, and
// validate the parser with published Microsoft command-line examples.
function windowsArgv(commandLine) {
  const argv = []
  let i = 0
  while (i < commandLine.length) {
    while (/\s/.test(commandLine[i] ?? '') && i < commandLine.length) i++
    if (i >= commandLine.length) break
    let arg = '', quoted = false
    while (i < commandLine.length && (quoted || !/\s/.test(commandLine[i]))) {
      let slashes = 0
      while (commandLine[i] === '\\') { slashes++; i++ }
      if (commandLine[i] === '"') {
        arg += '\\'.repeat(Math.floor(slashes / 2))
        if (slashes % 2) arg += '"'
        else quoted = !quoted
        i++
      } else {
        arg += '\\'.repeat(slashes)
        if (i < commandLine.length) arg += commandLine[i++]
      }
    }
    argv.push(arg)
  }
  return argv
}
equal(windowsArgv('"a b c" d e'), ['a b c', 'd', 'e'])
equal(windowsArgv(String.raw`"ab\"c" "\\" d`), ['ab"c', '\\', 'd'])
function psLiteral(value) { return value.slice(1, -1).replace(/(''|‘‘|’’)/gu, (pair) => pair[0]) }
for (const comment of ['', 'QA "quotes" label', 'a\\"b and tail\\', '"$(printf BAD)"; `printf BAD`', 'O\'Brien “smart” "quote"']) {
  const command = generateSSHCommand({ ...defaults, comment, filename: "Alice's work key" }, 'windows')
  check(command.startsWith('Start-Process -FilePath ssh-keygen -NoNewWindow -Wait '), 'Quoted/empty comments survive Windows PowerShell legacy argument passing')
  const match = command.match(/-ArgumentList \(('(?:[^']|'')*') \+ \(Join-Path \$HOME ('(?:[^']|'')*')\) \+ '"'\)$/u)
  check(match, 'Only literal PowerShell arguments and the home path are emitted')
  const keyPath = 'C:\\Users\\Alice Example\\' + psLiteral(match[2])
  equal(windowsArgv(psLiteral(match[1]) + keyPath + '"'), ['-t', 'ed25519', '-C', comment, '-f', keyPath])
}
const setup = generateSSHSetupCommands(defaults, 'windows', labels)
check(!setup.includes('%USERPROFILE%') && !setup.includes('2>nul') && !setup.includes(' | clip'), 'Windows setup contains no CMD commands')
check(!setup.includes('Set-Service') && !setup.includes('Start-Service'), 'Administrator service setup is separate from user commands')
check(setup.includes('Get-Content -LiteralPath') && setup.includes('Set-Clipboard'), 'Windows uses literal file paths and PowerShell clipboard')
check(generateWindowsAgentCommands().includes('Set-Service -StartupType Automatic'), 'Separate agent prerequisite is available')
for (const platform of ['linux', 'macos', 'windows']) {
  const script = generateSSHSetupCommands({ ...defaults, filename: 'work key' }, platform, labels)
  check(script.includes(generateSSHCommand({ ...defaults, filename: 'work key' }, platform)), 'Full setup uses the same validated command')
}

// Confirm the captured arguments also work with real OpenSSH. Only redirect
// the test output file to an isolated temporary directory and use a test-only
// empty passphrase to avoid interactive input. No generated key is printed.
const directory = await mkdtemp(path.join(tmpdir(), 'ssh-command-test-'))
try {
  const comment = 'QA "quotes" and apostrophe\'s test'
  const args = posixArgs({ ...defaults, comment, filename: 'not-written-to-home' })
  args[args.indexOf('-f') + 1] = path.join(directory, 'test key')
  const result = spawnSync('ssh-keygen', [...args, '-N', '', '-q'], { encoding: 'utf8' })
  equal(result.status, 0, result.stderr)
  const pub = await readFile(path.join(directory, 'test key.pub'), 'utf8')
  check(pub.trimEnd().endsWith(' ' + comment), 'OpenSSH preserves the exact quoted comment')
} finally {
  await rm(directory, { recursive: true, force: true })
}
console.log(`SSH command checks passed: ${checks}. Real zsh and OpenSSH verified; native Windows execution requires a Windows environment.`)
