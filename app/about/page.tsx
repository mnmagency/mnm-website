import Image from 'next/image'
import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'
import { localize, localizePath } from '@/lib/locale'
import { getLocale } from '@/lib/locale-server'

export const revalidate = 60

type LocaleField = { en?: string; ar?: string } | string | null | undefined

type AboutPage = {
  seo?: {
    metaTitle?: LocaleField
    metaDescription?: LocaleField
    canonicalUrl?: string
    ogImage?: { asset?: { url?: string } }
  }
  eyebrow?: LocaleField
  title?: LocaleField
  subtitle?: LocaleField
  heroImage?: { asset?: { url?: string } }
  heroImageAlt?: LocaleField
  positioningTitle?: LocaleField
  positioning?: LocaleField
  missionEyebrow?: LocaleField
  missionTitle?: LocaleField
  missionText?: LocaleField
  methodologyEyebrow?: LocaleField
  methodologyTitle?: LocaleField
  methodologyText?: LocaleField
  principlesEyebrow?: LocaleField
  principlesTitle?: LocaleField
  principles?: Array<LocaleField>
  ctaTitle?: LocaleField
  ctaText?: LocaleField
  ctaButtonText?: LocaleField
  ctaButtonLink?: string
}

export async function generateMetadata() {
  const locale = await getLocale()
  const page = await client.fetch<AboutPage | null>(`
    *[_type == "aboutPage"][0]{
      seo{ metaTitle, metaDescription, canonicalUrl }
    }
  `)

  const seo = page?.seo
  return {
    title: localize(seo?.metaTitle, locale) || 'About M&M Marketing Qatar',
    description:
      localize(seo?.metaDescription, locale) ||
      'M&M Marketing builds growth systems combining strategy, execution, and measurable results for businesses in Qatar.',
    alternates: { canonical: seo?.canonicalUrl || undefined },
  }
}

export default async function AboutPage() {
  const locale = await getLocale()
  const page = await client.fetch<AboutPage | null>(`
    *[_type == "aboutPage"][0]{
      eyebrow, title, subtitle,
      heroImage{ asset->{url} }, heroImageAlt,
      positioningTitle, positioning,
      missionEyebrow, missionTitle, missionText,
      methodologyEyebrow, methodologyTitle, methodologyText,
      principlesEyebrow, principlesTitle, principles,
      ctaTitle, ctaText, ctaButtonText, ctaButtonLink
    }
  `)

  const L = (f: LocaleField) => localize(f, locale)
  const eyebrow            = L(page?.eyebrow)            || 'About'
  const title              = L(page?.title)
  const subtitle           = L(page?.subtitle)
  const heroImageAlt       = L(page?.heroImageAlt)       || 'About M&M Marketing'
  const positioningTitle   = L(page?.positioningTitle)   || "We don't just market. We build growth systems."
  const positioning        = L(page?.positioning)
  const missionEyebrow     = L(page?.missionEyebrow)     || 'Mission'
  const missionTitle       = L(page?.missionTitle)
  const missionText        = L(page?.missionText)
  const methodologyEyebrow = L(page?.methodologyEyebrow) || 'Methodology'
  const methodologyTitle   = L(page?.methodologyTitle)
  const methodologyText    = L(page?.methodologyText)
  const principlesEyebrow  = L(page?.principlesEyebrow)  || 'Principles'
  const principlesTitle    = L(page?.principlesTitle)    || 'How we think. How we execute.'
  const ctaTitle           = L(page?.ctaTitle)
  const ctaText            = L(page?.ctaText)
  const ctaButtonText      = L(page?.ctaButtonText)      || 'Get Free Consultation'
  const ctaButtonLink      = localizePath(page?.ctaButtonLink || '/get-strategy', locale)

  return (
    <PageLayout>
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-40 pb-24">
        <p className="text-[#DFBA67] uppercase tracking-widest mb-4">{eyebrow}</p>

        <h1 className="text-4xl md:text-7xl font-bold mb-6 max-w-5xl">{title}</h1>

        <p className="text-lg text-[#8A95A5] max-w-3xl">{subtitle}</p>

        {page?.heroImage?.asset?.url && (
          <div className="relative mt-12 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/30 h-[280px] sm:h-[380px] lg:h-[500px]">
            <Image
              src={page.heroImage.asset.url}
              alt={heroImageAlt}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="object-cover"
            />
          </div>
        )}
      </section>

      {/* POSITIONING */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{positioningTitle}</h2>
          <p className="text-[#8A95A5] leading-relaxed text-lg">{positioning}</p>
        </div>
      </section>

      {/* MISSION + METHODOLOGY */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-8">
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4">{missionEyebrow}</p>
            <h2 className="text-2xl font-bold mb-4">{missionTitle}</h2>
            <p className="text-[#8A95A5] leading-relaxed whitespace-pre-line">{missionText}</p>
          </div>

          <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-8">
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4">{methodologyEyebrow}</p>
            <h2 className="text-2xl font-bold mb-4">{methodologyTitle}</h2>
            <p className="text-[#8A95A5] leading-relaxed whitespace-pre-line">{methodologyText}</p>
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      {page?.principles && page.principles.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <p className="text-[#DFBA67] uppercase tracking-widest mb-4">{principlesEyebrow}</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-10">{principlesTitle}</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {page.principles.map((item: LocaleField, index: number) => (
              <div key={index} className="bg-white/[0.06] border border-white/10 rounded-2xl p-6">
                <span className="text-[#DFBA67] font-bold block mb-3">0{index + 1}</span>
                <p className="text-[#8A95A5]">{L(item)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-[#DFBA67] text-[#0E1635] rounded-[2rem] p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">{ctaTitle}</h2>
          <p className="text-lg text-[#0E1635]/80 max-w-3xl mx-auto mb-8">{ctaText}</p>
          <a href={ctaButtonLink} className="inline-block bg-[#0E1635] text-white px-10 py-4 rounded-full font-bold">
            {ctaButtonText}
          </a>
        </div>
      </section>
    </PageLayout>
  )
}
