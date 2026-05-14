import Image from 'next/image'
import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'
import { localize, localizePath } from '@/lib/locale'
import { getLocale } from '@/lib/locale-server'

export const revalidate = 60

type LocaleField = { en?: string; ar?: string } | string | null | undefined

type BlogCard = {
  title?: LocaleField
  slug?: { current?: string }
  category?: LocaleField
  excerpt?: LocaleField
  publishedAt?: string
  image?: { asset?: { url?: string } }
}

export async function generateMetadata() {
  const locale = await getLocale()
  const page = await client.fetch(`
    *[_type == "blogPage"][0]{
      title, subtitle,
      seo{ metaTitle, metaDescription, canonicalUrl, ogImage{ asset->{url} } }
    }
  `)

  const seo = page?.seo
  const title = localize(seo?.metaTitle, locale) || localize(page?.title, locale) || 'Insights | M&M Marketing Qatar'
  const description = localize(seo?.metaDescription, locale) || localize(page?.subtitle, locale) ||
    'Practical thinking from M&M Marketing on websites, SEO, social media, AI-driven growth, and revenue systems.'

  return {
    title, description,
    openGraph: {
      title, description,
      images: seo?.ogImage?.asset?.url ? [seo.ogImage.asset.url] : [],
    },
    alternates: { canonical: seo?.canonicalUrl || undefined },
  }
}

export default async function BlogPage() {
  const locale = await getLocale()
  const data = await client.fetch(`
    {
      "page": *[_type == "blogPage"][0]{ eyebrow, title, subtitle },
      "posts": *[_type == "blog"] | order(publishedAt desc){
        title, slug, category, excerpt, publishedAt, image{ asset->{url} }
      }
    }
  `)

  const page = data?.page
  const posts: BlogCard[] = data?.posts || []
  const L = (f: LocaleField) => localize(f, locale)
  const eyebrow  = L(page?.eyebrow)  || 'Insights'
  const title    = L(page?.title)    || 'Growth, marketing, and digital strategy insights.'
  const subtitle = L(page?.subtitle) || 'Practical thinking from M&M Marketing on websites, SEO, social media, AI-driven growth, and revenue systems.'

  return (
    <PageLayout>
      <section className="max-w-7xl mx-auto px-6 pt-40 pb-24">
        <p className="text-[#DFBA67] uppercase tracking-widest mb-4">{eyebrow}</p>
        <h1 className="text-4xl md:text-6xl font-bold mb-6">{title}</h1>
        <p className="text-[#8A95A5] text-lg max-w-3xl mb-14">{subtitle}</p>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post, index) => {
            const pTitle = L(post.title)
            const pCategory = L(post.category)
            const pExcerpt = L(post.excerpt)
            return (
              <a
                key={index}
                href={localizePath(`/blog/${post.slug?.current}`, locale)}
                className="group rounded-3xl overflow-hidden bg-white/[0.06] border border-white/10 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/10"
              >
                <div className="relative h-[240px] bg-white/10 overflow-hidden">
                  {post?.image?.asset?.url && (
                    <Image
                      src={post.image.asset.url}
                      alt={pTitle || 'Blog article'}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition duration-700"
                    />
                  )}
                </div>

                <div className="p-6">
                  <p className="text-[#DFBA67] uppercase tracking-widest text-xs mb-3">{pCategory}</p>
                  <h2 className="text-2xl font-bold mb-4">{pTitle}</h2>
                  <p className="text-[#8A95A5] leading-relaxed">{pExcerpt}</p>
                </div>
              </a>
            )
          })}
        </div>
      </section>
    </PageLayout>
  )
}
