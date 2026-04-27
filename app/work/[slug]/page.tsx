import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'

export async function generateMetadata({ params }: any) {
  const { slug } = await params

  const work = await client.fetch(
    `
      *[_type == "work" && slug.current == $slug][0]{
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

  const seo = work?.seo

  return {
    title: seo?.metaTitle || `${work?.title || 'Work'} | M&M Marketing Qatar`,
    description:
      seo?.metaDescription ||
      work?.description ||
      'Case studies and marketing work by M&M Marketing in Qatar.',
    openGraph: {
      title: seo?.metaTitle || work?.title,
      description: seo?.metaDescription || work?.description,
      images: seo?.ogImage?.asset?.url
        ? [seo.ogImage.asset.url]
        : work?.image?.asset?.url
          ? [work.image.asset.url]
          : [],
    },
    alternates: {
      canonical: seo?.canonicalUrl || undefined,
    },
  }
}

export default async function WorkPage({ params }: any) {
  const { slug } = await params

  const work = await client.fetch(
    `
      *[_type == "work" && slug.current == $slug][0]{
        title,
        category,
        description,
        image{
          asset->{url}
        }
      }
    `,
    { slug }
  )

  return (
    <PageLayout>

      <section className="max-w-6xl mx-auto px-6 pt-40 pb-24">
        <a href="/" className="text-[#DFBA67] font-bold">
          ← Back to Home
        </a>

        <p className="text-[#DFBA67] uppercase tracking-widest mt-12 mb-4">
          {work?.category}
        </p>

        <h1 className="text-4xl md:text-6xl font-bold mb-8">
          {work?.title}
        </h1>

        {work?.image?.asset?.url && (
          <img
            src={work.image.asset.url}
            alt={work.title}
            className="w-full h-[500px] object-cover rounded-3xl mb-10"
          />
        )}

        <p className="text-xl text-[#6B7280] leading-relaxed max-w-4xl">
          {work?.description}
        </p>
      </section>
      </PageLayout>
  )
}