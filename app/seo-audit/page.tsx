import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'
import SeoAuditWidget from '@/app/seo-audit/SeoAuditWidget'
import { localize } from '@/lib/locale'
import { getLocale } from '@/lib/locale-server'

export const revalidate = 60

type LocaleField = { en?: string; ar?: string } | string | null | undefined

export async function generateMetadata() {
  const locale = await getLocale()
  const page = await client.fetch(`
    *[_type == "seoAuditPage"][0]{
      title, subtitle,
      seo{ metaTitle, metaDescription, canonicalUrl, ogImage{ asset->{url} } }
    }
  `)
  const seo = page?.seo
  return {
    title: localize(seo?.metaTitle, locale) || localize(page?.title, locale) || 'Free SEO Audit | M&M Marketing Qatar',
    description: localize(seo?.metaDescription, locale) || localize(page?.subtitle, locale) ||
      'Free SEO audit for your website. Get a full report covering technical SEO, on-page optimisation, performance, and growth opportunities.',
    alternates: { canonical: seo?.canonicalUrl || undefined },
  }
}

export default async function SeoAuditPage() {
  const locale = await getLocale()
  const page = await client.fetch(`
    *[_type == "seoAuditPage"][0]{
      eyebrow, title, subtitle,
      widgetTitle, seoptimerUid, seoptimerCsrfToken, placeholders, successMessage
    }
  `)
  const L = (f: LocaleField) => localize(f, locale)

  const eyebrow      = L(page?.eyebrow)
  const title        = L(page?.title)        || 'Free SEO Audit'
  const subtitle     = L(page?.subtitle)     || 'Enter your website URL below to get a full SEO report instantly.'
  const widgetTitle  = L(page?.widgetTitle)  || "Audit Your Website's SEO Now!"
  const successMsg   = L(page?.successMessage) || 'The report will be sent to your email shortly. Thank you!'

  const placeholders = page?.placeholders ? {
    url:       L(page.placeholders.url),
    firstName: L(page.placeholders.firstName),
    email:     L(page.placeholders.email),
    phone:     L(page.placeholders.phone),
    submit:    L(page.placeholders.submit),
  } : undefined

  return (
    <PageLayout>
      <section className="max-w-3xl mx-auto px-6 pt-40 pb-20 text-center">
        {eyebrow && (
          <p className="text-[#DFBA67] uppercase tracking-widest mb-4">{eyebrow}</p>
        )}

        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">{title}</h1>

        <p className="text-lg text-[#8A95A5] leading-relaxed mb-12">{subtitle}</p>

        <SeoAuditWidget
          widgetTitle={widgetTitle}
          uid={page?.seoptimerUid || ''}
          csrfToken={page?.seoptimerCsrfToken || ''}
          placeholders={placeholders}
          successMessage={successMsg}
        />
      </section>
    </PageLayout>
  )
}
