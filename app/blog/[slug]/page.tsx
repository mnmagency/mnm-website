import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'

export async function generateMetadata({ params }: any) {
  const { slug } = await params

  const post = await client.fetch(
    `
      *[_type == "blog" && slug.current == $slug][0]{
        title,
        excerpt,
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

  const seo = post?.seo

  return {
    title: seo?.metaTitle || `${post?.title || 'Blog'} | M&M Marketing Qatar`,
    description:
      seo?.metaDescription ||
      post?.excerpt ||
      'Insights on marketing, SEO, websites, and AI-driven growth in Qatar.',
    openGraph: {
      title: seo?.metaTitle || post?.title,
      description: seo?.metaDescription || post?.excerpt,
      images: seo?.ogImage?.asset?.url
        ? [seo.ogImage.asset.url]
        : post?.image?.asset?.url
          ? [post.image.asset.url]
          : [],
    },
    alternates: {
      canonical: seo?.canonicalUrl || undefined,
    },
  }
}

export default async function BlogPostPage({ params }: any) {
  const { slug } = await params

  const post = await client.fetch(
    `
      *[_type == "blog" && slug.current == $slug][0]{
        title,
        category,
        excerpt,
        content,
        publishedAt,
        image{
          asset->{url}
        }
      }
    `,
    { slug }
  )

  if (!post) {
    return (
      <PageLayout>
        <section className="max-w-4xl mx-auto px-6 pt-40 pb-24">
          <h1 className="text-4xl font-bold text-[#DFBA67]">
            Blog post not found
          </h1>
        </section>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <article className="max-w-5xl mx-auto px-6 pt-40 pb-24">
        <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
          {post.category}
        </p>

        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          {post.title}
        </h1>

        {post.publishedAt && (
          <p className="text-[#8A95A5] mb-10">
            {new Date(post.publishedAt).toLocaleDateString()}
          </p>
        )}

        {post?.image?.asset?.url && (
          <img
            src={post.image.asset.url}
            alt={post.title}
            className="w-full h-[460px] object-cover rounded-3xl mb-12"
          />
        )}

        <p className="text-xl text-[#8A95A5] leading-relaxed mb-10">
          {post.excerpt}
        </p>

        <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-8 md:p-12">
          <p className="text-lg text-[#D6D8E0] leading-relaxed whitespace-pre-line">
            {post.content}
          </p>
        </div>
      </article>
    </PageLayout>
  )
}