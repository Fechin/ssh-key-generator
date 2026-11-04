import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import siteInfo from '@/content/siteInfo.json'

export function SiteInfoPage({ slug }: { slug: string }) {
  const page = siteInfo.find((entry) => entry.slug === slug)

  if (!page) return null

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main lang="en" dir="ltr" className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        <article className="max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">{page.heading}</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Last reviewed: <time dateTime={page.dateModified}>{page.dateModified}</time>
          </p>
          <div className="space-y-8">
            {page.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl font-semibold mb-3">{section.heading}</h2>
                <div className="space-y-3 text-muted-foreground leading-relaxed">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
                {section.links && (
                  <ul className="mt-3 space-y-2">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <a href={link.href} className="text-primary underline underline-offset-4 hover:opacity-80">
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
