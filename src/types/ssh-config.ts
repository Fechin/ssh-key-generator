export interface SSHHost {
  id: string
  name: string
  hostname: string
  user?: string
  port?: number
  identityFile?: string
  forwardAgent?: boolean
  proxyJump?: string
  extraOptions?: Record<string, string>
}

export interface SSHConfigStore {
  hosts: SSHHost[]
  addHost: (host: Omit<SSHHost, 'id'>) => void
  updateHost: (id: string, host: Partial<SSHHost>) => void
  removeHost: (id: string) => void
  generateConfig: () => string
}
