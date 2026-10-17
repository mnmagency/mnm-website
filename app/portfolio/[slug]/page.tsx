/**
 * /portfolio/{slug} — one indexable page per website we built.
 *
 * Content: `webProject` document. Labels/CTA: `portfolioPage` singleton.
 */
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { pageAlternates, pageOpenGraph, breadcrumbLd, localeUrl, SITE_URL } from '@/lib/seo'
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
    title, description,
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

  return (
    <PageLayout>
      <JsonLd data={crumbs} />
      <JsonLd data={creativeWork} />

      <section className="relative px-6 pt-40 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(223,186,103,0.16),transparent_35%)]" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <Link href={localizePath('/portfolio', locale)} className="text-[#DFBA67] font-bold inline-block mb-10">
            {lb('backText', '← Back to Portfolio', '→ العودة إلى أعمالنا')}
          </Link>
          <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
            {[category, projectType].filter(Boolean).join(' · ') || portfolioName}
          </p>
          <h1 className="text-4xl md:text-7xl font-bold leading-tight max-w-5xl mb-6">{title}</h1>
          {L(p.summary) && <p className="text-lg md:text-xl text-[#8A95A5] max-w-3xl leading-relaxed mb-8">{L(p.summary)}</p>}
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
      </section>

      {p.heroImage?.asset?.url && (
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/30 aspect-[16/9]">
            <Image
              src={p.heroImage.asset.url}
              alt={L(p.heroImage.alt) || title}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="object-cover object-top"
            />
          </div>
        </section>
      )}

      {(facts.length > 0 || (p.technologies?.length ?? 0) > 0) && (
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {facts.map((f) => (
              <div key={f.label} className="bg-white/[0.06] border border-white/10 rounded-3xl p-7">
                <p className="text-[#DFBA67] uppercase tracking-widest text-xs mb-3">{f.label}</p>
                <p className="text-xl font-bold">{f.value}</p>
              </div>
            ))}
          </div>
          {p.technologies && p.technologies.length > 0 && (
            <div className="mt-6 bg-white/[0.06] border border-white/10 rounded-3xl p-7">
              <p className="text-[#DFBA67] uppercase tracking-widest text-xs mb-4">{lb('techLabel', 'Technologies', 'التقنيات')}</p>
              <ul className="flex flex-wrap gap-2">
                {p.technologies.map((t) => (
                  <li key={t} className="px-4 py-2 rounded-full bg-white/10 text-sm font-medium">{t}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {sections.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid lg:grid-cols-2 gap-8">
            {sections.map((s) => (
              <div key={s.label} className="bg-white/[0.06] border border-white/10 rounded-3xl p-8">
                <h2 className="text-[#DFBA67] uppercase tracking-widest text-sm font-bold mb-4">{s.label}</h2>
                <p className="text-[#C9D1DC] leading-relaxed whitespace-pre-line">{s.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {features.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">{lb('featuresLabel', 'Key Features', 'أبرز المزايا')}</h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <li key={f} className="flex gap-3 bg-white/[0.06] border border-white/10 rounded-2xl p-5">
                <span className="text-[#DFBA67] font-bold" aria-hidden>✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {p.gallery && p.gallery.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-2 gap-6">
            {p.gallery.filter((g) => g.asset?.url).map((g, i) => (
              <div key={i} className="relative aspect-[16/10] rounded-3xl overflow-hidden border border-white/10">
                <Image src={g.asset!.url!} alt={L(g.alt) || title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-top" />
              </div>
            ))}
          </div>
        </section>
      )}

      {(p.caseStudySlug || p.services?.[0]?.slug) && (
        <section className="max-w-7xl mx-auto px-6 pb-20 flex flex-col gap-4">
          {p.caseStudySlug && (
            <Link href={localizePath(`/case-studies/${p.caseStudySlug}`, locale)} className="text-[#DFBA67] font-bold text-lg">
              {lb('caseStudyText', 'Read the full case study →', 'اقرأ دراسة الحالة كاملة ←')}
            </Link>
          )}
          {p.services?.[0]?.slug && (
            <Link href={localizePath(`/services/${p.services[0].slug}`, locale)} className="text-[#DFBA67] font-bold text-lg">
              {L(labels?.relatedServiceText) || L(p.services[0].title)}
            </Link>
          )}
        </section>
      )}

      {more.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">{lb('moreProjectsTitle', 'More projects', 'مشاريع أخرى')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {more.map((m) => (
              <Link key={m.slug} href={localizePath(`/portfolio/${m.slug}`, locale)} className="group rounded-3xl overflow-hidden bg-white/[0.06] border border-white/10">
                <div className="relative aspect-[16/10] bg-white/10 overflow-hidden">
                  {m.heroImage?.asset?.url && (
                    <Image src={m.heroImage.asset.url} alt={L(m.heroImage.alt) || L(m.title)} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover object-top group-hover:scale-105 transition duration-700" />
                  )}
                </div>
                <div className="p-6">
                  <p className="text-[#DFBA67] uppercase tracking-widest text-xs mb-2">{L(m.category)}</p>
                  <h3 className="text-xl font-bold">{L(m.title)}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

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
