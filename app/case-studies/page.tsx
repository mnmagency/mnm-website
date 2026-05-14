import Image from 'next/image'
import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'
import { localize, localizePath } from '@/lib/locale'
import { getLocale } from '@/lib/locale-server'

export const revalidate = 60

type LocaleField = { en?: string; ar?: string } | string | null | undefined

type CaseStudyCard = {
  title?: LocaleField
  slug?: { current?: string }
  client?: string
  industry?: LocaleField
  category?: LocaleField
  description?: LocaleField
  results?: LocaleField
  image?: { asset?: { url?: string } }
}

export async function generateMetadata() {
  const locale = await getLocale()
  const page = await client.fetch(`
    *[_type == "caseStudiesPage"][0]{
      title, subtitle,
      seo{ metaTitle, metaDescription, canonicalUrl, ogImage{ asset->{url} } }
    }
  `)

  const seo = page?.seo
  const title = localize(seo?.metaTitle, locale) || localize(page?.title, locale) || 'Case Studies | M&M Marketing Qatar'
  const description = localize(seo?.metaDescription, locale) || localize(page?.subtitle, locale) ||
    'Explore M&M Marketing case studies across websites, SEO, social media, branding, paid media, and growth systems in Qatar.'

  return {
    title, description,
    openGraph: { title, description, images: seo?.ogImage?.asset?.url ? [seo.ogImage.asset.url] : [] },
    alternates: { canonical: seo?.canonicalUrl || undefined },
  }
}

export default async function CaseStudiesPage() {
  const locale = await getLocale()
  const data = await client.fetch(`
    {
      "page": *[_type == "caseStudiesPage"][0]{ eyebrow, title, subtitle, cardCtaText },
      "caseStudies": *[_type == "caseStudy"] | order(_createdAt desc){
        title, slug, client, industry, category, description, results, image{ asset->{url} }
      }
    }
  `)

  const page = data?.page
  const caseStudies: CaseStudyCard[] = data?.caseStudies || []
  const L = (f: LocaleField) => localize(f, locale)
  const eyebrow  = L(page?.eyebrow)     || 'Case Studies'
  const title    = L(page?.title)       || 'Real work. Real strategy. Real measurable growth.'
  const subtitle = L(page?.subtitle)    || 'Explore selected case studies showing how M&M Marketing helps brands in Qatar turn digital strategy into business growth.'
  const cardCta  = L(page?.cardCtaText) || 'View Case Study →'

  return (
    <PageLayout>
      <section className="max-w-7xl mx-auto px-6 pt-40 pb-24">
        <p className="text-[#DFBA67] uppercase tracking-widest mb-4">{eyebrow}</p>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl">{title}</h1>
        <p className="text-[#8A95A5] text-lg max-w-3xl mb-14">{subtitle}</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caseStudies.map((item, index) => {
            const cTitle = L(item.title)
            const cCategory = L(item.category) || L(item.industry)
            const cDesc = L(item.description) || L(item.results)
            return (
              <a
                key={index}
                href={localizePath(`/case-studies/${item.slug?.current}`, locale)}
                className="group overflow-hidden rounded-3xl bg-white/[0.06] border border-white/10 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/10"
              >
                <div className="relative h-[260px] bg-white/10 overflow-hidden">
                  {item?.image?.asset?.url && (
                    <Image
                      src={item.image.asset.url}
                      alt={cTitle || 'Case study'}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition duration-700"
                    />
                  )}
                </div>

                <div className="p-7">
                  <p className="text-[#DFBA67] uppercase tracking-widest text-xs mb-3">{cCategory}</p>
                  <h2 className="text-2xl font-bold mb-4">{cTitle}</h2>
                  <p className="text-[#8A95A5] leading-relaxed mb-5">{cDesc}</p>
                  <span className="text-[#DFBA67] font-bold">{cardCta}</span>
                </div>
              </a>
            )
          })}
        </div>
      </section>
    </PageLayout>
  )
}
