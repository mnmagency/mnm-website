/**
 * /services/{slug}
 *
 * Visually mirrors the /lp/[slug] campaign landing-page template so every
 * service page has the same conversion-focused look-and-feel as the
 * "masterpiece" SEO Qatar landing page. All copy and assets are CMS-driven
 * via the existing `service` schema; nothing is hardcoded.
 *
 * Sections (top → bottom):
 *   1. Hero            — service.title / description / image / hero CTA
 *   2. Why it matters  — service.whyItMatters (eyebrow-led card row)
 *   3. What's included — service.deliverables[] (checklist cards)
 *   4. What we build   — service.content (single content block)
 *   5. CMS sections    — service.sections[] page-builder blocks
 *   6. Projects        — service.projects[]
 *   7. FAQs            — referenced FAQ docs
 *   8. Strategy form   — pre-tagged with the service title
 *   9. Final CTA       — gold banner
 */

import Image from 'next/image'
import { notFound } from 'next/navigation'
import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'
import StrategyForm from '@/app/components/StrategyForm'
import ServiceIcon from '@/app/components/ServiceIcon'
import VideoSampleCard from '@/app/components/VideoSampleCard'
import { localize, localizePath } from '@/lib/locale'
import { getLocale } from '@/lib/locale-server'

export const revalidate = 60

type LocaleField = { en?: string; ar?: string } | string | null | undefined
type ImageRef = { asset?: { url?: string } }

type SectionBlock = {
  _type?: string
  eyebrow?: LocaleField
  title?: LocaleField
  subtitle?: LocaleField
  content?: LocaleField
  caption?: LocaleField
  items?: Array<LocaleField>
  text?: LocaleField
  buttonText?: LocaleField
  buttonLink?: string
  image?: ImageRef
}

type ProjectItem = {
  clientName?: LocaleField
  category?: LocaleField
  projectImage?: ImageRef
  clientLogo?: ImageRef
  title?: LocaleField
  description?: LocaleField
}

type Faq = { _id?: string; question?: LocaleField; answer?: LocaleField }

type VideoSampleDoc = {
  title?: LocaleField
  description?: LocaleField
  videoUrl?: string
  videoFile?: { asset?: { url?: string } }
  thumbnail?: ImageRef
  aspectRatio?: '16-9' | '9-16' | '1-1'
}

type Service = {
  _id?: string
  title?: LocaleField
  description?: LocaleField
  content?: LocaleField
  whyItMatters?: LocaleField
  deliverables?: Array<LocaleField>
  ctaTitle?: LocaleField
  ctaText?: LocaleField
  image?: ImageRef
  projects?: ProjectItem[]
  sections?: SectionBlock[]
  faqs?: Faq[]
  heroEyebrow?: LocaleField
  heroCtaButtonText?: LocaleField
  heroCtaButtonLink?: string
  whatWeBuildEyebrow?: LocaleField
  whatWeBuildTitle?: LocaleField
  whyItMattersEyebrow?: LocaleField
  whyItMattersTitle?: LocaleField
  deliverablesEyebrow?: LocaleField
  deliverablesTitle?: LocaleField
  projectsEyebrow?: LocaleField
  projectsTitle?: LocaleField
  faqsEyebrow?: LocaleField
  faqsTitle?: LocaleField
  videoSamplesEyebrow?: LocaleField
  videoSamplesTitle?: LocaleField
  videoSamplesSubtitle?: LocaleField
  videoSamples?: VideoSampleDoc[]
  formEyebrow?: LocaleField
  formTitle?: LocaleField
  formSubtitle?: LocaleField
  formSubmitText?: LocaleField
  finalCtaButtonText?: LocaleField
  finalCtaButtonLink?: string
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()

  const service = await client.fetch<{
    title?: LocaleField
    description?: LocaleField
    seo?: { metaTitle?: LocaleField; metaDescription?: LocaleField; canonicalUrl?: string; ogImage?: ImageRef }
    image?: ImageRef
  } | null>(
    `
      *[_type == "service" && slug.current == $slug][0]{
        title, description,
        seo{ metaTitle, metaDescription, canonicalUrl, ogImage{ asset->{url} } },
        image{ asset->{url} }
      }
    `,
    { slug }
  )

  const seo = service?.seo
  const title = localize(seo?.metaTitle, locale) ||
    `${localize(service?.title, locale) || 'Marketing Service'} in Qatar | M&M Marketing`
  const description = localize(seo?.metaDescription, locale) ||
    localize(service?.description, locale) ||
    'M&M Marketing is a leading marketing agency in Qatar delivering SEO, web development, social media management, branding, paid ads, videography, and bulk SMS for brands in Doha and across Qatar.'

  return {
    title, description,
    openGraph: {
      title, description,
      images: seo?.ogImage?.asset?.url ? [seo.ogImage.asset.url] : service?.image?.asset?.url ? [service.image.asset.url] : [],
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description, images: seo?.ogImage?.asset?.url ? [seo.ogImage.asset.url] : [] },
    alternates: { canonical: seo?.canonicalUrl || undefined },
  }
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()
  const L = (f: LocaleField) => localize(f, locale)

  const [service, formSettings] = await Promise.all([
    client.fetch<Service | null>(
      `
        *[_type == "service" && slug.current == $slug][0]{
          _id,
          title, description, content, whyItMatters, deliverables,
          ctaTitle, ctaText,
          heroEyebrow, heroCtaButtonText, heroCtaButtonLink,
          whatWeBuildEyebrow, whatWeBuildTitle,
          whyItMattersEyebrow, whyItMattersTitle,
          deliverablesEyebrow, deliverablesTitle,
          projectsEyebrow, projectsTitle,
          faqsEyebrow, faqsTitle,
          videoSamplesEyebrow, videoSamplesTitle, videoSamplesSubtitle,
          videoSamples[]{
            title, description, videoUrl, aspectRatio,
            videoFile{ asset->{url} },
            thumbnail{ asset->{url} }
          },
          formEyebrow, formTitle, formSubtitle, formSubmitText,
          finalCtaButtonText, finalCtaButtonLink,
          image{ asset->{url} },
          projects[]{
            clientName, category, title, description,
            projectImage{ asset->{url} },
            clientLogo{ asset->{url} }
          },
          sections[]{
            _type, eyebrow, title, subtitle, content, caption,
            items, text, buttonText, buttonLink,
            image{ asset->{url} }
          },
          "faqs": *[_type == "faq" && relatedService._ref == ^._id] | order(_createdAt asc){
            _id, question, answer
          }
        }
      `,
      { slug }
    ),
    client.fetch<StrategyFormDoc | null>(`
      *[_type == "strategyForm"][0]{
        placeholders, services, budgetOptions,
        countries[]{flag, countryName, dialCode, phoneLength},
        humanQuestion, humanAnswer, successMessage, errorMessage
      }
    `),
  ])

  if (!service) {
    notFound()
  }

  // Fallback copy
  const heroEyebrow         = L(service.heroEyebrow)         || (locale === 'ar' ? 'خدمة من M&M' : 'M&M Service')
  const heroCtaButtonText   = L(service.heroCtaButtonText)   || (locale === 'ar' ? 'احصل على استراتيجية النمو' : 'Get Free Consultation')
  const whatWeBuildEyebrow  = L(service.whatWeBuildEyebrow)  || (locale === 'ar' ? 'ما الذي نبنيه' : 'What We Build')
  const whatWeBuildTitle    = L(service.whatWeBuildTitle)    || (locale === 'ar' ? 'نظام إيرادات، وليس مجرد واجهة رقمية.' : 'Built as a revenue system, not a digital brochure.')
  const whyItMattersEyebrow = L(service.whyItMattersEyebrow) || (locale === 'ar' ? 'لماذا هذا مهم' : 'Why It Matters')
  const whyItMattersTitle   = L(service.whyItMattersTitle)   || (locale === 'ar' ? 'حضورك الرقمي يؤثر مباشرة على النمو.' : 'Your digital presence directly affects growth.')
  const deliverablesEyebrow = L(service.deliverablesEyebrow) || (locale === 'ar' ? 'ما ستحصل عليه' : "What's included")
  const deliverablesTitle   = L(service.deliverablesTitle)   || (locale === 'ar' ? 'كل ما يلزم لتحويل الاستراتيجية إلى تنفيذ قابل للقياس.' : 'Everything you need to turn strategy into measurable execution.')
  const projectsEyebrow     = L(service.projectsEyebrow)     || (locale === 'ar' ? 'دراسات الحالة' : 'Case Studies')
  const projectsTitle       = L(service.projectsTitle)       || (locale === 'ar' ? 'نتائج حقيقية في قطر' : 'Real Results in Qatar')
  const videoSamplesEyebrow = L(service.videoSamplesEyebrow) || (locale === 'ar' ? 'الريل المختار' : 'Selected Reel')
  const videoSamplesTitle   = L(service.videoSamplesTitle)   || (locale === 'ar' ? 'شاهد عملنا' : 'Watch our work')
  const videoSamplesSubtitle = L(service.videoSamplesSubtitle)
  const faqsEyebrow         = L(service.faqsEyebrow)         || (locale === 'ar' ? 'الأسئلة الشائعة' : 'FAQs')
  const faqsTitle           = L(service.faqsTitle)           || (locale === 'ar' ? 'أسئلة يطرحها العملاء' : 'Frequently Asked Questions')
  const formEyebrow         = L(service.formEyebrow)         || (locale === 'ar' ? 'تحدث إلى الخبراء' : "Let's Talk")
  const formTitle           = L(service.formTitle)           || (locale === 'ar' ? 'احجز استشارتك المجانية' : 'Book Your Free Consultation')
  const formSubtitle        = L(service.formSubtitle)        || (locale === 'ar'
                                ? 'املأ النموذج وسيتواصل معك فريقنا باستراتيجية مخصصة لعملك خلال 24 ساعة.'
                                : "Fill out the form and our team will reach out within 24 hours with a strategy tailored to your business.")
  const formSubmitText      = L(service.formSubmitText)      || (locale === 'ar' ? 'أرسل' : 'Get Started')
  const finalCtaButtonText  = L(service.finalCtaButtonText)  || (locale === 'ar' ? 'احصل على استراتيجية النمو' : 'Get Free Consultation')

  const heroCtaButtonLink   = localizePath(service.heroCtaButtonLink   || '#service-form', locale)
  const finalCtaButtonLink  = localizePath(service.finalCtaButtonLink  || '#service-form', locale)

  const serviceTitle        = L(service.title)
  const serviceDescription  = L(service.description)
  const serviceContent      = L(service.content)
  const serviceWhyItMatters = L(service.whyItMatters)
  const serviceCtaTitle     = L(service.ctaTitle) || (locale === 'ar' ? 'جاهز للنمو؟' : 'Ready to grow?')
  const serviceCtaText      = L(service.ctaText)  || (locale === 'ar' ? 'لنبني استراتيجية تركز على نتائج حقيقية.' : "Let's build a strategy focused on real results.")

  const services      = (formSettings?.services      || []).map(L).filter(Boolean) as string[]
  const budgetOptions = (formSettings?.budgetOptions || []).map(L).filter(Boolean) as string[]

  return (
    <PageLayout>
      {service?.faqs && service.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: service.faqs.map((faq) => ({
                '@type': 'Question',
                name: L(faq.question),
                acceptedAnswer: { '@type': 'Answer', text: L(faq.answer) },
              })),
            }),
          }}
        />
      )}

      {/* ─── Hero ─── */}
      <section className="px-6 pt-40 pb-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-4 mb-5">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#DFBA67]/15 border border-[#DFBA67]/30">
                <ServiceIcon slug={slug} className="w-6 h-6 text-[#DFBA67]" />
              </span>
              <p className="text-[#DFBA67] uppercase tracking-widest text-sm font-bold">
                {heroEyebrow}
              </p>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.05]">
              {serviceTitle}
            </h1>
            {serviceDescription && (
              <p className="text-lg text-[#8A95A5] leading-relaxed mb-8">
                {serviceDescription}
              </p>
            )}
            <a
              href={heroCtaButtonLink}
              className="inline-block bg-[#DFBA67] text-[#0E1635] px-8 py-4 rounded-full font-bold text-lg hover:scale-[1.03] transition-all duration-300 shadow-xl shadow-[#DFBA67]/30"
            >
              {heroCtaButtonText}
            </a>
          </div>

          {service?.image?.asset?.url && (
            <figure className="space-y-3">
              <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl shadow-black/40">
                <Image
                  src={service.image.asset.url}
                  alt={serviceTitle || 'M&M Marketing service'}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </figure>
          )}
        </div>
      </section>

      {/* ─── Why it matters — LIGHT section with big gold quote ─── */}
      {serviceWhyItMatters && (
        <section className="relative bg-[#FAF7F2] text-[#0E1635] py-24 lg:py-32 px-6 overflow-hidden">
          {/* Decorative gold gradient wash, top-right */}
          <div
            className="absolute top-0 right-0 w-[40rem] h-[40rem] opacity-20 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at center, #DFBA67 0%, transparent 60%)',
            }}
          />

          <div className="relative max-w-5xl mx-auto">
            <p className="text-[#DFBA67] uppercase tracking-widest text-sm font-bold mb-4">
              {whyItMattersEyebrow}
            </p>

            {/* Giant gold open-quote glyph as a graphic element */}
            <div className="flex items-start gap-6 mb-8">
              <span
                aria-hidden="true"
                className="text-[4rem] sm:text-[6rem] lg:text-[8rem] leading-none font-bold text-[#DFBA67]/40 -mt-2 sm:-mt-4 select-none flex-shrink-0"
              >
                &ldquo;
              </span>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
                {whyItMattersTitle}
              </h2>
            </div>

            <p className="text-lg md:text-xl text-[#475569] leading-relaxed whitespace-pre-line max-w-3xl">
              {serviceWhyItMatters}
            </p>
          </div>
        </section>
      )}

      {/* ─── What's included — LIGHT section with animated checklist cards ─── */}
      {service?.deliverables && service.deliverables.length > 0 && (
        <section className="bg-white text-[#0E1635] py-24 lg:py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-14 text-center">
              <p className="text-[#DFBA67] uppercase tracking-widest text-sm font-bold mb-3">
                {deliverablesEyebrow}
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight max-w-3xl mx-auto">
                {deliverablesTitle}
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {service.deliverables.map((item, i) => (
                <div
                  key={i}
                  className="group relative bg-[#FAF7F2] border border-black/5 rounded-2xl p-6 hover:bg-white hover:border-[#DFBA67]/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#0E1635] text-[#DFBA67] font-bold flex items-center justify-center group-hover:bg-[#DFBA67] group-hover:text-[#0E1635] group-hover:rotate-6 transition-all duration-300">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </span>
                    <p className="text-[#0E1635] leading-relaxed font-medium pt-1">{L(item)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── What we build — split layout with service image + content ─── */}
      {serviceContent && (
        <section className="bg-[#FAF7F2] text-[#0E1635] py-24 lg:py-32 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-[#DFBA67] uppercase tracking-widest text-sm font-bold mb-3">
                {whatWeBuildEyebrow}
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-7 max-w-2xl leading-[1.05] tracking-tight">
                {whatWeBuildTitle}
              </h2>
              <p className="text-lg text-[#475569] leading-relaxed whitespace-pre-line">
                {serviceContent}
              </p>
              <a
                href="#service-form"
                className="group/cta mt-10 inline-flex items-center gap-2 text-[#0E1635] font-bold border-b-2 border-[#0E1635] pb-1.5 hover:text-[#DFBA67] hover:border-[#DFBA67] transition-colors"
              >
                <span>{locale === 'ar' ? 'لنبدأ مشروعك' : "Let's start your project"}</span>
                <span className="text-[#DFBA67] group-hover/cta:translate-x-1 transition-transform text-xl">›</span>
              </a>
            </div>

            {/* Right column — service image with gold "halo" gradient + offset frame */}
            <div className="relative">
              <div
                className="absolute -inset-6 rounded-[2.5rem] opacity-50 blur-2xl pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at 30% 30%, #DFBA67 0%, transparent 70%)',
                }}
              />
              {service?.image?.asset?.url ? (
                <div className="relative aspect-[4/5] lg:aspect-[5/6] rounded-[2rem] overflow-hidden shadow-2xl shadow-black/20 group">
                  <Image
                    src={service.image.asset.url}
                    alt={serviceTitle || 'Service image'}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover group-hover:scale-[1.04] transition-transform duration-700"
                  />
                </div>
              ) : (
                <div
                  className="relative aspect-[4/5] lg:aspect-[5/6] rounded-[2rem] overflow-hidden shadow-2xl shadow-black/20 flex items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(135deg, #0E1635 0%, #1A2854 60%, #DFBA67 200%)',
                  }}
                >
                  <ServiceIcon slug={slug} className="w-32 h-32 text-[#DFBA67]" />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── Video samples (reel) — DARK section for cinematic contrast ─── */}
      {service?.videoSamples && service.videoSamples.length > 0 && (
        <section className="relative bg-[#0E1635] text-white py-24 lg:py-32 px-6 overflow-hidden">
          {/* Subtle gold radial glow */}
          <div
            className="absolute top-0 right-0 w-[50rem] h-[50rem] opacity-15 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at center, #DFBA67 0%, transparent 60%)',
            }}
          />

          <div className="relative max-w-7xl mx-auto">
            <div className="mb-14 text-center">
              <p className="text-[#DFBA67] uppercase tracking-widest text-sm font-bold mb-3">
                {videoSamplesEyebrow}
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-4 max-w-3xl mx-auto">
                {videoSamplesTitle}
              </h2>
              {videoSamplesSubtitle && (
                <p className="text-[#8A95A5] max-w-2xl mx-auto leading-relaxed">
                  {videoSamplesSubtitle}
                </p>
              )}
            </div>

            {/* Mixed-aspect grid: portrait clips slot in beside landscape ones */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.videoSamples.map((sample, i) => (
                <VideoSampleCard
                  key={i}
                  sample={{
                    title: L(sample.title),
                    description: L(sample.description),
                    videoUrl: sample.videoUrl,
                    videoFile: sample.videoFile,
                    thumbnail: sample.thumbnail,
                    aspectRatio: sample.aspectRatio,
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CMS sections (page-builder blocks) ─── */}
      {service?.sections?.map((section, index) => {
        const sEyebrow  = L(section.eyebrow)
        const sTitle    = L(section.title)
        const sSubtitle = L(section.subtitle)
        const sContent  = L(section.content)
        const sCaption  = L(section.caption)

        if (section._type === 'heroSection') {
          return (
            <section key={index} className="py-24 px-6">
              <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  {sEyebrow && (
                    <p className="text-[#DFBA67] uppercase tracking-widest text-sm font-bold mb-3">
                      {sEyebrow}
                    </p>
                  )}
                  {sTitle && <h2 className="text-3xl md:text-5xl font-bold mb-6">{sTitle}</h2>}
                  {sSubtitle && (
                    <p className="text-lg text-[#8A95A5] leading-relaxed">{sSubtitle}</p>
                  )}
                </div>
                {section?.image?.asset?.url && (
                  <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl shadow-black/40">
                    <Image
                      src={section.image.asset.url}
                      alt={sTitle || 'Section image'}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </section>
          )
        }

        if (section._type === 'textBlock') {
          return (
            <section key={index} className="bg-white/[0.03] border-y border-white/5 py-24 px-6">
              <div className="max-w-5xl mx-auto">
                {sEyebrow && (
                  <p className="text-[#DFBA67] uppercase tracking-widest text-sm font-bold mb-3">
                    {sEyebrow}
                  </p>
                )}
                {sTitle && <h2 className="text-3xl md:text-5xl font-bold mb-6">{sTitle}</h2>}
                {sContent && (
                  <p className="text-lg text-[#D6D8E0] leading-relaxed whitespace-pre-line">
                    {sContent}
                  </p>
                )}
              </div>
            </section>
          )
        }

        if (section._type === 'imageBlock') {
          if (!section?.image?.asset?.url) return null
          return (
            <section key={index} className="py-24 px-6">
              <div className="max-w-7xl mx-auto">
                <div className="relative aspect-[16/8] rounded-[2rem] overflow-hidden shadow-2xl shadow-black/30">
                  <Image
                    src={section.image.asset.url}
                    alt={sCaption || serviceTitle || 'Section image'}
                    fill
                    sizes="(max-width: 1280px) 100vw, 1200px"
                    className="object-cover"
                  />
                </div>
                {sCaption && (
                  <p className="text-sm text-[#8A95A5] mt-4 text-center">{sCaption}</p>
                )}
              </div>
            </section>
          )
        }

        if (section._type === 'featuresBlock') {
          return (
            <section key={index} className="bg-white/[0.03] border-y border-white/5 py-24 px-6">
              <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                  {sEyebrow && (
                    <p className="text-[#DFBA67] uppercase tracking-widest text-sm font-bold mb-3">
                      {sEyebrow}
                    </p>
                  )}
                  {sTitle && (
                    <h2 className="text-3xl md:text-5xl font-bold max-w-3xl">{sTitle}</h2>
                  )}
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {section?.items?.map((item, itemIndex: number) => (
                    <div key={itemIndex} className="relative">
                      <div className="text-6xl font-bold text-[#DFBA67]/30 mb-3">
                        {String(itemIndex + 1).padStart(2, '0')}
                      </div>
                      <p className="text-white/90 leading-relaxed">{L(item)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )
        }

        if (section._type === 'ctaBlock') {
          const sText = L(section.text)
          const sButtonText = L(section.buttonText)
          return (
            <section key={index} className="bg-[#DFBA67] text-[#0E1635] py-20 px-6">
              <div className="max-w-4xl mx-auto text-center">
                {sTitle && <h2 className="text-3xl md:text-5xl font-bold mb-4">{sTitle}</h2>}
                {sText && <p className="text-lg mb-8 opacity-90">{sText}</p>}
                <a
                  href={localizePath(section.buttonLink || '#service-form', locale)}
                  className="inline-block bg-[#0E1635] text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-[1.03] transition-all duration-300 shadow-xl shadow-black/30"
                >
                  {sButtonText || finalCtaButtonText}
                </a>
              </div>
            </section>
          )
        }

        return null
      })}

      {/* ─── Projects / Case Studies — LIGHT section with lifting photo cards ─── */}
      {service?.projects && service.projects.length > 0 && (
        <section className="bg-white text-[#0E1635] py-24 lg:py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-14 text-center">
              <p className="text-[#DFBA67] uppercase tracking-widest text-sm font-bold mb-3">
                {projectsEyebrow}
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight max-w-3xl mx-auto">
                {projectsTitle}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.projects.map((project, index) => {
                const pTitle = L(project.title)
                const pCategory = L(project.category)
                const pClientName = L(project.clientName)
                const pDescription = L(project.description)
                return (
                  <div
                    key={index}
                    className="group bg-[#FAF7F2] border border-black/5 rounded-2xl overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/15 transition-all duration-500"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#0E1635]">
                      {project?.projectImage?.asset?.url ? (
                        <Image
                          src={project.projectImage.asset.url}
                          alt={pTitle || 'Project'}
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <>
                          <div
                            className="absolute inset-0 opacity-40"
                            style={{
                              background:
                                'radial-gradient(circle at 70% 30%, #DFBA67 0%, transparent 65%)',
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ServiceIcon slug={slug} className="w-16 h-16 text-[#DFBA67]" />
                          </div>
                        </>
                      )}
                      {pCategory && (
                        <span className="absolute top-4 left-4 bg-white/95 text-[#0E1635] text-xs uppercase tracking-widest px-3 py-1.5 rounded-full font-bold">
                          {pCategory}
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-xl mb-2 text-[#0E1635] leading-tight group-hover:text-[#DFBA67] transition-colors">
                        {pTitle}
                      </h3>
                      {pClientName && (
                        <p className="text-sm text-[#475569] mb-3 font-medium">{pClientName}</p>
                      )}
                      {pDescription && (
                        <p className="text-[#475569] text-sm leading-relaxed line-clamp-3">
                          {pDescription}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── FAQs — LIGHT section with bordered accordions ─── */}
      {service?.faqs && service.faqs.length > 0 && (
        <section className="bg-[#FAF7F2] text-[#0E1635] py-24 lg:py-32 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center">
              <p className="text-[#DFBA67] uppercase tracking-widest text-sm font-bold mb-3">
                {faqsEyebrow}
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-4">
                {faqsTitle}
              </h2>
            </div>

            <div className="space-y-3">
              {service.faqs.map((faq) => (
                <details
                  key={faq._id}
                  className="bg-white border border-black/5 rounded-2xl p-6 group hover:border-[#DFBA67]/40 hover:shadow-xl hover:shadow-black/5 transition-all duration-300"
                >
                  <summary className="flex justify-between items-center cursor-pointer font-bold text-[#0E1635] list-none gap-6">
                    <span className="text-lg">{L(faq.question)}</span>
                    <span className="flex-shrink-0 w-9 h-9 rounded-full bg-[#FAF7F2] text-[#DFBA67] text-2xl flex items-center justify-center group-open:rotate-45 group-open:bg-[#DFBA67] group-open:text-[#0E1635] transition-all duration-300">
                      +
                    </span>
                  </summary>
                  <p className="mt-5 text-[#475569] leading-relaxed">{L(faq.answer)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Strategy form — DARK section so the form pops ─── */}
      <section id="service-form" className="relative bg-[#0E1635] text-white py-24 lg:py-32 px-6 overflow-hidden">
        {/* Decorative gold gradient wash */}
        <div
          className="absolute -bottom-32 -left-32 w-[40rem] h-[40rem] opacity-25 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #DFBA67 0%, transparent 60%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4 text-sm font-bold">
              {formEyebrow}
            </p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.05] tracking-tight">
              {formTitle}
            </h2>
            <p className="text-lg text-[#D6D8E0] leading-relaxed">
              {formSubtitle}
            </p>
          </div>

          <div className="bg-white text-[#0E1635] rounded-[2rem] p-8 shadow-2xl shadow-black/40">
            <StrategyForm
              variant="light"
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
              defaultService={serviceTitle || ''}
              submitText={formSubmitText}
              successMessage={L(formSettings?.successMessage) || "Thanks — we'll be in touch shortly."}
              errorMessage={L(formSettings?.errorMessage) || 'Sorry, something went wrong. Please try again or email us directly.'}
            />
          </div>
        </div>
      </section>

      {/* ─── Final CTA banner — bold gold band ─── */}
      <section className="relative bg-[#DFBA67] text-[#0E1635] py-20 px-6 overflow-hidden">
        {/* Decorative pattern of soft circles */}
        <div
          className="absolute -top-24 -right-24 w-[30rem] h-[30rem] rounded-full opacity-25 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0E1635 0%, transparent 70%)' }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-5">
            {serviceCtaTitle}
          </h2>
          <p className="text-lg mb-8 opacity-90">{serviceCtaText}</p>
          <a
            href={finalCtaButtonLink}
            className="inline-flex items-center gap-2 bg-[#0E1635] text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/40 transition-all duration-300 shadow-xl shadow-black/30 group/cta"
          >
            <span>{finalCtaButtonText}</span>
            <span className="text-[#DFBA67] group-hover/cta:translate-x-1 transition-transform text-xl">›</span>
          </a>
        </div>
      </section>
    </PageLayout>
  )
}
