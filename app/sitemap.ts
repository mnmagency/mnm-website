import { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'

const SITE_URL = 'https://mnmagency.com'
const LOCALES = ['en', 'ar'] as const

type Slug = { slug?: { current?: string }; _updatedAt?: string }

/**
 * Bilingual sitemap.
 *
 * Each canonical English URL is emitted alongside its /ar/* counterpart, with
 * `alternates.languages` so Google understands they're translations of each
 * other (and to feed the hreflang relationship).
 *
 * /work was consolidated into /case-studies in Phase 3-D — not included.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await client.fetch<{
    services: Slug[]
    blogs: Slug[]
    caseStudies: Slug[]
  }>(`
    {
      "services":    *[_type == "service"   && defined(slug.current)]{ slug, _updatedAt },
      "blogs":       *[_type == "blog"      && defined(slug.current)]{ slug, _updatedAt },
      "caseStudies": *[_type == "caseStudy" && defined(slug.current)]{ slug, _updatedAt }
    }
  `)

  const now = new Date()

  const staticPaths: Array<{
    path: string
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
    priority: number
  }> = [
    { path: '/',             changeFrequency: 'monthly', priority: 1.0 },
    { path: '/about',        changeFrequency: 'monthly', priority: 0.8 },
    { path: '/services',     changeFrequency: 'monthly', priority: 0.9 },
    { path: '/case-studies', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/blog',         changeFrequency: 'weekly',  priority: 0.7 },
    { path: '/faqs',         changeFrequency: 'monthly', priority: 0.5 },
    { path: '/contact',      changeFrequency: 'monthly', priority: 0.6 },
    { path: '/get-strategy', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/seo-audit',    changeFrequency: 'monthly', priority: 0.6 },
  ]

  function buildLocaleUrl(path: string, locale: (typeof LOCALES)[number]): string {
    if (locale === 'en') return `${SITE_URL}${path}`
    if (path === '/') return `${SITE_URL}/ar`
    return `${SITE_URL}/ar${path}`
  }

  function alternates(path: string): Record<string, string> {
    const langs: Record<string, string> = {}
    for (const loc of LOCALES) {
      langs[loc] = buildLocaleUrl(path, loc)
    }
    // x-default points to the default (English) version
    langs['x-default'] = buildLocaleUrl(path, 'en')
    return langs
  }

  function entries(
    path: string,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
    priority: number,
    lastModified: Date,
  ): MetadataRoute.Sitemap {
    return LOCALES.map((loc) => ({
      url: buildLocaleUrl(path, loc),
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages: alternates(path) },
    }))
  }

  const staticRoutes = staticPaths.flatMap((p) =>
    entries(p.path, p.changeFrequency, p.priority, now),
  )

  function dynamicEntries(
    basePath: string,
    items: Slug[],
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
    priority: number,
  ): MetadataRoute.Sitemap {
    const out: MetadataRoute.Sitemap = []
    for (const item of items) {
      const slug = item.slug?.current
      if (!slug) continue
      const path = `${basePath}/${slug}`
      const lm = item._updatedAt ? new Date(item._updatedAt) : now
      out.push(...entries(path, changeFrequency, priority, lm))
    }
    return out
  }

  const dynamicRoutes: MetadataRoute.Sitemap = [
    ...dynamicEntries('/services',     data?.services    ?? [], 'monthly', 0.8),
    ...dynamicEntries('/case-studies', data?.caseStudies ?? [], 'monthly', 0.7),
    ...dynamicEntries('/blog',         data?.blogs       ?? [], 'weekly',  0.6),
  ]

  return [...staticRoutes, ...dynamicRoutes]
}
