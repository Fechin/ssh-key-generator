import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import siteInfo from '@/content/siteInfo.json'

export function SiteInfoPage({ slug }: { slug: string }) {
  const page = siteInfo.find((entry) => entry.slug === slug)

  if (!page) return null

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main lang="en" dir="ltr" className="flex-1 min-w-0 max-w-4xl mx-auto px-4 py-10 w-full">
        <article className="article-prose min-w-0 max-w-3xl mx-auto">
          <h1>{page.heading}</h1>
          <p className="not-prose text-caption text-muted-foreground mb-8">
            Last reviewed: <time dateTime={page.dateModified}>{page.dateModified}</time>
          </p>
          <div>
            {page.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                <div>
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
                {section.links && (
                  <ul>
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <a href={link.href}>
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
