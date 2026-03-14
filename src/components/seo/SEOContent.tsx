import { Shield, Zap, ThumbsUp, Heart, Github, Server, RefreshCw, Lock, BookOpen, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation, getLanguagePathname } from '@/i18n'
import { ARTICLE_SLUGS, getArticleMeta } from '@/content/articles'
import { FAQSection } from './FAQSection'

const SECTION_TITLE: Partial<Record<string, string>> = {
  en: 'SSH Guides & Learning Resources',
  zh: 'SSH 学习指南',
  'zh-Hant': 'SSH 學習指南',
  ja: 'SSH ガイド・学習リソース',
  ko: 'SSH 가이드 및 학습 자료',
  es: 'Guías y recursos de aprendizaje SSH',
  pt: 'Guias e recursos de aprendizagem SSH',
  fr: 'Guides et ressources SSH',
  de: 'SSH-Anleitungen & Lernressourcen',
  ru: 'Руководства и обучающие материалы по SSH',
  it: 'Guide e risorse SSH',
  nl: 'SSH-handleidingen en leermiddelen',
  pl: 'Przewodniki i zasoby edukacyjne SSH',
  sv: 'SSH-guider och lärresurser',
  he: 'מדריכים ומשאבי למידה SSH',
  da: 'SSH-guider og læringsressourcer',
  nb: 'SSH-guider og læringsressurser',
  hi: 'SSH गाइड और सीखने के संसाधन',
  vi: 'Hướng dẫn và tài nguyên học tập SSH',
  tr: 'SSH Kılavuzları ve Öğrenme Kaynakları',
  id: 'Panduan dan sumber belajar SSH',
  fi: 'SSH-oppaat ja oppimisresurssit',
  uk: 'Посібники та навчальні матеріали SSH',
  ar: 'أدلة ومصادر تعلم SSH',
  th: 'คู่มือและแหล่งเรียนรู้ SSH',
  ro: 'Ghiduri și resurse de învățare SSH',
  cs: 'Průvodce a studijní zdroje SSH',
  bn: 'SSH গাইড ও শেখার সম্পদ',
  el: 'Οδηγοί και πόροι εκμάθησης SSH',
  hu: 'SSH útmutatók és tanulási anyagok',
}

export function SEOContent() {
  const { t, language } = useTranslation()
  const basePath = language === 'en' ? '' : getLanguagePathname(language).replace(/\/$/, '')
  const sectionTitle = SECTION_TITLE[language] ?? SECTION_TITLE['en']!

  return (
    <section id="ssh-key-generator-guide" className="mt-16 space-y-10">
      {/* What is an SSH Key */}
      <div id="what-is-ssh-key-generator" className="space-y-3">
        <h2 className="text-xl font-bold">{t('seo.whatIs.title')}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t('seo.whatIs.desc')}
        </p>
      </div>

      {/* Why Use This SSH Key Generator */}
      <div id="why-use-this-ssh-key-generator" className="space-y-4">
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
      <div id="how-to-generate-ssh-key" className="space-y-3">
        <h2 className="text-xl font-bold">{t('seo.howTo.title')}</h2>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li id="how-to-step-1" className="flex gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">1</span>
            <span>{t('seo.howTo.step1')}</span>
          </li>
          <li id="how-to-step-2" className="flex gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">2</span>
            <span>{t('seo.howTo.step2')}</span>
          </li>
          <li id="how-to-step-3" className="flex gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">3</span>
            <span>{t('seo.howTo.step3')}</span>
          </li>
          <li id="how-to-step-4" className="flex gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">4</span>
            <span>{t('seo.howTo.step4')}</span>
          </li>
          <li id="how-to-step-5" className="flex gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">5</span>
            <span>{t('seo.howTo.step5')}</span>
          </li>
        </ol>
      </div>

      {/* Ed25519 vs RSA Comparison */}
      <div id="ed25519-vs-rsa" className="space-y-3">
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
      <div id="ssh-key-use-cases" className="space-y-4">
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

      {/* Related Articles */}
      <div id="ssh-guides" className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">{sectionTitle}</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {ARTICLE_SLUGS.map((slug) => {
            const meta = getArticleMeta(slug, language)
            return (
              <Link
                key={slug}
                to={`${basePath}/${slug}/`}
                className="flex items-start justify-between gap-3 p-4 rounded-lg bg-card/50 border border-border hover:border-primary/50 hover:bg-card transition-colors group"
              >
                <div className="space-y-1 min-w-0">
                  <p className="font-medium text-sm leading-snug">{meta.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{meta.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
              </Link>
            )
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <FAQSection />
    </section>
  )
}
