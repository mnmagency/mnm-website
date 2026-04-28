import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'
import ContactForm from '@/app/components/ContactForm'
export const revalidate = 60

export async function generateMetadata() {
  const page = await client.fetch(`
    *[_type == "contactPage"][0]{
      seo{
        metaTitle,
        metaDescription,
        canonicalUrl,
        ogImage{
          asset->{url}
        }
      }
    }
  `)

  const seo = page?.seo

  return {
    title: seo?.metaTitle || 'Contact M&M Marketing Qatar',
    description:
      seo?.metaDescription ||
      'Contact M&M Marketing in Qatar for websites, SEO, social media, branding, and AI-driven growth.',
    openGraph: {
      title: seo?.metaTitle || 'Contact M&M Marketing Qatar',
      description: seo?.metaDescription,
      images: seo?.ogImage?.asset?.url ? [seo.ogImage.asset.url] : [],
    },
    alternates: {
      canonical: seo?.canonicalUrl || undefined,
    },
  }
}

export default async function ContactPage() {
  const page = await client.fetch(`
    *[_type == "contactPage"][0]{
      title,
      subtitle,
      phone,
      email,
      address,
      workingHours,
      mapEmbed,
      mapUrl,
      formTitle,
      formSubtitle,
      servicesOptions,
      ctaTitle,
      ctaText
    }
  `)

  return (
    <PageLayout>
      {/* HERO / INTRO */}
      <section className="max-w-7xl mx-auto px-6 pt-40 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
              Contact M&M
            </p>

            <h1 className="text-4xl md:text-7xl font-bold mb-6">
              {page?.title || 'Let’s build your growth system.'}
            </h1>

            <p className="text-lg text-[#8A95A5] leading-relaxed max-w-2xl">
              {page?.subtitle}
            </p>
          </div>

          <div className="bg-white/[0.05] border border-white/10 rounded-[2rem] p-8 shadow-2xl shadow-black/20">
            <h2 className="text-2xl font-bold text-[#DFBA67] mb-6">
              Contact Details
            </h2>

            <div className="space-y-5 text-[#8A95A5]">
              {page?.workingHours && (
                <p>
                  <strong className="text-white">Working Hours:</strong>{' '}
                  {page.workingHours}
                </p>
              )}

              {page?.phone && (
                <p>
                  <strong className="text-white">Phone:</strong>{' '}
                  <a href={`tel:${page.phone}`} className="hover:text-[#DFBA67]">
                    {page.phone}
                  </a>
                </p>
              )}

              {page?.email && (
                <p>
                  <strong className="text-white">Email:</strong>{' '}
                  <a href={`mailto:${page.email}`} className="hover:text-[#DFBA67]">
                    {page.email}
                  </a>
                </p>
              )}

              {page?.address && (
                <p>
                  <strong className="text-white">Location:</strong>{' '}
                  {page.address}
                </p>
              )}

              {page?.mapUrl && (
                <a
                  href={page.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 bg-[#DFBA67] text-[#33314E] px-7 py-3 rounded-full font-bold hover:scale-[1.03] transition-all duration-300"
                >
                  Open Location
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FORM + MAP */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* FORM CARD */}
          <div className="bg-white text-[#33314E] rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-black/20">
            <p className="text-[#DFBA67] uppercase tracking-widest mb-3 font-bold">
              Let’s Talk
            </p>

            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {page?.formTitle || 'Tell us about your project'}
            </h2>

            <p className="text-[#6B7280] mb-8 leading-relaxed">
              {page?.formSubtitle ||
                'Fill out the form and our team will get back to you with a tailored strategy for your business.'}
            </p>

            <ContactForm servicesOptions={page?.servicesOptions || []} />
          </div>

          {/* MAP CARD */}
          {page?.mapEmbed && (
            <div className="rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/30 bg-white/5 min-h-[520px]">
              <iframe
                src={page.mapEmbed}
                width="100%"
                height="100%"
                loading="lazy"
                className="w-full h-full min-h-[520px] border-0"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>
      </section>

{/* PREMIUM CTA */}
<section className="max-w-7xl mx-auto px-6 pb-24">
  <div className="bg-[#DFBA67] text-[#33314E] rounded-[2rem] px-8 py-8 md:px-10 md:py-9 shadow-2xl shadow-black/20">
    <div className="grid lg:grid-cols-[1fr_1.8fr_1fr] gap-6 items-center">
      
      <div>
        <p className="text-xl font-bold mb-1">
          Your growth is our mission.
        </p>
        <p className="text-sm text-[#33314E]/70">
          Let’s achieve it together.
        </p>
      </div>

      <div className="lg:border-x lg:border-[#33314E]/20 lg:px-8 text-center">
        <h2 className="text-2xl md:text-4xl font-bold leading-tight mb-3">
          {page?.ctaTitle || 'Ready to Turn Your Marketing Into Revenue?'}
        </h2>

        <p className="text-base text-[#33314E]/75 max-w-2xl mx-auto">
          {page?.ctaText ||
            'Let’s build a strategy focused on real results, not just impressions.'}
        </p>
      </div>

      <div className="text-center">
        <a
          href="/get-strategy"
          className="inline-block bg-[#33314E] text-white px-7 py-3 rounded-full font-bold text-sm hover:scale-[1.03] transition-all duration-300"
        >
          Get Your AI Growth Strategy
        </a>

        <p className="text-xs text-[#33314E]/65 mt-3">
          No commitment. Strategy call within 24 hours.
        </p>
      </div>

    </div>
  </div>
</section>
    </PageLayout>
  )
}