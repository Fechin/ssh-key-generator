import { Shield, Zap, ThumbsUp, Heart, Github, Server, RefreshCw, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from '@/i18n'
import { FAQSection } from './FAQSection'

export function SEOContent() {
  const { t } = useTranslation()

  return (
    <section className="mt-16 space-y-10">
      {/* What is an SSH Key */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold">{t('seo.whatIs.title')}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t('seo.whatIs.desc')}
        </p>
      </div>

      {/* Why Use This SSH Key Generator */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">{t('seo.whyUse.title')}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-success" />
                {t('seo.whyUse.secure.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{t('seo.whyUse.secure.desc')}</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-warning" />
                {t('seo.whyUse.modern.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{t('seo.whyUse.modern.desc')}</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ThumbsUp className="h-4 w-4 text-primary" />
                {t('seo.whyUse.easy.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{t('seo.whyUse.easy.desc')}</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Heart className="h-4 w-4 text-destructive" />
                {t('seo.whyUse.free.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{t('seo.whyUse.free.desc')}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How to Generate */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold">{t('seo.howTo.title')}</h2>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">1</span>
            <span>{t('seo.howTo.step1')}</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">2</span>
            <span>{t('seo.howTo.step2')}</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">3</span>
            <span>{t('seo.howTo.step3')}</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">4</span>
            <span>{t('seo.howTo.step4')}</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">5</span>
            <span>{t('seo.howTo.step5')}</span>
          </li>
        </ol>
      </div>

      {/* Ed25519 vs RSA Comparison */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold">{t('seo.comparison.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('seo.comparison.intro')}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-semibold border-b border-border">{t('seo.comparison.feature')}</th>
                <th className="text-left p-3 font-semibold border-b border-border">Ed25519</th>
                <th className="text-left p-3 font-semibold border-b border-border">RSA</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr>
                <td className="p-3 border-b border-border">{t('seo.comparison.algorithmType')}</td>
                <td className="p-3 border-b border-border">{t('seo.comparison.ed25519AlgoType')}</td>
                <td className="p-3 border-b border-border">{t('seo.comparison.rsaAlgoType')}</td>
              </tr>
              <tr>
                <td className="p-3 border-b border-border">{t('seo.comparison.keySize')}</td>
                <td className="p-3 border-b border-border text-success">{t('seo.comparison.ed25519KeySize')}</td>
                <td className="p-3 border-b border-border">{t('seo.comparison.rsaKeySize')}</td>
              </tr>
              <tr>
                <td className="p-3 border-b border-border">{t('seo.comparison.signatureSize')}</td>
                <td className="p-3 border-b border-border text-success">{t('seo.comparison.ed25519SigSize')}</td>
                <td className="p-3 border-b border-border">{t('seo.comparison.rsaSigSize')}</td>
              </tr>
              <tr>
                <td className="p-3 border-b border-border">{t('seo.comparison.security')}</td>
                <td className="p-3 border-b border-border text-success">{t('seo.comparison.ed25519Security')}</td>
                <td className="p-3 border-b border-border">{t('seo.comparison.rsaSecurity')}</td>
              </tr>
              <tr>
                <td className="p-3 border-b border-border">{t('seo.comparison.performance')}</td>
                <td className="p-3 border-b border-border text-success">{t('seo.comparison.ed25519Performance')}</td>
                <td className="p-3 border-b border-border">{t('seo.comparison.rsaPerformance')}</td>
              </tr>
              <tr>
                <td className="p-3 border-b border-border">{t('seo.comparison.compatibility')}</td>
                <td className="p-3 border-b border-border">{t('seo.comparison.ed25519Compat')}</td>
                <td className="p-3 border-b border-border text-success">{t('seo.comparison.rsaCompat')}</td>
              </tr>
              <tr>
                <td className="p-3 border-b border-border">{t('seo.comparison.quantumResistance')}</td>
                <td className="p-3 border-b border-border text-warning">{t('seo.comparison.ed25519Quantum')}</td>
                <td className="p-3 border-b border-border text-warning">{t('seo.comparison.rsaQuantum')}</td>
              </tr>
              <tr>
                <td className="p-3 border-b border-border">{t('seo.comparison.bestFor')}</td>
                <td className="p-3 border-b border-border">{t('seo.comparison.ed25519BestFor')}</td>
                <td className="p-3 border-b border-border">{t('seo.comparison.rsaBestFor')}</td>
              </tr>
              <tr>
                <td className="p-3">{t('seo.comparison.recommendation')}</td>
                <td className="p-3 text-primary font-medium">{t('seo.comparison.ed25519Rec')}</td>
                <td className="p-3">{t('seo.comparison.rsaRec')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Common Use Cases */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">{t('seo.useCases.title')}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex gap-3 p-3 rounded-lg bg-card/50 border border-border">
            <Github className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-sm">{t('seo.useCases.git.title')}</h3>
              <p className="text-xs text-muted-foreground mt-1">{t('seo.useCases.git.desc')}</p>
            </div>
          </div>

          <div className="flex gap-3 p-3 rounded-lg bg-card/50 border border-border">
            <Server className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-sm">{t('seo.useCases.server.title')}</h3>
              <p className="text-xs text-muted-foreground mt-1">{t('seo.useCases.server.desc')}</p>
            </div>
          </div>

          <div className="flex gap-3 p-3 rounded-lg bg-card/50 border border-border">
            <RefreshCw className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-sm">{t('seo.useCases.automation.title')}</h3>
              <p className="text-xs text-muted-foreground mt-1">{t('seo.useCases.automation.desc')}</p>
            </div>
          </div>

          <div className="flex gap-3 p-3 rounded-lg bg-card/50 border border-border">
            <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-sm">{t('seo.useCases.tunnels.title')}</h3>
              <p className="text-xs text-muted-foreground mt-1">{t('seo.useCases.tunnels.desc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQSection />
    </section>
  )
}
