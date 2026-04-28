import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'
export const revalidate = 60

export async function generateMetadata() {
  return {
    title: 'Case Studies | M&M Marketing Qatar',
    description:
      'Explore M&M Marketing case studies across websites, SEO, social media, branding, paid media, and growth systems in Qatar.',
  }
}

export default async function CaseStudiesPage() {
  const caseStudies = await client.fetch(`
    *[_type == "caseStudy"] | order(_createdAt desc){
      title,
      slug,
      client,
      industry,
      category,
      description,
      results,
      image{
        asset->{url}
      }
    }
  `)

  return (
    <PageLayout>
      <section className="max-w-7xl mx-auto px-6 pt-40 pb-24">
        <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
          Case Studies
        </p>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl">
          Real work. Real strategy. Real measurable growth.
        </h1>

        <p className="text-[#8A95A5] text-lg max-w-3xl mb-14">
          Explore selected case studies showing how M&M Marketing helps brands
          in Qatar turn digital strategy into business growth.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caseStudies?.map((item: any, index: number) => (
            <a
              key={index}
              href={`/case-studies/${item.slug?.current}`}
              className="group overflow-hidden rounded-3xl bg-white/[0.06] border border-white/10 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/10"
            >
              <div className="h-[260px] bg-white/10 overflow-hidden">
                {item?.image?.asset?.url && (
                  <img
                    src={item.image.asset.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  />
                )}
              </div>

              <div className="p-7">
                <p className="text-[#DFBA67] uppercase tracking-widest text-xs mb-3">
                  {item.category || item.industry}
                </p>

                <h2 className="text-2xl font-bold mb-4">
                  {item.title}
                </h2>

                <p className="text-[#8A95A5] leading-relaxed mb-5">
                  {item.description || item.results}
                </p>

                <span className="text-[#DFBA67] font-bold">
                  View Case Study →
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </PageLayout>
  )
}