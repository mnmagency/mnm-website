/**
 * /llms.txt — site index for LLM crawlers.
 *
 * Spec: https://llmstxt.org
 *
 * Format:
 *   # <Brand>
 *   > <one-line site description>
 *
 *   ## <Section>
 *   - [Title](URL): description
 *   ...
 *
 * Built dynamically from Sanity so it stays in sync as you add services,
 * case studies, blog posts, etc. Lists both the English and Arabic URLs
 * so AI search picks up both locales.
 */

import { client } from '@/lib/sanity'
import { localize } from '@/lib/locale'

export const revalidate = 600 // refresh every 10 minutes

const SITE_URL = 'https://mnmagency.com'

type LocaleField = { en?: string; ar?: string } | string | null | undefined

type Item = {
  title?: LocaleField
  slug?: { current?: string }
  description?: LocaleField
  excerpt?: LocaleField
  category?: LocaleField
  publishedAt?: string
}

type Faq = { question?: LocaleField; answer?: LocaleField; category?: string }

type Data = {
  navigation: {
    brandName?: string
    footerDescription?: LocaleField
  } | null
  homepage: {
    title?: LocaleField
    subtitle?: LocaleField
    missionText?: LocaleField
  } | null
  services: Item[]
  caseStudies: Item[]
  blogs: Item[]
  faqs: Faq[]
}

function clean(s: string): string {
  // Strip extra whitespace and trim — keep llms.txt tidy
  return s.replace(/\s+/g, ' ').trim()
}

function bilingualLink(label: string, path: string): string {
  // emits two lines: one for English URL, one for Arabic URL
  const en = `- [${label}](${SITE_URL}${path})`
  const arPath = path === '/' ? '/ar' : `/ar${path}`
  const ar = `- [${label} (العربية)](${SITE_URL}${arPath})`
  return `${en}\n${ar}`
}

function describe(item: { title?: LocaleField; description?: LocaleField; excerpt?: LocaleField }, locale: 'en' = 'en'): string {
  const desc = localize(item.description, locale) || localize(item.excerpt, locale) || ''
  return clean(desc).slice(0, 200)
}

export async function GET() {
  const data = await client.fetch<Data>(`
    {
      "navigation": *[_type == "navigation"][0]{
        brandName, footerDescription
      },
      "homepage": *[_type == "homepage"][0]{
        title, subtitle, missionText
      },
      "services": *[_type == "service" && defined(slug.current)] | order(_createdAt asc){
        title, slug, description
      },
      "caseStudies": *[_type == "caseStudy" && defined(slug.current)] | order(_createdAt desc){
        title, slug, description, category
      },
      "blogs": *[_type == "blog" && defined(slug.current)] | order(publishedAt desc)[0...50]{
        title, slug, excerpt, category, publishedAt
      },
      "faqs": *[_type == "faq" && showOnFaqPage == true] | order(order asc, _createdAt asc)[0...20]{
        question, answer, category
      }
    }
  `)

  const brand = data.navigation?.brandName || 'M&M Marketing'
  const description =
    clean(localize(data.homepage?.subtitle, 'en') || localize(data.navigation?.footerDescription, 'en') ||
      'AI-driven marketing agency in Qatar focused on measurable business growth — websites, SEO, social, paid media, branding.')

  const lines: string[] = []

  // Header
  lines.push(`# ${brand}`)
  lines.push('')
  lines.push(`> ${description}`)
  lines.push('')

  // About / context
  const mission = clean(localize(data.homepage?.missionText, 'en') || '')
  if (mission) {
    lines.push('## About')
    lines.push('')
    lines.push(mission)
    lines.push('')
  }

  // Main navigation
  lines.push('## Main pages')
  lines.push('')
  lines.push(bilingualLink('Homepage', '/'))
  lines.push(bilingualLink('About', '/about'))
  lines.push(bilingualLink('Services', '/services'))
  lines.push(bilingualLink('Case Studies', '/case-studies'))
  lines.push(bilingualLink('Blog', '/blog'))
  lines.push(bilingualLink('FAQs', '/faqs'))
  lines.push(bilingualLink('Contact', '/contact'))
  lines.push(bilingualLink('Get an AI Growth Strategy', '/get-strategy'))
  lines.push(bilingualLink('Free SEO Audit', '/seo-audit'))
  lines.push('')

  // Services
  if (data.services?.length > 0) {
    lines.push('## Services')
    lines.push('')
    for (const s of data.services) {
      const slug = s.slug?.current
      if (!slug) continue
      const title = clean(localize(s.title, 'en') || slug)
      const desc = describe(s)
      lines.push(`- [${title}](${SITE_URL}/services/${slug})${desc ? `: ${desc}` : ''}`)
      lines.push(`- [${title} (العربية)](${SITE_URL}/ar/services/${slug})`)
    }
    lines.push('')
  }

  // Case studies
  if (data.caseStudies?.length > 0) {
    lines.push('## Case studies')
    lines.push('')
    for (const c of data.caseStudies) {
      const slug = c.slug?.current
      if (!slug) continue
      const title = clean(localize(c.title, 'en') || slug)
      const desc = describe(c)
      lines.push(`- [${title}](${SITE_URL}/case-studies/${slug})${desc ? `: ${desc}` : ''}`)
      lines.push(`- [${title} (العربية)](${SITE_URL}/ar/case-studies/${slug})`)
    }
    lines.push('')
  }

  // Blog
  if (data.blogs?.length > 0) {
    lines.push('## Blog articles')
    lines.push('')
    for (const b of data.blogs) {
      const slug = b.slug?.current
      if (!slug) continue
      const title = clean(localize(b.title, 'en') || slug)
      const desc = describe(b)
      lines.push(`- [${title}](${SITE_URL}/blog/${slug})${desc ? `: ${desc}` : ''}`)
      lines.push(`- [${title} (العربية)](${SITE_URL}/ar/blog/${slug})`)
    }
    lines.push('')
  }

  // FAQs (text-only, since they don't have unique URLs)
  if (data.faqs?.length > 0) {
    lines.push('## Frequently asked questions')
    lines.push('')
    for (const f of data.faqs) {
      const q = clean(localize(f.question, 'en') || '')
      const a = clean(localize(f.answer, 'en') || '').slice(0, 300)
      if (!q || !a) continue
      lines.push(`- **${q}** ${a}`)
    }
    lines.push('')
  }

  // Pointer to fuller dump
  lines.push('## Optional')
  lines.push('')
  lines.push(`- [Full content for LLMs](${SITE_URL}/llms-full.txt): Expanded version of this index with the full body of each page.`)
  lines.push('')

  return new Response(lines.join('\n'), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=600, s-maxage=600',
    },
  })
}
