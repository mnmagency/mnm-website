import Image from 'next/image'
import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'
import { localize, localizePath } from '@/lib/locale'
import { getLocale } from '@/lib/locale-server'

export const revalidate = 60

type LocaleField = { en?: string; ar?: string } | string | null | undefined

type ServiceCard = {
  title?: LocaleField
  description?: LocaleField
  slug?: { current?: string }
  image?: { asset?: { url?: string } }
}

export async function generateMetadata() {
  const locale = await getLocale()
  const page = await client.fetch(`
    *[_type == "servicesPage"][0]{
      title, subtitle,
      seo{ metaTitle, metaDescription, canonicalUrl, ogImage{ asset->{url} } }
    }
  `)

  const seo = page?.seo
  const title = localize(seo?.metaTitle, locale) || localize(page?.title, locale) || 'Services | M&M Marketing Qatar'
  const description = localize(seo?.metaDescription, locale) || localize(page?.subtitle, locale) ||
    'Websites, SEO, social media, branding, paid media, and AI-driven growth services in Qatar.'

  return {
    title, description,
    openGraph: {
      title, description,
      images: seo?.ogImage?.asset?.url ? [seo.ogImage.asset.url] : [],
    },
    alternates: { canonical: seo?.canonicalUrl || undefined },
  }
}

export default async function ServicesIndexPage() {
  const locale = await getLocale()
  const data = await client.fetch(`
    {
      "page": *[_type == "servicesPage"][0]{
        eyebrow, title, subtitle, intro,
        ctaTitle, ctaText, ctaButtonText, ctaButtonLink
      },
      "services": *[_type == "service"] | order(_createdAt asc){
        title, description, slug, image{ asset->{url} }
      }
    }
  `)

  const page = data?.page
  const services: ServiceCard[] = data?.services || []
  const L = (f: LocaleField) => localize(f, locale)
  const eyebrow      = L(page?.eyebrow)
  const title        = L(page?.title) || 'Services built to generate revenue.'
  const subtitle     = L(page?.subtitle)
  const intro        = L(page?.intro)
  const ctaTitle     = L(page?.ctaTitle)
  const ctaText      = L(page?.ctaText)
  const ctaButtonText = L(page?.ctaButtonText) || 'Get Your AI Growth Strategy'
  const ctaButtonLink = localizePath(page?.ctaButtonLink || '/get-strategy', locale)

  return (
    <PageLayout>
      <section className="max-w-7xl mx-auto px-6 pt-40 pb-16">
        {eyebrow && (
          <p className="text-[#DFBA67] uppercase tracking-widest mb-4">{eyebrow}</p>
        )}

        <h1 className="text-4xl md:text-7xl font-bold mb-6 max-w-5xl leading-[1.05] tracking-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="text-lg md:text-xl text-[#8A95A5] max-w-3xl leading-relaxed">{subtitle}</p>
        )}

        {intro && (
          <p className="text-[#8A95A5] leading-relaxed max-w-3xl mt-6 whitespace-pre-line">{intro}</p>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const sTitle = L(service.title)
            const sDesc = L(service.description)
            return (
              <a
                key={index}
                href={localizePath(`/services/${service.slug?.current}`, locale)}
                className="group relative block overflow-hidden rounded-3xl border border-white/10 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/20 min-h-[320px]"
              >
                {service?.image?.asset?.url && (
                  <Image
                    src={service.image.asset.url}
                    alt={sTitle || 'M&M Marketing service'}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition duration-700"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

                <div className="relative z-10 p-7 h-full flex flex-col justify-end">
                  <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">{sTitle}</h2>
                  <p className="text-white/75 leading-relaxed">{sDesc}</p>
                  <span className="text-[#DFBA67] font-bold mt-5 inline-block">
                    {locale === 'ar' ? 'استكشف الخدمة ←' : 'Explore service →'}
                  </span>
                </div>
              </a>
            )
          })}
        </div>
      </section>

      {(ctaTitle || ctaText) && (
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="bg-[#DFBA67] text-[#33314E] rounded-[2rem] p-10 md:p-16 text-center shadow-2xl shadow-black/20">
            {ctaTitle && <h2 className="text-3xl md:text-5xl font-bold mb-6">{ctaTitle}</h2>}
            {ctaText && <p className="text-lg text-[#33314E]/80 max-w-3xl mx-auto mb-8">{ctaText}</p>}
            <a href={ctaButtonLink} className="inline-block bg-[#33314E] text-white px-10 py-4 rounded-full font-bold hover:scale-[1.03] transition-all duration-300">
              {ctaButtonText}
            </a>
          </div>
        </section>
      )}
    </PageLayout>
  )
}
