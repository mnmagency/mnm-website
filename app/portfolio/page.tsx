/**
 * /portfolio — every website M&M has designed and built.
 *
 * All copy comes from the `portfolioPage` singleton and `webProject`
 * documents in Sanity. Fallback strings only render if a field is blank.
 */
import { pageAlternates, pageOpenGraph, breadcrumbLd, localeUrl } from '@/lib/seo'
import JsonLd from '@/app/components/JsonLd'
import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'
import PortfolioGrid, { type PortfolioCard } from '@/app/components/PortfolioGrid'
import { localize, localizePath } from '@/lib/locale'
import { getLocale } from '@/lib/locale-server'

export const revalidate = 60

type LocaleField = { en?: string; ar?: string } | string | null | undefined

type WebProjectDoc = {
  title?: LocaleField
  slug?: string
  clientName?: LocaleField
  category?: LocaleField
  projectType?: LocaleField
  summary?: LocaleField
  technologies?: string[]
  heroImage?: { asset?: { url?: string }; alt?: LocaleField }
  clientLogo?: { asset?: { url?: string } }
}

const PAGE_QUERY = `*[_type == "portfolioPage"][0]{
  eyebrow, title, subtitle, allFilterText, cardCtaText,
  seo{ metaTitle, metaDescription, ogImage{ asset->{url} } }
}`

export async function generateMetadata() {
  const locale = await getLocale()
  const page = await client.fetch(PAGE_QUERY)
  const seo = page?.seo
  const title = localize(seo?.metaTitle, locale) || localize(page?.title, locale) || 'Web Development Portfolio'
  const description = localize(seo?.metaDescription, locale) || localize(page?.subtitle, locale) ||
    'Websites designed and developed by M&M Marketing in Qatar.'
  return {
    title, description,
    openGraph: await pageOpenGraph('/portfolio', { title, description, images: seo?.ogImage?.asset?.url ? [seo.ogImage.asset.url] : [] }),
    alternates: await pageAlternates('/portfolio'),
  }
}

export default async function PortfolioPage() {
  const locale = await getLocale()
  const L = (f: LocaleField) => localize(f, locale)

  const data = await client.fetch<{ page: Record<string, LocaleField> | null; projects: WebProjectDoc[] }>(`{
    "page": ${PAGE_QUERY},
    "projects": *[_type == "webProject" && defined(slug.current)] | order(coalesce(order, 999) asc, _createdAt desc){
      title, "slug": slug.current, clientName, category, projectType, summary, technologies,
      heroImage{ asset->{url}, alt }, clientLogo{ asset->{url} }
    }
  }`)

  const page = data?.page
  const projects = data?.projects || []

  const eyebrow  = L(page?.eyebrow)       || (locale === 'ar' ? 'أعمالنا' : 'Portfolio')
  const title    = L(page?.title)         || (locale === 'ar' ? 'مواقع صممناها وطورناها' : 'Websites we have designed and built')
  const subtitle = L(page?.subtitle)
  const allText  = L(page?.allFilterText) || (locale === 'ar' ? 'الكل' : 'All')
  const cardCta  = L(page?.cardCtaText)   || (locale === 'ar' ? 'عرض المشروع ←' : 'View Project →')

  const cards: PortfolioCard[] = projects.map((p) => ({
    href: localizePath(`/portfolio/${p.slug}`, locale),
    title: L(p.title),
    clientName: L(p.clientName),
    category: L(p.category),
    projectType: L(p.projectType),
    summary: L(p.summary),
    technologies: p.technologies || [],
    imageUrl: p.heroImage?.asset?.url,
    imageAlt: L(p.heroImage?.alt) || L(p.title),
    logoUrl: p.clientLogo?.asset?.url,
  }))

  const crumbs = breadcrumbLd(locale, [
    { name: locale === 'ar' ? 'الرئيسية' : 'Home', path: '/' },
    { name: eyebrow, path: '/portfolio' },
  ])

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    itemListElement: projects.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: localeUrl(`/portfolio/${p.slug}`, locale),
      name: L(p.title),
    })),
  }

  return (
    <PageLayout>
      <JsonLd data={crumbs} />
      <JsonLd data={itemList} />
      <section className="max-w-7xl mx-auto px-6 pt-40 pb-24">
        <p className="text-[#DFBA67] uppercase tracking-widest mb-4">{eyebrow}</p>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl">{title}</h1>
        {subtitle && <p className="text-[#8A95A5] text-lg max-w-3xl mb-14">{subtitle}</p>}
        <PortfolioGrid cards={cards} allText={allText} ctaText={cardCta} />
      </section>
    </PageLayout>
  )
}
