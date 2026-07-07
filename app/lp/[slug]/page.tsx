/**
 * Campaign Landing Pages — /lp/{slug}
 *
 * Conversion-focused pages driven by the `landingPage` schema in Sanity.
 * All four campaign LPs (SEO, web development, social media, bulk SMS) share
 * this template; only the content changes.
 *
 * The strategy form at the bottom is pre-tagged with `serviceTag` so leads
 * land in the same inbox as /get-strategy but pre-attributed to the campaign.
 */

import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'
import StrategyForm from '@/app/components/StrategyForm'
import { localize, localizePath } from '@/lib/locale'
import { getLocale } from '@/lib/locale-server'

export const revalidate = 60

// ──────────────────────────────────────────────────────────────────────
// Types (loose — Sanity returns localized objects we hand to `localize()`)
// ──────────────────────────────────────────────────────────────────────

type LocaleField = { en?: string; ar?: string } | string | null | undefined
type ImageRef = {
  asset?: { url?: string }
  alt?: LocaleField
  caption?: LocaleField
}

type LandingPage = {
  seo?: {
    metaTitle?: LocaleField
    metaDescription?: LocaleField
    canonicalUrl?: string
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
  }
  pains?: {
    eyebrow?: LocaleField
    title?: LocaleField
    subtitle?: LocaleField
    items?: Array<{ title?: LocaleField; description?: LocaleField }>
  }
  includes?: {
    eyebrow?: LocaleField
    title?: LocaleField
    subtitle?: LocaleField
    items?: Array<{ title?: LocaleField; description?: LocaleField }>
  }
  process?: {
    eyebrow?: LocaleField
    title?: LocaleField
    steps?: Array<{ title?: LocaleField; description?: LocaleField }>
  }
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
    client?: string
    industry?: LocaleField
    heroImage?: ImageRef
  }>
  pricing?: {
    show?: boolean
    eyebrow?: LocaleField
    title?: LocaleField
    subtitle?: LocaleField
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
  faqs?: {
    eyebrow?: LocaleField
    title?: LocaleField
    subtitle?: LocaleField
    items?: Array<{ question?: LocaleField; answer?: LocaleField }>
  }
  form?: {
    eyebrow?: LocaleField
    title?: LocaleField
    subtitle?: LocaleField
    submitText?: LocaleField
  }
  finalCta?: {
    eyebrow?: LocaleField
    title?: LocaleField
    subtitle?: LocaleField
    buttonText?: LocaleField
  }
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

// GROQ projection shared by both data fetches
const LP_PROJECTION = `{
  seo{ metaTitle, metaDescription, canonicalUrl, ogImage{asset->{url}} },
  slug,
  serviceTag,
  hero{ eyebrow, title, subtitle, image{asset->{url}, alt, caption}, ctaText, trustNote },
  pains{ eyebrow, title, subtitle, items[]{title, description} },
  includes{ eyebrow, title, subtitle, items[]{title, description} },
  process{ eyebrow, title, steps[]{title, description} },
  proof{ eyebrow, title, testimonials[]{quote, author, role} },
  "featuredCaseStudies": featuredCaseStudies[]->{
    _id, slug, title, description, client, industry,
    "heroImage": heroImage{asset->{url}}
  },
  pricing{
    show, eyebrow, title, subtitle,
    tiers[]{ name, price, period, description, features, ctaText, popular }
  },
  faqs{ eyebrow, title, subtitle, items[]{question, answer} },
  form{ eyebrow, title, subtitle, submitText },
  finalCta{ eyebrow, title, subtitle, buttonText }
}`

// ──────────────────────────────────────────────────────────────────────
// Static params for prerender (every landing page slug)
// ──────────────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const slugs = await client.fetch<Array<{ slug: string }>>(
    `*[_type == "landingPage" && defined(slug.current)]{ "slug": slug.current }`,
  )
  return slugs.map((s) => ({ slug: s.slug }))
}

// ──────────────────────────────────────────────────────────────────────
// SEO metadata
// ──────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()
  const lp = await client.fetch<LandingPage | null>(
    `*[_type == "landingPage" && slug.current == $slug][0]${LP_PROJECTION}`,
    { slug },
  )
  if (!lp) return {}

  const title = localize(lp.seo?.metaTitle, locale) || localize(lp.hero?.title, locale) || 'Landing Page'
  const description = localize(lp.seo?.metaDescription, locale) || localize(lp.hero?.subtitle, locale) || ''
  const ogImage = lp.seo?.ogImage?.asset?.url || lp.hero?.image?.asset?.url

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [ogImage] : [],
      type: 'website',
    },
    alternates: {
      canonical: lp.seo?.canonicalUrl || `https://mnmagency.com/lp/${slug}`,
      languages: {
        en: `https://mnmagency.com/lp/${slug}`,
        ar: `https://mnmagency.com/ar/lp/${slug}`,
      },
    },
  }
}

// ──────────────────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────────────────

export default async function LandingPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()

  const [lp, formSettings] = await Promise.all([
    client.fetch<LandingPage | null>(
      `*[_type == "landingPage" && slug.current == $slug][0]${LP_PROJECTION}`,
      { slug },
    ),
    client.fetch<StrategyFormDoc | null>(`
      *[_type == "strategyForm"][0]{
        placeholders, services, budgetOptions,
        countries[]{flag, countryName, dialCode, phoneLength},
        humanQuestion, humanAnswer, successMessage, errorMessage
      }
    `),
  ])

  if (!lp) notFound()

  const L = (f: LocaleField) => localize(f, locale)
  const services = (formSettings?.services || []).map(L).filter(Boolean) as string[]
  const budgetOptions = (formSettings?.budgetOptions || []).map(L).filter(Boolean) as string[]

  return (
    <PageLayout>
      {/* ─── Hero ─── */}
      <section className="px-6 pt-40 pb-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            {L(lp.hero?.eyebrow) && (
              <p className="text-[#DFBA67] uppercase tracking-widest mb-4 text-sm font-bold">
                {L(lp.hero?.eyebrow)}
              </p>
            )}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.05]">
              {L(lp.hero?.title) || 'Grow your business'}
            </h1>
            {L(lp.hero?.subtitle) && (
              <p className="text-lg text-[#8A95A5] leading-relaxed mb-8">
                {L(lp.hero?.subtitle)}
              </p>
            )}
            <a
              href="#lp-form"
              className="inline-block bg-[#DFBA67] text-[#0E1635] px-8 py-4 rounded-full font-bold text-lg hover:scale-[1.03] transition-all duration-300 shadow-xl shadow-[#DFBA67]/30"
            >
              {L(lp.hero?.ctaText) || 'Get Started'}
            </a>
            {L(lp.hero?.trustNote) && (
              <p className="text-sm text-[#8A95A5] mt-4">{L(lp.hero?.trustNote)}</p>
            )}
          </div>

          {lp.hero?.image?.asset?.url && (
            <figure className="space-y-3">
              <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl shadow-black/40">
                <Image
                  src={lp.hero.image.asset.url}
                  alt={
                    L(lp.hero.image.alt) ||
                    L(lp.hero?.title) ||
                    'M&M Marketing — marketing agency in Qatar'
                  }
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              {L(lp.hero.image.caption) && (
                <figcaption className="text-xs text-[#8A95A5] text-center">
                  {L(lp.hero.image.caption)}
                </figcaption>
              )}
            </figure>
          )}
        </div>
      </section>

      {/* ─── Pain points ─── */}
      {lp.pains?.items && lp.pains.items.length > 0 && (
        <section className="bg-white/[0.03] border-y border-white/5 py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 text-center">
              {L(lp.pains?.eyebrow) && (
                <p className="text-[#DFBA67] uppercase tracking-widest text-sm font-bold mb-3">
                  {L(lp.pains?.eyebrow)}
                </p>
              )}
              {L(lp.pains?.title) && (
                <h2 className="text-3xl md:text-5xl font-bold mb-4 max-w-3xl mx-auto">
                  {L(lp.pains?.title)}
                </h2>
              )}
              {L(lp.pains?.subtitle) && (
                <p className="text-[#8A95A5] max-w-2xl mx-auto">{L(lp.pains?.subtitle)}</p>
              )}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lp.pains.items.map((p, i) => (
                <div key={i} className="bg-[#0E1635]/40 border border-white/10 rounded-2xl p-7">
                  <h3 className="font-bold text-lg mb-2 text-white">{L(p.title)}</h3>
                  <p className="text-[#8A95A5] text-sm leading-relaxed">{L(p.description)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── What's included ─── */}
      {lp.includes?.items && lp.includes.items.length > 0 && (
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              {L(lp.includes?.eyebrow) && (
                <p className="text-[#DFBA67] uppercase tracking-widest text-sm font-bold mb-3">
                  {L(lp.includes?.eyebrow)}
                </p>
              )}
              {L(lp.includes?.title) && (
                <h2 className="text-3xl md:text-5xl font-bold mb-4 max-w-3xl">
                  {L(lp.includes?.title)}
                </h2>
              )}
              {L(lp.includes?.subtitle) && (
                <p className="text-[#8A95A5] max-w-2xl">{L(lp.includes?.subtitle)}</p>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {lp.includes.items.map((it, i) => (
                <div key={i} className="bg-white/[0.04] border border-white/10 rounded-2xl p-7 hover:bg-white/[0.06] transition">
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-10 h-10 rounded-full bg-[#DFBA67] text-[#0E1635] font-bold flex items-center justify-center">
                      ✓
                    </span>
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-white">{L(it.title)}</h3>
                      <p className="text-[#8A95A5] text-sm leading-relaxed">{L(it.description)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Process ─── */}
      {lp.process?.steps && lp.process.steps.length > 0 && (
        <section className="bg-white/[0.03] border-y border-white/5 py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              {L(lp.process?.eyebrow) && (
                <p className="text-[#DFBA67] uppercase tracking-widest text-sm font-bold mb-3">
                  {L(lp.process?.eyebrow)}
                </p>
              )}
              {L(lp.process?.title) && (
                <h2 className="text-3xl md:text-5xl font-bold max-w-3xl">{L(lp.process?.title)}</h2>
              )}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {lp.process.steps.map((step, i) => (
                <div key={i} className="relative">
                  <div className="text-6xl font-bold text-[#DFBA67]/30 mb-3">{i + 1}</div>
                  <h3 className="font-bold text-lg mb-2 text-white">{L(step.title)}</h3>
                  <p className="text-[#8A95A5] text-sm leading-relaxed">{L(step.description)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Proof / Testimonials ─── */}
      {lp.proof?.testimonials && lp.proof.testimonials.length > 0 && (
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              {L(lp.proof?.eyebrow) && (
                <p className="text-[#DFBA67] uppercase tracking-widest text-sm font-bold mb-3">
                  {L(lp.proof?.eyebrow)}
                </p>
              )}
              {L(lp.proof?.title) && (
                <h2 className="text-3xl md:text-5xl font-bold max-w-3xl">{L(lp.proof?.title)}</h2>
              )}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lp.proof.testimonials.map((t, i) => (
                <figure key={i} className="bg-white/[0.06] border border-white/10 rounded-3xl p-7 flex flex-col gap-5">
                  <blockquote className="text-[#D6D8E0] text-lg leading-relaxed">
                    &ldquo;{L(t.quote)}&rdquo;
                  </blockquote>
                  <figcaption className="flex items-center gap-4 mt-auto pt-4 border-t border-white/10">
                    <div className="w-12 h-12 rounded-full bg-[#DFBA67]/30 flex items-center justify-center text-[#DFBA67] font-bold">
                      {t.author?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-white">{t.author}</p>
                      {L(t.role) && <p className="text-sm text-[#8A95A5]">{L(t.role)}</p>}
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Featured case studies ─── */}
      {lp.featuredCaseStudies && lp.featuredCaseStudies.length > 0 && (
        <section className="bg-white/[0.03] border-y border-white/5 py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 text-center">
              <p className="text-[#DFBA67] uppercase tracking-widest text-sm font-bold mb-3">
                {locale === 'ar' ? 'دراسات الحالة' : 'Case Studies'}
              </p>
              <h2 className="text-3xl md:text-5xl font-bold max-w-3xl mx-auto">
                {locale === 'ar' ? 'نتائج حقيقية في قطر' : 'Real Results in Qatar'}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lp.featuredCaseStudies.map((c) => {
                const cSlug = c.slug?.current
                if (!cSlug) return null
                return (
                  <Link
                    key={c._id}
                    href={localizePath(`/case-studies/${cSlug}`, locale)}
                    className="group bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.08] transition"
                  >
                    {c.heroImage?.asset?.url && (
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={c.heroImage.asset.url}
                          alt={L(c.title) || 'Case study'}
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      {L(c.industry) && (
                        <p className="text-[#DFBA67] text-xs uppercase tracking-widest mb-2">{L(c.industry)}</p>
                      )}
                      <h3 className="font-bold text-xl mb-2 text-white">{L(c.title)}</h3>
                      {L(c.description) && (
                        <p className="text-[#8A95A5] text-sm line-clamp-2">{L(c.description)}</p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── Pricing (optional) ─── */}
      {lp.pricing?.show && lp.pricing?.tiers && lp.pricing.tiers.length > 0 && (
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 text-center">
              {L(lp.pricing?.eyebrow) && (
                <p className="text-[#DFBA67] uppercase tracking-widest text-sm font-bold mb-3">
                  {L(lp.pricing?.eyebrow)}
                </p>
              )}
              {L(lp.pricing?.title) && (
                <h2 className="text-3xl md:text-5xl font-bold mb-4 max-w-3xl mx-auto">{L(lp.pricing?.title)}</h2>
              )}
              {L(lp.pricing?.subtitle) && (
                <p className="text-[#8A95A5] max-w-2xl mx-auto">{L(lp.pricing?.subtitle)}</p>
              )}
            </div>
            <div className={`grid gap-6 ${lp.pricing.tiers.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
              {lp.pricing.tiers.map((tier, i) => (
                <div
                  key={i}
                  className={`relative rounded-3xl p-8 border ${tier.popular ? 'bg-[#DFBA67]/10 border-[#DFBA67]' : 'bg-white/[0.04] border-white/10'}`}
                >
                  {tier.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#DFBA67] text-[#0E1635] px-3 py-1 rounded-full text-xs font-bold uppercase">
                      {locale === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
                    </span>
                  )}
                  <h3 className="font-bold text-xl mb-2 text-white">{L(tier.name)}</h3>
                  {L(tier.description) && (
                    <p className="text-[#8A95A5] text-sm mb-4">{L(tier.description)}</p>
                  )}
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold text-white">{tier.price}</span>
                    {L(tier.period) && <span className="text-[#8A95A5]">{L(tier.period)}</span>}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {(tier.features || []).map((f, fi) => (
                      <li key={fi} className="flex items-start gap-3 text-sm text-[#D6D8E0]">
                        <span className="text-[#DFBA67] mt-0.5">✓</span>
                        <span>{L(f)}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#lp-form"
                    className={`block text-center rounded-full font-bold py-3 px-6 transition ${tier.popular ? 'bg-[#DFBA67] text-[#0E1635] hover:scale-[1.02]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    {L(tier.ctaText) || (locale === 'ar' ? 'ابدأ الآن' : 'Get Started')}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── FAQ ─── */}
      {lp.faqs?.items && lp.faqs.items.length > 0 && (
        <section className="bg-white/[0.03] border-y border-white/5 py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center">
              {L(lp.faqs?.eyebrow) && (
                <p className="text-[#DFBA67] uppercase tracking-widest text-sm font-bold mb-3">
                  {L(lp.faqs?.eyebrow)}
                </p>
              )}
              {L(lp.faqs?.title) && (
                <h2 className="text-3xl md:text-5xl font-bold mb-4">{L(lp.faqs?.title)}</h2>
              )}
              {L(lp.faqs?.subtitle) && (
                <p className="text-[#8A95A5]">{L(lp.faqs?.subtitle)}</p>
              )}
            </div>
            <div className="space-y-3">
              {lp.faqs.items.map((q, i) => (
                <details key={i} className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 group">
                  <summary className="flex justify-between items-center cursor-pointer font-bold text-white list-none">
                    <span>{L(q.question)}</span>
                    <span className="text-[#DFBA67] text-2xl group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-4 text-[#8A95A5] leading-relaxed">{L(q.answer)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Form ─── */}
      <section id="lp-form" className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <div>
            {L(lp.form?.eyebrow) && (
              <p className="text-[#DFBA67] uppercase tracking-widest mb-4 text-sm font-bold">
                {L(lp.form?.eyebrow)}
              </p>
            )}
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-[1.05]">
              {L(lp.form?.title) || L(lp.finalCta?.title) || (locale === 'ar' ? 'احجز استشارتك الآن' : 'Book Your Consultation')}
            </h2>
            {L(lp.form?.subtitle) && (
              <p className="text-lg text-[#8A95A5] leading-relaxed">{L(lp.form?.subtitle)}</p>
            )}
          </div>

          <div className="bg-white/[0.05] border border-white/10 rounded-[2rem] p-8 shadow-2xl shadow-black/20">
            <StrategyForm
              countries={formSettings?.countries || []}
              humanQuestion={L(formSettings?.humanQuestion) || ''}
              humanAnswer={L(formSettings?.humanAnswer) || ''}
              placeholders={{
                name:    L(formSettings?.placeholders?.name),
                email:   L(formSettings?.placeholders?.email),
                country: L(formSettings?.placeholders?.country),
                phone:   L(formSettings?.placeholders?.phone),
                company: L(formSettings?.placeholders?.company),
                budget:  L(formSettings?.placeholders?.budget),
                message: L(formSettings?.placeholders?.message),
                service: L(formSettings?.placeholders?.service),
              }}
              services={services}
              budgetOptions={budgetOptions}
              defaultService={lp.serviceTag || ''}
              submitText={L(lp.form?.submitText) || (locale === 'ar' ? 'أرسل' : 'Get Started')}
              successMessage={L(formSettings?.successMessage) || "Thanks — we'll be in touch shortly."}
              errorMessage={L(formSettings?.errorMessage) || 'Sorry, something went wrong. Please try again or email us directly.'}
            />
          </div>
        </div>
      </section>

      {/* ─── Final CTA banner ─── */}
      {(L(lp.finalCta?.title) || L(lp.finalCta?.buttonText)) && (
        <section className="bg-[#DFBA67] text-[#0E1635] py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            {L(lp.finalCta?.eyebrow) && (
              <p className="uppercase tracking-widest text-sm font-bold mb-3">
                {L(lp.finalCta?.eyebrow)}
              </p>
            )}
            {L(lp.finalCta?.title) && (
              <h2 className="text-3xl md:text-5xl font-bold mb-4">{L(lp.finalCta?.title)}</h2>
            )}
            {L(lp.finalCta?.subtitle) && (
              <p className="text-lg mb-8 opacity-90">{L(lp.finalCta?.subtitle)}</p>
            )}
            <a
              href="#lp-form"
              className="inline-block bg-[#0E1635] text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-[1.03] transition-all duration-300 shadow-xl shadow-black/30"
            >
              {L(lp.finalCta?.buttonText) || (locale === 'ar' ? 'ابدأ الآن' : 'Get Started')}
            </a>
          </div>
        </section>
      )}
    </PageLayout>
  )
}
