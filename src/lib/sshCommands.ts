import type { KeyAlgorithm } from '@/types/keys'

export type SSHCommandPlatform = 'linux' | 'macos' | 'windows'

export interface SSHCommandOptions {
  algorithm: KeyAlgorithm
  comment: string
  filename: string
}

export interface SSHCommandLabels {
  createDirectory: string
  generateKey: string
  startAgent: string
  addKey: string
  permissions: string
  publicKey: string
}

// eslint-disable-next-line no-control-regex -- These characters must never enter a copied shell command.
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/u

export function getSSHKeyFilename({ filename, algorithm }: SSHCommandOptions): string {
  return filename || (algorithm === 'ed25519' ? 'id_ed25519' : 'id_rsa')
}

export function validateSSHCommandOptions(
  options: SSHCommandOptions,
  platform: SSHCommandPlatform,
): 'filename' | 'comment' | null {
  const filename = getSSHKeyFilename(options)
  if (
    CONTROL_CHARACTERS.test(filename) ||
    /[/\\]/u.test(filename) ||
    filename === '.' || filename === '..' ||
    (platform === 'windows' && (
      /[<>:"|?*]/u.test(filename) || /[. ]$/u.test(filename) ||
      /^(?:con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/iu.test(filename)
    ))
  ) return 'filename'

  return CONTROL_CHARACTERS.test(options.comment) ? 'comment' : null
}

function quotePosix(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`
}

function quotePowerShell(value: string): string {
  // PowerShell recognizes curly apostrophes as quotes too.
  return `'${value.replace(/['‘’]/gu, (quote) => quote + quote)}'`
}

function quoteWindowsArgument(value: string): string {
  // Microsoft C argv rules: double backslashes before quotes and at the end.
  return `"${value.replace(/(\\*)"/gu, '$1$1\\"').replace(/(\\+)$/u, '$1$1')}"`
}

function getKeyPath(options: SSHCommandOptions, platform: SSHCommandPlatform, publicKey = false): string {
  const file = getSSHKeyFilename(options) + (publicKey ? '.pub' : '')
  return platform === 'windows'
    ? `(Join-Path $HOME ${quotePowerShell(`.ssh\\${file}`)})`
    : `"$HOME/.ssh/"${quotePosix(file)}`
}

export function generateSSHCommand(options: SSHCommandOptions, platform: SSHCommandPlatform): string {
  const invalid = validateSSHCommandOptions(options, platform)
  if (invalid) throw new Error(`Invalid SSH command ${invalid}`)

  const type = options.algorithm === 'ed25519' ? 'ed25519' : 'rsa'
  const bits = options.algorithm === 'rsa-4096' ? ' -b 4096' : options.algorithm === 'rsa-2048' ? ' -b 2048' : ''
  const flags = `-t ${type}${bits}`
  const path = getKeyPath(options, platform)

  if (platform === 'windows') {
    if (options.comment.includes('"') || options.comment === '') {
      // Windows PowerShell 5.1 loses embedded quotes when calling native tools
      // directly. Pass one escaped native argument string only for this case.
      const args = `${flags} -C ${quoteWindowsArgument(options.comment)} -f "`
      return `Start-Process -FilePath ssh-keygen -NoNewWindow -Wait -ArgumentList (${quotePowerShell(args)} + ${path} + '"')`
    }
    return `ssh-keygen ${flags} -C ${quotePowerShell(options.comment)} -f ${path}`
  }

  return `ssh-keygen ${flags} -C ${quotePosix(options.comment)} -f ${path}`
}

export function generateWindowsAgentCommands(): string {
  return 'Get-Service ssh-agent | Set-Service -StartupType Automatic\nStart-Service ssh-agent\nGet-Service ssh-agent'
}

export function generateSSHSetupCommands(
  options: SSHCommandOptions,
  platform: SSHCommandPlatform,
  labels: SSHCommandLabels,
): string {
  const command = generateSSHCommand(options, platform)
  const path = getKeyPath(options, platform)
  const publicPath = getKeyPath(options, platform, true)
  const lines = [`# ${labels.createDirectory}`]

  if (platform === 'windows') {
    lines.push('New-Item -ItemType Directory -Force -Path (Join-Path $HOME \'.ssh\') | Out-Null')
    lines.push('', `# ${labels.generateKey}`, command, '', `# ${labels.addKey}`, `ssh-add ${path}`)
    lines.push('', `# ${labels.publicKey}`, `Get-Content -LiteralPath ${publicPath} | Set-Clipboard`)
  } else {
    lines.push('mkdir -p "$HOME/.ssh" && chmod 700 "$HOME/.ssh"')
    lines.push('', `# ${labels.generateKey}`, command, '', `# ${labels.startAgent}`, 'eval "$(ssh-agent -s)"')
    lines.push(`ssh-add${platform === 'macos' ? ' --apple-use-keychain' : ''} ${path}`)
    lines.push('', `# ${labels.permissions}`, `chmod 600 ${path}`)
    lines.push('', `# ${labels.publicKey}`, platform === 'macos' ? `pbcopy < ${publicPath}` : `cat ${publicPath}`)
  }

  return lines.join('\n')
}
