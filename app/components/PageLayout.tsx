import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
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
    '@type': 'Organization',
    name,
    url: SITE_URL,
  }

  if (nav?.logo?.asset?.url) schema.logo = nav.logo.asset.url

  if (nav?.phone) {
    schema.contactPoint = {
      '@type': 'ContactPoint',
      telephone: nav.phone,
      contactType: 'customer service',
      areaServed: 'QA',
      ...(nav?.email ? { email: nav.email } : {}),
    }
  }

  if (nav?.address) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: nav.address,
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
      ? 'bg-white text-[#33314E]'
      : 'bg-[#33314E] text-white'

  // Pull the brand/contact fields once so the JSON-LD stays in sync with what
  // Header and Footer render. Sanity returns null cleanly if any field is missing.
  const nav = await client.fetch<NavBrand | null>(`
    *[_type == "navigation"][0]{
      brandName,
      logo{ asset->{url} },
      phone,
      email,
      address,
      socials{ instagram, facebook, x, youtube }
    }
  `)

  const organizationSchema = buildOrganizationSchema(nav)

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />

      <main className={`min-h-screen ${backgroundClass}`}>
        <Header />
        {children}
        <Footer />
      </main>
    </>
  )
}
