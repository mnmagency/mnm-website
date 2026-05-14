import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'
import { localize, localizePath } from '@/lib/locale'
import { getLocale } from '@/lib/locale-server'

export const revalidate = 60

type LocaleField = { en?: string; ar?: string } | string | null | undefined
type ImageRef = { asset?: { url?: string } }
type Slug = { current?: string }

type ProofItem = { number?: string; label?: LocaleField }
type GrowthStep = { title?: LocaleField; text?: LocaleField }
type LogoItem = { name?: LocaleField; logo?: ImageRef }

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
  aboutPattern?: ImageRef
  servicesEyebrow?: LocaleField
  servicesTitle?: LocaleField
  caseStudiesEyebrow?: LocaleField
  caseStudiesTitle?: LocaleField
  caseStudiesLinkText?: LocaleField
  caseStudyCardCta?: LocaleField
  missionEyebrow?: LocaleField
  missionTitle?: LocaleField
  missionText?: LocaleField
  workEyebrow?: LocaleField
  workTitle?: LocaleField
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
type WorkCard = {
  title?: LocaleField
  category?: LocaleField
  description?: LocaleField
  slug?: Slug
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
      seo{
        metaTitle,
        metaDescription,
        canonicalUrl,
        ogImage{ asset->{url} }
      }
    }
  `)

  const seo = homepage?.seo
  const title = localize(seo?.metaTitle, locale) || 'M&M Marketing Qatar'
  const description =
    localize(seo?.metaDescription, locale) ||
    'AI-driven marketing agency in Qatar focused on measurable business growth.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: seo?.ogImage?.asset?.url ? [seo.ogImage.asset.url] : [],
    },
    alternates: {
      canonical: seo?.canonicalUrl || undefined,
    },
  }
}

export default async function Home() {
  const locale = await getLocale()
  const data = await client.fetch<{
    homepage: Homepage | null
    services: ServiceCard[]
    caseStudies: CaseStudyCard[]
    selectedWork: WorkCard[]
    posts: BlogCard[]
  }>(`
    {
      "homepage": *[_type == "homepage"][0]{
        seo{ metaTitle, metaDescription, focusKeyword, canonicalUrl, ogImage{ asset->{url} } },
        heroEyebrow, title, subtitle, heroImageAlt,
        buttonText, buttonLink,
        secondaryButtonText, secondaryButtonLink,
        heroMediaType, heroImage{ asset->{url} }, heroVideoUrl,
        proofItems, proofEyebrow,
        systemEyebrow, systemTitle, growthSteps,
        aboutEyebrow, aboutTitle, aboutText,
        aboutButtonText, aboutButtonLink,
        aboutImage{ asset->{url} },
        aboutPattern{ asset->{url} },
        aboutLogos[]{ name, logo{ asset->{url} } },
        servicesEyebrow, servicesTitle,
        caseStudiesEyebrow, caseStudiesTitle, caseStudiesLinkText, caseStudyCardCta,
        missionEyebrow, missionTitle, missionText,
        workEyebrow, workTitle,
        blogPill, blogTitle, blogDescription, blogLinkText,
        clientsBannerTitle,
        clientLogos[]{ name, logo{ asset->{url} } },
        finalCtaTitle, finalCtaText, finalCtaButtonText, finalCtaButtonLink
      },
      "services": *[_type == "service"]{
        title, description, slug, image{ asset->{url} }
      },
      "caseStudies": *[_type == "caseStudy"] | order(_createdAt desc)[0...3]{
        title, slug, category, description, results, image{ asset->{url} }
      },
      "selectedWork": *[_type == "caseStudy"] | order(_createdAt desc)[0...4]{
        title, category, description, slug, image{ asset->{url} }
      },
      "posts": *[_type == "blog"] | order(publishedAt desc)[0...3]{
        title, slug, category, excerpt, image{ asset->{url} }
      }
    }
  `)

  const homepage = data?.homepage
  const L = (f: LocaleField) => localize(f, locale)

  // Fallbacks preserve the previous hardcoded copy so the page never goes blank
  // before an editor populates the Arabic values.
  const heroEyebrow         = L(homepage?.heroEyebrow)         || 'AI-Driven Growth Partner in Qatar'
  const heroTitle           = L(homepage?.title)
  const heroSubtitle        = L(homepage?.subtitle)
  const heroImageAlt        = L(homepage?.heroImageAlt)        || 'M&M Marketing Growth System'
  const proofEyebrow        = L(homepage?.proofEyebrow)        || 'Revenue Proof'
  const clientsBannerTitle  = L(homepage?.clientsBannerTitle)  || 'Trusted by brands across Qatar'
  const systemEyebrow       = L(homepage?.systemEyebrow)       || 'The Growth System'
  const systemTitle         = L(homepage?.systemTitle)         || "We don't run random campaigns. We build revenue systems."
  const servicesEyebrow     = L(homepage?.servicesEyebrow)     || 'Our Services'
  const servicesTitle       = L(homepage?.servicesTitle)       || 'Services built to generate revenue.'
  const caseStudiesEyebrow  = L(homepage?.caseStudiesEyebrow)  || 'Proven Results'
  const caseStudiesTitle    = L(homepage?.caseStudiesTitle)    || 'Real businesses. Real measurable growth.'
  const caseStudiesLinkText = L(homepage?.caseStudiesLinkText) || 'View all case studies →'
  const caseStudyCardCta    = L(homepage?.caseStudyCardCta)    || 'View Case Study →'
  const missionEyebrow      = L(homepage?.missionEyebrow)      || 'Our Mission'
  const missionTitle        = L(homepage?.missionTitle)
  const missionText         = L(homepage?.missionText)
  const workEyebrow         = L(homepage?.workEyebrow)         || 'Selected Work'
  const workTitle           = L(homepage?.workTitle)           || 'Work that turns attention into measurable growth.'
  const blogPill            = L(homepage?.blogPill)            || 'Daily News'
  const blogTitle           = L(homepage?.blogTitle)           || 'Read from our blog'
  const blogDescription     = L(homepage?.blogDescription)     || 'Insights on websites, SEO, social media, AI-driven growth, and revenue systems.'
  const blogLinkText        = L(homepage?.blogLinkText)        || 'Read more from the blog ›'
  const finalCtaTitle       = L(homepage?.finalCtaTitle)
  const finalCtaText        = L(homepage?.finalCtaText)
  const finalCtaButtonText  = L(homepage?.finalCtaButtonText)  || L(homepage?.buttonText) || 'Get Your AI Growth Strategy'
  const finalCtaButtonLink  = homepage?.finalCtaButtonLink || homepage?.buttonLink || '/get-strategy'
  const buttonText          = L(homepage?.buttonText)
  const secondaryButtonText = L(homepage?.secondaryButtonText)
  const aboutEyebrow        = L(homepage?.aboutEyebrow)
  const aboutTitle          = L(homepage?.aboutTitle)
  const aboutText           = L(homepage?.aboutText)
  const aboutButtonText     = L(homepage?.aboutButtonText)

  return (
    <PageLayout>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center px-6 pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(223,186,103,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(138,149,165,0.14),transparent_35%)]" />

        <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#DFBA67] uppercase tracking-widest mb-5">
              {heroEyebrow}
            </p>

            <h1 className="text-4xl md:text-7xl font-bold leading-[1.05] mb-6 tracking-tight">
              {heroTitle}
            </h1>

            <p className="text-lg md:text-xl text-[#8A95A5] mb-8 leading-relaxed">
              {heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {buttonText && (
                <a
                  href={homepage?.buttonLink ? localizePath(homepage.buttonLink, locale) : localizePath('/get-strategy', locale)}
                  className="bg-[#DFBA67] text-[#33314E] px-8 py-4 rounded-full font-bold text-center hover:opacity-90 transition"
                >
                  {buttonText}
                </a>
              )}

              {secondaryButtonText && (
                <a
                  href={homepage?.secondaryButtonLink ? localizePath(homepage.secondaryButtonLink, locale) : '#case-studies'}
                  className="border border-[#DFBA67] text-[#DFBA67] px-8 py-4 rounded-full font-bold text-center hover:bg-[#DFBA67] hover:text-[#33314E] transition"
                >
                  {secondaryButtonText}
                </a>
              )}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/30 backdrop-blur">
            {homepage?.heroMediaType === 'video' && homepage?.heroVideoUrl ? (
              <video
                src={homepage.heroVideoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-[420px] object-cover"
              />
            ) : homepage?.heroImage?.asset?.url ? (
              <Image
                src={homepage.heroImage.asset.url}
                alt={heroImageAlt}
                width={1200}
                height={700}
                priority
                className="w-full h-[420px] object-cover"
              />
            ) : (
              <div className="p-8">
                <p className="text-[#DFBA67] mb-6 font-bold">
                  {proofEyebrow}
                </p>

                <div className="space-y-6">
                  {homepage?.proofItems?.map((item, index) => (
                    <div key={index}>
                      <h3 className="text-4xl font-bold text-white">
                        {item.number}
                      </h3>
                      <p className="text-[#8A95A5]">{localize(item.label, locale)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CLIENT LOGOS BANNER */}
      {homepage?.clientLogos && homepage.clientLogos.length > 0 && (
        // dir="ltr" forces the marquee to behave the same way in RTL pages.
        // Without this, dir="rtl" inverts the flex item order and the
        // translateX animation pushes the logos off the visible viewport.
        <section dir="ltr" className="bg-white py-10 overflow-hidden">
          <div className="mb-6 text-center">
            <p className="text-[#DFBA67] uppercase tracking-widest text-sm font-bold">
              {clientsBannerTitle}
            </p>
          </div>

          <div className="relative w-full overflow-hidden">
            <div className="flex w-max animate-[scroll_28s_linear_infinite] gap-16">
              {[...homepage.clientLogos, ...homepage.clientLogos].map(
                (clientLogo, index) => (
                  <div
                    key={index}
                    className="w-[180px] h-[90px] flex items-center justify-center"
                  >
                    {clientLogo?.logo?.asset?.url && (
                      <Image
                        src={clientLogo.logo.asset.url}
                        alt={localize(clientLogo.name, locale) || 'Client logo'}
                        width={180}
                        height={90}
                        className="max-w-[160px] max-h-[70px] object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition"
                      />
                    )}
                  </div>
                )
              )}
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

      {/* RESULTS STRIP */}
      <section className="border-y border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-center">
          {homepage?.proofItems?.map((item, index) => (
            <div key={index}>
              <h3 className="text-3xl font-bold text-[#DFBA67]">
                {item.number}
              </h3>
              <p className="text-[#8A95A5]">{localize(item.label, locale)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SYSTEM */}
      <section id="system" className="max-w-7xl mx-auto px-6 py-24">
        <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
          {systemEyebrow}
        </p>

        <h2 className="text-3xl md:text-5xl font-bold mb-12">
          {systemTitle}
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {homepage?.growthSteps?.map((step, index) => (
            <div
              key={index}
              className="bg-white/[0.06] border border-white/10 rounded-3xl p-6 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/10"
            >
              <span className="text-[#DFBA67] font-bold">
                0{index + 1}
              </span>

              <h3 className="text-2xl font-bold mt-4 mb-3">
                {localize(step.title, locale)}
              </h3>

              <p className="text-[#8A95A5]">{localize(step.text, locale)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT JOURNEY */}
      {aboutTitle && (
        <section
          className="relative text-[#33314E] overflow-hidden"
          style={{
            backgroundImage: `url(${homepage?.aboutPattern?.asset?.url || ''})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-white/85" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-14 items-center">
            <div>
              {homepage?.aboutLogos && homepage.aboutLogos.length > 0 && (
                <div className="flex items-center gap-4 mb-8 flex-wrap">
                  {homepage.aboutLogos.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl border border-black/10 w-[150px] h-[70px] shadow-sm flex items-center justify-center"
                    >
                      {item?.logo?.asset?.url && (
                        <Image
                          src={item.logo.asset.url}
                          alt={localize(item.name, locale) || 'Partner logo'}
                          width={150}
                          height={70}
                          className="max-h-12 max-w-[120px] object-contain"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
                {aboutEyebrow}
              </p>

              <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                {aboutTitle}
              </h2>

              <p className="text-lg text-[#6B7280] leading-relaxed mb-8">
                {aboutText}
              </p>

              {aboutButtonText && homepage?.aboutButtonLink && (
                <a
                  href={localizePath(homepage.aboutButtonLink, locale)}
                  className="inline-block bg-[#33314E] text-white px-8 py-4 rounded-xl font-bold hover:scale-[1.03] transition-all duration-300 shadow-xl shadow-black/10"
                >
                  {aboutButtonText}
                </a>
              )}
            </div>

            {homepage?.aboutImage?.asset?.url && (
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/20 border border-black/5">
                <Image
                  src={homepage.aboutImage.asset.url}
                  alt={aboutTitle || 'About M&M Marketing'}
                  width={900}
                  height={700}
                  className="w-full h-[520px] object-cover"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* SERVICES */}
      <section id="services" className="max-w-7xl mx-auto px-6 py-24">
        <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
          {servicesEyebrow}
        </p>

        <h2 className="text-3xl md:text-5xl font-bold mb-12">
          {servicesTitle}
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data?.services?.map((service, index) => {
            const sTitle = localize(service.title, locale)
            const sDesc = localize(service.description, locale)
            return (
              <a
                key={index}
                href={localizePath(`/services/${service.slug?.current}`, locale)}
                className="group relative block overflow-hidden rounded-3xl border border-white/10 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/20"
              >
                {service?.image?.asset?.url && (
                  <Image
                    src={service.image.asset.url}
                    alt={sTitle || 'M&M Marketing service'}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition duration-700"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                <div className="relative z-10 p-6 h-[260px] flex flex-col items-center justify-center text-center">
                  <h3 className="text-2xl font-bold mb-3 text-white">
                    {sTitle}
                  </h3>

                  <p className="text-white/70 text-sm leading-relaxed max-w-[90%]">
                    {sDesc}
                  </p>
                </div>
              </a>
            )
          })}
        </div>
      </section>

      {/* CASE STUDIES */}
      <section id="case-studies" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
              {caseStudiesEyebrow}
            </p>

            <h2 className="text-3xl md:text-5xl font-bold max-w-3xl">
              {caseStudiesTitle}
            </h2>
          </div>

          <Link
            href={localizePath('/case-studies', locale)}
            className="text-[#DFBA67] font-bold hover:opacity-80 transition"
          >
            {caseStudiesLinkText}
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {data?.caseStudies?.map((caseStudy, index) => {
            const cTitle = localize(caseStudy.title, locale)
            const cCategory = localize(caseStudy.category, locale)
            const cDesc = localize(caseStudy.description, locale) || localize(caseStudy.results, locale)
            return (
              <a
                key={index}
                href={localizePath(`/case-studies/${caseStudy.slug?.current}`, locale)}
                className="group overflow-hidden rounded-3xl bg-white/[0.06] border border-white/10 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/10"
              >
                <div className="h-[240px] bg-white/10 overflow-hidden">
                  {caseStudy?.image?.asset?.url && (
                    <Image
                      src={caseStudy.image.asset.url}
                      alt={cTitle || 'Case study'}
                      width={700}
                      height={420}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    />
                  )}
                </div>

                <div className="p-7">
                  <p className="text-[#DFBA67] uppercase tracking-widest text-xs mb-3">
                    {cCategory || 'Case Study'}
                  </p>

                  <h3 className="text-2xl font-bold mb-4">
                    {cTitle}
                  </h3>

                  <p className="text-[#8A95A5] leading-relaxed mb-5">
                    {cDesc}
                  </p>

                  <span className="text-[#DFBA67] font-bold">
                    {caseStudyCardCta}
                  </span>
                </div>
              </a>
            )
          })}
        </div>
      </section>

      {/* MISSION */}
      <section id="mission" className="bg-white/5 border-y border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
            {missionEyebrow}
          </p>

          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {missionTitle}
          </h2>

          <p className="text-lg text-[#8A95A5] leading-relaxed">
            {missionText}
          </p>
        </div>
      </section>

      {/* OUR WORK */}
      <section id="our-work" className="bg-white text-[#33314E]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="mb-12">
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
              {workEyebrow}
            </p>

            <h2 className="text-3xl md:text-5xl font-bold max-w-3xl">
              {workTitle}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {data?.selectedWork?.map((work, index) => {
              const wTitle = localize(work.title, locale)
              const wCategory = localize(work.category, locale)
              const wDesc = localize(work.description, locale)
              return (
                <a
                  key={index}
                  href={localizePath(`/case-studies/${work.slug?.current}`, locale)}
                  className="group rounded-3xl overflow-hidden bg-[#F6F6F8] border border-black/5 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-black/5"
                >
                  <div className="h-[340px] overflow-hidden bg-[#EDEDF0]">
                    {work?.image?.asset?.url ? (
                      <Image
                        src={work.image.asset.url}
                        alt={wTitle || 'M&M Marketing work'}
                        width={900}
                        height={560}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#33314E]/40 text-xl font-bold">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="p-8">
                    <p className="text-sm uppercase tracking-widest text-[#DFBA67] mb-3">
                      {wCategory}
                    </p>

                    <h3 className="text-3xl font-bold mb-3">
                      {wTitle}
                    </h3>

                    <p className="text-[#6B7280] leading-relaxed">
                      {wDesc}
                    </p>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          {finalCtaTitle}
        </h2>

        <p className="text-[#8A95A5] mb-8 text-lg">
          {finalCtaText}
        </p>

        <a
          href={localizePath(finalCtaButtonLink, locale)}
          className="inline-block bg-[#DFBA67] text-[#33314E] px-10 py-4 rounded-full font-bold hover:scale-[1.03] transition-all duration-300 shadow-lg shadow-[#DFBA67]/20"
        >
          {finalCtaButtonText}
        </a>
      </section>

      {/* LATEST BLOGS */}
      {data?.posts?.length > 0 && (
        <section className="bg-white text-[#33314E]">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="text-center mb-14">
              <p className="inline-block bg-[#F6F6F8] text-[#33314E] px-5 py-2 rounded-full text-sm font-bold mb-6 shadow-sm">
                {blogPill}
              </p>

              <h2 className="text-3xl md:text-5xl font-bold mb-5">
                {blogTitle}
              </h2>

              <p className="text-[#6B7280] text-lg max-w-2xl mx-auto mb-6">
                {blogDescription}
              </p>

              <Link
                href={localizePath('/blog', locale)}
                className="text-[#33314E] font-bold hover:text-[#DFBA67] transition"
              >
                {blogLinkText}
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {data.posts.map((post, index) => {
                const pTitle = localize(post.title, locale)
                const pCategory = localize(post.category, locale)
                const pExcerpt = localize(post.excerpt, locale)
                return (
                  <a
                    key={index}
                    href={localizePath(`/blog/${post.slug?.current}`, locale)}
                    className="group overflow-hidden rounded-3xl bg-white border border-black/5 shadow-xl shadow-black/10 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="h-[260px] overflow-hidden bg-[#F6F6F8]">
                      {post?.image?.asset?.url && (
                        <Image
                          src={post.image.asset.url}
                          alt={pTitle || 'Blog article'}
                          width={700}
                          height={460}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                        />
                      )}
                    </div>

                    <div className="p-7">
                      <p className="inline-block bg-[#F0EEF8] text-[#33314E] px-3 py-1 rounded-md text-xs font-bold mb-5">
                        {pCategory || 'Articles'}
                      </p>

                      <h3 className="text-2xl md:text-3xl font-bold leading-tight mb-4">
                        {pTitle}
                      </h3>

                      <p className="text-[#6B7280] leading-relaxed">
                        {pExcerpt}
                      </p>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </PageLayout>
  )
}
