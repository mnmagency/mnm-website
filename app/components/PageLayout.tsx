import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import FloatingAuditCta from '@/app/components/FloatingAuditCta'
import FloatingWhatsAppCta, { type WhatsAppRoute } from '@/app/components/FloatingWhatsAppCta'
import TrackingScripts from '@/app/components/TrackingScripts'
import { localize } from '@/lib/locale'
import { getLocale } from '@/lib/locale-server'
import Script from 'next/script'
import { client } from '@/lib/sanity'

const SITE_URL = 'https://mnmagency.com'

type Socials = {
  instagram?: string
  facebook?: string
  x?: string
  youtube?: string
}

type NavBrand = {
  brandName?: string
  logo?: { asset?: { url?: string } }
  phone?: string
  email?: string
  address?: string
  socials?: Socials
}

// Build a full LocalBusiness / MarketingAgency schema keyed for Qatar
// local search. Adds priceRange, geo coordinates (Doha), opening hours,
// areaServed, and a Service catalog — all signals Google uses to
// surface the business in the "Marketing agency in Qatar" local pack.
function buildOrganizationSchema(nav: NavBrand | null | undefined) {
  const name = nav?.brandName || 'M&M Marketing'
  const sameAs = [
    nav?.socials?.instagram,
    nav?.socials?.facebook,
    nav?.socials?.x,
    nav?.socials?.youtube,
  ].filter((url): url is string => typeof url === 'string' && url.length > 0)

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    // Multiple @type entries let us claim both a LocalBusiness (for the
    // Qatar map pack) and a professional MarketingAgency service org.
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': `${SITE_URL}/#organization`,
    name,
    alternateName: 'M&M Marketing Agency Qatar',
    url: SITE_URL,
    description:
      'M&M Marketing is a full-service marketing agency in Qatar specialising in SEO, Web Development, Social Media Management, Branding, Paid Ads, Videography, and Bulk SMS for brands in Doha and across Qatar.',
    priceRange: '$$$',
    currenciesAccepted: 'QAR, USD',
    paymentAccepted: 'Bank Transfer, Credit Card',
    areaServed: [
      { '@type': 'Country', name: 'Qatar' },
      { '@type': 'City', name: 'Doha' },
      { '@type': 'City', name: 'Al Rayyan' },
      { '@type': 'City', name: 'Al Wakrah' },
      { '@type': 'City', name: 'Al Khor' },
    ],
    knowsAbout: [
      'Marketing agency in Qatar',
      'SEO agency in Qatar',
      'Web development in Qatar',
      'Web design in Qatar',
      'Social media marketing Qatar',
      'Branding Qatar',
      'Paid ads Qatar',
      'Videography Qatar',
      'Bulk SMS Qatar',
      'AI marketing Qatar',
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    // Doha centre coordinates — refine to your office location if desired.
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 25.276987,
      longitude: 51.520008,
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Marketing Services in Qatar',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'SEO Agency in Qatar',
            url: `${SITE_URL}/services/seo`,
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Web Development in Qatar',
            url: `${SITE_URL}/services/web-development`,
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Social Media Management in Qatar',
            url: `${SITE_URL}/services/social-media`,
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Branding Agency in Qatar',
            url: `${SITE_URL}/services/branding`,
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Paid Ads Agency in Qatar',
            url: `${SITE_URL}/services/paid-ads`,
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Videography in Qatar',
            url: `${SITE_URL}/services/videography`,
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Bulk SMS in Qatar',
            url: `${SITE_URL}/services/bulk-sms`,
          },
        },
      ],
    },
  }

  if (nav?.logo?.asset?.url) {
    schema.logo = nav.logo.asset.url
    schema.image = nav.logo.asset.url
  }

  if (nav?.phone) {
    schema.telephone = nav.phone
    schema.contactPoint = {
      '@type': 'ContactPoint',
      telephone: nav.phone,
      contactType: 'customer service',
      areaServed: 'QA',
      availableLanguage: ['English', 'Arabic'],
      ...(nav?.email ? { email: nav.email } : {}),
    }
  }

  if (nav?.email) schema.email = nav.email

  if (nav?.address) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: nav.address,
      addressLocality: 'Doha',
      addressCountry: 'QA',
    }
  }

  if (sameAs.length > 0) schema.sameAs = sameAs

  return schema
}

export default async function PageLayout({
  children,
  variant = 'dark',
}: {
  children: React.ReactNode
  variant?: 'dark' | 'light'
}) {
  const backgroundClass =
    variant === 'light'
      ? 'bg-white text-[#0E1635]'
      : 'bg-[#0E1635] text-white'

  const locale = await getLocale()

  // Pull the brand/contact fields once so the JSON-LD stays in sync with what
  // Header and Footer render. Sanity returns null cleanly if any field is missing.
  // Also fetches the WhatsApp routing config in the same query.
  const nav = await client.fetch<
    (NavBrand & {
      whatsapp?: {
        enabled?: boolean
        defaultNumber?: string
        defaultMessage?: { en?: string; ar?: string } | string
        routes?: Array<{
          label?: string
          number?: string
          message?: { en?: string; ar?: string } | string
          matchPaths?: string[]
        }>
      }
    }) | null
  >(`
    *[_type == "navigation"][0]{
      brandName,
      logo{ asset->{url} },
      phone,
      email,
      address,
      socials{ instagram, facebook, x, youtube },
      whatsapp{
        enabled, defaultNumber, defaultMessage,
        routes[]{ label, number, message, matchPaths }
      }
    }
  `)

  // Localize the WhatsApp messages so pre-filled text matches the visitor's locale.
  const wa = nav?.whatsapp
  const waRoutes: WhatsAppRoute[] = (wa?.routes || []).map((r) => ({
    label: r.label,
    number: r.number,
    message: localize(r.message, locale) || undefined,
    matchPaths: r.matchPaths,
  }))
  const waDefaultMessage = localize(wa?.defaultMessage, locale) || undefined
  const waEnabled = wa?.enabled !== false // default to enabled if the field is missing

  const organizationSchema = buildOrganizationSchema(nav)

  // Pull the GTM container ID separately so we can inject the required
  // <noscript> iframe in <body> too (Google's official install spec).
  const settings = await client.fetch<{gtmContainerId?: string} | null>(`
    *[_type == "siteSettings"][0]{ gtmContainerId }
  `)

  return (
    <>
      {/* Analytics + tracking pixels (GA4, GTM, Meta, TikTok, etc.) — only fire
          when the corresponding ID is present in Sanity Studio → Site Settings. */}
      <TrackingScripts />

      <Script
        id="organization-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />

      <main className={`min-h-screen ${backgroundClass}`}>
        {/* GTM <noscript> fallback (per Google's install spec). Renders as an
            invisible iframe when JS is disabled. */}
        {settings?.gtmContainerId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${settings.gtmContainerId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}

        <Header />
        <FloatingAuditCta />
        <FloatingWhatsAppCta
          enabled={waEnabled}
          defaultNumber={wa?.defaultNumber}
          defaultMessage={waDefaultMessage}
          routes={waRoutes}
          ariaLabel={locale === 'ar' ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
        />
        {children}
        <Footer />
      </main>
    </>
  )
}
