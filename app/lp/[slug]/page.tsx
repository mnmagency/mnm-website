/**
 * Campaign Landing Pages: /lp/{slug}
 *
 * Conversion and AI-search focused pages driven by the `landingPage` schema.
 * Every campaign LP shares this template; sections render only when filled,
 * so older pages keep working while newer ones use the full structure:
 *
 *   navy hero (showcase / image / video)  →  authority logos  →  problem as a
 *   question  →  solution as the answer  →  outcomes  →  value figures (cited)
 *   →  projects  →  process  →  ways to work (prices optional)  →  offer
 *   →  FAQ  →  form + human support  →  final CTA,  plus a mobile sticky CTA
 *   and an optional exit-intent offer.
 *
 * JSON-LD: Service, FAQPage and BreadcrumbList, server-rendered.
 * The form is pre-tagged with `serviceTag` (or the offer tag) so leads arrive
 * attributed to the campaign.
 */

import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { pageAlternates, pageOpenGraph } from '@/lib/seo'
import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'
import JsonLd from '@/app/components/JsonLd'
import LpForm from '@/app/components/LpForm'
import LpShowcase, { type ShowcaseSlide } from '@/app/components/LpShowcase'
import LpOfferButton from '@/app/components/LpOfferButton'
import ExitIntentOffer from '@/app/components/ExitIntentOffer'
import LpStickyCta from '@/app/components/LpStickyCta'
import { localize, localizePath } from '@/lib/locale'
import { getLocale } from '@/lib/locale-server'

export const revalidate = 60

const SITE = 'https://mnmagency.com'

// ──────────────────────────────────────────────────────────────────────
// Types (loose: Sanity returns localized objects we hand to `localize()`)
// ──────────────────────────────────────────────────────────────────────

type LocaleField = { en?: string; ar?: string } | string | null | undefined
type ImageRef = {
  asset?: { url?: string; metadata?: { dimensions?: { width?: number; height?: number } } }
  alt?: LocaleField
  caption?: LocaleField
}
type TitledItem = { title?: LocaleField; description?: LocaleField }
type Answer = {
  eyebrow?: LocaleField
  question?: LocaleField
  answer?: LocaleField
  points?: LocaleField[]
  image?: ImageRef
}
type WebProject = {
  _id?: string
  slug?: string
  title?: LocaleField
  clientName?: LocaleField
  category?: LocaleField
  summary?: LocaleField
  websiteUrl?: string
  technologies?: string[]
  heroImage?: ImageRef
}

type LandingPage = {
  seo?: {
    metaTitle?: LocaleField
    metaDescription?: LocaleField
    ogImage?: ImageRef
  }
  slug?: { current?: string }
  serviceTag?: string
  hero?: {
    eyebrow?: LocaleField
    title?: LocaleField
    subtitle?: LocaleField
    image?: ImageRef
    ctaText?: LocaleField
    trustNote?: LocaleField
    secondaryText?: LocaleField
    showcase?: boolean
    backgroundImage?: ImageRef
    backgroundVideo?: { asset?: { url?: string } }
    stats?: Array<{ value?: LocaleField; label?: LocaleField }>
  }
  authority?: {
    title?: LocaleField
    useHomepageLogos?: boolean
    logos?: Array<{ name?: LocaleField; logo?: ImageRef }>
    badges?: LocaleField[]
  }
  problem?: Answer
  solution?: Answer
  pains?: { eyebrow?: LocaleField; title?: LocaleField; subtitle?: LocaleField; items?: TitledItem[] }
  includes?: { eyebrow?: LocaleField; title?: LocaleField; subtitle?: LocaleField; items?: TitledItem[] }
  value?: {
    eyebrow?: LocaleField
    title?: LocaleField
    subtitle?: LocaleField
    items?: Array<{ value?: LocaleField; label?: LocaleField; source?: LocaleField; sourceUrl?: string }>
  }
  featuredWebProjects?: WebProject[]
  projectsSection?: {
    eyebrow?: LocaleField
    title?: LocaleField
    subtitle?: LocaleField
    linkText?: LocaleField
    allText?: LocaleField
  }
  process?: { eyebrow?: LocaleField; title?: LocaleField; steps?: TitledItem[] }
  proof?: {
    eyebrow?: LocaleField
    title?: LocaleField
    testimonials?: Array<{ quote?: LocaleField; author?: string; role?: LocaleField }>
  }
  featuredCaseStudies?: Array<{
    _id?: string
    slug?: { current?: string }
    title?: LocaleField
    description?: LocaleField
    industry?: LocaleField
    heroImage?: ImageRef
  }>
  pricing?: {
    show?: boolean
    eyebrow?: LocaleField
    title?: LocaleField
    subtitle?: LocaleField
    footnote?: LocaleField
    tiers?: Array<{
      name?: LocaleField
      price?: string
      period?: LocaleField
      description?: LocaleField
      features?: LocaleField[]
      ctaText?: LocaleField
      popular?: boolean
    }>
  }
  offer?: {
    show?: boolean
    eyebrow?: LocaleField
    title?: LocaleField
    text?: LocaleField
    points?: LocaleField[]
    buttonText?: LocaleField
    formTag?: string
    image?: ImageRef
    exitIntent?: boolean
    popupTitle?: LocaleField
    popupText?: LocaleField
    popupDismissText?: LocaleField
  }
  faqs?: {
    eyebrow?: LocaleField
    title?: LocaleField
    subtitle?: LocaleField
    items?: Array<{ question?: LocaleField; answer?: LocaleField }>
  }
  form?: { eyebrow?: LocaleField; title?: LocaleField; subtitle?: LocaleField; submitText?: LocaleField }
  support?: {
    title?: LocaleField
    text?: LocaleField
    whatsappText?: LocaleField
    whatsappMessage?: LocaleField
    phone?: string
    callText?: LocaleField
    email?: string
  }
  finalCta?: { eyebrow?: LocaleField; title?: LocaleField; subtitle?: LocaleField; buttonText?: LocaleField }
  stickyCta?: { show?: boolean; text?: LocaleField }
}

type Country = { flag?: string; countryName?: string; dialCode?: string; phoneLength?: number }
type StrategyFormDoc = {
  placeholders?: Record<string, LocaleField>
  services?: Array<LocaleField>
  budgetOptions?: Array<LocaleField>
  countries?: Country[]
  humanQuestion?: LocaleField
  humanAnswer?: LocaleField
  successMessage?: LocaleField
  errorMessage?: LocaleField
}
type Shared = {
  logos?: Array<{ name?: LocaleField; logo?: ImageRef }>
  whatsapp?: string
}

const IMG = `{asset->{url, metadata{dimensions}}, alt, caption}`
const ANSWER = `{ eyebrow, question, answer, points, image${IMG} }`

const LP_PROJECTION = `{
  seo{ metaTitle, metaDescription, ogImage{asset->{url}} },
  slug,
  serviceTag,
  hero{
    eyebrow, title, subtitle, ctaText, trustNote, secondaryText, showcase, stats,
    image${IMG}, backgroundImage${IMG}, backgroundVideo{asset->{url}}
  },
  authority{ title, useHomepageLogos, logos[]{name, logo${IMG}}, badges },
  problem${ANSWER},
  solution${ANSWER},
  pains{ eyebrow, title, subtitle, items[]{title, description} },
  includes{ eyebrow, title, subtitle, items[]{title, description} },
  value{ eyebrow, title, subtitle, items[]{value, label, source, sourceUrl} },
  "featuredWebProjects": featuredWebProjects[]->{
    _id, "slug": slug.current, title, clientName, category, summary, websiteUrl, technologies,
    heroImage${IMG}
  },
  projectsSection,
  process{ eyebrow, title, steps[]{title, description} },
  proof{ eyebrow, title, testimonials[]{quote, author, role} },
  "featuredCaseStudies": featuredCaseStudies[]->{
    _id, slug, title, description, industry,
    "heroImage": heroImage{asset->{url}}
  },
  pricing{ show, eyebrow, title, subtitle, footnote, tiers[]{ name, price, period, description, features, ctaText, popular } },
  offer{ show, eyebrow, title, text, points, buttonText, formTag, image${IMG}, exitIntent, popupTitle, popupText, popupDismissText },
  faqs{ eyebrow, title, subtitle, items[]{question, answer} },
  form{ eyebrow, title, subtitle, submitText },
  support,
  finalCta{ eyebrow, title, subtitle, buttonText },
  stickyCta
}`

const fetchLp = (slug: string) =>
  client.fetch<LandingPage | null>(`*[_type == "landingPage" && slug.current == $slug][0]${LP_PROJECTION}`, { slug })

// ──────────────────────────────────────────────────────────────────────
// Static params + metadata
// ──────────────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const slugs = await client.fetch<Array<{ slug: string }>>(
    `*[_type == "landingPage" && defined(slug.current)]{ "slug": slug.current }`,
  )
  return slugs.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()
  const lp = await fetchLp(slug)
  if (!lp) return {}

  const title = localize(lp.seo?.metaTitle, locale) || localize(lp.hero?.title, locale) || 'Landing Page'
  const description = localize(lp.seo?.metaDescription, locale) || localize(lp.hero?.subtitle, locale) || ''
  const ogImage =
    lp.seo?.ogImage?.asset?.url ||
    (lp.hero?.showcase ? lp.featuredWebProjects?.[0]?.heroImage?.asset?.url : undefined) ||
    lp.hero?.image?.asset?.url

  return {
    title,
    description,
    openGraph: await pageOpenGraph(`/lp/${slug}`, { title, description, images: ogImage ? [ogImage] : [] }),
    alternates: await pageAlternates(`/lp/${slug}`),
  }
}

// ──────────────────────────────────────────────────────────────────────
// Small presentational helpers
// ──────────────────────────────────────────────────────────────────────

const goldOnLight = 'text-[#8A6A22]' // brand gold darkened for contrast on white

function Eyebrow({ text, light = false, center = false }: { text?: string; light?: boolean; center?: boolean }) {
  if (!text) return null
  return (
    <p
      className={`${light ? goldOnLight : 'text-[#DFBA67]'} uppercase tracking-widest text-sm font-bold mb-3 ${
        center ? 'text-center' : ''
      }`}
    >
      {text}
    </p>
  )
}

const hostOf = (url?: string) => {
  if (!url) return undefined
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return undefined
  }
}

// ──────────────────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────────────────

export default async function LandingPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()
  const isAr = locale === 'ar'

  const [lp, formSettings, shared] = await Promise.all([
    fetchLp(slug),
    client.fetch<StrategyFormDoc | null>(`
      *[_type == "strategyForm"][0]{
        placeholders, services, budgetOptions,
        countries[]{flag, countryName, dialCode, phoneLength},
        humanQuestion, humanAnswer, successMessage, errorMessage
      }
    `),
    client.fetch<Shared | null>(`{
      "logos": *[_type == "homepage"][0].clientLogos[]{ name, logo${IMG} },
      "whatsapp": *[_type == "navigation"][0].whatsapp.defaultNumber
    }`),
  ])

  if (!lp) notFound()

  const L = (f: LocaleField) => localize(f, locale)
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const services = (formSettings?.services || []).map(L).filter(Boolean) as string[]
  const budgetOptions = (formSettings?.budgetOptions || []).map(L).filter(Boolean) as string[]
  const pageUrl = `${SITE}${localizePath(`/lp/${slug}`, locale)}`
  const ctaText = L(lp.hero?.ctaText) || t('Get Started', 'ابدأ الآن')
  const heroTitle = L(lp.hero?.title) || t('Grow your business', 'طوّر أعمالك')

  // Hero showcase slides come from the featured web projects (real work).
  const projects = (lp.featuredWebProjects || []).filter((p) => p?.slug)
  const slides: ShowcaseSlide[] = projects
    .filter((p) => p.heroImage?.asset?.url)
    .map((p) => ({
      src: p.heroImage!.asset!.url!,
      alt: L(p.heroImage?.alt) || `${L(p.title)} ${t('website', 'موقع')}`,
      label: L(p.title) || '',
      host: hostOf(p.websiteUrl),
    }))

  const logos = (lp.authority?.useHomepageLogos !== false ? shared?.logos : lp.authority?.logos) || []
  const visibleLogos = logos.filter((l) => l.logo?.asset?.url)

  const faqItems = (lp.faqs?.items || []).filter((q) => L(q.question) && L(q.answer))
  const waNumber = (lp.support?.phone || shared?.whatsapp || '').replace(/[^\d+]/g, '')
  const waLink = waNumber
    ? `https://wa.me/${waNumber.replace(/\D/g, '')}${
        L(lp.support?.whatsappMessage) ? `?text=${encodeURIComponent(L(lp.support?.whatsappMessage) || '')}` : ''
      }`
    : ''

  // ── JSON-LD ────────────────────────────────────────────────────────
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: L(lp.seo?.metaTitle) || heroTitle,
      serviceType: lp.serviceTag || heroTitle,
      description: L(lp.seo?.metaDescription) || L(lp.hero?.subtitle) || undefined,
      url: pageUrl,
      areaServed: { '@type': 'Country', name: 'Qatar' },
      availableLanguage: ['en', 'ar'],
      provider: { '@type': 'Organization', '@id': `${SITE}/#organization`, name: 'M&M Marketing', url: SITE },
      ...(projects.length > 0 && {
        subjectOf: projects.map((p) => ({
          '@type': 'CreativeWork',
          name: L(p.title),
          url: `${SITE}${localizePath(`/portfolio/${p.slug}`, locale)}`,
        })),
      }),
    },
    ...(faqItems.length > 0
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map((q) => ({
              '@type': 'Question',
              name: L(q.question),
              acceptedAnswer: { '@type': 'Answer', text: L(q.answer) },
            })),
          },
        ]
      : []),
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: t('Home', 'الرئيسية'), item: `${SITE}${localizePath('/', locale)}` },
        { '@type': 'ListItem', position: 2, name: L(lp.hero?.eyebrow) || heroTitle, item: pageUrl },
      ],
    },
  ]

  const bgImage = lp.hero?.backgroundImage?.asset?.url
  const bgVideo = lp.hero?.backgroundVideo?.asset?.url

  return (
    <PageLayout>
      <JsonLd data={jsonLd} />

      {/* ─── HERO (navy) ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pt-36 md:pt-40 pb-20 md:pb-24">
        {(bgImage || bgVideo) && (
          <div className="absolute inset-0" aria-hidden>
            {bgImage && <Image src={bgImage} alt="" fill priority sizes="100vw" className="object-cover" />}
            {bgVideo && (
              <video
                className="absolute inset-0 w-full h-full object-cover hidden md:block"
                src={bgVideo}
                poster={bgImage}
                autoPlay
                muted
                loop
                playsInline
                preload="none"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0E1635]/85 via-[#0E1635]/80 to-[#0E1635]" />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          <div className="lg:col-span-6">
            <Eyebrow text={L(lp.hero?.eyebrow)} />
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.05]">{heroTitle}</h1>
            {L(lp.hero?.subtitle) && (
              <p className="text-lg md:text-xl text-[#C9D1DC] leading-relaxed mb-8">{L(lp.hero?.subtitle)}</p>
            )}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#lp-form"
                className="inline-flex items-center min-h-14 bg-[#DFBA67] text-[#0E1635] px-8 rounded-full font-bold text-lg hover:scale-[1.03] transition-all duration-300 shadow-xl shadow-[#DFBA67]/30"
              >
                {ctaText}
              </a>
              {projects.length > 0 && (
                <a href="#lp-projects" className="font-bold text-white underline decoration-[#DFBA67] decoration-2 underline-offset-8 hover:text-[#DFBA67]">
                  {L(lp.hero?.secondaryText) || t('See our work', 'شاهد أعمالنا')}
                </a>
              )}
            </div>
            {L(lp.hero?.trustNote) && <p className="text-sm text-[#8A95A5] mt-5">{L(lp.hero?.trustNote)}</p>}

            {lp.hero?.stats && lp.hero.stats.length > 0 && (
              <dl className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-6 border-t border-white/10 pt-8">
                {lp.hero.stats.map((s, i) => (
                  <div key={i}>
                    <dt className="sr-only">{L(s.label)}</dt>
                    <dd>
                      <span className="block text-2xl md:text-3xl font-bold text-white">{L(s.value)}</span>
                      <span className="block text-sm text-[#8A95A5] mt-1">{L(s.label)}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <div className="lg:col-span-6">
            {lp.hero?.showcase && slides.length > 0 ? (
              <LpShowcase slides={slides} />
            ) : (
              lp.hero?.image?.asset?.url && (
                <figure className="space-y-3">
                  <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl shadow-black/40">
                    <Image
                      src={lp.hero.image.asset.url}
                      alt={L(lp.hero.image.alt) || heroTitle}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  {L(lp.hero.image.caption) && (
                    <figcaption className="text-xs text-[#8A95A5] text-center">{L(lp.hero.image.caption)}</figcaption>
                  )}
                </figure>
              )
            )}
          </div>
        </div>
      </section>

      {/* ─── AUTHORITY (white) ───────────────────────────────────── */}
      {(visibleLogos.length > 0 || (lp.authority?.badges?.length ?? 0) > 0) && (
        <section className="bg-white text-[#0E1635] px-6 py-14 md:py-16">
          <div className="max-w-7xl mx-auto">
            {L(lp.authority?.title) && (
              <p className="text-center text-sm uppercase tracking-widest text-[#64748B] font-bold mb-8">
                {L(lp.authority?.title)}
              </p>
            )}
            {visibleLogos.length > 0 && (
              <ul className="grid grid-cols-3 gap-x-6 gap-y-6 sm:flex sm:flex-wrap sm:justify-center sm:items-center sm:gap-x-10 sm:gap-y-8">
                {visibleLogos.map((l, i) => (
                  <li key={i} className="relative h-10 w-full sm:h-12 sm:w-28 md:h-14 md:w-32">
                    <Image
                      src={l.logo!.asset!.url!}
                      alt={L(l.name) || 'Client logo'}
                      fill
                      sizes="128px"
                      className="object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition"
                    />
                  </li>
                ))}
              </ul>
            )}
            {lp.authority?.badges && lp.authority.badges.length > 0 && (
              <ul className="mt-10 flex flex-wrap justify-center gap-3">
                {lp.authority.badges.map((b, i) =>
                  L(b) ? (
                    <li key={i} className="px-4 py-2 rounded-full bg-[#F3F5F8] text-sm font-bold text-[#0E1635]">
                      <span className={goldOnLight} aria-hidden>✓ </span>
                      {L(b)}
                    </li>
                  ) : null,
                )}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* ─── PROBLEM as a question (light grey) ─────────────────── */}
      {L(lp.problem?.question) && (
        <AnswerSection a={lp.problem!} L={L} tone="grey" imageSide="end" marker="cross" />
      )}

      {/* ─── Legacy pain points (older LPs) ─────────────────────── */}
      {!L(lp.problem?.question) && lp.pains?.items && lp.pains.items.length > 0 && (
        <section className="bg-[#F3F5F8] text-[#0E1635] py-20 md:py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 text-center">
              <Eyebrow text={L(lp.pains?.eyebrow)} light center />
              {L(lp.pains?.title) && <h2 className="text-3xl md:text-5xl font-bold mb-4 max-w-3xl mx-auto">{L(lp.pains?.title)}</h2>}
              {L(lp.pains?.subtitle) && <p className="text-[#475569] max-w-2xl mx-auto">{L(lp.pains?.subtitle)}</p>}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {lp.pains.items.map((p, i) => (
                <div key={i} className="bg-white rounded-2xl p-7 ring-1 ring-slate-900/5">
                  <h3 className="font-bold text-lg mb-2">{L(p.title)}</h3>
                  <p className="text-[#475569] text-sm leading-relaxed">{L(p.description)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── SOLUTION as the answer (white) ─────────────────────── */}
      {L(lp.solution?.question) && <AnswerSection a={lp.solution!} L={L} tone="white" imageSide="start" />}

      {/* ─── OUTCOMES (light grey) ──────────────────────────────── */}
      {lp.includes?.items && lp.includes.items.length > 0 && (
        <section className="bg-[#F3F5F8] text-[#0E1635] py-20 md:py-28 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 max-w-3xl">
              <Eyebrow text={L(lp.includes?.eyebrow)} light />
              {L(lp.includes?.title) && <h2 className="text-3xl md:text-5xl font-bold mb-4">{L(lp.includes?.title)}</h2>}
              {L(lp.includes?.subtitle) && <p className="text-lg text-[#475569] leading-relaxed">{L(lp.includes?.subtitle)}</p>}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lp.includes.items.map((it, i) => (
                <div key={i} className="bg-white rounded-2xl p-7 ring-1 ring-slate-900/5 shadow-sm">
                  <span className="flex w-10 h-10 mb-5 rounded-full bg-[#DFBA67] text-[#0E1635] font-bold items-center justify-center" aria-hidden>
                    ✓
                  </span>
                  <h3 className="font-bold text-lg mb-2">{L(it.title)}</h3>
                  <p className="text-[#475569] leading-relaxed">{L(it.description)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── VALUE figures (navy) ───────────────────────────────── */}
      {lp.value?.items && lp.value.items.length > 0 && (
        <section className="px-6 py-20 md:py-28">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 max-w-3xl">
              <Eyebrow text={L(lp.value?.eyebrow)} />
              {L(lp.value?.title) && <h2 className="text-3xl md:text-5xl font-bold mb-4">{L(lp.value?.title)}</h2>}
              {L(lp.value?.subtitle) && <p className="text-lg text-[#C9D1DC] leading-relaxed">{L(lp.value?.subtitle)}</p>}
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {lp.value.items.map((v, i) => (
                <figure key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 flex flex-col">
                  <p className="text-5xl md:text-6xl font-bold text-[#DFBA67] mb-4">{L(v.value)}</p>
                  <blockquote className="text-[#D6D8E0] leading-relaxed mb-6">{L(v.label)}</blockquote>
                  {L(v.source) && (
                    <figcaption className="mt-auto text-xs uppercase tracking-widest text-[#8A95A5]">
                      {t('Source', 'المصدر')}:{' '}
                      {v.sourceUrl ? (
                        <a href={v.sourceUrl} target="_blank" rel="noopener" className="underline underline-offset-4 hover:text-white">
                          <cite className="not-italic">{L(v.source)}</cite>
                        </a>
                      ) : (
                        <cite className="not-italic">{L(v.source)}</cite>
                      )}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── PROJECTS (white) ───────────────────────────────────── */}
      {projects.length > 0 && (
        <section id="lp-projects" className="bg-white text-[#0E1635] px-6 py-20 md:py-28 scroll-mt-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
              <div className="max-w-3xl">
                <Eyebrow text={L(lp.projectsSection?.eyebrow)} light />
                {L(lp.projectsSection?.title) && <h2 className="text-3xl md:text-5xl font-bold mb-4">{L(lp.projectsSection?.title)}</h2>}
                {L(lp.projectsSection?.subtitle) && <p className="text-lg text-[#475569] leading-relaxed">{L(lp.projectsSection?.subtitle)}</p>}
              </div>
              <Link
                href={localizePath('/portfolio', locale)}
                className="shrink-0 font-bold text-[#0E1635] underline decoration-[#DFBA67] decoration-2 underline-offset-8 hover:text-[#8A6A22]"
              >
                {L(lp.projectsSection?.allText) || t('View full portfolio', 'عرض كل الأعمال')}
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {projects.map((p) => (
                <article key={p._id} className="group rounded-2xl overflow-hidden ring-1 ring-slate-900/10 bg-white shadow-sm hover:shadow-xl transition">
                  <Link href={localizePath(`/portfolio/${p.slug}`, locale)} className="block">
                    {p.heroImage?.asset?.url && (
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#F3F5F8]">
                        <Image
                          src={p.heroImage.asset.url}
                          alt={L(p.heroImage.alt) || L(p.title) || ''}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover object-top group-hover:scale-[1.03] transition duration-700"
                        />
                      </div>
                    )}
                    <div className="p-7">
                      <p className={`${goldOnLight} text-xs uppercase tracking-widest font-bold mb-2`}>
                        {[L(p.category), L(p.clientName)].filter(Boolean).join(' · ')}
                      </p>
                      <h3 className="text-2xl font-bold mb-3">{L(p.title)}</h3>
                      {L(p.summary) && <p className="text-[#475569] leading-relaxed mb-4">{L(p.summary)}</p>}
                      {p.technologies && p.technologies.length > 0 && (
                        <ul className="flex flex-wrap gap-2 mb-5" dir="ltr">
                          {p.technologies.slice(0, 4).map((tech) => (
                            <li key={tech} className="px-3 py-1 rounded-full bg-[#F3F5F8] text-xs font-bold text-[#334155]">
                              {tech}
                            </li>
                          ))}
                        </ul>
                      )}
                      <span className="font-bold underline decoration-[#DFBA67] decoration-2 underline-offset-4">
                        {L(lp.projectsSection?.linkText) || t('See the project →', 'شاهد المشروع ←')}
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {/* Real testimonials, only when provided */}
            {lp.proof?.testimonials && lp.proof.testimonials.length > 0 && (
              <div className="mt-16">
                {L(lp.proof?.title) && <h3 className="text-2xl md:text-3xl font-bold mb-8">{L(lp.proof?.title)}</h3>}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lp.proof.testimonials.map((q, i) => (
                    <figure key={i} className="rounded-2xl bg-[#F3F5F8] p-7 flex flex-col gap-5">
                      <blockquote className="text-lg leading-relaxed">&ldquo;{L(q.quote)}&rdquo;</blockquote>
                      <figcaption className="mt-auto pt-4 border-t border-slate-900/10">
                        <p className="font-bold">{q.author}</p>
                        {L(q.role) && <p className="text-sm text-[#64748B]">{L(q.role)}</p>}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Case studies (older LPs or extra proof) */}
      {lp.featuredCaseStudies && lp.featuredCaseStudies.length > 0 && (
        <section className="bg-white text-[#0E1635] px-6 pb-20 md:pb-28">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lp.featuredCaseStudies.map((c) =>
              c.slug?.current ? (
                <Link
                  key={c._id}
                  href={localizePath(`/case-studies/${c.slug.current}`, locale)}
                  className="group rounded-2xl overflow-hidden ring-1 ring-slate-900/10 hover:shadow-xl transition"
                >
                  {c.heroImage?.asset?.url && (
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image src={c.heroImage.asset.url} alt={L(c.title) || ''} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  )}
                  <div className="p-6">
                    {L(c.industry) && <p className={`${goldOnLight} text-xs uppercase tracking-widest mb-2`}>{L(c.industry)}</p>}
                    <h3 className="font-bold text-xl mb-2">{L(c.title)}</h3>
                    {L(c.description) && <p className="text-[#475569] text-sm line-clamp-2">{L(c.description)}</p>}
                  </div>
                </Link>
              ) : null,
            )}
          </div>
        </section>
      )}

      {/* ─── PROCESS (light grey) ───────────────────────────────── */}
      {lp.process?.steps && lp.process.steps.length > 0 && (
        <section className="bg-[#F3F5F8] text-[#0E1635] py-20 md:py-28 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 max-w-3xl">
              <Eyebrow text={L(lp.process?.eyebrow)} light />
              {L(lp.process?.title) && <h2 className="text-3xl md:text-5xl font-bold">{L(lp.process?.title)}</h2>}
            </div>
            <ol className={`grid md:grid-cols-2 ${lp.process.steps.length > 4 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}>
              {lp.process.steps.map((step, i) => (
                <li key={i} className="bg-white rounded-2xl p-7 ring-1 ring-slate-900/5">
                  <span className="block text-5xl font-bold text-[#DFBA67] mb-3" aria-hidden>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-bold text-lg mb-2">{L(step.title)}</h3>
                  <p className="text-[#475569] leading-relaxed">{L(step.description)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ─── WAYS TO WORK / PRICING (white) ─────────────────────── */}
      {lp.pricing?.show && lp.pricing?.tiers && lp.pricing.tiers.length > 0 && (
        <section className="bg-white text-[#0E1635] py-20 md:py-28 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 text-center">
              <Eyebrow text={L(lp.pricing?.eyebrow)} light center />
              {L(lp.pricing?.title) && <h2 className="text-3xl md:text-5xl font-bold mb-4 max-w-3xl mx-auto">{L(lp.pricing?.title)}</h2>}
              {L(lp.pricing?.subtitle) && <p className="text-lg text-[#475569] max-w-2xl mx-auto">{L(lp.pricing?.subtitle)}</p>}
            </div>
            <div className={`grid gap-6 ${lp.pricing.tiers.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'}`}>
              {lp.pricing.tiers.map((tier, i) => (
                <div
                  key={i}
                  className={`relative rounded-3xl p-8 flex flex-col ${
                    tier.popular ? 'bg-[#0E1635] text-white shadow-2xl shadow-slate-900/30' : 'bg-[#F3F5F8]'
                  }`}
                >
                  {tier.popular && (
                    <span className="absolute -top-3 start-8 bg-[#DFBA67] text-[#0E1635] px-3 py-1 rounded-full text-xs font-bold uppercase">
                      {t('Most chosen', 'الأكثر طلباً')}
                    </span>
                  )}
                  <h3 className="font-bold text-2xl mb-2">{L(tier.name)}</h3>
                  {L(tier.description) && (
                    <p className={`${tier.popular ? 'text-[#C9D1DC]' : 'text-[#475569]'} mb-6 leading-relaxed`}>{L(tier.description)}</p>
                  )}
                  {tier.price && (
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      {L(tier.period) && <span className="opacity-70">{L(tier.period)}</span>}
                    </div>
                  )}
                  <ul className="space-y-3 mb-8">
                    {(tier.features || []).map((f, fi) => (
                      <li key={fi} className="flex items-start gap-3">
                        <span className={tier.popular ? 'text-[#DFBA67]' : goldOnLight} aria-hidden>✓</span>
                        <span className={tier.popular ? 'text-[#D6D8E0]' : 'text-[#334155]'}>{L(f)}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#lp-form"
                    className={`mt-auto block text-center rounded-full font-bold py-3.5 px-6 transition ${
                      tier.popular ? 'bg-[#DFBA67] text-[#0E1635] hover:scale-[1.02]' : 'bg-[#0E1635] text-white hover:bg-[#DFBA67] hover:text-[#0E1635]'
                    }`}
                  >
                    {L(tier.ctaText) || ctaText}
                  </a>
                </div>
              ))}
            </div>
            {L(lp.pricing?.footnote) && <p className="text-center text-[#64748B] mt-8 max-w-2xl mx-auto">{L(lp.pricing?.footnote)}</p>}
          </div>
        </section>
      )}

      {/* ─── OFFER / lead magnet (navy card) ────────────────────── */}
      {lp.offer?.show && L(lp.offer?.title) && (
        <section className="px-6 py-20 md:py-24">
          <div className="max-w-7xl mx-auto rounded-[2rem] overflow-hidden border border-white/10 bg-white/[0.04] grid lg:grid-cols-2">
            <div className="p-8 md:p-12 lg:p-14">
              <Eyebrow text={L(lp.offer?.eyebrow)} />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{L(lp.offer?.title)}</h2>
              {L(lp.offer?.text) && <p className="text-lg text-[#C9D1DC] leading-relaxed mb-6">{L(lp.offer?.text)}</p>}
              {lp.offer?.points && lp.offer.points.length > 0 && (
                <ul className="space-y-3 mb-8">
                  {lp.offer.points.map((pt, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-[#DFBA67]" aria-hidden>✓</span>
                      <span className="text-[#D6D8E0]">{L(pt)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <LpOfferButton
                tag={lp.offer?.formTag}
                className="inline-flex items-center min-h-14 bg-[#DFBA67] text-[#0E1635] px-8 rounded-full font-bold text-lg hover:scale-[1.03] transition-all duration-300"
              >
                {L(lp.offer?.buttonText) || ctaText}
              </LpOfferButton>
            </div>
            {lp.offer?.image?.asset?.url && (
              <div className="relative min-h-[280px]">
                <Image
                  src={lp.offer.image.asset.url}
                  alt={L(lp.offer.image.alt) || L(lp.offer?.title) || ''}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── FAQ (light grey) ───────────────────────────────────── */}
      {faqItems.length > 0 && (
        <section className="bg-[#F3F5F8] text-[#0E1635] py-20 md:py-28 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center">
              <Eyebrow text={L(lp.faqs?.eyebrow)} light center />
              {L(lp.faqs?.title) && <h2 className="text-3xl md:text-5xl font-bold mb-4">{L(lp.faqs?.title)}</h2>}
              {L(lp.faqs?.subtitle) && <p className="text-lg text-[#475569]">{L(lp.faqs?.subtitle)}</p>}
            </div>
            <div className="space-y-3">
              {faqItems.map((q, i) => (
                <details key={i} className="bg-white rounded-2xl p-6 ring-1 ring-slate-900/5 group" open={i === 0}>
                  <summary className="flex justify-between items-center gap-4 cursor-pointer font-bold text-lg list-none">
                    <h3>{L(q.question)}</h3>
                    <span className={`${goldOnLight} text-2xl group-open:rotate-45 transition-transform`} aria-hidden>+</span>
                  </summary>
                  <p className="mt-4 text-[#475569] leading-relaxed whitespace-pre-line">{L(q.answer)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── FORM + HUMAN SUPPORT (white) ───────────────────────── */}
      <section id="lp-form" className="bg-white text-[#0E1635] py-20 md:py-28 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <Eyebrow text={L(lp.form?.eyebrow)} light />
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-[1.05]">
              {L(lp.form?.title) || L(lp.finalCta?.title) || t('Book your consultation', 'احجز استشارتك الآن')}
            </h2>
            {L(lp.form?.subtitle) && <p className="text-lg text-[#475569] leading-relaxed">{L(lp.form?.subtitle)}</p>}

            {(L(lp.support?.title) || waLink) && (
              <div className="mt-10 rounded-2xl bg-[#F3F5F8] p-7">
                {L(lp.support?.title) && <h3 className="text-xl font-bold mb-2">{L(lp.support?.title)}</h3>}
                {L(lp.support?.text) && <p className="text-[#475569] leading-relaxed mb-5">{L(lp.support?.text)}</p>}
                <div className="flex flex-wrap gap-3">
                  {waLink && (
                    <a href={waLink} target="_blank" rel="noopener" className="inline-flex items-center min-h-12 px-6 rounded-full bg-[#25D366] text-white font-bold hover:opacity-90">
                      {L(lp.support?.whatsappText) || 'WhatsApp'}
                    </a>
                  )}
                  {waNumber && L(lp.support?.callText) && (
                    <a href={`tel:${waNumber}`} className="inline-flex items-center min-h-12 px-6 rounded-full bg-[#0E1635] text-white font-bold hover:bg-[#DFBA67] hover:text-[#0E1635]">
                      {L(lp.support?.callText)}
                    </a>
                  )}
                  {lp.support?.email && (
                    <a href={`mailto:${lp.support.email}`} className="inline-flex items-center min-h-12 px-2 font-bold underline decoration-[#DFBA67] decoration-2 underline-offset-4" dir="ltr">
                      {lp.support.email}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 rounded-[2rem] bg-white ring-1 ring-slate-900/10 p-6 md:p-10 shadow-xl shadow-slate-900/5">
            <LpForm
              variant="light"
              tagNote={t('Request', 'الطلب')}
              countries={formSettings?.countries || []}
              humanQuestion={L(formSettings?.humanQuestion) || ''}
              humanAnswer={L(formSettings?.humanAnswer) || ''}
              placeholders={{
                name: L(formSettings?.placeholders?.name),
                email: L(formSettings?.placeholders?.email),
                country: L(formSettings?.placeholders?.country),
                phone: L(formSettings?.placeholders?.phone),
                company: L(formSettings?.placeholders?.company),
                budget: L(formSettings?.placeholders?.budget),
                message: L(formSettings?.placeholders?.message),
                service: L(formSettings?.placeholders?.service),
              }}
              services={services}
              budgetOptions={budgetOptions}
              defaultService={lp.serviceTag || ''}
              submitText={L(lp.form?.submitText) || t('Get Started', 'أرسل')}
              successMessage={L(formSettings?.successMessage) || t("Thanks, we'll be in touch shortly.", 'شكراً، سنتواصل معك قريباً.')}
              errorMessage={L(formSettings?.errorMessage) || t('Sorry, something went wrong. Please try again or email us directly.', 'عذراً، حدث خطأ. حاول مرة أخرى أو راسلنا مباشرة.')}
            />
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA (gold) ───────────────────────────────────── */}
      {(L(lp.finalCta?.title) || L(lp.finalCta?.buttonText)) && (
        <section className="bg-[#DFBA67] text-[#0E1635] py-20 px-6 pb-28 md:pb-20">
          <div className="max-w-4xl mx-auto text-center">
            {L(lp.finalCta?.eyebrow) && <p className="uppercase tracking-widest text-sm font-bold mb-3">{L(lp.finalCta?.eyebrow)}</p>}
            {L(lp.finalCta?.title) && <h2 className="text-3xl md:text-5xl font-bold mb-4">{L(lp.finalCta?.title)}</h2>}
            {L(lp.finalCta?.subtitle) && <p className="text-lg mb-8 opacity-90">{L(lp.finalCta?.subtitle)}</p>}
            <a
              href="#lp-form"
              className="inline-flex items-center min-h-14 bg-[#0E1635] text-white px-8 rounded-full font-bold text-lg hover:scale-[1.03] transition-all duration-300 shadow-xl shadow-black/30"
            >
              {L(lp.finalCta?.buttonText) || ctaText}
            </a>
          </div>
        </section>
      )}

      {/* ─── Mobile sticky CTA (after the hero, hidden at the form) ─ */}
      {lp.stickyCta?.show !== false && <LpStickyCta text={L(lp.stickyCta?.text) || ctaText} />}

      {/* ─── Exit-intent offer ──────────────────────────────────── */}
      {lp.offer?.show && lp.offer?.exitIntent && L(lp.offer?.popupTitle) && (
        <ExitIntentOffer
          storageKey={`lp-exit-${slug}`}
          title={L(lp.offer?.popupTitle) || ''}
          text={L(lp.offer?.popupText) || undefined}
          buttonText={L(lp.offer?.buttonText) || ctaText}
          dismissText={L(lp.offer?.popupDismissText) || t('No thanks', 'لا شكراً')}
          tag={lp.offer?.formTag}
        />
      )}
    </PageLayout>
  )
}

// ──────────────────────────────────────────────────────────────────────
// Problem / Solution block: question as H2, direct answer, points, image
// ──────────────────────────────────────────────────────────────────────

function AnswerSection({
  a,
  L,
  tone,
  imageSide,
  marker = 'tick',
}: {
  a: Answer
  L: (f: LocaleField) => string | undefined
  tone: 'grey' | 'white'
  imageSide: 'start' | 'end'
  marker?: 'tick' | 'cross'
}) {
  const img = a.image?.asset?.url
  return (
    <section className={`${tone === 'grey' ? 'bg-[#F3F5F8]' : 'bg-white'} text-[#0E1635] px-6 py-20 md:py-28`}>
      <div className={`max-w-7xl mx-auto grid ${img ? 'lg:grid-cols-2' : ''} gap-12 lg:gap-16 items-center`}>
        <div className={imageSide === 'start' && img ? 'lg:order-2' : ''}>
          <Eyebrow text={L(a.eyebrow)} light />
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-[1.1]">{L(a.question)}</h2>
          {L(a.answer) && <p className="text-lg md:text-xl text-[#334155] leading-relaxed whitespace-pre-line mb-6">{L(a.answer)}</p>}
          {a.points && a.points.length > 0 && (
            <ul className="space-y-3">
              {a.points.map((pt, i) =>
                L(pt) ? (
                  <li key={i} className="flex gap-3 items-start">
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        marker === 'cross' ? 'bg-[#0E1635]/10 text-[#0E1635]' : 'bg-[#DFBA67] text-[#0E1635]'
                      }`}
                      aria-hidden
                    >
                      {marker === 'cross' ? '✕' : '✓'}
                    </span>
                    <span className="text-[#334155] leading-relaxed">{L(pt)}</span>
                  </li>
                ) : null,
              )}
            </ul>
          )}
        </div>
        {img && (
          <div className={`relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-900/20 ${imageSide === 'start' ? 'lg:order-1' : ''}`}>
            <Image src={img} alt={L(a.image?.alt) || L(a.question) || ''} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
        )}
      </div>
    </section>
  )
}
