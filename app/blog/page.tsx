import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'



export default async function BlogPage() {
  const posts = await client.fetch(`
    *[_type == "blog"] | order(publishedAt desc){
      title,
      slug,
      category,
      excerpt,
      publishedAt,
      image{
        asset->{url}
      }
    }
  `)

  return (
    <PageLayout>
      <section className="max-w-7xl mx-auto px-6 pt-40 pb-24">
        <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
          Insights
        </p>

        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Growth, marketing, and digital strategy insights.
        </h1>

        <p className="text-[#8A95A5] text-lg max-w-3xl mb-14">
          Practical thinking from M&M Marketing on websites, SEO, social media,
          AI-driven growth, and revenue systems.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {posts?.map((post: any, index: number) => (
            <a
              key={index}
              href={`/blog/${post.slug?.current}`}
              className="group rounded-3xl overflow-hidden bg-white/[0.06] border border-white/10 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/10"
            >
              <div className="h-[240px] bg-white/10 overflow-hidden">
                {post?.image?.asset?.url && (
                  <img
                    src={post.image.asset.url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  />
                )}
              </div>

              <div className="p-6">
                <p className="text-[#DFBA67] uppercase tracking-widest text-xs mb-3">
                  {post.category}
                </p>

                <h2 className="text-2xl font-bold mb-4">
                  {post.title}
                </h2>

                <p className="text-[#8A95A5] leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </PageLayout>
  )
}