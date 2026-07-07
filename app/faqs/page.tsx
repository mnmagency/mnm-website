import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'
import { localize } from '@/lib/locale'
import { getLocale } from '@/lib/locale-server'

export const revalidate = 60

type LocaleField = { en?: string; ar?: string } | string | null | undefined

type FAQ = {
  _id?: string
  question?: LocaleField
  answer?: LocaleField
  category?: string
}

type CategoryLabels = Record<string, LocaleField>

const CATEGORY_ORDER: Array<{
  value: string
  labelKey: string
  defaultEn: string
  defaultAr: string
}> = [
  { value: 'general',             labelKey: 'general',            defaultEn: 'General',             defaultAr: 'عام' },
  { value: 'website-development', labelKey: 'websiteDevelopment', defaultEn: 'Website Development', defaultAr: 'تطوير المواقع' },
  { value: 'seo',                 labelKey: 'seo',                defaultEn: 'SEO',                 defaultAr: 'تحسين محركات البحث' },
  { value: 'social-media',        labelKey: 'socialMedia',        defaultEn: 'Social Media',        defaultAr: 'وسائل التواصل' },
  { value: 'branding',            labelKey: 'branding',           defaultEn: 'Branding',            defaultAr: 'الهوية' },
  { value: 'bulk-sms',            labelKey: 'bulkSms',            defaultEn: 'Bulk SMS',            defaultAr: 'الرسائل النصية' },
  { value: 'paid-ads',            labelKey: 'paidAds',            defaultEn: 'Paid Ads',            defaultAr: 'الإعلانات المدفوعة' },
  { value: 'ai-llmo-geo',         labelKey: 'aiLlmoGeo',          defaultEn: 'AI / LLMO / GEO',     defaultAr: 'الذكاء الاصطناعي' },
]

export async function generateMetadata() {
  const locale = await getLocale()
  const page = await client.fetch(`
    *[_type == "faqsPage"][0]{
      title, subtitle,
      seo{ metaTitle, metaDescription, canonicalUrl, ogImage{ asset->{url} } }
    }
  `)
  const seo = page?.seo
  return {
    title: localize(seo?.metaTitle, locale) || localize(page?.title, locale) || 'FAQs | M&M Marketing Qatar',
    description: localize(seo?.metaDescription, locale) || localize(page?.subtitle, locale) ||
      'Frequently asked questions about M&M Marketing services in Qatar.',
    alternates: { canonical: seo?.canonicalUrl || undefined },
  }
}

export default async function FAQsPage() {
  const locale = await getLocale()
  const data = await client.fetch<{
    page: { eyebrow?: LocaleField; title?: LocaleField; subtitle?: LocaleField; categoryLabels?: CategoryLabels } | null
    faqs: FAQ[]
  }>(`
    {
      "page": *[_type == "faqsPage"][0]{ eyebrow, title, subtitle, categoryLabels },
      "faqs": *[_type == "faq" && showOnFaqPage == true] | order(order asc, _createdAt asc){
        _id, question, answer, category
      }
    }
  `)

  const page = data?.page
  const faqs = data?.faqs || []
  const categoryLabels = page?.categoryLabels || {}
  const L = (f: LocaleField) => localize(f, locale)

  const grouped = new Map<string, FAQ[]>()
  const knownCategories = new Set(CATEGORY_ORDER.map((c) => c.value))
  for (const faq of faqs) {
    const key = faq.category && knownCategories.has(faq.category) ? faq.category : 'other'
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(faq)
  }

  const groupsToRender = CATEGORY_ORDER
    .map(({ value, labelKey, defaultEn, defaultAr }) => ({
      heading: L(categoryLabels[labelKey]) || (locale === 'ar' ? defaultAr : defaultEn),
      faqs: grouped.get(value) || [],
    }))
    .filter((g) => g.faqs.length > 0)

  if (grouped.has('other')) {
    groupsToRender.push({
      heading: locale === 'ar' ? 'أخرى' : 'Other',
      faqs: grouped.get('other')!,
    })
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: L(faq.question),
      acceptedAnswer: { '@type': 'Answer', text: L(faq.answer) },
    })),
  }

  return (
    <PageLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="max-w-4xl mx-auto px-6 pt-40 pb-24">
        <p className="text-[#DFBA67] uppercase tracking-widest mb-4">{L(page?.eyebrow) || 'FAQs'}</p>
        <h1 className="text-4xl md:text-6xl font-bold mb-6">{L(page?.title) || 'Frequently Asked Questions'}</h1>
        {L(page?.subtitle) && <p className="text-[#8A95A5] text-lg max-w-3xl mb-10">{L(page?.subtitle)}</p>}

        <div className="space-y-12 mt-12">
          {groupsToRender.map((group) => (
            <div key={group.heading}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#DFBA67] mb-6">{group.heading}</h2>

              <div className="space-y-4">
                {group.faqs.map((faq) => (
                  <details key={faq._id} className="group rounded-2xl bg-white border border-black/5 shadow-lg shadow-black/5 overflow-hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-lg md:text-xl font-bold text-[#0E1635]">
                      <span>{L(faq.question)}</span>
                      <span className="text-[#DFBA67] text-2xl transition-transform duration-300 group-open:rotate-45">+</span>
                    </summary>
                    <div className="px-6 pb-6 text-[#6B7280] leading-relaxed">{L(faq.answer)}</div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  )
}
