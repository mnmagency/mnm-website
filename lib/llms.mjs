/**
 * /llms.txt and /llms-full.txt content (llmstxt.org) — built live from Sanity.
 *
 * Served by app/llms.txt/route.ts and app/llms-full.txt/route.ts with hourly
 * revalidation, so new services, portfolio projects, posts and FAQs reach AI
 * crawlers without a redeploy. (Replaces the old prebuild script that wrote
 * static files for the former Apache/Cloudways host.)
 */

import { createClient } from 'next-sanity'

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

export async function fetchAll() {
  return client.fetch(`
    {
      "navigation": *[_type == "navigation"][0]{
        brandName, footerDescription, address, phone, email
      },
      "homepage": *[_type == "homepage"][0]{
        title, subtitle, missionText
      },
      "services": *[_type == "service" && defined(slug.current)] | order(_createdAt asc){
        title, slug, description, content, whyItMatters, deliverables,
        sections[]{
          _type, eyebrow, title, subtitle, content, items, footnote,
          cards[]{ tag, title, text },
          criterionLabel, optionALabel, optionBLabel,
          rows[]{ criterion, optionA, optionB }
        }
      },
      "caseStudies": *[_type == "caseStudy" && defined(slug.current)] | order(_createdAt desc){
        title, slug, client, industry, category, description, challenge, solution, results
      },
      "webProjects": *[_type == "webProject" && defined(slug.current)] | order(coalesce(order, 999) asc){
        title, slug, websiteUrl, "description": summary, clientName, category, projectType, year,
        technologies, overview, challenge, solution, results, features,
        "caseStudySlug": relatedCaseStudy->slug.current
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

export function buildLlmsTxt(data) {
  const brand = data.navigation?.brandName || 'M&M Marketing'
  const description = clean(
    localize(data.homepage?.subtitle, 'en') ||
      localize(data.navigation?.footerDescription, 'en') ||
      "M&M Marketing is a full-service marketing agency in Doha, Qatar — trusted by leading brands for SEO, web development, social media management, branding, paid ads, and videography."
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
  lines.push(bilingualLink('Get Your Free Quote', '/get-strategy'))
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

  if (data.webProjects?.length > 0) {
    lines.push('## Web development portfolio')
    lines.push('')
    for (const w of data.webProjects) {
      const slug = w.slug?.current
      if (!slug) continue
      const title = clean(localize(w.title, 'en') || slug)
      const desc = describe(w)
      const live = w.websiteUrl ? ` (live site: ${w.websiteUrl})` : ''
      lines.push(`- [${title}](${SITE_URL}/portfolio/${slug})${desc ? `: ${desc}` : ''}${live}`)
      lines.push(`- [${title} (العربية)](${SITE_URL}/ar/portfolio/${slug})`)
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

  const nav = data.navigation || {}
  if (nav.address || nav.phone || nav.email) {
    lines.push('## Contact')
    lines.push('')
    const address = clean(localize(nav.address, 'en'))
    if (address) lines.push(`- Address: ${address}, Doha, Qatar`)
    if (nav.phone) lines.push(`- Phone: ${clean(nav.phone)}`)
    if (nav.email) lines.push(`- Email: ${clean(nav.email)}`)
    lines.push('- Working hours: Sunday to Thursday, 09:00 to 18:00 (Qatar time)')
    lines.push('- Languages: English, Arabic')
    lines.push(`- Website: ${SITE_URL}`)
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

export function buildLlmsFullTxt(data) {
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
      for (const sec of s.sections || []) {
        const secTitle = clean(localize(sec.title, 'en'))
        if (secTitle) lines.push('', `#### ${secTitle}`)
        const sub = clean(localize(sec.subtitle, 'en'))
        if (sub) lines.push(sub)
        const body = String(localize(sec.content, 'en') || '').trim()
        if (body) lines.push(body)
        if (Array.isArray(sec.items)) {
          for (const it of sec.items) {
            const t = clean(localize(it, 'en'))
            if (t) lines.push(`- ${t}`)
          }
        }
        if (Array.isArray(sec.cards)) {
          for (const c of sec.cards) {
            const t = clean(localize(c.title, 'en'))
            const tag = clean(localize(c.tag, 'en'))
            const tx = clean(localize(c.text, 'en'))
            if (t || tx) lines.push(`- ${tag ? `[${tag}] ` : ''}${t ? `**${t}**: ` : ''}${tx}`)
          }
        }
        if (Array.isArray(sec.rows) && sec.rows.length > 0) {
          const a = clean(localize(sec.optionALabel, 'en')) || 'Option A'
          const b = clean(localize(sec.optionBLabel, 'en')) || 'Option B'
          const k = clean(localize(sec.criterionLabel, 'en')) || 'Criterion'
          lines.push('', `| ${k} | ${a} | ${b} |`, '| --- | --- | --- |')
          for (const r of sec.rows) {
            const cell = (f) => clean(localize(f, 'en')).replace(/\|/g, '/')
            lines.push(`| ${cell(r.criterion)} | ${cell(r.optionA)} | ${cell(r.optionB)} |`)
          }
        }
        const foot = clean(localize(sec.footnote, 'en'))
        if (foot) lines.push('', foot)
      }
      lines.push('')
    }
  }

  if (data.webProjects?.length > 0) {
    lines.push('## Web development portfolio')
    lines.push('')
    for (const w of data.webProjects) {
      const slug = w.slug?.current
      if (!slug) continue
      lines.push(`### ${clean(localize(w.title, 'en') || slug)}`)
      lines.push(`URL: ${SITE_URL}/portfolio/${slug}  |  Arabic: ${SITE_URL}/ar/portfolio/${slug}`)
      if (w.websiteUrl) lines.push(`Live site: ${w.websiteUrl}`)
      const client = clean(localize(w.clientName, 'en'))
      const cat = clean(localize(w.category, 'en'))
      const type = clean(localize(w.projectType, 'en'))
      if (client) lines.push(`Client: ${client}`)
      if (cat) lines.push(`Industry: ${cat}`)
      if (type) lines.push(`Project type: ${type}`)
      if (w.year) lines.push(`Year: ${w.year}`)
      if (Array.isArray(w.technologies) && w.technologies.length) lines.push(`Technologies: ${w.technologies.join(', ')}`)
      for (const [label, f] of [['', w.description], ['Overview', w.overview], ['Challenge', w.challenge], ['What we built', w.solution], ['Results', w.results]]) {
        const t = clean(localize(f, 'en'))
        if (t) lines.push('', label ? `**${label}:** ${t}` : t)
      }
      if (Array.isArray(w.features) && w.features.length) {
        lines.push('', 'Key features:')
        for (const f of w.features) {
          const t = clean(localize(f, 'en'))
          if (t) lines.push(`- ${t}`)
        }
      }
      if (w.caseStudySlug) lines.push('', `Full case study: ${SITE_URL}/case-studies/${w.caseStudySlug}`)
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
