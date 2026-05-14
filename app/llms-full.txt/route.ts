/**
 * /llms-full.txt — fuller content dump for LLM crawlers.
 *
 * Same shape as /llms.txt, but each page's full body copy is inlined so
 * the model has the actual content (not just titles + descriptions). Good
 * for sites that want to be cite-able by AI search.
 */

import { client } from '@/lib/sanity'
import { localize } from '@/lib/locale'

export const revalidate = 600

const SITE_URL = 'https://mnmagency.com'

type LocaleField = { en?: string; ar?: string } | string | null | undefined
type PortableTextChild = { _type?: string; text?: string }
type PortableTextBlock = { _type?: string; children?: PortableTextChild[]; style?: string }

type Service = {
  title?: LocaleField
  slug?: { current?: string }
  description?: LocaleField
  content?: LocaleField
  whyItMatters?: LocaleField
  deliverables?: Array<LocaleField>
}
type CaseStudy = {
  title?: LocaleField
  slug?: { current?: string }
  client?: string
  industry?: LocaleField
  category?: LocaleField
  description?: LocaleField
  challenge?: LocaleField
  solution?: LocaleField
  results?: LocaleField
}
type Blog = {
  title?: LocaleField
  slug?: { current?: string }
  category?: LocaleField
  author?: LocaleField
  excerpt?: LocaleField
  content?: PortableTextBlock[]
  publishedAt?: string
}
type Faq = { question?: LocaleField; answer?: LocaleField; category?: string }

function clean(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

function portableTextToPlain(blocks: PortableTextBlock[] | undefined): string {
  if (!Array.isArray(blocks)) return ''
  const paragraphs: string[] = []
  for (const block of blocks) {
    if (!block || block._type !== 'block') continue
    const text = (block.children || [])
      .filter((c) => c && c._type === 'span' && typeof c.text === 'string')
      .map((c) => c.text as string)
      .join('')
    if (text.trim()) {
      if (block.style === 'h2' || block.style === 'h3' || block.style === 'h4') {
        paragraphs.push('## ' + text)
      } else {
        paragraphs.push(text)
      }
    }
  }
  return paragraphs.join('\n\n')
}

export async function GET() {
  const data = await client.fetch<{
    brand?: string
    services: Service[]
    caseStudies: CaseStudy[]
    blogs: Blog[]
    faqs: Faq[]
  }>(`
    {
      "brand": *[_type == "navigation"][0].brandName,
      "services": *[_type == "service" && defined(slug.current)] | order(_createdAt asc){
        title, slug, description, content, whyItMatters, deliverables
      },
      "caseStudies": *[_type == "caseStudy" && defined(slug.current)] | order(_createdAt desc){
        title, slug, client, industry, category, description, challenge, solution, results
      },
      "blogs": *[_type == "blog" && defined(slug.current)] | order(publishedAt desc)[0...30]{
        title, slug, category, author, excerpt, content, publishedAt
      },
      "faqs": *[_type == "faq" && showOnFaqPage == true] | order(order asc, _createdAt asc){
        question, answer, category
      }
    }
  `)

  const brand = data.brand || 'M&M Marketing'
  const lines: string[] = []

  lines.push(`# ${brand} — full content`)
  lines.push('')
  lines.push(`> Expanded content dump of every page on ${SITE_URL} for LLM ingestion. Includes both English and Arabic where available.`)
  lines.push('')

  // Services
  if (data.services?.length > 0) {
    lines.push('## Services')
    lines.push('')
    for (const s of data.services) {
      const slug = s.slug?.current
      if (!slug) continue
      const enTitle = clean(localize(s.title, 'en') || slug)
      const arTitle = clean(localize(s.title, 'ar') || '')
      lines.push(`### ${enTitle}`)
      if (arTitle) lines.push(`Arabic: ${arTitle}`)
      lines.push(`URL: ${SITE_URL}/services/${slug}  |  Arabic: ${SITE_URL}/ar/services/${slug}`)
      const desc = clean(localize(s.description, 'en') || '')
      if (desc) lines.push('', desc)
      const content = clean(localize(s.content, 'en') || '')
      if (content) lines.push('', content)
      const why = clean(localize(s.whyItMatters, 'en') || '')
      if (why) lines.push('', `Why it matters: ${why}`)
      if (Array.isArray(s.deliverables) && s.deliverables.length > 0) {
        lines.push('', 'Deliverables:')
        for (const d of s.deliverables) {
          const en = clean(localize(d, 'en') || '')
          if (en) lines.push(`- ${en}`)
        }
      }
      lines.push('')
    }
  }

  // Case studies
  if (data.caseStudies?.length > 0) {
    lines.push('## Case studies')
    lines.push('')
    for (const c of data.caseStudies) {
      const slug = c.slug?.current
      if (!slug) continue
      const enTitle = clean(localize(c.title, 'en') || slug)
      lines.push(`### ${enTitle}`)
      lines.push(`URL: ${SITE_URL}/case-studies/${slug}  |  Arabic: ${SITE_URL}/ar/case-studies/${slug}`)
      if (c.client) lines.push(`Client: ${c.client}`)
      const industry = clean(localize(c.industry, 'en') || '')
      const category = clean(localize(c.category, 'en') || '')
      if (industry) lines.push(`Industry: ${industry}`)
      if (category) lines.push(`Category: ${category}`)
      const desc = clean(localize(c.description, 'en') || '')
      if (desc) lines.push('', desc)
      const challenge = clean(localize(c.challenge, 'en') || '')
      if (challenge) lines.push('', `**Challenge:** ${challenge}`)
      const solution = clean(localize(c.solution, 'en') || '')
      if (solution) lines.push('', `**Solution:** ${solution}`)
      const results = clean(localize(c.results, 'en') || '')
      if (results) lines.push('', `**Results:** ${results}`)
      lines.push('')
    }
  }

  // Blog
  if (data.blogs?.length > 0) {
    lines.push('## Blog articles')
    lines.push('')
    for (const b of data.blogs) {
      const slug = b.slug?.current
      if (!slug) continue
      const enTitle = clean(localize(b.title, 'en') || slug)
      lines.push(`### ${enTitle}`)
      lines.push(`URL: ${SITE_URL}/blog/${slug}  |  Arabic: ${SITE_URL}/ar/blog/${slug}`)
      const author = clean(localize(b.author, 'en') || '')
      const category = clean(localize(b.category, 'en') || '')
      if (author) lines.push(`Author: ${author}`)
      if (category) lines.push(`Category: ${category}`)
      if (b.publishedAt) lines.push(`Published: ${new Date(b.publishedAt).toISOString().slice(0, 10)}`)
      const excerpt = clean(localize(b.excerpt, 'en') || '')
      if (excerpt) lines.push('', excerpt)
      const body = portableTextToPlain(b.content)
      if (body) lines.push('', body)
      lines.push('')
    }
  }

  // FAQs
  if (data.faqs?.length > 0) {
    lines.push('## Frequently asked questions')
    lines.push('')
    for (const f of data.faqs) {
      const q = clean(localize(f.question, 'en') || '')
      const a = clean(localize(f.answer, 'en') || '')
      if (!q || !a) continue
      lines.push(`### ${q}`)
      lines.push(a)
      lines.push('')
    }
  }

  return new Response(lines.join('\n'), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=600, s-maxage=600',
    },
  })
}
