import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Script from 'next/script'

export default function PageLayout({
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

  return (
    <>
      {/* ✅ SEO Schema */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "M&M Marketing",
            url: "https://mnmagency.com",
            
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+97444157441",
              contactType: "customer service",
              areaServed: "QA",
            },
          }),
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