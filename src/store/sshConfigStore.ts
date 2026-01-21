import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { SSHHost } from '@/types/ssh-config'

interface SSHConfigState {
  hosts: SSHHost[]
  addHost: (host: Omit<SSHHost, 'id'>) => void
  updateHost: (id: string, host: Partial<SSHHost>) => void
  removeHost: (id: string) => void
  generateConfig: () => string
  loadFromStorage: () => void
}

const STORAGE_KEY = 'ssh-key-generator-ssh-config'

const getStoredHosts = (): SSHHost[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore localStorage errors
  }
  return []
}

const persistHosts = (hosts: SSHHost[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hosts))
  } catch {
    // Ignore localStorage errors
  }
}

export const useSSHConfigStore = create<SSHConfigState>((set, get) => ({
  hosts: getStoredHosts(),

  addHost: (host) => {
    const newHost: SSHHost = { ...host, id: nanoid() }
    set((state) => {
      const hosts = [...state.hosts, newHost]
      persistHosts(hosts)
      return { hosts }
    })
  },

  updateHost: (id, updates) => {
    set((state) => {
      const hosts = state.hosts.map((h) =>
        h.id === id ? { ...h, ...updates } : h
      )
      persistHosts(hosts)
      return { hosts }
    })
  },

  removeHost: (id) => {
    set((state) => {
      const hosts = state.hosts.filter((h) => h.id !== id)
      persistHosts(hosts)
      return { hosts }
    })
  },

  generateConfig: () => {
    const { hosts } = get()
    const lines: string[] = []

    for (const host of hosts) {
      lines.push(`Host ${host.name}`)
      lines.push(`    HostName ${host.hostname}`)

      if (host.user) {
        lines.push(`    User ${host.user}`)
      }

      if (host.port && host.port !== 22) {
        lines.push(`    Port ${host.port}`)
      }

      if (host.identityFile) {
        lines.push(`    IdentityFile ${host.identityFile}`)
      }

      if (host.forwardAgent) {
        lines.push(`    ForwardAgent yes`)
      }

      if (host.proxyJump) {
        lines.push(`    ProxyJump ${host.proxyJump}`)
      }

      if (host.extraOptions) {
        for (const [key, value] of Object.entries(host.extraOptions)) {
          lines.push(`    ${key} ${value}`)
        }
      }

      lines.push('')
    }

    return lines.join('\n')
  },

  loadFromStorage: () => {
    const hosts = getStoredHosts()
    set({ hosts })
  }
}))
