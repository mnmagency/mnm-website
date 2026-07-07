import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'
import ContactForm from '@/app/components/ContactForm'
import { localize, localizePath } from '@/lib/locale'
import { getLocale } from '@/lib/locale-server'

export const revalidate = 60

type LocaleField = { en?: string; ar?: string } | string | null | undefined

type ContactPage = {
  seo?: {
    metaTitle?: LocaleField
    metaDescription?: LocaleField
    canonicalUrl?: string
    ogImage?: { asset?: { url?: string } }
  }
  eyebrow?: LocaleField
  title?: LocaleField
  subtitle?: LocaleField
  phone?: string
  email?: string
  address?: LocaleField
  workingHours?: string
  mapEmbed?: string
  mapUrl?: string
  contactDetailsTitle?: LocaleField
  detailLabels?: {
    workingHours?: LocaleField
    phone?: LocaleField
    email?: LocaleField
    location?: LocaleField
  }
  openLocationButton?: LocaleField
  formEyebrow?: LocaleField
  formTitle?: LocaleField
  formSubtitle?: LocaleField
  servicesOptions?: Array<LocaleField>
  formPlaceholders?: {
    name?: LocaleField
    email?: LocaleField
    phone?: LocaleField
    company?: LocaleField
    service?: LocaleField
    message?: LocaleField
  }
  formSubmitText?: LocaleField
  formSuccessTitle?: LocaleField
  formSuccessText?: LocaleField
  formErrorMessage?: LocaleField
  formPrivacyNote?: LocaleField
  ctaTagline?: LocaleField
  ctaSubTagline?: LocaleField
  ctaTitle?: LocaleField
  ctaText?: LocaleField
  ctaButtonText?: LocaleField
  ctaButtonLink?: string
  ctaButtonNote?: LocaleField
}

export async function generateMetadata() {
  const locale = await getLocale()
  const page = await client.fetch<ContactPage | null>(`
    *[_type == "contactPage"][0]{
      seo{ metaTitle, metaDescription, canonicalUrl, ogImage{ asset->{url} } }
    }
  `)
  const seo = page?.seo
  return {
    title: localize(seo?.metaTitle, locale) || 'Contact M&M Marketing Qatar',
    description: localize(seo?.metaDescription, locale) ||
      "Contact M&M Marketing — Qatar's trusted marketing agency in Doha. SEO, web development, social media, branding, paid ads, and videography. Free consultation.",
    openGraph: {
      title: localize(seo?.metaTitle, locale),
      description: localize(seo?.metaDescription, locale),
      images: seo?.ogImage?.asset?.url ? [seo.ogImage.asset.url] : [],
    },
    alternates: { canonical: seo?.canonicalUrl || undefined },
  }
}

export default async function ContactPage() {
  const locale = await getLocale()
  const page = await client.fetch<ContactPage | null>(`
    *[_type == "contactPage"][0]{
      eyebrow, title, subtitle,
      phone, email, address, workingHours, mapEmbed, mapUrl,
      contactDetailsTitle, detailLabels, openLocationButton,
      formEyebrow, formTitle, formSubtitle, servicesOptions,
      formPlaceholders, formSubmitText, formSuccessTitle, formSuccessText,
      formErrorMessage, formPrivacyNote,
      ctaTagline, ctaSubTagline, ctaTitle, ctaText, ctaButtonText, ctaButtonLink, ctaButtonNote
    }
  `)

  const L = (f: LocaleField) => localize(f, locale)
  const eyebrow             = L(page?.eyebrow)             || 'Contact M&M'
  const title               = L(page?.title)               || "Contact Qatar's Trusted Marketing Agency"
  const subtitle            = L(page?.subtitle)
  const contactDetailsTitle = L(page?.contactDetailsTitle) || 'Contact Details'
  const labelWorkingHours   = L(page?.detailLabels?.workingHours) || 'Working Hours:'
  const labelPhone          = L(page?.detailLabels?.phone)        || 'Phone:'
  const labelEmail          = L(page?.detailLabels?.email)        || 'Email:'
  const labelLocation       = L(page?.detailLabels?.location)     || 'Location:'
  const openLocationButton  = L(page?.openLocationButton)  || 'Open Location'
  const formEyebrow         = L(page?.formEyebrow)         || "Let's Talk"
  const formTitle           = L(page?.formTitle)           || 'Tell us about your project'
  const formSubtitle        = L(page?.formSubtitle)        || 'Fill out the form and our team will get back to you with a tailored strategy for your business.'
  const address             = L(page?.address)
  const ctaTagline          = L(page?.ctaTagline)          || 'Your growth is our mission.'
  const ctaSubTagline       = L(page?.ctaSubTagline)       || "Let's achieve it together."
  const ctaTitle            = L(page?.ctaTitle)            || 'Ready to Turn Your Marketing Into Revenue?'
  const ctaText             = L(page?.ctaText)             || "Let's build a strategy focused on real results, not just impressions."
  const ctaButtonText       = L(page?.ctaButtonText)       || 'Get Free Consultation'
  const ctaButtonLink       = localizePath(page?.ctaButtonLink || '/get-strategy', locale)
  const ctaButtonNote       = L(page?.ctaButtonNote)       || 'No commitment. Strategy call within 24 hours.'

  const servicesOptions = (page?.servicesOptions || []).map(L).filter(Boolean) as string[]

  return (
    <PageLayout>
      <section className="max-w-7xl mx-auto px-6 pt-40 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4">{eyebrow}</p>
            <h1 className="text-4xl md:text-7xl font-bold mb-6">{title}</h1>
            <p className="text-lg text-[#8A95A5] leading-relaxed max-w-2xl">{subtitle}</p>
          </div>

          <div className="bg-white/[0.05] border border-white/10 rounded-[2rem] p-8 shadow-2xl shadow-black/20">
            <h2 className="text-2xl font-bold text-[#DFBA67] mb-6">{contactDetailsTitle}</h2>

            <div className="space-y-5 text-[#8A95A5]">
              {page?.workingHours && (
                <p><strong className="text-white">{labelWorkingHours}</strong> {page.workingHours}</p>
              )}
              {page?.phone && (
                <p>
                  <strong className="text-white">{labelPhone}</strong>{' '}
                  <a href={`tel:${page.phone}`} className="hover:text-[#DFBA67]">{page.phone}</a>
                </p>
              )}
              {page?.email && (
                <p>
                  <strong className="text-white">{labelEmail}</strong>{' '}
                  <a href={`mailto:${page.email}`} className="hover:text-[#DFBA67]">{page.email}</a>
                </p>
              )}
              {address && (
                <p><strong className="text-white">{labelLocation}</strong> {address}</p>
              )}
              {page?.mapUrl && (
                <a
                  href={page.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 bg-[#DFBA67] text-[#0E1635] px-7 py-3 rounded-full font-bold hover:scale-[1.03] transition-all duration-300"
                >
                  {openLocationButton}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          <div className="bg-white text-[#0E1635] rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-black/20">
            <p className="text-[#DFBA67] uppercase tracking-widest mb-3 font-bold">{formEyebrow}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{formTitle}</h2>
            <p className="text-[#6B7280] mb-8 leading-relaxed">{formSubtitle}</p>

            <ContactForm
              servicesOptions={servicesOptions}
              placeholders={{
                name:    L(page?.formPlaceholders?.name),
                email:   L(page?.formPlaceholders?.email),
                phone:   L(page?.formPlaceholders?.phone),
                company: L(page?.formPlaceholders?.company),
                service: L(page?.formPlaceholders?.service),
                message: L(page?.formPlaceholders?.message),
              }}
              submitText={L(page?.formSubmitText) || 'Send Message'}
              successTitle={L(page?.formSuccessTitle) || 'Thanks — your message is on its way.'}
              successText={L(page?.formSuccessText) || 'Our team will get back to you shortly.'}
              errorMessage={L(page?.formErrorMessage) || 'Sorry, something went wrong. Please try again or email us directly.'}
              privacyNote={L(page?.formPrivacyNote) || 'We respect your privacy.'}
            />
          </div>

          {page?.mapEmbed && (
            <div className="rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/30 bg-white/5 min-h-[520px]">
              <iframe
                src={page.mapEmbed}
                width="100%"
                height="100%"
                loading="lazy"
                className="w-full h-full min-h-[520px] border-0"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                title="Map"
              />
            </div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-[#DFBA67] text-[#0E1635] rounded-[2rem] px-8 py-8 md:px-10 md:py-9 shadow-2xl shadow-black/20">
          <div className="grid lg:grid-cols-[1fr_1.8fr_1fr] gap-6 items-center">
            <div>
              <p className="text-xl font-bold mb-1">{ctaTagline}</p>
              <p className="text-sm text-[#0E1635]/70">{ctaSubTagline}</p>
            </div>

            <div className="lg:border-x lg:border-[#0E1635]/20 lg:px-8 text-center">
              <h2 className="text-2xl md:text-4xl font-bold leading-tight mb-3">{ctaTitle}</h2>
              <p className="text-base text-[#0E1635]/75 max-w-2xl mx-auto">{ctaText}</p>
            </div>

            <div className="text-center">
              <a
                href={ctaButtonLink}
                className="inline-block bg-[#0E1635] text-white px-7 py-3 rounded-full font-bold text-sm hover:scale-[1.03] transition-all duration-300"
              >
                {ctaButtonText}
              </a>
              {ctaButtonNote && (
                <p className="text-xs text-[#0E1635]/65 mt-3">{ctaButtonNote}</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
