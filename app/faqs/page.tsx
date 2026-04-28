import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'
export const revalidate = 60

export async function generateMetadata() {
  return {
    title: 'FAQs | M&M Marketing Qatar',
    description:
      'Frequently asked questions about M&M Marketing services, websites, SEO, social media, branding, bulk SMS, and AI-driven growth in Qatar.',
  }
}

export default async function FAQsPage() {
  const faqs = await client.fetch(`
    *[_type == "faq" && showOnFaqPage == true] 
    | order(_createdAt asc){
      _id,
      question,
      answer,
      category
    }
  `)

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (faqs || []).map((faq: any) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      <section className="max-w-4xl mx-auto px-6 pt-40 pb-24">
        <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
          FAQs
        </p>

        <h1 className="text-4xl md:text-6xl font-bold mb-10">
          Frequently Asked Questions
        </h1>

        <div className="space-y-4">
          {faqs?.map((faq: any) => (
            <details
              key={faq._id}
              className="group rounded-2xl bg-white border border-black/5 shadow-lg shadow-black/5 overflow-hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-lg md:text-xl font-bold text-[#33314E]">
                <span>{faq.question}</span>

                <span className="text-[#DFBA67] text-2xl transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>

              <div className="px-6 pb-6 text-[#6B7280] leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </PageLayout>
  )
}