import Image from 'next/image'
import Link from 'next/link'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'
import { localize, localizePath } from '@/lib/locale'
import { getLocale } from '@/lib/locale-server'

export const revalidate = 60

type ImageRef = { asset?: { url?: string } }

type PortableTextBlock = {
  _type?: string
  _key?: string
  style?: string
  children?: Array<{ _type?: string; text?: string; marks?: string[] }>
  markDefs?: Array<{ _key?: string; _type?: string; href?: string }>
}

type LocaleField = { en?: string; ar?: string } | string | null | undefined

type BlogPost = {
  title?: LocaleField
  category?: LocaleField
  author?: LocaleField
  tags?: string[]
  excerpt?: LocaleField
  content?: PortableTextBlock[] | string
  publishedAt?: string
  image?: ImageRef
  seo?: {
    metaTitle?: LocaleField
    metaDescription?: LocaleField
    canonicalUrl?: string
    ogImage?: ImageRef
  }
}

type RelatedPost = {
  _id?: string
  title?: LocaleField
  slug?: { current?: string }
  category?: LocaleField
  excerpt?: LocaleField
  image?: ImageRef
}

const portableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="text-3xl md:text-4xl font-bold mt-12 mb-5 text-white">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl md:text-3xl font-bold mt-10 mb-4 text-white">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl font-bold mt-8 mb-3 text-white">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[#DFBA67] pl-6 my-8 italic text-[#D6D8E0]">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => (
      <p className="text-lg text-[#D6D8E0] leading-relaxed mb-5">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-outside pl-6 mb-6 space-y-2 text-[#D6D8E0]">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-outside pl-6 mb-6 space-y-2 text-[#D6D8E0]">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="text-white">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => (
      <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#DFBA67] underline underline-offset-2 hover:opacity-80"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }: { value: { asset?: { url?: string }; alt?: string; caption?: string } }) => {
      if (!value?.asset?.url) return null
      return (
        <figure className="my-10">
          <img
            src={value.asset.url}
            alt={value.alt || ''}
            className="w-full rounded-2xl"
          />
          {value.caption && (
            <figcaption className="text-sm text-[#8A95A5] mt-3 text-center">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()

  const post = await client.fetch<BlogPost | null>(
    `*[_type == "blog" && slug.current == $slug][0]{
      title, excerpt,
      seo{ metaTitle, metaDescription, canonicalUrl, ogImage{ asset->{url} } },
      image{ asset->{url} }
    }`,
    { slug }
  )

  const seo = post?.seo
  const title = localize(seo?.metaTitle, locale) ||
    `${localize(post?.title, locale) || 'Blog'} | M&M Marketing Qatar`
  const description = localize(seo?.metaDescription, locale) ||
    localize(post?.excerpt, locale) ||
    "Marketing insights for Qatar businesses — SEO, web development, social media, branding, and paid ads from Doha's trusted marketing agency."

  return {
    title, description,
    openGraph: {
      title, description,
      images: seo?.ogImage?.asset?.url ? [seo.ogImage.asset.url] : post?.image?.asset?.url ? [post.image.asset.url] : [],
    },
    alternates: { canonical: seo?.canonicalUrl || undefined },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()
  const L = (f: LocaleField) => localize(f, locale)

  const data = await client.fetch<{
    post: BlogPost | null
    related: RelatedPost[]
  }>(
    `
      {
        "post": *[_type == "blog" && slug.current == $slug][0]{
          _id,
          title,
          category,
          author,
          tags,
          excerpt,
          content,
          publishedAt,
          image{ asset->{url} }
        },
        "related": *[
          _type == "blog"
          && slug.current != $slug
          && (
            count((tags[])[@ in *[_type == "blog" && slug.current == $slug][0].tags]) > 0
            || category == *[_type == "blog" && slug.current == $slug][0].category
          )
        ] | order(publishedAt desc)[0...3]{
          _id,
          title,
          slug,
          category,
          excerpt,
          image{ asset->{url} }
        }
      }
    `,
    { slug }
  )

  const post = data?.post
  const related = data?.related || []

  if (!post) {
    return (
      <PageLayout>
        <section className="max-w-4xl mx-auto px-6 pt-40 pb-24">
          <h1 className="text-4xl font-bold text-[#DFBA67]">
            {locale === 'ar' ? 'المقال غير موجود' : 'Blog post not found'}
          </h1>
        </section>
      </PageLayout>
    )
  }

  const title    = L(post.title)
  const category = L(post.category)
  const author   = L(post.author)
  const excerpt  = L(post.excerpt)
  const backLabel = locale === 'ar' ? '→ العودة إلى المدونة' : '← Back to Blog'
  const byLabel   = locale === 'ar' ? 'بقلم' : 'By'
  const tagsLabel = locale === 'ar' ? 'الوسوم' : 'Tags'

  // `content` is portable text after the Phase 3-C migration. During the brief
  // window between schema deployment and migration completion it may still be
  // a string — render it as a single paragraph in that case so nothing breaks.
  const isPortable = Array.isArray(post.content)

  return (
    <PageLayout>
      <article className="max-w-5xl mx-auto px-6 pt-40 pb-24">
        <Link
          href={localizePath('/blog', locale)}
          className="text-[#DFBA67] font-bold inline-block mb-8 hover:opacity-80"
        >
          {backLabel}
        </Link>

        {category && (
          <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
            {category}
          </p>
        )}

        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[#8A95A5] mb-10">
          {author && (
            <span>
              {byLabel} <span className="text-white font-bold">{author}</span>
            </span>
          )}
          {author && post.publishedAt && <span className="opacity-50">·</span>}
          {post.publishedAt && (
            <span>{new Date(post.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-QA' : 'en-US')}</span>
          )}
        </div>

        {post?.image?.asset?.url && (
          <div className="relative w-full h-[240px] sm:h-[320px] lg:h-[460px] rounded-3xl overflow-hidden mb-12">
            <Image
              src={post.image.asset.url}
              alt={title || 'Blog featured image'}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="object-cover"
            />
          </div>
        )}

        {excerpt && (
          <p className="text-xl text-[#8A95A5] leading-relaxed mb-10">
            {excerpt}
          </p>
        )}

        <div className="bg-white/[0.06] border border-white/10 rounded-3xl p-8 md:p-12">
          {isPortable ? (
            <PortableText
              value={post.content as PortableTextBlock[]}
              components={portableTextComponents}
            />
          ) : (
            <p className="text-lg text-[#D6D8E0] leading-relaxed whitespace-pre-line">
              {post.content as string}
            </p>
          )}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-10">
            <span className="text-sm uppercase tracking-widest text-[#DFBA67] mr-2">
              {tagsLabel}
            </span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-white/[0.08] border border-white/10 text-[#D6D8E0] text-sm px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {related.length > 0 && (
        <section className="bg-white text-[#0E1635]">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
              {locale === 'ar' ? 'مقالات ذات صلة' : 'Related Articles'}
            </p>

            <h2 className="text-3xl md:text-4xl font-bold mb-10">
              {locale === 'ar' ? 'تابع القراءة' : 'Keep reading'}
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {related.map((item) => {
                const rTitle = L(item.title)
                const rCategory = L(item.category)
                const rExcerpt = L(item.excerpt)
                return (
                  <a
                    key={item._id}
                    href={localizePath(`/blog/${item.slug?.current}`, locale)}
                    className="group rounded-3xl overflow-hidden bg-white border border-black/5 shadow-xl shadow-black/5 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative h-[220px] overflow-hidden bg-[#F6F6F8]">
                      {item?.image?.asset?.url && (
                        <Image
                          src={item.image.asset.url}
                          alt={rTitle || 'Related article'}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition duration-700"
                        />
                      )}
                    </div>

                    <div className="p-6">
                      {rCategory && (
                        <p className="inline-block bg-[#F0EEF8] text-[#0E1635] px-3 py-1 rounded-md text-xs font-bold mb-4">
                          {rCategory}
                        </p>
                      )}

                      <h3 className="text-xl font-bold leading-tight mb-3">
                        {rTitle}
                      </h3>

                      {rExcerpt && (
                        <p className="text-[#6B7280] leading-relaxed text-sm">
                          {rExcerpt}
                        </p>
                      )}
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </PageLayout>
  )
}
