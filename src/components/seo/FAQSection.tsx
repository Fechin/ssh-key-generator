import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'

interface FAQItem {
  question: string
  answer: string
}

function FAQAccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-sm">{item.question}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <p className="p-4 pt-0 text-sm text-muted-foreground leading-relaxed">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  )
}

export function FAQSection() {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs: FAQItem[] = [
    {
      question: t('seo.faq.safe.question'),
      answer: t('seo.faq.safe.answer'),
    },
    {
      question: t('seo.faq.ed25519VsRsa.question'),
      answer: t('seo.faq.ed25519VsRsa.answer'),
    },
    {
      question: t('seo.faq.github.question'),
      answer: t('seo.faq.github.answer'),
    },
    {
      question: t('seo.faq.rsaKeySize.question'),
      answer: t('seo.faq.rsaKeySize.answer'),
    },
    {
      question: t('seo.faq.offline.question'),
      answer: t('seo.faq.offline.answer'),
    },
    {
      question: t('seo.faq.passphrase.question'),
      answer: t('seo.faq.passphrase.answer'),
    },
    {
      question: t('seo.faq.multipleServers.question'),
      answer: t('seo.faq.multipleServers.answer'),
    },
    {
      question: t('seo.faq.fingerprint.question'),
      answer: t('seo.faq.fingerprint.answer'),
    },
    {
      question: t('seo.faq.bestAlgorithm.question'),
      answer: t('seo.faq.bestAlgorithm.answer'),
    },
    {
      question: t('seo.faq.authorizedKeys.question'),
      answer: t('seo.faq.authorizedKeys.answer'),
    },
    {
      question: t('seo.faq.permissions.question'),
      answer: t('seo.faq.permissions.answer'),
    },
  ]

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">{t('seo.faq.title')}</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        {t('seo.faq.subtitle')}
      </p>
      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <FAQAccordionItem
            key={index}
            item={faq}
            isOpen={openIndex === index}
            onToggle={() => handleToggle(index)}
          />
        ))}
      </div>
    </section>
  )
}
