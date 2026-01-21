import { Github, GitBranch, Box, ExternalLink, Cloud, Server, Droplet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CopyButton } from '@/components/common/CopyButton'
import { useTranslation } from '@/i18n'

interface Step {
  titleKey: string
  descKey: string
  command?: string
}

interface Platform {
  id: string
  name: string
  icon: React.ReactNode
  steps: Step[]
  docsUrl: string
}

export function PlatformGuides() {
  const { t } = useTranslation()

  const platforms: Platform[] = [
    {
      id: 'github',
      name: 'GitHub',
      icon: <Github className="h-4 w-4" />,
      docsUrl: 'https://docs.github.com/en/authentication/connecting-to-github-with-ssh',
      steps: [
        {
          titleKey: 'guides.github.step1Title',
          descKey: 'guides.github.step1Desc',
          command: 'ssh-keygen -t ed25519 -C "your_email@example.com"',
        },
        {
          titleKey: 'guides.github.step2Title',
          descKey: 'guides.github.step2Desc',
          command: 'eval "$(ssh-agent -s)"',
        },
        {
          titleKey: 'guides.github.step3Title',
          descKey: 'guides.github.step3Desc',
          command: 'ssh-add ~/.ssh/id_ed25519',
        },
        {
          titleKey: 'guides.github.step4Title',
          descKey: 'guides.github.step4Desc',
          command: 'cat ~/.ssh/id_ed25519.pub | pbcopy  # macOS\ncat ~/.ssh/id_ed25519.pub | xclip -selection clipboard  # Linux',
        },
        {
          titleKey: 'guides.github.step5Title',
          descKey: 'guides.github.step5Desc',
        },
        {
          titleKey: 'guides.github.step6Title',
          descKey: 'guides.github.step6Desc',
          command: 'ssh -T git@github.com',
        },
      ],
    },
    {
      id: 'gitlab',
      name: 'GitLab',
      icon: <GitBranch className="h-4 w-4" />,
      docsUrl: 'https://docs.gitlab.com/ee/user/ssh.html',
      steps: [
        {
          titleKey: 'guides.gitlab.step1Title',
          descKey: 'guides.gitlab.step1Desc',
          command: 'ssh-keygen -t ed25519 -C "your_email@example.com"',
        },
        {
          titleKey: 'guides.gitlab.step2Title',
          descKey: 'guides.gitlab.step2Desc',
          command: 'eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519',
        },
        {
          titleKey: 'guides.gitlab.step3Title',
          descKey: 'guides.gitlab.step3Desc',
          command: 'cat ~/.ssh/id_ed25519.pub',
        },
        {
          titleKey: 'guides.gitlab.step4Title',
          descKey: 'guides.gitlab.step4Desc',
        },
        {
          titleKey: 'guides.gitlab.step5Title',
          descKey: 'guides.gitlab.step5Desc',
          command: 'ssh -T git@gitlab.com',
        },
      ],
    },
    {
      id: 'bitbucket',
      name: 'Bitbucket',
      icon: <Box className="h-4 w-4" />,
      docsUrl: 'https://support.atlassian.com/bitbucket-cloud/docs/configure-ssh-and-two-step-verification/',
      steps: [
        {
          titleKey: 'guides.bitbucket.step1Title',
          descKey: 'guides.bitbucket.step1Desc',
          command: 'ssh-keygen -t ed25519 -b 4096 -C "your_email@example.com"',
        },
        {
          titleKey: 'guides.bitbucket.step2Title',
          descKey: 'guides.bitbucket.step2Desc',
          command: 'eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519',
        },
        {
          titleKey: 'guides.bitbucket.step3Title',
          descKey: 'guides.bitbucket.step3Desc',
          command: 'cat ~/.ssh/id_ed25519.pub',
        },
        {
          titleKey: 'guides.bitbucket.step4Title',
          descKey: 'guides.bitbucket.step4Desc',
        },
        {
          titleKey: 'guides.bitbucket.step5Title',
          descKey: 'guides.bitbucket.step5Desc',
          command: 'ssh -T git@bitbucket.org',
        },
      ],
    },
    {
      id: 'aws',
      name: 'AWS EC2',
      icon: <Cloud className="h-4 w-4" />,
      docsUrl: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html',
      steps: [
        {
          titleKey: 'guides.aws.step1Title',
          descKey: 'guides.aws.step1Desc',
          command: 'ssh-keygen -t ed25519 -C "aws-ec2-key"',
        },
        {
          titleKey: 'guides.aws.step2Title',
          descKey: 'guides.aws.step2Desc',
          command: 'cat ~/.ssh/id_ed25519.pub',
        },
        {
          titleKey: 'guides.aws.step3Title',
          descKey: 'guides.aws.step3Desc',
        },
        {
          titleKey: 'guides.aws.step4Title',
          descKey: 'guides.aws.step4Desc',
          command: 'chmod 400 ~/.ssh/id_ed25519',
        },
        {
          titleKey: 'guides.aws.step5Title',
          descKey: 'guides.aws.step5Desc',
          command: 'ssh -i ~/.ssh/id_ed25519 ec2-user@<instance-public-ip>',
        },
      ],
    },
    {
      id: 'azure',
      name: 'Azure VMs',
      icon: <Server className="h-4 w-4" />,
      docsUrl: 'https://learn.microsoft.com/en-us/azure/virtual-machines/linux/create-ssh-keys-detailed',
      steps: [
        {
          titleKey: 'guides.azure.step1Title',
          descKey: 'guides.azure.step1Desc',
          command: 'ssh-keygen -t ed25519 -C "azure-vm-key"',
        },
        {
          titleKey: 'guides.azure.step2Title',
          descKey: 'guides.azure.step2Desc',
          command: 'cat ~/.ssh/id_ed25519.pub',
        },
        {
          titleKey: 'guides.azure.step3Title',
          descKey: 'guides.azure.step3Desc',
        },
        {
          titleKey: 'guides.azure.step4Title',
          descKey: 'guides.azure.step4Desc',
          command: 'ssh -i ~/.ssh/id_ed25519 azureuser@<vm-public-ip>',
        },
        {
          titleKey: 'guides.azure.step5Title',
          descKey: 'guides.azure.step5Desc',
          command: 'az vm user update --resource-group <rg> --name <vm> --username azureuser --ssh-key-value "$(cat ~/.ssh/id_ed25519.pub)"',
        },
      ],
    },
    {
      id: 'digitalocean',
      name: 'DigitalOcean',
      icon: <Droplet className="h-4 w-4" />,
      docsUrl: 'https://docs.digitalocean.com/products/droplets/how-to/add-ssh-keys/',
      steps: [
        {
          titleKey: 'guides.digitalocean.step1Title',
          descKey: 'guides.digitalocean.step1Desc',
          command: 'ssh-keygen -t ed25519 -C "digitalocean-droplet"',
        },
        {
          titleKey: 'guides.digitalocean.step2Title',
          descKey: 'guides.digitalocean.step2Desc',
          command: 'cat ~/.ssh/id_ed25519.pub',
        },
        {
          titleKey: 'guides.digitalocean.step3Title',
          descKey: 'guides.digitalocean.step3Desc',
        },
        {
          titleKey: 'guides.digitalocean.step4Title',
          descKey: 'guides.digitalocean.step4Desc',
        },
        {
          titleKey: 'guides.digitalocean.step5Title',
          descKey: 'guides.digitalocean.step5Desc',
          command: 'ssh -i ~/.ssh/id_ed25519 root@<droplet-ip>',
        },
      ],
    },
  ]

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-base font-semibold">{t('guides.title')}</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {t('guides.description')}
        </p>
      </div>
      <Tabs defaultValue="github">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-1 h-auto">
            {platforms.map((platform) => (
              <TabsTrigger key={platform.id} value={platform.id} className="gap-1.5 text-xs px-2 py-1.5">
                {platform.icon}
                <span className="hidden sm:inline">{platform.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {platforms.map((platform) => (
            <TabsContent key={platform.id} value={platform.id} className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  {platform.icon}
                  {t('guides.sshSetup', { platform: platform.name })}
                </h3>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={platform.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    {t('guides.officialDocs')}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>

              <ol className="space-y-3">
                {platform.steps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <h4 className="font-medium text-sm">{t(step.titleKey)}</h4>
                      <p className="text-xs text-muted-foreground">{t(step.descKey)}</p>
                      {step.command && (
                        <div className="relative">
                          <pre className="p-2.5 bg-background rounded-md text-xs font-mono overflow-x-auto pr-10">
                            {step.command}
                          </pre>
                          <div className="absolute right-2 top-2">
                            <CopyButton text={step.command} />
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </TabsContent>
          ))}
        </Tabs>
    </div>
  )
}
