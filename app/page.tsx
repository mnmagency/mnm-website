/**
 * Homepage — Wpromote-inspired international agency layout.
 *
 * Same Sanity content fields, completely new structure & visual language:
 *   1. Bold typographic hero (no image, title is the visual)
 *   2. Recognition strip (partners / certifications)
 *   3. Three color-coded pillars (uses growthSteps from Sanity)
 *   4. Featured spotlight (big case study)
 *   5. Services grid (color-coded arrows like Wpromote)
 *   6. Stats — bold numbers with client names
 *   7. Client logo grid (static, not marquee)
 *   8. Pull-quote testimonial
 *   9. About statement
 *  10. Insights / blog row
 *  11. Final CTA with cinematic image
 *
 * Light-heavy palette with strategic dark accent sections.
 * Accent palette adds depth without changing brand colours.
 */

import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'
import ServiceIcon from '@/app/components/ServiceIcon'
import AIPlatformConstellation from '@/app/components/AIPlatformConstellation'
import FeaturedSpotlightCarousel from '@/app/components/FeaturedSpotlightCarousel'
import { localize, localizePath } from '@/lib/locale'
import { getLocale } from '@/lib/locale-server'

export const revalidate = 60

// ── Brand-only palette: NAVY + GOLD + WHITE. No other colours. ─────
const GOLD = '#DFBA67'

const ACCENTS = [
  { color: GOLD, name: 'gold' },
  { color: GOLD, name: 'gold' },
  { color: GOLD, name: 'gold' },
  { color: GOLD, name: 'gold' },
] as const

type LocaleField = { en?: string; ar?: string } | string | null | undefined
type ImageRef = { asset?: { url?: string } }
type Slug = { current?: string }

type ProofItem = { number?: string; label?: LocaleField }
type GrowthStep = { title?: LocaleField; text?: LocaleField }
type LogoItem = { name?: LocaleField; logo?: ImageRef }
type Testimonial = {
  quote?: LocaleField
  authorName?: LocaleField
  authorTitle?: LocaleField
  authorLogo?: ImageRef
}

type Homepage = {
  seo?: {
    metaTitle?: LocaleField
    metaDescription?: LocaleField
    focusKeyword?: LocaleField
    canonicalUrl?: string
    ogImage?: ImageRef
  }
  heroEyebrow?: LocaleField
  title?: LocaleField
  subtitle?: LocaleField
  heroImageAlt?: LocaleField
  buttonText?: LocaleField
  buttonLink?: string
  secondaryButtonText?: LocaleField
  secondaryButtonLink?: string
  heroMediaType?: 'image' | 'video'
  heroImage?: ImageRef
  heroVideoUrl?: string
  proofItems?: ProofItem[]
  proofEyebrow?: LocaleField
  systemEyebrow?: LocaleField
  systemTitle?: LocaleField
  growthSteps?: GrowthStep[]
  aboutLogos?: LogoItem[]
  aboutEyebrow?: LocaleField
  aboutTitle?: LocaleField
  aboutText?: LocaleField
  aboutButtonText?: LocaleField
  aboutButtonLink?: string
  aboutImage?: ImageRef
  servicesEyebrow?: LocaleField
  servicesTitle?: LocaleField
  caseStudiesEyebrow?: LocaleField
  caseStudiesTitle?: LocaleField
  caseStudiesLinkText?: LocaleField
  caseStudyCardCta?: LocaleField
  blogPill?: LocaleField
  blogTitle?: LocaleField
  blogDescription?: LocaleField
  blogLinkText?: LocaleField
  clientLogos?: LogoItem[]
  clientsBannerTitle?: LocaleField
  finalCtaTitle?: LocaleField
  finalCtaText?: LocaleField
  finalCtaButtonText?: LocaleField
  finalCtaButtonLink?: string
}

type ServiceCard = {
  title?: LocaleField
  description?: LocaleField
  slug?: Slug
  image?: ImageRef
}
type CaseStudyCard = {
  title?: LocaleField
  slug?: Slug
  category?: LocaleField
  description?: LocaleField
  results?: LocaleField
  image?: ImageRef
}
type BlogCard = {
  title?: LocaleField
  slug?: Slug
  category?: LocaleField
  excerpt?: LocaleField
  image?: ImageRef
}

export async function generateMetadata() {
  const locale = await getLocale()
  const homepage = await client.fetch<{ seo?: Homepage['seo'] } | null>(`
    *[_type == "homepage"][0]{
      seo{ metaTitle, metaDescription, canonicalUrl, ogImage{ asset->{url} } }
    }
  `)
  const seo = homepage?.seo
  const title = localize(seo?.metaTitle, locale) || 'M&M Marketing Qatar'
  const description =
    localize(seo?.metaDescription, locale) ||
    "M&M Marketing is a full-service marketing agency in Doha, Qatar — trusted by leading brands for SEO, web development, social media, branding, paid ads, and videography."
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: seo?.ogImage?.asset?.url ? [seo.ogImage.asset.url] : [],
    },
    alternates: { canonical: seo?.canonicalUrl || undefined },
  }
}

export default async function Home() {
  const locale = await getLocale()
  const data = await client.fetch<{
    homepage: Homepage | null
    services: ServiceCard[]
    caseStudies: CaseStudyCard[]
    posts: BlogCard[]
    testimonials: Testimonial[]
  }>(`
    {
      "homepage": *[_type == "homepage"][0]{
        seo{ metaTitle, metaDescription, focusKeyword, canonicalUrl, ogImage{ asset->{url} } },
        heroEyebrow, title, subtitle, heroImageAlt,
        buttonText, buttonLink, secondaryButtonText, secondaryButtonLink,
        heroMediaType, heroImage{ asset->{url} }, heroVideoUrl,
        proofItems, proofEyebrow,
        systemEyebrow, systemTitle, growthSteps,
        aboutEyebrow, aboutTitle, aboutText, aboutButtonText, aboutButtonLink,
        aboutImage{ asset->{url} },
        aboutLogos[]{ name, logo{ asset->{url} } },
        servicesEyebrow, servicesTitle,
        caseStudiesEyebrow, caseStudiesTitle, caseStudiesLinkText, caseStudyCardCta,
        blogPill, blogTitle, blogDescription, blogLinkText,
        clientsBannerTitle,
        clientLogos[]{ name, logo{ asset->{url} } },
        finalCtaTitle, finalCtaText, finalCtaButtonText, finalCtaButtonLink
      },
      "services": *[_type == "service"]{ title, description, slug, image{ asset->{url} } },
      "caseStudies": *[_type == "caseStudy"] | order(_createdAt desc)[0...6]{
        title, slug, category, description, results, image{ asset->{url} }
      },
      "posts": *[_type == "blog"] | order(publishedAt desc)[0...3]{
        title, slug, category, excerpt, image{ asset->{url} }
      },
      "testimonials": *[_type == "strategyForm"][0].testimonials[]{
        quote, authorName, authorTitle, authorLogo{ asset->{url} }
      }
    }
  `)

  const homepage = data?.homepage
  const L = (f: LocaleField) => localize(f, locale)
  const isRtl = locale === 'ar'

  // ── Fallbacks (Sanity first, hard-coded Qatar-market English second) ─────
  const heroEyebrow         = L(homepage?.heroEyebrow)         || 'Marketing Agency in Qatar'
  const heroTitle           = L(homepage?.title)               || 'Marketing Agency in Qatar That Actually Drives Results'
  const heroSubtitle        = L(homepage?.subtitle)            || "M&M Marketing is one of the best marketing agencies in Qatar — specialising in SEO, web development, social media management, branding, paid ads, and videography for brands ready to grow in Doha and across Qatar."
  const heroImageAlt        = L(homepage?.heroImageAlt)        || heroTitle
  const clientsBannerTitle  = L(homepage?.clientsBannerTitle)  || 'Trusted by leading brands across Qatar'
  const systemEyebrow       = L(homepage?.systemEyebrow)       || 'How we work'
  const systemTitle         = L(homepage?.systemTitle)         || "We don't run random campaigns. We build marketing systems that grow revenue in Qatar."
  const servicesEyebrow     = L(homepage?.servicesEyebrow)     || 'Our Marketing Services in Qatar'
  const servicesTitle       = L(homepage?.servicesTitle)       || 'Complete Marketing Services for Qatar Businesses'
  const caseStudiesEyebrow  = L(homepage?.caseStudiesEyebrow)  || 'Our Work in Qatar'
  const caseStudiesTitle    = L(homepage?.caseStudiesTitle)    || 'Real Qatar Businesses. Real Measurable Growth.'
  const caseStudiesLinkText = L(homepage?.caseStudiesLinkText) || 'View all case studies →'
  const caseStudyCardCta    = L(homepage?.caseStudyCardCta)    || 'Read Case Study →'
  // Available if we surface a blog-section eyebrow again later.
  // const blogPill         = L(homepage?.blogPill)            || 'Marketing Insights'
  const blogTitle           = L(homepage?.blogTitle)           || 'Marketing Insights for Qatar Businesses'
  // const blogDescription  = L(homepage?.blogDescription)     || "Guides, tactics, and case studies from Qatar's best marketing agency."
  const blogLinkText        = L(homepage?.blogLinkText)        || 'Read all insights →'
  const finalCtaTitle       = L(homepage?.finalCtaTitle)       || 'Ready to Grow Your Business in Qatar?'
  const finalCtaText        = L(homepage?.finalCtaText)        || "Free consultation, no commitment. Tell us about your business and we'll come back within 24 hours with a marketing plan built for the Qatar market."
  const finalCtaButtonText  = L(homepage?.finalCtaButtonText)  || L(homepage?.buttonText) || 'Get Free Consultation'
  const finalCtaButtonLink  = homepage?.finalCtaButtonLink || homepage?.buttonLink || '/get-strategy'
  const buttonText          = L(homepage?.buttonText) || 'Get Free Consultation'
  const secondaryButtonText = L(homepage?.secondaryButtonText) || 'View Case Studies'
  const aboutEyebrow        = L(homepage?.aboutEyebrow)
  const aboutTitle          = L(homepage?.aboutTitle)
  const aboutText           = L(homepage?.aboutText)
  const aboutButtonText     = L(homepage?.aboutButtonText)

  const primaryCtaLink   = homepage?.buttonLink ? localizePath(homepage.buttonLink, locale) : localizePath('/services', locale)
  const secondaryCtaLink = homepage?.secondaryButtonLink ? localizePath(homepage.secondaryButtonLink, locale) : '#work'

  const leadTestimonial = (data?.testimonials || []).find((t) => L(t.quote))
  const featuredCaseStudy = data?.caseStudies?.[0]

  return (
    <PageLayout>
      {/* ─────────────────────────────────────────────────────────────
           1. HERO — balanced typography + vertically-centered visual
                    Fits one viewport, no scroll, header clearance built in.
         ───────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#0E1635] overflow-hidden h-screen min-h-[680px] max-h-[920px] flex items-center pt-24 lg:pt-28">
        {/* Ambient brand-tinted glows */}
        <div className="absolute inset-0 opacity-[0.10] pointer-events-none" style={{
          backgroundImage:
            'radial-gradient(circle at 12% 25%, #DFBA67 0%, transparent 32%), radial-gradient(circle at 88% 75%, #DFBA67 0%, transparent 38%)',
        }} />

        {/* Hero visual — semi-circle (D-shape).
           In LTR: sits flush to the RIGHT, curve opens LEFT, text on left.
           In RTL: MIRRORED — flush to the LEFT, curve opens RIGHT, text on right.
           This prevents the Arabic headline colliding with the video. */}
        <div
          aria-hidden="true"
          className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-0' : 'right-0'} w-[75%] sm:w-[64%] md:w-[58%] lg:w-[56%] xl:w-[54%] h-[88%] sm:h-[92%] lg:h-[95%] z-0 pointer-events-none`}
        >
          {/* Outer glow — bleeds away from the curved edge */}
          <div
            className={`absolute inset-[-6%] ${isRtl ? 'rounded-r-full' : 'rounded-l-full'} blur-3xl opacity-30`}
            style={{
              background: `radial-gradient(ellipse at ${isRtl ? 'left' : 'right'}, #DFBA67 0%, #DFBA67 40%, transparent 75%)`,
            }}
          />

          {/* The semi-circle holding the video */}
          <div className={`absolute inset-0 ${isRtl ? 'rounded-r-full' : 'rounded-l-full'} overflow-hidden shadow-2xl shadow-black/60 bg-[#0E1635]`}>
            {homepage?.heroMediaType === 'video' && homepage?.heroVideoUrl ? (
              <video
                src={homepage.heroVideoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-contain"
              />
            ) : homepage?.heroImage?.asset?.url ? (
              <Image
                src={homepage.heroImage.asset.url}
                alt={heroImageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 60vw, 50vw"
                className="object-contain"
              />
            ) : (
              <div
                className="w-full h-full animate-[spin_60s_linear_infinite]"
                style={{
                  background:
                    'conic-gradient(from 0deg, #DFBA67, #DFBA67, #DFBA67, #DFBA67, #DFBA67, #DFBA67, #DFBA67)',
                  opacity: 0.9,
                }}
              />
            )}

            {/* Vignette along the curved edge so it sits into the page */}
            <div
              className={`absolute inset-0 pointer-events-none ${isRtl ? 'rounded-r-full' : 'rounded-l-full'}`}
              style={{
                background: `radial-gradient(ellipse at ${isRtl ? 'left' : 'right'}, transparent 50%, rgba(14,22,53,0.55) 100%)`,
              }}
            />
          </div>

          {/* Thin gold ring tracing the curved edge */}
          <div className={`absolute inset-[1.5%] ${isRtl ? 'rounded-r-full' : 'rounded-l-full'} border border-[#DFBA67]/40 pointer-events-none`} />
        </div>

        {/* Vignette — strong dark veil on the SIDE OPPOSITE the D-shape,
           so the headline pops out from a dark backdrop. In LTR the veil
           is heaviest on the left; in RTL, heaviest on the right. */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: isRtl
            ? 'linear-gradient(270deg, rgba(15,14,28,0.92) 0%, rgba(15,14,28,0.78) 30%, rgba(15,14,28,0.3) 55%, rgba(15,14,28,0.15) 80%, rgba(15,14,28,0.35) 100%)'
            : 'linear-gradient(90deg, rgba(15,14,28,0.92) 0%, rgba(15,14,28,0.78) 30%, rgba(15,14,28,0.3) 55%, rgba(15,14,28,0.15) 80%, rgba(15,14,28,0.35) 100%)',
        }} />

        {/* Foreground content — kept narrower so the D-shape sits clean next to it */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
          <div className="max-w-[560px]">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/60 mb-4 md:mb-5 font-medium">
              {heroEyebrow}
            </p>

            <h1 className="text-[2rem] sm:text-[2.5rem] md:text-[2.75rem] lg:text-[3.25rem] xl:text-[3.75rem] font-bold leading-[1] tracking-[-0.025em] text-white mb-5 md:mb-6 uppercase">
              {heroTitle}
            </h1>

            <p className="text-sm md:text-base text-white/70 leading-relaxed mb-6 md:mb-8 max-w-md font-light">
              {heroSubtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 md:gap-5">
              <a
                href={primaryCtaLink}
                className="group inline-flex items-center gap-2 text-white font-bold text-sm md:text-base px-6 py-3 md:py-3.5 rounded-full hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-[#DFBA67]/25"
                style={{
                  background: 'linear-gradient(95deg, #DFBA67 0%, #DFBA67 50%, #DFBA67 100%)',
                }}
              >
                <span>{buttonText}</span>
                <span className="group-hover:translate-x-1 transition-transform text-lg">›</span>
              </a>

              {secondaryButtonText && (
                <a
                  href={secondaryCtaLink}
                  className="group inline-flex items-center gap-2 text-white font-bold text-sm md:text-base border-b-2 border-[#DFBA67] pb-1 hover:text-[#DFBA67] transition"
                >
                  <span>{secondaryButtonText.replace(/\s*→\s*$/, '')}</span>
                  <span className="text-[#DFBA67] group-hover:translate-x-1 transition-transform">›</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Loop indicator — sits on the trailing edge in the reading direction */}
        <div className={`absolute bottom-6 ${isRtl ? 'left-6' : 'right-6'} hidden md:flex items-center gap-2 text-white/35 text-[10px] uppercase tracking-[0.3em] font-medium z-10`}>
          <span className="flex gap-0.5">
            <span className="w-[2px] h-3 bg-white/35" />
            <span className="w-[2px] h-3 bg-white/35" />
          </span>
          <span>Loop</span>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
           1b. CAPABILITIES STRIP — six core services, each with a tiny
                ∞ icon. Sits directly under the hero as a "what we do" peek.
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#0E1635] border-y border-white/[0.07] py-6 lg:py-7">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center md:justify-between gap-x-8 gap-y-4">
            {[
              { en: 'Web Development',       ar: 'تطوير المواقع' },
              { en: 'Social Media',          ar: 'سوشيال ميديا' },
              { en: 'SEO',                   ar: 'SEO' },
              { en: 'SMS',                   ar: 'رسائل SMS' },
              { en: 'Influencer Management', ar: 'إدارة المؤثرين' },
              { en: 'Branding',              ar: 'العلامات التجارية' },
            ].map((service, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 text-white/75 hover:text-white transition group cursor-default"
              >
                {/* Mini ∞ icon — same gold stroke style as the hero brand mark */}
                <svg
                  width="22"
                  height="11"
                  viewBox="0 0 40 20"
                  aria-hidden="true"
                  className="text-[#DFBA67] flex-shrink-0"
                >
                  <path
                    d="M 3,10 C 3,3 16,3 20,10 C 24,17 37,17 37,10 C 37,3 24,3 20,10 C 16,17 3,17 3,10 Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-[11px] md:text-xs font-medium uppercase tracking-[0.2em] whitespace-nowrap">
                  {locale === 'ar' ? service.ar : service.en}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
           1c. CLIENTS TRUST US — moving marquee (colored logos)
                Sits right under the capabilities strip so visitors see
                "what we do → who trusts us" in one continuous flow.
         ───────────────────────────────────────────────────────────── */}
      {homepage?.clientLogos && homepage.clientLogos.length > 0 && (
        <section dir="ltr" className="bg-white py-16 lg:py-20 overflow-hidden">
          <div className="text-center mb-10 px-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#0E1635]/50 font-medium mb-3">
              {locale === 'ar' ? 'يثق بنا' : 'Clients trust us'}
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0E1635] tracking-tight">
              {clientsBannerTitle}
            </h2>
          </div>

          <div className="relative w-full overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-white to-transparent" />

            <div className="flex w-max animate-[scroll_32s_linear_infinite] gap-16 items-center">
              {[...homepage.clientLogos, ...homepage.clientLogos].map((clientLogo, index) => (
                <div key={index} className="w-[200px] h-[80px] flex items-center justify-center flex-shrink-0">
                  {clientLogo?.logo?.asset?.url && (
                    <Image
                      src={clientLogo.logo.asset.url}
                      alt={localize(clientLogo.name, locale) || 'Client'}
                      width={200}
                      height={80}
                      className="max-w-[170px] max-h-[60px] object-contain"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <style>{`
            @keyframes scroll {
              from { transform: translateX(0); }
              to   { transform: translateX(-50%); }
            }
          `}</style>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
           2. CERTIFIED PARTNERS — prominent centered Meta + Google certified
                A real "trust seal" moment after capabilities + client logos.
         ───────────────────────────────────────────────────────────── */}
      {homepage?.aboutLogos && homepage.aboutLogos.length > 0 && (
        <section className="bg-white border-y border-black/5 py-20 lg:py-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-xs uppercase tracking-[0.3em] text-[#DFBA67] font-bold mb-5">
                {locale === 'ar' ? 'شركاء معتمدون' : 'Certified Partners'}
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-[3rem] font-bold text-[#0E1635] uppercase tracking-[-0.02em] leading-[0.98] max-w-3xl mx-auto">
                {locale === 'ar' ? 'موثوقون من قِبَل قادة الصناعة' : 'Backed by the platforms that move marketing.'}
              </h2>
            </div>

            <div
              className={`grid gap-6 items-center mx-auto ${
                homepage.aboutLogos.length === 1
                  ? 'grid-cols-1 max-w-sm'
                  : homepage.aboutLogos.length === 2
                  ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl'
                  : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-4xl'
              }`}
            >
              {homepage.aboutLogos.map((item, index) => (
                <div
                  key={index}
                  className="aspect-[3/2] flex items-center justify-center bg-white rounded-2xl border border-black/10 px-8 py-7 shadow-sm hover:shadow-md transition"
                >
                  {item?.logo?.asset?.url && (
                    <Image
                      src={item.logo.asset.url}
                      alt={localize(item.name, locale) || 'Certified partner'}
                      width={220}
                      height={120}
                      className="max-h-20 max-w-[180px] object-contain"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
           3. THREE PILLARS — color-coded
         ───────────────────────────────────────────────────────────── */}
      {homepage?.growthSteps && homepage.growthSteps.length > 0 && (
        <section className="bg-white py-28 lg:py-36">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-[1fr_2fr] gap-12 mb-20">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#0E1635]/50 font-medium mb-4">
                  {systemEyebrow}
                </p>
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#0E1635] tracking-tight leading-[1.05] max-w-3xl">
                {systemTitle}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16">
              {homepage.growthSteps.slice(0, 4).map((step, index) => {
                const accent = ACCENTS[index % ACCENTS.length]
                return (
                  <div key={index} className="group">
                    {/* Double-circle icon like Wpromote */}
                    <div className="flex items-center gap-1.5 mb-7">
                      <span
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: accent.color, opacity: 0.5 }}
                      />
                      <span
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: accent.color }}
                      />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-4 text-[#0E1635] leading-snug tracking-tight">
                      {localize(step.title, locale)}
                    </h3>
                    <p className="text-[#6B7280] leading-relaxed">
                      {localize(step.text, locale)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
           4. FEATURED SPOTLIGHT — corrected layout per user direction:
                Section bg is WHITE. Navy block takes ~70% (left + bottom),
                top-right ~30% stays WHITE. Image floats top-right, straddling
                the white area inside the section + the white above (previous).
                ~75% navy, ~25% white visual split.
         ───────────────────────────────────────────────────────────── */}
      {data?.caseStudies && data.caseStudies.length > 0 && (
        <FeaturedSpotlightCarousel
          slides={data.caseStudies.map((c) => {
            const t = localize(c.title, locale)
            return {
              title: t,
              description:
                localize(c.description, locale) ||
                localize(c.results, locale) ||
                '',
              href: localizePath(`/case-studies/${c.slug?.current}`, locale),
              imageUrl: c.image?.asset?.url,
              imageAlt: t || 'Featured case study',
            }
          })}
          labels={{
            eyebrow: isRtl ? 'الأعمال المميزة' : 'Hot off the press',
            ctaText: isRtl ? 'اقرأ القصة الكاملة' : 'Get the full story',
            slideLabel: isRtl ? 'الشريحة' : 'Slide',
            prevLabel: isRtl ? 'السابق' : 'Previous',
            nextLabel: isRtl ? 'التالي' : 'Next',
          }}
          isRtl={isRtl}
          intervalSeconds={10}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
           5. SERVICES — Wpromote-style: left headline + paragraph + CTA,
                right 2x2 grid of services with uniform BLUE diagonal arrows.
         ───────────────────────────────────────────────────────────── */}
      <section id="services" className="bg-white py-28 lg:py-36">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20 items-start">
            {/* Left column — eyebrow + headline + paragraph + CTA */}
            <div className="lg:sticky lg:top-32">
              <p className="text-xs uppercase tracking-[0.3em] text-[#0E1635]/50 font-medium mb-5">
                {servicesEyebrow}
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-[3.5rem] font-bold text-[#0E1635] uppercase tracking-[-0.02em] leading-[0.95] mb-7">
                {servicesTitle}
              </h2>
              <p className="text-base lg:text-lg text-[#6B7280] leading-relaxed mb-6 max-w-md">
                {locale === 'ar'
                  ? 'وصول إلى قدرات شاملة دون التضحية بالمرونة أو الخدمة المخصصة.'
                  : 'Get access to comprehensive capabilities without sacrificing flexibility or personalized service.'}
              </p>
              <p className="text-base lg:text-lg text-[#6B7280] leading-relaxed mb-10 max-w-md">
                {locale === 'ar'
                  ? 'فريق تسويق متكامل عبر الاستراتيجية والوسائط والإبداع والبيانات — يفكر دائمًا في خمس خطوات قادمة.'
                  : "A fully integrated marketing team across strategy, media, creative and data that's already thinking five moves ahead."}
              </p>
              <Link
                href={localizePath('/services', locale)}
                className="group inline-flex items-center gap-2 text-[#0E1635] font-bold border-b-2 border-[#0E1635] pb-1.5 hover:text-[#DFBA67] hover:border-[#DFBA67] transition"
              >
                <span>{locale === 'ar' ? 'استكشف خدماتنا' : 'Explore our capabilities'}</span>
                <span className="text-[#DFBA67] group-hover:translate-x-1 transition-transform text-xl">›</span>
              </Link>
            </div>

            {/* Right column — service grid with brand icons */}
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-14">
              {data?.services?.slice(0, 6).map((service, index) => {
                const sTitle = localize(service.title, locale)
                const sDesc = localize(service.description, locale)
                const sSlug = service.slug?.current
                return (
                  <a
                    key={index}
                    href={localizePath(`/services/${sSlug}`, locale)}
                    className="group block"
                  >
                    {/* Service icon — replaces the generic diagonal arrow */}
                    <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0E1635]/5 group-hover:bg-[#DFBA67]/15 transition-colors duration-300">
                      <ServiceIcon slug={sSlug} className="w-7 h-7 text-[#DFBA67]" />
                    </div>

                    <h3 className="text-2xl lg:text-3xl font-bold mb-3 text-[#0E1635] leading-tight tracking-tight group-hover:text-[#DFBA67] transition">
                      {sTitle}
                    </h3>
                    <p className="text-[#6B7280] text-sm lg:text-base leading-relaxed line-clamp-4">
                      {sDesc}
                    </p>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
           5b. SEO SPOTLIGHT — Wpromote AI Search style.
                Image left, headline + body + gradient CTA right.
                Links to the SEO landing page.
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 lg:py-28 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
          {/* Left — AI platform constellation. Animated SVG showing the search
             layer M&M helps brands rank inside (ChatGPT, Gemini, Perplexity,
             Claude, Google AI, Meta AI). Pure code — always crisp, always
             on-brand, no image asset needed. */}
          <div className="aspect-[4/3] lg:aspect-[5/4] rounded-2xl overflow-hidden bg-[#0E1635] p-4 lg:p-6">
            <AIPlatformConstellation className="w-full h-full" />
          </div>

          {/* Right — headline + body + gradient CTA */}
          <div>
            <h2 className="text-3xl md:text-5xl lg:text-[3.25rem] font-bold text-[#0E1635] uppercase tracking-[-0.02em] leading-[0.98] mb-7">
              {locale === 'ar'
                ? 'SEO و GEO هما المستقبل التالي للتسويق'
                : 'SEO & GEO are the next frontier of marketing'}
            </h2>
            <p className="text-base lg:text-lg text-[#6B7280] leading-relaxed mb-10 max-w-lg">
              {locale === 'ar'
                ? 'البحث هو حافة الرمح في الذكاء الاصطناعي وقدرته على إحداث ثورة في التسويق، وعلامتك التجارية في قطر تحتاج للاستعداد. من أساسيات الموقع إلى Reddit ومحركات LLM، تعلّم كيف تتفوّق على المنافسة.'
                : 'Search is the tip of the spear when it comes to AI and its potential to revolutionize marketing, and your Qatar brand needs to be ready. From website fundamentals to digital PR to Reddit, learn how to win in LLMs and outmaneuver the competition.'}
            </p>
            <a
              href={localizePath('/lp/seo-qatar', locale)}
              className="group inline-flex items-center gap-2.5 text-white font-bold text-base px-7 py-4 rounded-full hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-[#DFBA67]/30"
              style={{
                background: 'linear-gradient(95deg, #DFBA67 0%, #DFBA67 50%, #DFBA67 100%)',
              }}
            >
              <span>{locale === 'ar' ? 'فُز بسباق SEO' : 'Win the AI search race'}</span>
              <span className="text-lg group-hover:translate-x-1 transition-transform">›</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
           6. STATS — Wpromote-style: title + description LEFT, 2x2 stats RIGHT
         ───────────────────────────────────────────────────────────── */}
      {homepage?.proofItems && homepage.proofItems.length > 0 && (
        <section className="bg-[#0E1635] py-28 lg:py-36">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-[1fr_1.5fr] gap-14 lg:gap-24 items-start">
              {/* Left — eyebrow + headline + description */}
              <div>
                <h2 className="text-3xl md:text-5xl lg:text-[3.5rem] font-bold text-white uppercase tracking-[-0.02em] leading-[0.95] mb-7">
                  {locale === 'ar' ? 'النتائج تتحدّث' : 'Bold moves pay off'}
                </h2>
                <p className="text-base lg:text-lg text-white/70 leading-relaxed max-w-md">
                  {locale === 'ar'
                    ? 'من حملات الذكاء الاصطناعي إلى الفعاليات الحضورية، نتأكد أن كل تحرّك تسويقي يقود إلى نتيجة أعمال حقيقية.'
                    : 'From AI campaigns to experiential activations, we make sure every marketing move leads to real business outcomes.'}
                </p>
              </div>

              {/* Right — 2×2 grid of stats with colored + signs */}
              <div className="grid sm:grid-cols-2 gap-x-12 gap-y-16">
                {homepage.proofItems.slice(0, 4).map((item, index) => {
                  const accent = ACCENTS[index % ACCENTS.length]
                  return (
                    <div key={index}>
                      <div className="flex items-start gap-3 mb-3">
                        <h3 className="text-5xl md:text-6xl lg:text-[4.5rem] font-bold text-white tracking-tight leading-none">
                          {item.number}
                        </h3>
                        <span
                          className="text-3xl md:text-4xl font-bold leading-none"
                          style={{ color: accent.color }}
                        >
                          +
                        </span>
                      </div>
                      <p className="text-white/65 text-sm lg:text-base leading-relaxed">
                        {localize(item.label, locale)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
           8. PULL-QUOTE TESTIMONIAL
         ───────────────────────────────────────────────────────────── */}
      {leadTestimonial && (
        <section className="bg-white py-28 lg:py-36 border-t border-black/5">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[#0E1635]/50 font-medium mb-10">
              {locale === 'ar' ? 'بصوت العملاء' : 'In their words'}
            </p>

            <blockquote className="text-3xl md:text-4xl lg:text-5xl font-medium text-[#0E1635] leading-[1.2] tracking-tight mb-12">
              &ldquo;{L(leadTestimonial.quote)}&rdquo;
            </blockquote>

            <div className="flex items-center justify-center gap-4">
              {leadTestimonial.authorLogo?.asset?.url ? (
                <Image
                  src={leadTestimonial.authorLogo.asset.url}
                  alt={L(leadTestimonial.authorName) || 'Client'}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-full object-cover bg-[#F8F8FA] border border-black/5"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#DFBA67]/20 flex items-center justify-center text-[#DFBA67] font-bold text-xl">
                  {L(leadTestimonial.authorName)?.charAt(0) || '?'}
                </div>
              )}
              <div className="text-left">
                <p className="font-bold text-[#0E1635]">{L(leadTestimonial.authorName)}</p>
                {L(leadTestimonial.authorTitle) && (
                  <p className="text-sm text-[#6B7280]">{L(leadTestimonial.authorTitle)}</p>
                )}
              </div>
            </div>

            {featuredCaseStudy?.slug?.current && (
              <a
                href={localizePath(`/case-studies/${featuredCaseStudy.slug.current}`, locale)}
                className="inline-flex items-center gap-2 text-[#0E1635] font-bold mt-10 group hover:text-[#DFBA67] transition"
              >
                <span>{locale === 'ar' ? 'اقرأ القصة الكاملة' : 'Read the full case study'}</span>
                <span className="text-[#DFBA67] group-hover:translate-x-1.5 transition-transform text-xl">→</span>
              </a>
            )}
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
           9. ABOUT STATEMENT — bold brand statement
         ───────────────────────────────────────────────────────────── */}
      {aboutTitle && (
        <section className="bg-[#F8F8FA] py-28 lg:py-36 border-t border-black/5">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1fr_1fr] gap-16 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#0E1635]/50 font-medium mb-5">
                {aboutEyebrow}
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#0E1635] tracking-tight leading-[1.05] mb-9">
                {aboutTitle}
              </h2>
              <p className="text-lg md:text-xl text-[#6B7280] leading-relaxed mb-10 max-w-xl font-light">
                {aboutText}
              </p>
              {aboutButtonText && homepage?.aboutButtonLink && (
                <a
                  href={localizePath(homepage.aboutButtonLink, locale)}
                  className="group inline-flex items-center gap-3 text-[#0E1635] font-bold border-b border-[#0E1635]/30 pb-1.5 hover:border-[#DFBA67] transition"
                >
                  <span>{aboutButtonText}</span>
                  <span className="text-[#DFBA67] group-hover:translate-x-1.5 transition-transform text-xl">→</span>
                </a>
              )}
            </div>

            {homepage?.aboutImage?.asset?.url && (
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-black/10">
                <Image
                  src={homepage.aboutImage.asset.url}
                  alt={aboutTitle}
                  width={900}
                  height={1100}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
           10. FEATURED WORK — remaining case studies (after spotlight)
         ───────────────────────────────────────────────────────────── */}
      {data?.caseStudies && data.caseStudies.length > 1 && (
        <section id="work" className="bg-white py-28 lg:py-36">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#0E1635]/50 font-medium mb-5">
                  {caseStudiesEyebrow}
                </p>
                <h2 className="text-3xl md:text-5xl font-bold text-[#0E1635] tracking-tight leading-[1.05] max-w-2xl">
                  {caseStudiesTitle}
                </h2>
              </div>
              <Link
                href={localizePath('/case-studies', locale)}
                className="group inline-flex items-center gap-2 text-[#0E1635] font-bold hover:text-[#DFBA67] transition self-start md:self-end"
              >
                <span>{caseStudiesLinkText.replace(/\s*→\s*$/, '')}</span>
                <span className="text-[#DFBA67] group-hover:translate-x-1.5 transition-transform text-xl">→</span>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {data.caseStudies.slice(1, 3).map((caseStudy, index) => {
                const cTitle = localize(caseStudy.title, locale)
                const cCategory = localize(caseStudy.category, locale)
                const cDesc = localize(caseStudy.description, locale) || localize(caseStudy.results, locale)
                const accent = ACCENTS[(index + 2) % ACCENTS.length]
                return (
                  <a
                    key={index}
                    href={localizePath(`/case-studies/${caseStudy.slug?.current}`, locale)}
                    className="group block"
                  >
                    <div className="aspect-[16/10] bg-[#F8F8FA] rounded-2xl overflow-hidden mb-6">
                      {caseStudy?.image?.asset?.url && (
                        <Image
                          src={caseStudy.image.asset.url}
                          alt={cTitle || 'Case study'}
                          width={1200}
                          height={750}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      )}
                    </div>
                    <p
                      className="text-xs uppercase tracking-[0.25em] font-bold mb-3"
                      style={{ color: accent.color }}
                    >
                      {cCategory || 'Case Study'}
                    </p>
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 text-[#0E1635] leading-tight tracking-tight">
                      {cTitle}
                    </h3>
                    <p className="text-[#6B7280] leading-relaxed mb-5">
                      {cDesc}
                    </p>
                    <span className="inline-flex items-center gap-2 text-[#0E1635] font-bold text-sm group-hover:gap-3 transition-all">
                      {caseStudyCardCta.replace(/\s*→\s*$/, '')}
                      <span style={{ color: accent.color }}>→</span>
                    </span>
                  </a>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
           11. INSIGHTS — Wpromote-style: left headline + CTA, three
                vertical cards on the right with dark title block + image.
         ───────────────────────────────────────────────────────────── */}
      {data?.posts && data.posts.length > 0 && (
        <section className="bg-white py-28 lg:py-36 border-t border-black/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-4 gap-10 lg:gap-12 items-start">
              {/* Left column — headline + CTA */}
              <div className="lg:col-span-1">
                <h2 className="text-3xl md:text-4xl lg:text-[2.25rem] xl:text-[2.75rem] font-bold text-[#0E1635] tracking-[-0.02em] leading-[1] uppercase mb-10 break-words">
                  {blogTitle}
                </h2>
                <Link
                  href={localizePath('/blog', locale)}
                  className="group inline-flex items-center gap-2 border-2 border-[#0E1635] px-6 py-3 rounded-full text-[#0E1635] font-bold text-sm hover:bg-[#0E1635] hover:text-white transition"
                >
                  <span>{blogLinkText.replace(/\s*[→›]\s*$/, '')}</span>
                  <span className="text-[#DFBA67] text-lg group-hover:translate-x-1 transition-transform">›</span>
                </Link>
              </div>

              {/* Right — three vertical cards */}
              <div className="lg:col-span-3 grid md:grid-cols-3 gap-5">
                {data.posts.map((post, index) => {
                  const pTitle = localize(post.title, locale)
                  const pCategory = localize(post.category, locale)
                  return (
                    <a
                      key={index}
                      href={localizePath(`/blog/${post.slug?.current}`, locale)}
                      className="group flex flex-col rounded-2xl overflow-hidden bg-[#0E1635] hover:-translate-y-1 transition-transform duration-300"
                    >
                      {/* Top: dark card with category + title */}
                      <div className="p-6 lg:p-7 flex-grow flex flex-col min-h-[260px]">
                        <p className="text-xs uppercase tracking-[0.25em] text-white/55 font-medium mb-5">
                          {pCategory || (locale === 'ar' ? 'مدونة' : 'Blog')}
                        </p>
                        <h3 className="text-xl lg:text-2xl font-bold text-white leading-[1.15] tracking-tight">
                          <span>{pTitle}</span>
                          <span className="text-[#DFBA67] ml-1.5 inline-block group-hover:translate-x-1 transition-transform">›</span>
                        </h3>
                      </div>

                      {/* Bottom: image */}
                      <div className="aspect-[16/10] bg-white/5 overflow-hidden">
                        {post?.image?.asset?.url && (
                          <Image
                            src={post.image.asset.url}
                            alt={pTitle || 'Article'}
                            width={700}
                            height={440}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        )}
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
           12. FINAL CTA — Wpromote "Don't settle" style, brand-coloured:
                White section bg with TOP + RIGHT margins, navy block
                fills the rest, photo bleeds 10 % into the white top and
                15 % into the white right.
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-white">
        {/* Outer wrapper creates the white margins: top + (right in LTR / left
            in RTL) on desktop. The margin is wide enough that when the image
            is anchored to the navy's trailing edge and translated 50 % outward,
            the image's middle lines up exactly with the navy/white boundary. */}
        <div className={`lg:pt-20 ${isRtl ? 'lg:pl-72' : 'lg:pr-72'}`}>
          {/* Inner navy "L" block. overflow-visible on desktop so image can bleed */}
          <div className="relative bg-[#0E1635] min-h-[480px] lg:min-h-[600px] lg:overflow-visible overflow-hidden">
            {/* Subtle gold radial glow for visual interest */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 20% 80%, #DFBA67 0%, transparent 45%)',
              }}
            />

            <div className="relative grid lg:grid-cols-[1.55fr_1fr]">
              {/* LEFT — content */}
              <div className="px-6 sm:px-10 lg:px-16 py-16 lg:py-24 flex flex-col justify-center text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-[#DFBA67] font-bold mb-6">
                  {locale === 'ar'
                    ? 'وكالة التسويق الجريئة في قطر'
                    : 'The fearless digital marketing agency'}
                </p>

                <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4.25rem] font-bold uppercase tracking-[-0.025em] leading-[0.95] mb-7">
                  {finalCtaTitle}
                </h2>

                <p className="text-base lg:text-lg text-white/85 leading-relaxed mb-10 max-w-md">
                  {finalCtaText}
                </p>

                <a
                  href={localizePath(finalCtaButtonLink, locale)}
                  className="group self-start inline-flex items-center gap-2.5 bg-[#DFBA67] text-[#0E1635] px-8 py-3.5 rounded-full font-bold text-base hover:bg-white transition-colors duration-300 shadow-xl shadow-black/30"
                >
                  <span>{finalCtaButtonText || (locale === 'ar' ? 'هيا نبدأ' : "Let's go")}</span>
                  <span className="text-[#0E1635] group-hover:translate-x-1 transition-transform text-xl">›</span>
                </a>

                <p className="text-xs text-white/60 mt-6 uppercase tracking-[0.25em]">
                  {locale === 'ar' ? 'مجاني · 30 دقيقة · بدون التزام' : 'Free · 30 minutes · No commitment'}
                </p>
              </div>

              {/* RIGHT placeholder — image is absolutely positioned on desktop */}
              <div aria-hidden="true" />
            </div>

            {/* IMAGE — desktop only. Square crop, anchored to navy's trailing
                edge (right in LTR, left in RTL) then translated 50 % outward
                so the image's middle sits on the navy/white boundary. Also
                bleeds 10 % into the white top via translate-y. */}
            <div className={`hidden lg:block absolute top-0 ${isRtl ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'} w-[38%] aspect-square -translate-y-[10%] z-20`}>
              {(homepage?.heroImage?.asset?.url || homepage?.aboutImage?.asset?.url) ? (
                <Image
                  src={(homepage.heroImage?.asset?.url || homepage.aboutImage?.asset?.url) as string}
                  alt={locale === 'ar' ? 'أطلق روح التحدي' : 'Dare to unleash your challenger spirit'}
                  fill
                  sizes="40vw"
                  className="object-cover shadow-2xl shadow-black/50"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center shadow-2xl shadow-black/50"
                  style={{
                    background:
                      'linear-gradient(135deg, #0E1635 0%, #1A2854 100%)',
                  }}
                >
                  <span className="text-white/30 text-sm">Add image in Sanity</span>
                </div>
              )}
            </div>

            {/* IMAGE — mobile fallback, stacked below content */}
            <div className="lg:hidden relative aspect-[4/3] mt-0">
              {(homepage?.heroImage?.asset?.url || homepage?.aboutImage?.asset?.url) && (
                <Image
                  src={(homepage.heroImage?.asset?.url || homepage.aboutImage?.asset?.url) as string}
                  alt={locale === 'ar' ? 'أطلق روح التحدي' : 'Dare to unleash your challenger spirit'}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
