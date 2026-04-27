import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'

export async function generateMetadata({ params }: any) {
  const { slug } = await params

  const service = await client.fetch(
    `
      *[_type == "service" && slug.current == $slug][0]{
        title,
        description,
        seo{
          metaTitle,
          metaDescription,
          canonicalUrl,
          ogImage{
            asset->{url}
          }
        },
        image{
          asset->{url}
        }
      }
    `,
    { slug }
  )

  const seo = service?.seo

  const title =
    seo?.metaTitle ||
    `${service?.title || 'Marketing Service'} in Qatar | M&M Marketing`

  const description =
    seo?.metaDescription ||
    service?.description ||
    'M&M Marketing provides digital marketing, websites, SEO, social media, branding, paid media, and AI-driven growth services in Qatar.'

  const image =
    seo?.ogImage?.asset?.url ||
    service?.image?.asset?.url ||
    undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
    alternates: {
      canonical: seo?.canonicalUrl || undefined,
    },
  }
}

export default async function ServicePage({ params }: any) {
  const { slug } = await params

  const service = await client.fetch(
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
        image{
          asset->{url}
        },
        projects[]{
          clientName,
          category,
          title,
          description,
          projectImage{
            asset->{url}
          },
          clientLogo{
            asset->{url}
          }
        },
        sections[]{
          _type,
          title,
          subtitle,
          content,
          caption,
          items,
          text,
          buttonText,
          buttonLink,
          image{
            asset->{url}
          }
        },
        "faqs": *[_type == "faq" && relatedService._ref == ^._id] | order(_createdAt asc){
  _id,
  question,
  answer
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

  return (
    <PageLayout>
      {service?.faqs?.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: service.faqs.map((faq: any) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer,
                },
              })),
            }),
          }}
        />
      )}
      {/* Default Service Hero */}
      <section className="relative px-6 pt-40 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(223,186,103,0.16),transparent_35%)]" />

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#DFBA67] uppercase tracking-widest mb-5">
              M&M Service
            </p>

            <h1 className="text-4xl md:text-7xl font-bold leading-[1.05] mb-6 tracking-tight">
              {service.title}
            </h1>

            <p className="text-lg md:text-xl text-[#8A95A5] leading-relaxed mb-8">
              {service.description}
            </p>

            <a
              href="/get-strategy"
              className="inline-block bg-[#DFBA67] text-[#33314E] px-8 py-4 rounded-full font-bold hover:scale-[1.03] transition-all duration-300 shadow-lg shadow-[#DFBA67]/20"
            >
              Get Your AI Growth Strategy
            </a>
          </div>

          <div className="rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/30 bg-white/5">
            {service?.image?.asset?.url ? (
              <img
                src={service.image.asset.url}
                alt={service.title}
                className="w-full h-[460px] object-cover"
              />
            ) : (
              <div className="h-[460px] flex items-center justify-center text-[#DFBA67] text-6xl font-bold">
                {service.title?.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Dynamic CMS Sections */}
      {service?.sections?.map((section: any, index: number) => {
        if (section._type === 'heroSection') {
          return (
            <section key={index} className="max-w-7xl mx-auto px-6 py-24">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
                    Section {index + 1}
                  </p>

                  <h2 className="text-3xl md:text-5xl font-bold mb-6">
                    {section.title}
                  </h2>

                  <p className="text-lg text-[#8A95A5] leading-relaxed">
                    {section.subtitle}
                  </p>
                </div>

                {section?.image?.asset?.url && (
                  <img
                    src={section.image.asset.url}
                    alt={section.title}
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
                Insight
              </p>

              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                {section.title}
              </h2>

              <p className="text-lg text-[#8A95A5] leading-relaxed whitespace-pre-line">
                {section.content}
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
                  alt={section.caption || service.title}
                  className="w-full h-[520px] object-cover rounded-[2rem] shadow-2xl shadow-black/30"
                />
              )}

              {section.caption && (
                <p className="text-[#8A95A5] mt-4 text-center">
                  {section.caption}
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
                  Features
                </p>

                <h2 className="text-3xl md:text-5xl font-bold max-w-3xl">
                  Built with the right execution layers.
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {section?.items?.map((item: string, itemIndex: number) => (
                  <div
                    key={itemIndex}
                    className="bg-white/[0.06] border border-white/10 rounded-2xl p-5 hover:-translate-y-1 transition-all duration-300"
                  >
                    <span className="text-[#DFBA67] font-bold mb-3 block">
                      0{itemIndex + 1}
                    </span>

                    <p className="text-white/90">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )
        }

        if (section._type === 'ctaBlock') {
          return (
            <section key={index} className="max-w-7xl mx-auto px-6 py-24">
              <div className="bg-[#DFBA67] text-[#33314E] rounded-[2rem] p-10 md:p-16 text-center shadow-2xl shadow-black/20">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  {section.title}
                </h2>

                <p className="text-lg text-[#33314E]/80 max-w-3xl mx-auto mb-8">
                  {section.text}
                </p>

                <a
                  href={section.buttonLink || '/get-strategy'}
                  className="inline-block bg-[#33314E] text-white px-10 py-4 rounded-full font-bold hover:scale-[1.03] transition-all duration-300"
                >
                  {section.buttonText || 'Get Your AI Growth Strategy'}
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
              What We Build
            </p>

            <h2 className="text-3xl font-bold mb-6">
              Built as a revenue system, not a digital brochure.
            </h2>

            <p className="text-[#8A95A5] leading-relaxed whitespace-pre-line">
              {service.content}
            </p>
          </div>

          <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-8">
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
              Why It Matters
            </p>

            <h2 className="text-3xl font-bold mb-6">
              Your digital presence directly affects growth.
            </h2>

            <p className="text-[#8A95A5] leading-relaxed whitespace-pre-line">
              {service.whyItMatters}
            </p>
          </div>
        </div>
      </section>

      {/* Deliverables */}
      {service?.deliverables?.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="mb-12">
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
              Deliverables
            </p>

            <h2 className="text-3xl md:text-5xl font-bold max-w-3xl">
              Everything needed to turn strategy into measurable execution.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {service.deliverables.map((item: string, index: number) => (
              <div
                key={index}
                className="bg-white/[0.06] border border-white/10 rounded-2xl p-5 hover:-translate-y-1 transition-all duration-300"
              >
                <span className="text-[#DFBA67] font-bold mb-3 block">
                  0{index + 1}
                </span>

                <p className="text-white/90">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects / Companies */}
      {service?.projects?.length > 0 && (
        <section className="bg-white text-[#33314E]">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
              Companies We Worked For
            </p>

            <h2 className="text-3xl md:text-5xl font-bold mb-12 max-w-3xl">
              Selected projects built to create measurable growth.
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {service.projects.map((project: any, index: number) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-3xl bg-[#F6F6F8] border border-black/5 shadow-xl shadow-black/5"
                >
                  <div className="h-[340px] bg-[#EDEDF0] overflow-hidden">
                    {project?.projectImage?.asset?.url && (
                      <img
                        src={project.projectImage.asset.url}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="p-8">
                    <div className="flex items-center justify-between gap-4 mb-5">
                      <div>
                        <p className="text-sm uppercase tracking-widest text-[#DFBA67] mb-1">
                          {project.category}
                        </p>

                        <p className="font-bold text-[#33314E]/70">
                          {project.clientName}
                        </p>
                      </div>

                      {project?.clientLogo?.asset?.url && (
                        <img
                          src={project.clientLogo.asset.url}
                          alt={project.clientName}
                          className="max-h-12 max-w-[120px] object-contain"
                        />
                      )}
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold mb-4">
                      {project.title}
                    </h3>

                    <p className="text-[#6B7280] leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


{/* Service FAQs */}
{service?.faqs?.length > 0 && (
  <section className="bg-white text-[#33314E]">
    <div className="max-w-5xl mx-auto px-6 py-24">
      <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
        FAQs
      </p>

      <h2 className="text-3xl md:text-5xl font-bold mb-10">
        Frequently Asked Questions
      </h2>

      <div className="space-y-4">
        {service.faqs.map((faq: any) => (
          <details
            key={faq._id}
            className="group rounded-2xl bg-white border border-black/5 shadow-lg shadow-black/5 overflow-hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-lg md:text-xl font-bold">
              <span>{faq.question}</span>

              <span className="text-[#DFBA67] text-2xl transition-transform duration-300 group-open:rotate-45">
                +
              </span>
            </summary>

            <div className="px-6 pb-6 text-[#6B7280] leading-relaxed">
              {faq.answer}
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
            {service.ctaTitle}
          </h2>

          <p className="text-lg text-[#33314E]/80 max-w-3xl mx-auto mb-8">
            {service.ctaText}
          </p>

          <a
            href="/get-strategy"
            className="inline-block bg-[#33314E] text-white px-10 py-4 rounded-full font-bold hover:scale-[1.03] transition-all duration-300"
          >
            Get Your AI Growth Strategy
          </a>
        </div>
      </section>
    </PageLayout>
  )
}