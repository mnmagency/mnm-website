import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'
import StrategyForm from '@/app/components/StrategyForm'
import { localize } from '@/lib/locale'
import { getLocale } from '@/lib/locale-server'

export const revalidate = 60

type LocaleField = { en?: string; ar?: string } | string | null | undefined
type ImageRef = { asset?: { url?: string } }

type Country = { flag?: string; countryName?: string; dialCode?: string; phoneLength?: number }
type TrustLogo = { name?: LocaleField; logo?: ImageRef }
type ProcessStep = { title?: LocaleField; description?: LocaleField }
type Testimonial = {
  quote?: LocaleField
  authorName?: LocaleField
  authorTitle?: LocaleField
  authorLogo?: ImageRef
}

type StrategyFormDoc = {
  seo?: { metaTitle?: LocaleField; metaDescription?: LocaleField; canonicalUrl?: string; ogImage?: ImageRef }
  eyebrow?: LocaleField
  title?: LocaleField
  subtitle?: LocaleField
  placeholders?: {
    name?: LocaleField; email?: LocaleField; country?: LocaleField; phone?: LocaleField
    company?: LocaleField; budget?: LocaleField; message?: LocaleField; service?: LocaleField
  }
  services?: Array<LocaleField>
  budgetOptions?: Array<LocaleField>
  countries?: Country[]
  humanQuestion?: LocaleField
  humanAnswer?: LocaleField
  submitText?: LocaleField
  successMessage?: LocaleField
  errorMessage?: LocaleField
  trustEyebrow?: LocaleField
  trustLogos?: TrustLogo[]
  processEyebrow?: LocaleField
  processTitle?: LocaleField
  processSteps?: ProcessStep[]
  testimonialsEyebrow?: LocaleField
  testimonialsTitle?: LocaleField
  testimonials?: Testimonial[]
}

export async function generateMetadata() {
  const locale = await getLocale()
  const form = await client.fetch<StrategyFormDoc | null>(`
    *[_type == "strategyForm"][0]{ title, subtitle, seo{ metaTitle, metaDescription, canonicalUrl, ogImage{ asset->{url} } } }
  `)
  const seo = form?.seo
  return {
    title: localize(seo?.metaTitle, locale) || localize(form?.title, locale) || 'Free Marketing Consultation in Qatar | M&M Marketing',
    description: localize(seo?.metaDescription, locale) || localize(form?.subtitle, locale) ||
      "Book a free marketing consultation with Qatar's leading marketing agency. Tell us about your business and get a tailored marketing plan within 24 hours.",
    openGraph: {
      title: localize(seo?.metaTitle, locale) || localize(form?.title, locale),
      description: localize(seo?.metaDescription, locale) || localize(form?.subtitle, locale),
      images: seo?.ogImage?.asset?.url ? [seo.ogImage.asset.url] : [],
    },
    alternates: { canonical: seo?.canonicalUrl || undefined },
  }
}

export default async function GetStrategy() {
  const locale = await getLocale()
  const form = await client.fetch<StrategyFormDoc | null>(`
    *[_type == "strategyForm"][0]{
      eyebrow, title, subtitle, placeholders, services, budgetOptions,
      countries[]{ flag, countryName, dialCode, phoneLength },
      humanQuestion, humanAnswer, submitText, successMessage, errorMessage,
      trustEyebrow, trustLogos[]{ name, logo{ asset->{url} } },
      processEyebrow, processTitle, processSteps[]{ title, description },
      testimonialsEyebrow, testimonialsTitle,
      testimonials[]{ quote, authorName, authorTitle, authorLogo{ asset->{url} } }
    }
  `)

  const L = (f: LocaleField) => localize(f, locale)
  const services = (form?.services || []).map(L).filter(Boolean) as string[]
  const budgetOptions = (form?.budgetOptions || []).map(L).filter(Boolean) as string[]

  return (
    <PageLayout>
      <section className="px-6 pt-40 pb-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <div>
            {L(form?.eyebrow) && (
              <p className="text-[#DFBA67] uppercase tracking-widest mb-4">{L(form?.eyebrow)}</p>
            )}

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.05]">
              {L(form?.title) || 'Get Your Free Marketing Consultation'}
            </h1>

            <p className="text-lg text-[#8A95A5] leading-relaxed">
              {L(form?.subtitle) || 'Tell us about your business and we will get back to you.'}
            </p>

            {form?.processSteps && form.processSteps.length > 0 && (
              <div className="mt-10 space-y-5">
                {L(form.processEyebrow) && (
                  <p className="text-[#DFBA67] uppercase tracking-widest text-sm">{L(form.processEyebrow)}</p>
                )}
                {L(form.processTitle) && (
                  <h2 className="text-2xl md:text-3xl font-bold">{L(form.processTitle)}</h2>
                )}
                <div className="space-y-4 pt-2">
                  {form.processSteps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#DFBA67] text-[#0E1635] font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-bold text-white mb-1">{L(step.title)}</h3>
                        <p className="text-[#8A95A5] text-sm leading-relaxed">{L(step.description)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white/[0.05] border border-white/10 rounded-[2rem] p-8 shadow-2xl shadow-black/20">
            <StrategyForm
              countries={form?.countries || []}
              humanQuestion={L(form?.humanQuestion) || ''}
              humanAnswer={L(form?.humanAnswer) || ''}
              placeholders={{
                name:    L(form?.placeholders?.name),
                email:   L(form?.placeholders?.email),
                country: L(form?.placeholders?.country),
                phone:   L(form?.placeholders?.phone),
                company: L(form?.placeholders?.company),
                budget:  L(form?.placeholders?.budget),
                message: L(form?.placeholders?.message),
                service: L(form?.placeholders?.service),
              }}
              services={services}
              budgetOptions={budgetOptions}
              submitText={L(form?.submitText) || 'Get Strategy'}
              successMessage={L(form?.successMessage) || "Thanks — we'll be in touch shortly."}
              errorMessage={L(form?.errorMessage) || 'Sorry, something went wrong. Please try again or email us directly.'}
            />
          </div>
        </div>
      </section>

      {form?.trustLogos && form.trustLogos.length > 0 && (
        <section className="bg-white py-12 overflow-hidden">
          {L(form.trustEyebrow) && (
            <div className="mb-6 text-center">
              <p className="text-[#DFBA67] uppercase tracking-widest text-sm font-bold">{L(form.trustEyebrow)}</p>
            </div>
          )}

          <div className="relative w-full overflow-hidden">
            <div className="flex justify-center items-center flex-wrap gap-12 px-6">
              {form.trustLogos.map((trust, index) => (
                <div key={index} className="w-[160px] h-[80px] flex items-center justify-center">
                  {trust?.logo?.asset?.url && (
                    <img
                      src={trust.logo.asset.url}
                      alt={L(trust.name) || 'Trusted brand'}
                      className="max-w-[140px] max-h-[60px] object-contain grayscale opacity-70"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {form?.testimonials && form.testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="mb-12">
            {L(form.testimonialsEyebrow) && (
              <p className="text-[#DFBA67] uppercase tracking-widest mb-4">{L(form.testimonialsEyebrow)}</p>
            )}
            {L(form.testimonialsTitle) && (
              <h2 className="text-3xl md:text-5xl font-bold max-w-3xl">{L(form.testimonialsTitle)}</h2>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {form.testimonials.map((testimonial, index) => {
              const authorName = L(testimonial.authorName)
              return (
                <figure key={index} className="bg-white/[0.06] border border-white/10 rounded-3xl p-7 flex flex-col gap-5">
                  <blockquote className="text-[#D6D8E0] text-lg leading-relaxed">
                    &ldquo;{L(testimonial.quote)}&rdquo;
                  </blockquote>
                  <figcaption className="flex items-center gap-4 mt-auto pt-4 border-t border-white/10">
                    {testimonial.authorLogo?.asset?.url ? (
                      <img
                        src={testimonial.authorLogo.asset.url}
                        alt={authorName || 'Author'}
                        className="w-12 h-12 rounded-full object-cover bg-white/10"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#DFBA67]/30 flex items-center justify-center text-[#DFBA67] font-bold">
                        {authorName?.charAt(0) || '?'}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-white">{authorName}</p>
                      {L(testimonial.authorTitle) && (
                        <p className="text-sm text-[#8A95A5]">{L(testimonial.authorTitle)}</p>
                      )}
                    </div>
                  </figcaption>
                </figure>
              )
            })}
          </div>
        </section>
      )}
    </PageLayout>
  )
}
