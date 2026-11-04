import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import type { Language } from '@/i18n'

const PUBLICATION_LABELS: Record<Language, [string, string, string]> = {
  en: ['By', 'Published', 'Updated'],
  zh: ['作者', '发布于', '更新于'],
  'zh-Hant': ['作者', '發佈於', '更新於'],
  ja: ['著者', '公開日', '更新日'],
  ko: ['작성', '게시일', '수정일'],
  es: ['Por', 'Publicado', 'Actualizado'],
  pt: ['Por', 'Publicado', 'Atualizado'],
  fr: ['Par', 'Publié le', 'Mis à jour le'],
  de: ['Von', 'Veröffentlicht', 'Aktualisiert'],
  ru: ['Автор', 'Опубликовано', 'Обновлено'],
  it: ['Di', 'Pubblicato', 'Aggiornato'],
  nl: ['Door', 'Gepubliceerd', 'Bijgewerkt'],
  pl: ['Autor', 'Opublikowano', 'Zaktualizowano'],
  sv: ['Av', 'Publicerad', 'Uppdaterad'],
  he: ['מאת', 'פורסם', 'עודכן'],
  da: ['Af', 'Udgivet', 'Opdateret'],
  nb: ['Av', 'Publisert', 'Oppdatert'],
  hi: ['लेखक', 'प्रकाशित', 'अपडेट किया गया'],
  vi: ['Tác giả', 'Xuất bản', 'Cập nhật'],
  tr: ['Yazar', 'Yayımlanma', 'Güncelleme'],
  id: ['Oleh', 'Diterbitkan', 'Diperbarui'],
  fi: ['Kirjoittaja', 'Julkaistu', 'Päivitetty'],
  uk: ['Автор', 'Опубліковано', 'Оновлено'],
  ar: ['بواسطة', 'نُشر', 'حُدّث'],
  th: ['ผู้เขียน', 'เผยแพร่', 'อัปเดต'],
  ro: ['Autor', 'Publicat', 'Actualizat'],
  cs: ['Autor', 'Publikováno', 'Aktualizováno'],
  bn: ['লেখক', 'প্রকাশিত', 'হালনাগাদ'],
  el: ['Συντάκτης', 'Δημοσιεύτηκε', 'Ενημερώθηκε'],
  hu: ['Szerző', 'Megjelent', 'Frissítve'],
}

interface Props {
  children: ReactNode
  backHref: string
  backLabel: string
  publication?: {
    language: Language
    publishDate: string
    modifiedDate?: string
  }
}

export function ArticleLayout({ children, backHref, backLabel, publication }: Props) {
  const labels = publication ? PUBLICATION_LABELS[publication.language] : null
  const formatDate = (date: string) => new Intl.DateTimeFormat(publication?.language, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 min-w-0 max-w-3xl mx-auto px-4 py-10 w-full">
        <Link
          to={backHref}
          className="inline-flex items-center gap-1 text-support text-link hover:underline underline-offset-4 mb-8"
        >
          <ChevronLeft className="h-4 w-4" />
          {backLabel}
        </Link>
        <article className="article-prose min-w-0">
          {publication && labels && (
            <div className="not-prose mb-6 flex flex-wrap gap-x-4 gap-y-1 text-caption text-muted-foreground">
              <span>
                {labels[0]}{' '}
                <a href="https://github.com/Fechin/ssh-key-generator" rel="author" className="text-link underline underline-offset-2">
                  SSH Key Generator
                </a>
              </span>
              <span>
                {labels[1]}{' '}
                <time dateTime={publication.publishDate}>{formatDate(publication.publishDate)}</time>
              </span>
              {publication.modifiedDate && publication.modifiedDate !== publication.publishDate && (
                <span>
                  {labels[2]}{' '}
                  <time dateTime={publication.modifiedDate}>{formatDate(publication.modifiedDate)}</time>
                </span>
              )}
            </div>
          )}
          {children}
        </article>
      </main>
      <Footer />
    </div>
  )
}
