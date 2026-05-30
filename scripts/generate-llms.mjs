/**
 * Pre-generate /llms.txt and /llms-full.txt as real static files at the
 * project root (= Cloudways' public_html). Apache serves them directly
 * from disk, which bypasses the broken mod_proxy_http handler for .txt
 * extensions on this host.
 *
 * Runs automatically before `next build` via the prebuild hook in
 * package.json.
 */

import { createClient } from 'next-sanity'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const SITE_URL = 'https://mnmagency.com'

const client = createClient({
  projectId: 'q7p7mofd',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

/** Pure copy of lib/locale.ts → localize(), inlined to keep the script standalone. */
function localize(field, locale = 'en') {
  if (field == null) return ''
  if (typeof field === 'string') return field
  if (typeof field !== 'object') return ''
  const active = field[locale]
  if (typeof active === 'string' && active.trim().length > 0) return active
  const fallback = field.en ?? field.ar
  return typeof fallback === 'string' ? fallback : ''
}

function clean(s) {
  return String(s || '').replace(/\s+/g, ' ').trim()
}

function portableTextToPlain(blocks) {
  if (!Array.isArray(blocks)) return ''
  const paragraphs = []
  for (const block of blocks) {
    if (!block || block._type !== 'block') continue
    const text = (block.children || [])
      .filter((c) => c && c._type === 'span' && typeof c.text === 'string')
      .map((c) => c.text)
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

function bilingualLink(label, path) {
  const en = `- [${label}](${SITE_URL}${path})`
  const arPath = path === '/' ? '/ar' : `/ar${path}`
  const ar = `- [${label} (العربية)](${SITE_URL}${arPath})`
  return `${en}\n${ar}`
}

function describe(item, locale = 'en') {
  const desc = localize(item.description, locale) || localize(item.excerpt, locale) || ''
  return clean(desc).slice(0, 200)
}

// ──────────────────────────────────────────────────────────────────────
// Fetch everything we need from Sanity once
// ──────────────────────────────────────────────────────────────────────

async function fetchAll() {
  return client.fetch(`
    {
      "navigation": *[_type == "navigation"][0]{
        brandName, footerDescription
      },
      "homepage": *[_type == "homepage"][0]{
        title, subtitle, missionText
      },
      "services": *[_type == "service" && defined(slug.current)] | order(_createdAt asc){
        title, slug, description, content, whyItMatters, deliverables
      },
      "caseStudies": *[_type == "caseStudy" && defined(slug.current)] | order(_createdAt desc){
        title, slug, client, industry, category, description, challenge, solution, results
      },
      "blogs": *[_type == "blog" && defined(slug.current)] | order(publishedAt desc)[0...30]{
        title, slug, category, author, excerpt, content, publishedAt
      },
      "blogsIndex": *[_type == "blog" && defined(slug.current)] | order(publishedAt desc)[0...50]{
        title, slug, excerpt, category, publishedAt
      },
      "landingPages": *[_type == "landingPage" && defined(slug.current)] | order(_createdAt asc){
        slug, serviceTag, hero, includes, faqs
      },
      "faqs": *[_type == "faq" && showOnFaqPage == true] | order(order asc, _createdAt asc){
        question, answer, category
      }
    }
  `)
}

// ──────────────────────────────────────────────────────────────────────
// llms.txt — the index file per llmstxt.org spec
// ──────────────────────────────────────────────────────────────────────

function buildLlmsTxt(data) {
  const brand = data.navigation?.brandName || 'M&M Marketing'
  const description = clean(
    localize(data.homepage?.subtitle, 'en') ||
      localize(data.navigation?.footerDescription, 'en') ||
      'AI-driven marketing agency in Qatar focused on measurable business growth — websites, SEO, social, paid media, branding.'
  )

  const lines = []
  lines.push(`# ${brand}`)
  lines.push('')
  lines.push(`> ${description}`)
  lines.push('')

  const mission = clean(localize(data.homepage?.missionText, 'en'))
  if (mission) {
    lines.push('## About')
    lines.push('')
    lines.push(mission)
    lines.push('')
  }

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

  if (data.blogsIndex?.length > 0) {
    lines.push('## Blog articles')
    lines.push('')
    for (const b of data.blogsIndex) {
      const slug = b.slug?.current
      if (!slug) continue
      const title = clean(localize(b.title, 'en') || slug)
      const desc = describe(b)
      lines.push(`- [${title}](${SITE_URL}/blog/${slug})${desc ? `: ${desc}` : ''}`)
      lines.push(`- [${title} (العربية)](${SITE_URL}/ar/blog/${slug})`)
    }
    lines.push('')
  }

  if (data.faqs?.length > 0) {
    lines.push('## Frequently asked questions')
    lines.push('')
    for (const f of data.faqs.slice(0, 20)) {
      const q = clean(localize(f.question, 'en'))
      const a = clean(localize(f.answer, 'en')).slice(0, 300)
      if (!q || !a) continue
      lines.push(`- **${q}** ${a}`)
    }
    lines.push('')
  }

  if (data.landingPages?.length > 0) {
    lines.push('## Campaign landing pages')
    lines.push('')
    for (const lp of data.landingPages) {
      const slug = lp.slug?.current
      if (!slug) continue
      const title = clean(localize(lp.hero?.title, 'en') || slug)
      const subtitle = clean(localize(lp.hero?.subtitle, 'en')).slice(0, 180)
      lines.push(`- [${title}](${SITE_URL}/lp/${slug})${subtitle ? `: ${subtitle}` : ''}`)
      lines.push(`- [${title} (العربية)](${SITE_URL}/ar/lp/${slug})`)
    }
    lines.push('')
  }

  lines.push('## Optional')
  lines.push('')
  lines.push(`- [Full content for LLMs](${SITE_URL}/llms-full.txt): Expanded version of this index with the full body of each page.`)
  lines.push('')

  return lines.join('\n')
}

// ──────────────────────────────────────────────────────────────────────
// llms-full.txt — full content dump
// ──────────────────────────────────────────────────────────────────────

function buildLlmsFullTxt(data) {
  const brand = data.navigation?.brandName || 'M&M Marketing'
  const lines = []

  lines.push(`# ${brand} — full content`)
  lines.push('')
  lines.push(`> Expanded content dump of every page on ${SITE_URL} for LLM ingestion. Includes both English and Arabic where available.`)
  lines.push('')

  if (data.services?.length > 0) {
    lines.push('## Services')
    lines.push('')
    for (const s of data.services) {
      const slug = s.slug?.current
      if (!slug) continue
      const enTitle = clean(localize(s.title, 'en') || slug)
      const arTitle = clean(localize(s.title, 'ar'))
      lines.push(`### ${enTitle}`)
      if (arTitle) lines.push(`Arabic: ${arTitle}`)
      lines.push(`URL: ${SITE_URL}/services/${slug}  |  Arabic: ${SITE_URL}/ar/services/${slug}`)
      const desc = clean(localize(s.description, 'en'))
      if (desc) lines.push('', desc)
      const content = clean(localize(s.content, 'en'))
      if (content) lines.push('', content)
      const why = clean(localize(s.whyItMatters, 'en'))
      if (why) lines.push('', `Why it matters: ${why}`)
      if (Array.isArray(s.deliverables) && s.deliverables.length > 0) {
        lines.push('', 'Deliverables:')
        for (const d of s.deliverables) {
          const en = clean(localize(d, 'en'))
          if (en) lines.push(`- ${en}`)
        }
      }
      lines.push('')
    }
  }

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
      const industry = clean(localize(c.industry, 'en'))
      const category = clean(localize(c.category, 'en'))
      if (industry) lines.push(`Industry: ${industry}`)
      if (category) lines.push(`Category: ${category}`)
      const desc = clean(localize(c.description, 'en'))
      if (desc) lines.push('', desc)
      const challenge = clean(localize(c.challenge, 'en'))
      if (challenge) lines.push('', `**Challenge:** ${challenge}`)
      const solution = clean(localize(c.solution, 'en'))
      if (solution) lines.push('', `**Solution:** ${solution}`)
      const results = clean(localize(c.results, 'en'))
      if (results) lines.push('', `**Results:** ${results}`)
      lines.push('')
    }
  }

  if (data.blogs?.length > 0) {
    lines.push('## Blog articles')
    lines.push('')
    for (const b of data.blogs) {
      const slug = b.slug?.current
      if (!slug) continue
      const enTitle = clean(localize(b.title, 'en') || slug)
      lines.push(`### ${enTitle}`)
      lines.push(`URL: ${SITE_URL}/blog/${slug}  |  Arabic: ${SITE_URL}/ar/blog/${slug}`)
      const author = clean(localize(b.author, 'en'))
      const category = clean(localize(b.category, 'en'))
      if (author) lines.push(`Author: ${author}`)
      if (category) lines.push(`Category: ${category}`)
      if (b.publishedAt) lines.push(`Published: ${new Date(b.publishedAt).toISOString().slice(0, 10)}`)
      const excerpt = clean(localize(b.excerpt, 'en'))
      if (excerpt) lines.push('', excerpt)
      const body = portableTextToPlain(b.content)
      if (body) lines.push('', body)
      lines.push('')
    }
  }

  if (data.faqs?.length > 0) {
    lines.push('## Frequently asked questions')
    lines.push('')
    for (const f of data.faqs) {
      const q = clean(localize(f.question, 'en'))
      const a = clean(localize(f.answer, 'en'))
      if (!q || !a) continue
      lines.push(`### ${q}`)
      lines.push(a)
      lines.push('')
    }
  }

  return lines.join('\n')
}

// ──────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('[generate-llms] fetching from Sanity…')
  const data = await fetchAll()

  const llms = buildLlmsTxt(data)
  const llmsFull = buildLlmsFullTxt(data)

  // Write to project root so Apache serves them as static files on Cloudways
  // (Apache's mod_proxy fails on .txt URLs for this app — disk files bypass that)
  await writeFile(resolve(process.cwd(), 'llms.txt'), llms, 'utf8')
  await writeFile(resolve(process.cwd(), 'llms-full.txt'), llmsFull, 'utf8')

  // Also write into public/ so Next.js dev server (npm run dev) serves them
  // at /llms.txt and /llms-full.txt for local testing
  await writeFile(resolve(process.cwd(), 'public', 'llms.txt'), llms, 'utf8')
  await writeFile(resolve(process.cwd(), 'public', 'llms-full.txt'), llmsFull, 'utf8')

  console.log(`[generate-llms] wrote llms.txt (${llms.length} chars) and llms-full.txt (${llmsFull.length} chars)`)
}

main().catch((err) => {
  console.error('[generate-llms] FAILED:', err)
  process.exit(1)
})
