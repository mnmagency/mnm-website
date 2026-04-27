import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'

export async function generateMetadata() {
  return {
    title: 'Our Work | M&M Marketing Qatar',
    description:
      'Explore selected work by M&M Marketing across websites, SEO, social media, branding, paid media, and digital growth in Qatar.',
  }
}

export default async function WorkPage() {
  const works = await client.fetch(`
    *[_type == "work"] | order(_createdAt desc){
      title,
      category,
      description,
      slug,
      image{
        asset->{url}
      }
    }
  `)

  return (
    <PageLayout>
      <section className="bg-white text-[#33314E]">
        <div className="max-w-7xl mx-auto px-6 pt-40 pb-24">
          <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
            Our Work
          </p>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl">
            Work that turns attention into measurable growth.
          </h1>

          <p className="text-[#6B7280] text-lg max-w-3xl mb-14">
            Explore selected projects created by M&M Marketing for brands across Qatar.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {works?.map((work: any, index: number) => (
              <a
                key={index}
                href={`/work/${work.slug?.current}`}
                className="group rounded-3xl overflow-hidden bg-[#F6F6F8] border border-black/5 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-black/5"
              >
                <div className="h-[340px] overflow-hidden bg-[#EDEDF0]">
                  {work?.image?.asset?.url ? (
                    <img
                      src={work.image.asset.url}
                      alt={work.title}
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
                    {work.category}
                  </p>

                  <h2 className="text-3xl font-bold mb-3">
                    {work.title}
                  </h2>

                  <p className="text-[#6B7280] leading-relaxed">
                    {work.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  )
}