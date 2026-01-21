import { useState } from 'react'
import { Settings, Plus, Trash2, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/common/CopyButton'
import { DownloadButton } from '@/components/common/DownloadButton'
import { useSSHConfigStore } from '@/store/sshConfigStore'
import { useTranslation } from '@/i18n'

interface HostFormData {
  name: string
  hostname: string
  user: string
  port: string
  identityFile: string
  forwardAgent: boolean
  proxyJump: string
}

const defaultFormData: HostFormData = {
  name: '',
  hostname: '',
  user: '',
  port: '',
  identityFile: '',
  forwardAgent: false,
  proxyJump: '',
}

export function SSHConfigBuilder() {
  const { hosts, addHost, removeHost, generateConfig } = useSSHConfigStore()
  const [formData, setFormData] = useState<HostFormData>(defaultFormData)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { t } = useTranslation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.hostname) return

    addHost({
      name: formData.name,
      hostname: formData.hostname,
      user: formData.user || undefined,
      port: formData.port ? parseInt(formData.port, 10) : undefined,
      identityFile: formData.identityFile || undefined,
      forwardAgent: formData.forwardAgent || undefined,
      proxyJump: formData.proxyJump || undefined,
    })

    setFormData(defaultFormData)
  }

  const handleChange = (field: keyof HostFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const config = generateConfig()

  return (
    <div className="space-y-6">
      {/* Add Host Form Section */}
      <div>
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Settings className="h-4 w-4" />
            {t('sshConfig.title')}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {t('sshConfig.description')}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="host-name" className="text-sm">{t('sshConfig.hostAliasRequired')}</Label>
              <Input
                id="host-name"
                placeholder="myserver"
                value={formData.name}
                onChange={handleChange('name')}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hostname" className="text-sm">{t('sshConfig.hostnameRequired')}</Label>
              <Input
                id="hostname"
                placeholder={t('sshConfig.hostnamePlaceholder')}
                value={formData.hostname}
                onChange={handleChange('hostname')}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="user" className="text-sm">{t('sshConfig.user')}</Label>
              <Input
                id="user"
                placeholder="root"
                value={formData.user}
                onChange={handleChange('user')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="port" className="text-sm">{t('sshConfig.port')}</Label>
              <Input
                id="port"
                type="number"
                placeholder="22"
                value={formData.port}
                onChange={handleChange('port')}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="identity-file" className="text-sm">{t('sshConfig.identityFile')}</Label>
              <Input
                id="identity-file"
                placeholder={t('sshConfig.identityFilePlaceholder')}
                value={formData.identityFile}
                onChange={handleChange('identityFile')}
              />
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {t('sshConfig.advancedOptions')}
          </button>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-border/50">
              <div className="space-y-1.5">
                <Label htmlFor="proxy-jump" className="text-sm">{t('sshConfig.proxyJump')}</Label>
                <Input
                  id="proxy-jump"
                  placeholder={t('sshConfig.proxyJumpPlaceholder')}
                  value={formData.proxyJump}
                  onChange={handleChange('proxyJump')}
                />
                <p className="text-xs text-muted-foreground">{t('sshConfig.proxyJumpDesc')}</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="forward-agent"
                    checked={formData.forwardAgent}
                    onChange={handleChange('forwardAgent')}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="forward-agent" className="text-sm cursor-pointer">
                    {t('sshConfig.forwardAgent')}
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">{t('sshConfig.forwardAgentDesc')}</p>
              </div>
            </div>
          )}

          <Button type="submit" className="gap-2">
            <Plus className="h-4 w-4" />
            {t('sshConfig.addHost')}
          </Button>
        </form>
      </div>

      {/* Configured Hosts Section */}
      {hosts.length > 0 && (
        <>
          <div className="border-t border-border/50" />
          <div>
            <h4 className="text-sm font-medium mb-3">{t('sshConfig.configuredHosts')}</h4>
            <div className="space-y-2">
              {hosts.map((host) => (
                <div
                  key={host.id}
                  className="flex items-center justify-between p-2.5 rounded-md bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-sm">{host.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {host.user && `${host.user}@`}
                      {host.hostname}
                      {host.port && host.port !== 22 && `:${host.port}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeHost(host.id)}
                    className="text-destructive hover:text-destructive h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Generated Config Section */}
      <div className="border-t border-border/50" />
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <h4 className="text-sm font-medium">{t('sshConfig.generatedConfig')}</h4>
          </div>
          {config && (
            <div className="flex gap-1.5">
              <CopyButton text={config} label={t('keyDisplay.copy')} />
              <DownloadButton content={config} filename="config" label={t('keyDisplay.download')} />
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          {t('sshConfig.saveToPath')}
        </p>
        <Textarea
          readOnly
          value={config || t('sshConfig.noHosts')}
          className="min-h-[180px] resize-none text-xs"
          placeholder={t('sshConfig.noHosts')}
        />
      </div>
    </div>
  )
}
