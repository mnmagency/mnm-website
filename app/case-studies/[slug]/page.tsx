import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'
import { localize, localizePath } from '@/lib/locale'
import { getLocale } from '@/lib/locale-server'

type LocaleField = { en?: string; ar?: string } | string | null | undefined
type ImageRef = { asset?: { url?: string } }

type CaseStudy = {
  title?: LocaleField
  client?: string
  industry?: LocaleField
  category?: LocaleField
  description?: LocaleField
  challenge?: LocaleField
  solution?: LocaleField
  results?: LocaleField
  image?: ImageRef
  seo?: { metaTitle?: LocaleField; metaDescription?: LocaleField; canonicalUrl?: string; ogImage?: ImageRef }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()

  const caseStudy = await client.fetch<CaseStudy | null>(
    `*[_type == "caseStudy" && slug.current == $slug][0]{
      title, description, results,
      seo{ metaTitle, metaDescription, canonicalUrl, ogImage{ asset->{url} } },
      image{ asset->{url} }
    }`,
    { slug }
  )

  const seo = caseStudy?.seo
  const title = localize(seo?.metaTitle, locale) || `${localize(caseStudy?.title, locale) || 'Case Study'} | M&M Marketing Qatar`
  const description = localize(seo?.metaDescription, locale) ||
    localize(caseStudy?.description, locale) ||
    localize(caseStudy?.results, locale) ||
    'Explore M&M Marketing case studies and measurable growth results in Qatar.'

  return {
    title, description,
    openGraph: {
      title, description,
      images: seo?.ogImage?.asset?.url ? [seo.ogImage.asset.url] : caseStudy?.image?.asset?.url ? [caseStudy.image.asset.url] : [],
    },
    alternates: { canonical: seo?.canonicalUrl || undefined },
  }
}

export default async function CaseStudyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()
  const L = (f: LocaleField) => localize(f, locale)

  const caseStudy = await client.fetch<CaseStudy | null>(
    `*[_type == "caseStudy" && slug.current == $slug][0]{
      title, client, industry, category, description, challenge, solution, results,
      image{ asset->{url} }
    }`,
    { slug }
  )

  if (!caseStudy) {
    return (
      <PageLayout>
        <section className="max-w-4xl mx-auto px-6 pt-40 pb-24">
          <h1 className="text-4xl font-bold text-[#DFBA67]">
            {locale === 'ar' ? 'دراسة الحالة غير موجودة' : 'Case study not found'}
          </h1>
        </section>
      </PageLayout>
    )
  }

  const title       = L(caseStudy.title)
  const description = L(caseStudy.description)
  const challenge   = L(caseStudy.challenge)
  const solution    = L(caseStudy.solution)
  const results     = L(caseStudy.results)
  const category    = L(caseStudy.category)
  const industry    = L(caseStudy.industry)

  const labelClient    = locale === 'ar' ? 'العميل' : 'Client'
  const labelIndustry  = locale === 'ar' ? 'القطاع' : 'Industry'
  const labelResult    = locale === 'ar' ? 'النتيجة' : 'Result'
  const labelChallenge = locale === 'ar' ? 'التحدي' : 'Challenge'
  const challengeTitle = locale === 'ar' ? 'ما الذي كان يحتاج إلى التغيير' : 'What needed to change'
  const labelSolution  = locale === 'ar' ? 'الحل' : 'Solution'
  const solutionTitle  = locale === 'ar' ? 'كيف تعاملنا مع الأمر' : 'How we approached it'
  const resultsLabel   = locale === 'ar' ? 'النتائج' : 'Results'
  const resultsHeading = locale === 'ar' ? 'أثر قابل للقياس من خلال الاستراتيجية والتنفيذ.' : 'Measurable impact delivered through strategy and execution.'
  const ctaTitle       = locale === 'ar' ? 'تريد نتائج مماثلة؟' : 'Want results like this?'
  const ctaText        = locale === 'ar' ? 'لنبني نظام نمو مصمم حول أهداف عملك وسوقك وإيراداتك.' : "Let's build a growth system designed around your business goals, market, and revenue targets."
  const ctaButtonText  = locale === 'ar' ? 'احصل على استشارة مجانية' : 'Get Free Consultation'
  const backLabel      = locale === 'ar' ? '→ العودة إلى دراسات الحالة' : '← Back to Case Studies'

  return (
    <PageLayout>
      {/* HERO */}
      <section className="relative px-6 pt-40 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(223,186,103,0.16),transparent_35%)]" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <Link href={localizePath('/case-studies', locale)} className="text-[#DFBA67] font-bold inline-block mb-10">
            {backLabel}
          </Link>

          <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
            {category || industry || (locale === 'ar' ? 'دراسة حالة' : 'Case Study')}
          </p>

          <h1 className="text-4xl md:text-7xl font-bold leading-tight max-w-5xl mb-6">
            {title}
          </h1>

          <p className="text-lg md:text-xl text-[#8A95A5] max-w-3xl leading-relaxed">
            {description}
          </p>
        </div>
      </section>

      {/* IMAGE */}
      {caseStudy?.image?.asset?.url && (
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/30 h-[280px] sm:h-[380px] lg:h-[520px]">
            <Image
              src={caseStudy.image.asset.url}
              alt={title || 'Case study image'}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="object-cover"
            />
          </div>
        </section>
      )}

      {/* DETAILS */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid lg:grid-cols-3 gap-8">
          {caseStudy.client && (
            <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-8">
              <p className="text-[#DFBA67] uppercase tracking-widest mb-3">{labelClient}</p>
              <h2 className="text-2xl font-bold">{caseStudy.client}</h2>
            </div>
          )}

          {(industry || category) && (
            <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-8">
              <p className="text-[#DFBA67] uppercase tracking-widest mb-3">{labelIndustry}</p>
              <h2 className="text-2xl font-bold">{industry || category}</h2>
            </div>
          )}

          {results && (
            <div className="bg-[#DFBA67] text-[#0E1635] rounded-3xl p-8">
              <p className="uppercase tracking-widest mb-3 font-bold">{labelResult}</p>
              <h2 className="text-2xl font-bold">{results}</h2>
            </div>
          )}
        </div>
      </section>

      {/* STORY */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-8">
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4">{labelChallenge}</p>
            <h2 className="text-3xl font-bold mb-6">{challengeTitle}</h2>
            <p className="text-[#8A95A5] leading-relaxed whitespace-pre-line">{challenge}</p>
          </div>

          <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-8">
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4">{labelSolution}</p>
            <h2 className="text-3xl font-bold mb-6">{solutionTitle}</h2>
            <p className="text-[#8A95A5] leading-relaxed whitespace-pre-line">{solution}</p>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-white text-[#0E1635] rounded-[2rem] p-10 md:p-16 shadow-2xl shadow-black/20">
          <p className="text-[#DFBA67] uppercase tracking-widest mb-4">{resultsLabel}</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">{resultsHeading}</h2>
          <p className="text-lg text-[#6B7280] leading-relaxed whitespace-pre-line max-w-4xl">{results}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-[#DFBA67] text-[#0E1635] rounded-[2rem] p-10 md:p-16 text-center shadow-2xl shadow-black/20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">{ctaTitle}</h2>
          <p className="text-lg text-[#0E1635]/80 max-w-3xl mx-auto mb-8">{ctaText}</p>
          <a
            href={localizePath('/get-strategy', locale)}
            className="inline-block bg-[#0E1635] text-white px-10 py-4 rounded-full font-bold hover:scale-[1.03] transition-all duration-300"
          >
            {ctaButtonText}
          </a>
        </div>
      </section>
    </PageLayout>
  )
}
