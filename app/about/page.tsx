import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'

export async function generateMetadata() {
  const page = await client.fetch(`
    *[_type == "aboutPage"][0]{
      seo{
        metaTitle,
        metaDescription,
        canonicalUrl
      }
    }
  `)

  const seo = page?.seo

  return {
    title: seo?.metaTitle || 'About M&M Marketing Qatar',
    description:
      seo?.metaDescription ||
      'M&M Marketing builds growth systems combining strategy, execution, and measurable results for businesses in Qatar.',
    alternates: {
      canonical: seo?.canonicalUrl || undefined,
    },
  }
}

export default async function AboutPage() {
    const page = await client.fetch(`
        *[_type == "aboutPage"][0]{
          title,
          subtitle,
          heroImage{
            asset->{url}
          },
          positioning,
          missionTitle,
          missionText,
          methodologyTitle,
          methodologyText,
          principles,
          ctaTitle,
          ctaText
        }
      `)

  return (
    <PageLayout>
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-40 pb-24">
        <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
          About
        </p>

        <h1 className="text-4xl md:text-7xl font-bold mb-6 max-w-5xl">
          {page?.title}
        </h1>

        <p className="text-lg text-[#8A95A5] max-w-3xl">
          {page?.subtitle}
        </p>
       
  {page?.heroImage?.asset?.url && (
    <div className="mt-12 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/30">
      <img
        src={page.heroImage.asset.url}
        alt="About M&M Marketing"
        className="w-full h-[500px] object-cover"
      />
    </div>
  )}
      </section>

      {/* POSITIONING */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            We don’t just market. We build growth systems.
          </h2>

          <p className="text-[#8A95A5] leading-relaxed text-lg">
            {page?.positioning}
          </p>
        </div>
      </section>

      {/* MISSION + METHODOLOGY */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-8">
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
              Mission
            </p>

            <h2 className="text-2xl font-bold mb-4">
              {page?.missionTitle}
            </h2>

            <p className="text-[#8A95A5] leading-relaxed whitespace-pre-line">
              {page?.missionText}
            </p>
          </div>

          <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-8">
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
              Methodology
            </p>

            <h2 className="text-2xl font-bold mb-4">
              {page?.methodologyTitle}
            </h2>

            <p className="text-[#8A95A5] leading-relaxed whitespace-pre-line">
              {page?.methodologyText}
            </p>
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      {page?.principles?.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
            Principles
          </p>

          <h2 className="text-3xl md:text-5xl font-bold mb-10">
            How we think. How we execute.
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {page.principles.map((item: string, index: number) => (
              <div
                key={index}
                className="bg-white/[0.06] border border-white/10 rounded-2xl p-6"
              >
                <span className="text-[#DFBA67] font-bold block mb-3">
                  0{index + 1}
                </span>

                <p className="text-[#8A95A5]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-[#DFBA67] text-[#33314E] rounded-[2rem] p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {page?.ctaTitle}
          </h2>

          <p className="text-lg text-[#33314E]/80 max-w-3xl mx-auto mb-8">
            {page?.ctaText}
          </p>

          <a
            href="/get-strategy"
            className="inline-block bg-[#33314E] text-white px-10 py-4 rounded-full font-bold"
          >
            Get Your AI Growth Strategy
          </a>
        </div>
      </section>
    </PageLayout>
  )
}