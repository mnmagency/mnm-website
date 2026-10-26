/**
 * /portfolio/{slug} — one indexable page per website we built.
 *
 * Content: `webProject` document. Labels/CTA: `portfolioPage` singleton.
 */
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { pageAlternates, pageOpenGraph, breadcrumbLd, localeUrl, SITE_URL, brandTitle } from '@/lib/seo'
import JsonLd from '@/app/components/JsonLd'
import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'
import { localize, localizePath } from '@/lib/locale'
import { getLocale } from '@/lib/locale-server'

export const revalidate = 60

type LocaleField = { en?: string; ar?: string } | string | null | undefined
type Img = { asset?: { url?: string }; alt?: LocaleField }

type WebProject = {
  _id: string
  title?: LocaleField
  clientName?: LocaleField
  websiteUrl?: string
  category?: LocaleField
  projectType?: LocaleField
  year?: string
  technologies?: string[]
  summary?: LocaleField
  overview?: LocaleField
  challenge?: LocaleField
  solution?: LocaleField
  results?: LocaleField
  features?: LocaleField[]
  heroImage?: Img
  clientLogo?: Img
  gallery?: Img[]
  caseStudySlug?: string
  services?: { title?: LocaleField; slug?: string }[]
  seo?: { metaTitle?: LocaleField; metaDescription?: LocaleField; ogImage?: Img }
  _updatedAt?: string
}

type Labels = Record<string, LocaleField>

const PROJECT_QUERY = `*[_type == "webProject" && slug.current == $slug][0]{
  _id, _updatedAt, title, clientName, websiteUrl, category, projectType, year, technologies,
  summary, overview, challenge, solution, results, features,
  heroImage{ asset->{url}, alt }, clientLogo{ asset->{url} }, gallery[]{ asset->{url}, alt },
  "caseStudySlug": relatedCaseStudy->slug.current,
  "services": relatedServices[]->{ title, "slug": slug.current },
  seo{ metaTitle, metaDescription, ogImage{ asset->{url} } }
}`

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()
  const p = await client.fetch<WebProject | null>(PROJECT_QUERY, { slug })
  if (!p) return {}
  const title = localize(p.seo?.metaTitle, locale) || localize(p.title, locale)
  const description = localize(p.seo?.metaDescription, locale) || localize(p.summary, locale) || localize(p.overview, locale)
  const img = p.seo?.ogImage?.asset?.url || p.heroImage?.asset?.url
  return {
    title: brandTitle(title), description,
    openGraph: await pageOpenGraph(`/portfolio/${slug}`, { title, description, images: img ? [img] : [] }),
    alternates: await pageAlternates(`/portfolio/${slug}`),
  }
}

export default async function WebProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()
  const L = (f: LocaleField) => localize(f, locale)

  const { project: p, labels, more } = await client.fetch<{
    project: WebProject | null
    labels: Labels | null
    more: { title?: LocaleField; slug?: string; category?: LocaleField; heroImage?: Img }[]
  }>(`{
    "project": ${PROJECT_QUERY},
    "labels": *[_type == "portfolioPage"][0]{
      eyebrow, backText, visitSiteText, clientLabel, industryLabel, typeLabel, yearLabel, techLabel,
      overviewLabel, challengeLabel, solutionLabel, resultsLabel, featuresLabel, caseStudyText, relatedServiceText,
      moreProjectsTitle, ctaTitle, ctaText, ctaButtonText, ctaButtonLink
    },
    "more": *[_type == "webProject" && defined(slug.current) && slug.current != $slug]
      | order(coalesce(order, 999) asc, _createdAt desc)[0...3]{
        title, "slug": slug.current, category, heroImage{ asset->{url}, alt }
      }
  }`, { slug })

  if (!p) notFound()

  const ar = locale === 'ar'
  const lb = (k: string, en: string, arText: string) => L(labels?.[k]) || (ar ? arText : en)

  const title = L(p.title)
  const clientName = L(p.clientName)
  const category = L(p.category)
  const projectType = L(p.projectType)
  const sections = [
    { label: lb('overviewLabel', 'Overview', 'نظرة عامة'), body: L(p.overview) },
    { label: lb('challengeLabel', 'The Challenge', 'التحدي'), body: L(p.challenge) },
    { label: lb('solutionLabel', 'What We Built', 'ما الذي بنيناه'), body: L(p.solution) },
    { label: lb('resultsLabel', 'Results', 'النتائج'), body: L(p.results) },
  ].filter((s) => s.body)
  const features = (p.features || []).map(L).filter(Boolean)
  const facts = [
    { label: lb('clientLabel', 'Client', 'العميل'), value: clientName },
    { label: lb('industryLabel', 'Industry', 'القطاع'), value: category },
    { label: lb('typeLabel', 'Project Type', 'نوع المشروع'), value: projectType },
    { label: lb('yearLabel', 'Year', 'السنة'), value: p.year },
  ].filter((f) => f.value)

  const portfolioName = lb('eyebrow', 'Portfolio', 'أعمالنا')
  const crumbs = breadcrumbLd(locale, [
    { name: ar ? 'الرئيسية' : 'Home', path: '/' },
    { name: portfolioName, path: '/portfolio' },
    { name: title || slug, path: `/portfolio/${slug}` },
  ])
  const creativeWork = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: title,
    url: localeUrl(`/portfolio/${slug}`, locale),
    description: L(p.summary) || L(p.overview),
    image: p.heroImage?.asset?.url,
    inLanguage: ar ? 'ar' : 'en',
    dateModified: p._updatedAt,
    keywords: (p.technologies || []).join(', ') || undefined,
    creator: { '@type': 'Organization', name: 'M&M Marketing', url: SITE_URL },
    ...(clientName ? { sourceOrganization: { '@type': 'Organization', name: clientName, ...(p.websiteUrl ? { url: p.websiteUrl } : {}) } } : {}),
    ...(p.websiteUrl ? { mainEntityOfPage: p.websiteUrl } : {}),
  }

  const gallery = (p.gallery || []).filter((g) => g.asset?.url)
  const goldOnLight = 'text-[#8A6A22]' // brand gold darkened for readable contrast on white

  return (
    <PageLayout>
      <JsonLd data={crumbs} />
      <JsonLd data={creativeWork} />

      {/* ── HERO (navy) ───────────────────────────────────────────── */}
      <section className="relative px-6 pt-36 md:pt-40 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(223,186,103,0.16),transparent_35%)]" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <Link href={localizePath('/portfolio', locale)} className="text-[#DFBA67] font-bold inline-block mb-8">
            {lb('backText', '← Back to Portfolio', '→ العودة إلى أعمالنا')}
          </Link>
          <p className="text-[#DFBA67] uppercase tracking-widest text-sm mb-4">
            {[category, projectType].filter(Boolean).join(' · ') || portfolioName}
          </p>
          <h1 className="text-4xl md:text-7xl font-bold leading-[1.05] max-w-5xl mb-6">{title}</h1>
          {L(p.summary) && <p className="text-lg md:text-xl text-[#C9D1DC] max-w-3xl leading-relaxed mb-8">{L(p.summary)}</p>}
          {p.websiteUrl && (
            <a
              href={p.websiteUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center min-h-12 bg-[#DFBA67] text-[#0E1635] px-8 rounded-full font-bold hover:scale-[1.03] transition-all duration-300"
            >
              {lb('visitSiteText', 'Visit Website ↗', 'زيارة الموقع ↗')}
            </a>
          )}
        </div>

        {p.heroImage?.asset?.url && (
          <div className="relative z-10 max-w-7xl mx-auto mt-12">
            <div className="relative rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/10 aspect-[16/10]">
              <Image
                src={p.heroImage.asset.url}
                alt={L(p.heroImage.alt) || title}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1200px"
                className="object-cover object-top"
              />
            </div>
          </div>
        )}

        {/* One compact facts card */}
        {(facts.length > 0 || (p.technologies?.length ?? 0) > 0) && (
          <div className="relative z-10 max-w-7xl mx-auto mt-8">
            <div className="rounded-2xl md:rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
              {facts.length > 0 && (
                <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6">
                  {facts.map((f) => (
                    <div key={f.label}>
                      <dt className="text-[#DFBA67] uppercase tracking-widest text-xs mb-1.5">{f.label}</dt>
                      <dd className="font-bold text-base md:text-lg leading-snug">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {p.technologies && p.technologies.length > 0 && (
                <div className={facts.length > 0 ? 'mt-6 pt-6 border-t border-white/10' : ''}>
                  <p className="text-[#DFBA67] uppercase tracking-widest text-xs mb-3">{lb('techLabel', 'Technologies', 'التقنيات')}</p>
                  <ul className="flex flex-wrap gap-2">
                    {p.technologies.map((t) => (
                      <li key={t} className="px-3.5 py-1.5 rounded-full bg-white/10 text-sm">{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── STORY (white) ─────────────────────────────────────────── */}
      {(sections.length > 0 || features.length > 0 || p.caseStudySlug || p.services?.[0]?.slug) && (
        <section className="bg-white text-[#0E1635] px-6 py-20 md:py-28">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-7 space-y-10">
              {sections.map((s) => (
                <div key={s.label}>
                  <h2 className={`${goldOnLight} uppercase tracking-widest text-sm font-bold mb-3`}>{s.label}</h2>
                  <p className="text-[#334155] text-lg leading-relaxed whitespace-pre-line">{s.body}</p>
                </div>
              ))}
              {(p.caseStudySlug || p.services?.[0]?.slug) && (
                <div className="flex flex-col gap-3 pt-2">
                  {p.caseStudySlug && (
                    <Link href={localizePath(`/case-studies/${p.caseStudySlug}`, locale)} className="font-bold text-[#0E1635] underline decoration-[#DFBA67] decoration-2 underline-offset-4 hover:text-[#8A6A22]">
                      {lb('caseStudyText', 'Read the full case study →', 'اقرأ دراسة الحالة كاملة ←')}
                    </Link>
                  )}
                  {p.services?.[0]?.slug && (
                    <Link href={localizePath(`/services/${p.services[0].slug}`, locale)} className="font-bold text-[#0E1635] underline decoration-[#DFBA67] decoration-2 underline-offset-4 hover:text-[#8A6A22]">
                      {L(labels?.relatedServiceText) || L(p.services[0].title)}
                    </Link>
                  )}
                </div>
              )}
            </div>

            {features.length > 0 && (
              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-28 rounded-2xl border border-slate-200 p-7 md:p-8">
                  <h2 className="text-2xl font-bold mb-6">{lb('featuresLabel', 'Key Features', 'أبرز المزايا')}</h2>
                  <ul className="space-y-4">
                    {features.map((f) => (
                      <li key={f} className="flex gap-3 items-start">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#DFBA67] text-[#0E1635] text-sm font-bold" aria-hidden>✓</span>
                        <span className="text-[#334155] leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── GALLERY (light grey) ──────────────────────────────────── */}
      {gallery.length > 0 && (
        <section className="bg-[#F3F5F8] px-6 py-20 md:py-28">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6 md:gap-8">
            {gallery.map((g, i) => (
              <div
                key={i}
                className={`relative aspect-[16/10] rounded-2xl overflow-hidden bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5 ${
                  gallery.length % 2 === 1 && i === 0 ? 'md:col-span-2' : ''
                }`}
              >
                <Image
                  src={g.asset!.url!}
                  alt={L(g.alt) || title}
                  fill
                  sizes={gallery.length % 2 === 1 && i === 0 ? '(max-width: 1280px) 100vw, 1200px' : '(max-width: 768px) 100vw, 50vw'}
                  className="object-cover object-top"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── MORE PROJECTS (navy) ──────────────────────────────────── */}
      {more.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-20 md:py-24">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">{lb('moreProjectsTitle', 'More projects', 'مشاريع أخرى')}</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {more.map((m) => (
              <Link key={m.slug} href={localizePath(`/portfolio/${m.slug}`, locale)} className="group block">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-white/10 ring-1 ring-white/10">
                  {m.heroImage?.asset?.url && (
                    <Image src={m.heroImage.asset.url} alt={L(m.heroImage.alt) || L(m.title)} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover object-top group-hover:scale-105 transition duration-700" />
                  )}
                </div>
                <p className="text-[#DFBA67] uppercase tracking-widest text-xs mt-4 mb-1">{L(m.category)}</p>
                <h3 className="text-xl font-bold group-hover:text-[#DFBA67] transition-colors">{L(m.title)}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA (gold) ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-[#DFBA67] text-[#0E1635] rounded-[2rem] p-10 md:p-16 text-center shadow-2xl shadow-black/20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">{lb('ctaTitle', 'Want a website like this?', 'تريد موقعاً مثل هذا؟')}</h2>
          {L(labels?.ctaText) && <p className="text-lg text-[#0E1635]/80 max-w-3xl mx-auto mb-8">{L(labels?.ctaText)}</p>}
          <a
            href={localizePath((labels?.ctaButtonLink as string) || '/get-strategy', locale)}
            className="inline-flex items-center min-h-12 bg-[#0E1635] text-white px-10 rounded-full font-bold hover:scale-[1.03] transition-all duration-300"
          >
            {lb('ctaButtonText', 'Get Free Consultation', 'احصل على استشارة مجانية')}
          </a>
        </div>
      </section>
    </PageLayout>
  )
}
