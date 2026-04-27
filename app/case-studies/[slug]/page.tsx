import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'

export async function generateMetadata({ params }: any) {
  const { slug } = await params

  const caseStudy = await client.fetch(
    `
      *[_type == "caseStudy" && slug.current == $slug][0]{
        title,
        description,
        results,
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

  const seo = caseStudy?.seo

  return {
    title: seo?.metaTitle || `${caseStudy?.title || 'Case Study'} | M&M Marketing Qatar`,
    description:
      seo?.metaDescription ||
      caseStudy?.description ||
      caseStudy?.results ||
      'Explore M&M Marketing case studies and measurable growth results in Qatar.',
    openGraph: {
      title: seo?.metaTitle || caseStudy?.title,
      description: seo?.metaDescription || caseStudy?.description,
      images: seo?.ogImage?.asset?.url
        ? [seo.ogImage.asset.url]
        : caseStudy?.image?.asset?.url
          ? [caseStudy.image.asset.url]
          : [],
    },
    alternates: {
      canonical: seo?.canonicalUrl || undefined,
    },
  }
}

export default async function CaseStudyDetailPage({ params }: any) {
  const { slug } = await params

  const caseStudy = await client.fetch(
    `
      *[_type == "caseStudy" && slug.current == $slug][0]{
        title,
        client,
        industry,
        category,
        description,
        challenge,
        solution,
        results,
        image{
          asset->{url}
        }
      }
    `,
    { slug }
  )

  if (!caseStudy) {
    return (
      <PageLayout>
        <section className="max-w-4xl mx-auto px-6 pt-40 pb-24">
          <h1 className="text-4xl font-bold text-[#DFBA67]">
            Case study not found
          </h1>
        </section>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      {/* HERO */}
      <section className="relative px-6 pt-40 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(223,186,103,0.16),transparent_35%)]" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <a
            href="/case-studies"
            className="text-[#DFBA67] font-bold inline-block mb-10"
          >
            ← Back to Case Studies
          </a>

          <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
            {caseStudy.category || caseStudy.industry || 'Case Study'}
          </p>

          <h1 className="text-4xl md:text-7xl font-bold leading-tight max-w-5xl mb-6">
            {caseStudy.title}
          </h1>

          <p className="text-lg md:text-xl text-[#8A95A5] max-w-3xl leading-relaxed">
            {caseStudy.description}
          </p>
        </div>
      </section>

      {/* IMAGE */}
      {caseStudy?.image?.asset?.url && (
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/30">
            <img
              src={caseStudy.image.asset.url}
              alt={caseStudy.title}
              className="w-full h-[520px] object-cover"
            />
          </div>
        </section>
      )}

      {/* DETAILS */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-8">
            <p className="text-[#DFBA67] uppercase tracking-widest mb-3">
              Client
            </p>
            <h2 className="text-2xl font-bold">
              {caseStudy.client || 'M&M Client'}
            </h2>
          </div>

          <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-8">
            <p className="text-[#DFBA67] uppercase tracking-widest mb-3">
              Industry
            </p>
            <h2 className="text-2xl font-bold">
              {caseStudy.industry || caseStudy.category}
            </h2>
          </div>

          <div className="bg-[#DFBA67] text-[#33314E] rounded-3xl p-8">
            <p className="uppercase tracking-widest mb-3 font-bold">
              Result
            </p>
            <h2 className="text-2xl font-bold">
              {caseStudy.results}
            </h2>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-8">
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
              Challenge
            </p>

            <h2 className="text-3xl font-bold mb-6">
              What needed to change
            </h2>

            <p className="text-[#8A95A5] leading-relaxed whitespace-pre-line">
              {caseStudy.challenge}
            </p>
          </div>

          <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-8">
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
              Solution
            </p>

            <h2 className="text-3xl font-bold mb-6">
              How we approached it
            </h2>

            <p className="text-[#8A95A5] leading-relaxed whitespace-pre-line">
              {caseStudy.solution}
            </p>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-white text-[#33314E] rounded-[2rem] p-10 md:p-16 shadow-2xl shadow-black/20">
          <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
            Results
          </p>

          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Measurable impact delivered through strategy and execution.
          </h2>

          <p className="text-lg text-[#6B7280] leading-relaxed whitespace-pre-line max-w-4xl">
            {caseStudy.results}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-[#DFBA67] text-[#33314E] rounded-[2rem] p-10 md:p-16 text-center shadow-2xl shadow-black/20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Want results like this?
          </h2>

          <p className="text-lg text-[#33314E]/80 max-w-3xl mx-auto mb-8">
            Let’s build a growth system designed around your business goals, market, and revenue targets.
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