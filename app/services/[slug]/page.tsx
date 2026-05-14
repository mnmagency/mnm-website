import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'
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
  finalCtaButtonText?: LocaleField
  finalCtaButtonLink?: string
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
    'M&M Marketing provides digital marketing, websites, SEO, social media, branding, paid media, and AI-driven growth services in Qatar.'

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

  const service = await client.fetch<Service | null>(
    `
      *[_type == "service" && slug.current == $slug][0]{
        _id,
        title,
        description,
        content,
        whyItMatters,
        deliverables,
        ctaTitle,
        ctaText,
        heroEyebrow,
        heroCtaButtonText,
        heroCtaButtonLink,
        whatWeBuildEyebrow,
        whatWeBuildTitle,
        whyItMattersEyebrow,
        whyItMattersTitle,
        deliverablesEyebrow,
        deliverablesTitle,
        projectsEyebrow,
        projectsTitle,
        faqsEyebrow,
        faqsTitle,
        finalCtaButtonText,
        finalCtaButtonLink,
        image{ asset->{url} },
        projects[]{
          clientName,
          category,
          title,
          description,
          projectImage{ asset->{url} },
          clientLogo{ asset->{url} }
        },
        sections[]{
          _type,
          eyebrow,
          title,
          subtitle,
          content,
          caption,
          items,
          text,
          buttonText,
          buttonLink,
          image{ asset->{url} }
        },
        "faqs": *[_type == "faq" && relatedService._ref == ^._id] | order(_createdAt asc){
          _id, question, answer
        }
      }
    `,
    { slug }
  )

  if (!service) {
    return (
      <PageLayout>
        <section className="max-w-4xl mx-auto px-6 pt-40 pb-24">
          <h1 className="text-4xl font-bold text-[#DFBA67]">
            Service not found
          </h1>
        </section>
      </PageLayout>
    )
  }

  // Fallbacks
  const heroEyebrow         = L(service.heroEyebrow)         || 'M&M Service'
  const heroCtaButtonText   = L(service.heroCtaButtonText)   || 'Get Your AI Growth Strategy'
  const heroCtaButtonLink   = localizePath(service.heroCtaButtonLink || '/get-strategy', locale)
  const whatWeBuildEyebrow  = L(service.whatWeBuildEyebrow)  || 'What We Build'
  const whatWeBuildTitle    = L(service.whatWeBuildTitle)    || 'Built as a revenue system, not a digital brochure.'
  const whyItMattersEyebrow = L(service.whyItMattersEyebrow) || 'Why It Matters'
  const whyItMattersTitle   = L(service.whyItMattersTitle)   || 'Your digital presence directly affects growth.'
  const deliverablesEyebrow = L(service.deliverablesEyebrow) || 'Deliverables'
  const deliverablesTitle   = L(service.deliverablesTitle)   || 'Everything needed to turn strategy into measurable execution.'
  const projectsEyebrow     = L(service.projectsEyebrow)     || 'Companies We Worked For'
  const projectsTitle       = L(service.projectsTitle)       || 'Selected projects built to create measurable growth.'
  const faqsEyebrow         = L(service.faqsEyebrow)         || 'FAQs'
  const faqsTitle           = L(service.faqsTitle)           || 'Frequently Asked Questions'
  const finalCtaButtonText  = L(service.finalCtaButtonText)  || 'Get Your AI Growth Strategy'
  const finalCtaButtonLink  = localizePath(service.finalCtaButtonLink || '/get-strategy', locale)
  const serviceTitle        = L(service.title)
  const serviceDescription  = L(service.description)
  const serviceContent      = L(service.content)
  const serviceWhyItMatters = L(service.whyItMatters)
  const serviceCtaTitle     = L(service.ctaTitle)
  const serviceCtaText      = L(service.ctaText)

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

      {/* Hero */}
      <section className="relative px-6 pt-40 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(223,186,103,0.16),transparent_35%)]" />

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#DFBA67] uppercase tracking-widest mb-5">
              {heroEyebrow}
            </p>

            <h1 className="text-4xl md:text-7xl font-bold leading-[1.05] mb-6 tracking-tight">
              {serviceTitle}
            </h1>

            <p className="text-lg md:text-xl text-[#8A95A5] leading-relaxed mb-8">
              {serviceDescription}
            </p>

            <a
              href={heroCtaButtonLink}
              className="inline-block bg-[#DFBA67] text-[#33314E] px-8 py-4 rounded-full font-bold hover:scale-[1.03] transition-all duration-300 shadow-lg shadow-[#DFBA67]/20"
            >
              {heroCtaButtonText}
            </a>
          </div>

          <div className="rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/30 bg-white/5">
            {service?.image?.asset?.url ? (
              <img
                src={service.image.asset.url}
                alt={serviceTitle || 'Service'}
                className="w-full h-[460px] object-cover"
              />
            ) : (
              <div className="h-[460px] flex items-center justify-center text-[#DFBA67] text-6xl font-bold">
                {serviceTitle?.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Dynamic CMS Sections */}
      {service?.sections?.map((section, index) => {
        const sEyebrow  = L(section.eyebrow)
        const sTitle    = L(section.title)
        const sSubtitle = L(section.subtitle)
        const sContent  = L(section.content)
        const sCaption  = L(section.caption)

        if (section._type === 'heroSection') {
          return (
            <section key={index} className="max-w-7xl mx-auto px-6 py-24">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
                    {sEyebrow || `Section ${index + 1}`}
                  </p>

                  <h2 className="text-3xl md:text-5xl font-bold mb-6">
                    {sTitle}
                  </h2>

                  <p className="text-lg text-[#8A95A5] leading-relaxed">
                    {sSubtitle}
                  </p>
                </div>

                {section?.image?.asset?.url && (
                  <img
                    src={section.image.asset.url}
                    alt={sTitle || 'Section image'}
                    className="w-full h-[420px] object-cover rounded-3xl"
                  />
                )}
              </div>
            </section>
          )
        }

        if (section._type === 'textBlock') {
          return (
            <section key={index} className="max-w-5xl mx-auto px-6 py-20">
              <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
                {sEyebrow || 'Insight'}
              </p>

              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                {sTitle}
              </h2>

              <p className="text-lg text-[#8A95A5] leading-relaxed whitespace-pre-line">
                {sContent}
              </p>
            </section>
          )
        }

        if (section._type === 'imageBlock') {
          return (
            <section key={index} className="max-w-7xl mx-auto px-6 py-20">
              {section?.image?.asset?.url && (
                <img
                  src={section.image.asset.url}
                  alt={sCaption || serviceTitle || 'Section image'}
                  className="w-full h-[520px] object-cover rounded-[2rem] shadow-2xl shadow-black/30"
                />
              )}

              {sCaption && (
                <p className="text-[#8A95A5] mt-4 text-center">
                  {sCaption}
                </p>
              )}
            </section>
          )
        }

        if (section._type === 'featuresBlock') {
          return (
            <section key={index} className="max-w-7xl mx-auto px-6 py-24">
              <div className="mb-12">
                <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
                  {sEyebrow || 'Features'}
                </p>

                <h2 className="text-3xl md:text-5xl font-bold max-w-3xl">
                  {sTitle || 'Built with the right execution layers.'}
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {section?.items?.map((item, itemIndex: number) => (
                  <div
                    key={itemIndex}
                    className="bg-white/[0.06] border border-white/10 rounded-2xl p-5 hover:-translate-y-1 transition-all duration-300"
                  >
                    <span className="text-[#DFBA67] font-bold mb-3 block">
                      0{itemIndex + 1}
                    </span>

                    <p className="text-white/90">
                      {L(item)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )
        }

        if (section._type === 'ctaBlock') {
          const sText = L(section.text)
          const sButtonText = L(section.buttonText)
          return (
            <section key={index} className="max-w-7xl mx-auto px-6 py-24">
              <div className="bg-[#DFBA67] text-[#33314E] rounded-[2rem] p-10 md:p-16 text-center shadow-2xl shadow-black/20">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  {sTitle}
                </h2>

                <p className="text-lg text-[#33314E]/80 max-w-3xl mx-auto mb-8">
                  {sText}
                </p>

                <a
                  href={localizePath(section.buttonLink || '/get-strategy', locale)}
                  className="inline-block bg-[#33314E] text-white px-10 py-4 rounded-full font-bold hover:scale-[1.03] transition-all duration-300"
                >
                  {sButtonText || 'Get Your AI Growth Strategy'}
                </a>
              </div>
            </section>
          )
        }

        return null
      })}

      {/* Standard Service Content */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-8">
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
              {whatWeBuildEyebrow}
            </p>

            <h2 className="text-3xl font-bold mb-6">
              {whatWeBuildTitle}
            </h2>

            <p className="text-[#8A95A5] leading-relaxed whitespace-pre-line">
              {serviceContent}
            </p>
          </div>

          <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-8">
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
              {whyItMattersEyebrow}
            </p>

            <h2 className="text-3xl font-bold mb-6">
              {whyItMattersTitle}
            </h2>

            <p className="text-[#8A95A5] leading-relaxed whitespace-pre-line">
              {serviceWhyItMatters}
            </p>
          </div>
        </div>
      </section>

      {/* Deliverables */}
      {service?.deliverables && service.deliverables.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="mb-12">
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
              {deliverablesEyebrow}
            </p>

            <h2 className="text-3xl md:text-5xl font-bold max-w-3xl">
              {deliverablesTitle}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {service.deliverables.map((item, index: number) => (
              <div
                key={index}
                className="bg-white/[0.06] border border-white/10 rounded-2xl p-5 hover:-translate-y-1 transition-all duration-300"
              >
                <span className="text-[#DFBA67] font-bold mb-3 block">
                  0{index + 1}
                </span>

                <p className="text-white/90">
                  {L(item)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects / Companies */}
      {service?.projects && service.projects.length > 0 && (
        <section className="bg-white text-[#33314E]">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
              {projectsEyebrow}
            </p>

            <h2 className="text-3xl md:text-5xl font-bold mb-12 max-w-3xl">
              {projectsTitle}
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {service.projects.map((project, index) => {
                const pTitle = L(project.title)
                const pCategory = L(project.category)
                const pClientName = L(project.clientName)
                const pDescription = L(project.description)
                return (
                  <div
                    key={index}
                    className="overflow-hidden rounded-3xl bg-[#F6F6F8] border border-black/5 shadow-xl shadow-black/5"
                  >
                    <div className="h-[340px] bg-[#EDEDF0] overflow-hidden">
                      {project?.projectImage?.asset?.url && (
                        <img
                          src={project.projectImage.asset.url}
                          alt={pTitle || 'Project'}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className="p-8">
                      <div className="flex items-center justify-between gap-4 mb-5">
                        <div>
                          <p className="text-sm uppercase tracking-widest text-[#DFBA67] mb-1">
                            {pCategory}
                          </p>

                          <p className="font-bold text-[#33314E]/70">
                            {pClientName}
                          </p>
                        </div>

                        {project?.clientLogo?.asset?.url && (
                          <img
                            src={project.clientLogo.asset.url}
                            alt={pClientName || 'Client logo'}
                            className="max-h-12 max-w-[120px] object-contain"
                          />
                        )}
                      </div>

                      <h3 className="text-2xl md:text-3xl font-bold mb-4">
                        {pTitle}
                      </h3>

                      <p className="text-[#6B7280] leading-relaxed">
                        {pDescription}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Service FAQs */}
      {service?.faqs && service.faqs.length > 0 && (
        <section className="bg-white text-[#33314E]">
          <div className="max-w-5xl mx-auto px-6 py-24">
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
              {faqsEyebrow}
            </p>

            <h2 className="text-3xl md:text-5xl font-bold mb-10">
              {faqsTitle}
            </h2>

            <div className="space-y-4">
              {service.faqs.map((faq) => (
                <details
                  key={faq._id}
                  className="group rounded-2xl bg-white border border-black/5 shadow-lg shadow-black/5 overflow-hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-lg md:text-xl font-bold">
                    <span>{L(faq.question)}</span>

                    <span className="text-[#DFBA67] text-2xl transition-transform duration-300 group-open:rotate-45">
                      +
                    </span>
                  </summary>

                  <div className="px-6 pb-6 text-[#6B7280] leading-relaxed">
                    {L(faq.answer)}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="bg-[#DFBA67] text-[#33314E] rounded-[2rem] p-10 md:p-16 text-center shadow-2xl shadow-black/20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {serviceCtaTitle}
          </h2>

          <p className="text-lg text-[#33314E]/80 max-w-3xl mx-auto mb-8">
            {serviceCtaText}
          </p>

          <a
            href={finalCtaButtonLink}
            className="inline-block bg-[#33314E] text-white px-10 py-4 rounded-full font-bold hover:scale-[1.03] transition-all duration-300"
          >
            {finalCtaButtonText}
          </a>
        </div>
      </section>
    </PageLayout>
  )
}
