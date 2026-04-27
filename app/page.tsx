import Image from 'next/image'
import { client } from '@/lib/sanity'
import PageLayout from '@/app/components/PageLayout'

export async function generateMetadata() {
  const homepage = await client.fetch(`
    *[_type == "homepage"][0]{
      seo{
        metaTitle,
        metaDescription,
        canonicalUrl,
        ogImage{
          asset->{url}
        }
      }
    }
  `)

  const seo = homepage?.seo

  return {
    title: seo?.metaTitle || 'M&M Marketing Qatar',
    description:
      seo?.metaDescription ||
      'AI-driven marketing agency in Qatar focused on measurable business growth.',
    openGraph: {
      title: seo?.metaTitle || 'M&M Marketing Qatar',
      description:
        seo?.metaDescription ||
        'AI-driven marketing agency in Qatar focused on measurable business growth.',
      images: seo?.ogImage?.asset?.url ? [seo.ogImage.asset.url] : [],
    },
    alternates: {
      canonical: seo?.canonicalUrl || undefined,
    },
  }
}

export default async function Home() {
  const data = await client.fetch(`
    {
      "homepage": *[_type == "homepage"][0]{
        seo{
          metaTitle,
          metaDescription,
          focusKeyword,
          canonicalUrl,
          ogImage{
            asset->{url}
          }
        },
        title,
        subtitle,
        buttonText,
        buttonLink,
        secondaryButtonText,
        secondaryButtonLink,
        logo{
          asset->{url}
        },
        heroMediaType,
        heroImage{
          asset->{url}
        },
        heroVideoUrl,
        proofItems,
        growthSteps,
        aboutEyebrow,
        aboutTitle,
        aboutText,
        aboutButtonText,
        aboutButtonLink,
        aboutImage{
          asset->{url}
        },
        aboutPattern{
          asset->{url}
        },
        aboutLogos[]{
          name,
          logo{
            asset->{url}
          }
        },
        missionTitle,
        missionText,
        finalCtaTitle,
        finalCtaText,
        clientLogos[]{
          name,
          logo{
            asset->{url}
          }
        },
        footerText
      },

      "services": *[_type == "service"]{
        title,
        description,
        slug,
        image{
          asset->{url}
        }
      },

      "caseStudies": *[_type == "caseStudy"] | order(_createdAt desc)[0...3]{
        title,
        slug,
        category,
        description,
        results,
        image{
          asset->{url}
        }
      },

      "works": *[_type == "work"] | order(_createdAt desc)[0...4]{
        title,
        category,
        description,
        slug,
        image{
          asset->{url}
        }
      },

      "posts": *[_type == "blog"] | order(publishedAt desc)[0...3]{
        title,
        slug,
        category,
        excerpt,
        image{
          asset->{url}
        }
      }
    }
  `)

  const homepage = data?.homepage

  return (
    <PageLayout>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center px-6 pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(223,186,103,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(138,149,165,0.14),transparent_35%)]" />

        <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#DFBA67] uppercase tracking-widest mb-5">
              AI-Driven Growth Partner in Qatar
            </p>

            <h1 className="text-4xl md:text-7xl font-bold leading-[1.05] mb-6 tracking-tight">
              {homepage?.title}
            </h1>

            <p className="text-lg md:text-xl text-[#8A95A5] mb-8 leading-relaxed">
              {homepage?.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {homepage?.buttonText && (
                <a
                  href={homepage?.buttonLink || '/get-strategy'}
                  className="bg-[#DFBA67] text-[#33314E] px-8 py-4 rounded-full font-bold text-center hover:opacity-90 transition"
                >
                  {homepage.buttonText}
                </a>
              )}

              {homepage?.secondaryButtonText && (
                <a
                  href={homepage?.secondaryButtonLink || '#case-studies'}
                  className="border border-[#DFBA67] text-[#DFBA67] px-8 py-4 rounded-full font-bold text-center hover:bg-[#DFBA67] hover:text-[#33314E] transition"
                >
                  {homepage.secondaryButtonText}
                </a>
              )}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/30 backdrop-blur">
            {homepage?.heroMediaType === 'video' && homepage?.heroVideoUrl ? (
              <video
                src={homepage.heroVideoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-[420px] object-cover"
              />
            ) : homepage?.heroImage?.asset?.url ? (
              <Image
                src={homepage.heroImage.asset.url}
                alt="M&M Marketing Growth System"
                width={1200}
                height={700}
                priority
                className="w-full h-[420px] object-cover"
              />
            ) : (
              <div className="p-8">
                <p className="text-[#DFBA67] mb-6 font-bold">
                  Revenue Proof
                </p>

                <div className="space-y-6">
                  {homepage?.proofItems?.map((item: any, index: number) => (
                    <div key={index}>
                      <h3 className="text-4xl font-bold text-white">
                        {item.number}
                      </h3>
                      <p className="text-[#8A95A5]">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CLIENT LOGOS BANNER */}
      {homepage?.clientLogos?.length > 0 && (
        <section className="bg-white py-10 overflow-hidden">
          <div className="mb-6 text-center">
            <p className="text-[#DFBA67] uppercase tracking-widest text-sm font-bold">
              Trusted by brands across Qatar
            </p>
          </div>

          <div className="relative w-full overflow-hidden">
            <div className="flex w-max animate-[scroll_28s_linear_infinite] gap-16">
              {[...homepage.clientLogos, ...homepage.clientLogos].map(
                (client: any, index: number) => (
                  <div
                    key={index}
                    className="w-[180px] h-[90px] flex items-center justify-center"
                  >
                    {client?.logo?.asset?.url && (
                      <Image
                        src={client.logo.asset.url}
                        alt={client.name || 'Client logo'}
                        width={180}
                        height={90}
                        className="max-w-[160px] max-h-[70px] object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition"
                      />
                    )}
                  </div>
                )
              )}
            </div>
          </div>

          <style>{`
            @keyframes scroll {
              from {
                transform: translateX(0);
              }
              to {
                transform: translateX(-50%);
              }
            }
          `}</style>
        </section>
      )}

      {/* RESULTS STRIP */}
      <section className="border-y border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-center">
          {homepage?.proofItems?.map((item: any, index: number) => (
            <div key={index}>
              <h3 className="text-3xl font-bold text-[#DFBA67]">
                {item.number}
              </h3>
              <p className="text-[#8A95A5]">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SYSTEM */}
      <section id="system" className="max-w-7xl mx-auto px-6 py-24">
        <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
          The Growth System
        </p>

        <h2 className="text-3xl md:text-5xl font-bold mb-12">
          We don’t run random campaigns. We build revenue systems.
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {homepage?.growthSteps?.map((step: any, index: number) => (
            <div
              key={index}
              className="bg-white/[0.06] border border-white/10 rounded-3xl p-6 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/10"
            >
              <span className="text-[#DFBA67] font-bold">
                0{index + 1}
              </span>

              <h3 className="text-2xl font-bold mt-4 mb-3">
                {step.title}
              </h3>

              <p className="text-[#8A95A5]">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT JOURNEY */}
      {homepage?.aboutTitle && (
        <section
          className="relative text-[#33314E] overflow-hidden"
          style={{
            backgroundImage: `url(${homepage?.aboutPattern?.asset?.url || ''})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-white/85" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-14 items-center">
            <div>
              {homepage?.aboutLogos?.length > 0 && (
                <div className="flex items-center gap-4 mb-8 flex-wrap">
                  {homepage.aboutLogos.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl border border-black/10 w-[150px] h-[70px] shadow-sm flex items-center justify-center"
                    >
                      {item?.logo?.asset?.url && (
                        <Image
                          src={item.logo.asset.url}
                          alt={item.name || 'Partner logo'}
                          width={150}
                          height={70}
                          className="max-h-12 max-w-[120px] object-contain"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
                {homepage.aboutEyebrow}
              </p>

              <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                {homepage.aboutTitle}
              </h2>

              <p className="text-lg text-[#6B7280] leading-relaxed mb-8">
                {homepage.aboutText}
              </p>

              {homepage?.aboutButtonText && (
                <a
                  href={homepage.aboutButtonLink || '#'}
                  className="inline-block bg-[#33314E] text-white px-8 py-4 rounded-xl font-bold hover:scale-[1.03] transition-all duration-300 shadow-xl shadow-black/10"
                >
                  {homepage.aboutButtonText}
                </a>
              )}
            </div>

            {homepage?.aboutImage?.asset?.url && (
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/20 border border-black/5">
                <Image
                  src={homepage.aboutImage.asset.url}
                  alt={homepage.aboutTitle || 'About M&M Marketing'}
                  width={900}
                  height={700}
                  className="w-full h-[520px] object-cover"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* SERVICES */}
      <section id="services" className="max-w-7xl mx-auto px-6 py-24">
        <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
          Our Services
        </p>

        <h2 className="text-3xl md:text-5xl font-bold mb-12">
          Services built to generate revenue.
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data?.services?.map((service: any, index: number) => (
            <a
              key={index}
              href={`/services/${service.slug?.current}`}
              className="group relative block overflow-hidden rounded-3xl border border-white/10 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/20"
            >
              {service?.image?.asset?.url && (
                <Image
                  src={service.image.asset.url}
                  alt={service.title || 'M&M Marketing service'}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition duration-700"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              <div className="relative z-10 p-6 h-[260px] flex flex-col items-center justify-center text-center">
                <h3 className="text-2xl font-bold mb-3 text-white">
                  {service.title}
                </h3>

                <p className="text-white/70 text-sm leading-relaxed max-w-[90%]">
                  {service.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* CASE STUDIES */}
      <section id="case-studies" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
              Proven Results
            </p>

            <h2 className="text-3xl md:text-5xl font-bold max-w-3xl">
              Real businesses. Real measurable growth.
            </h2>
          </div>

          <a
            href="/case-studies"
            className="text-[#DFBA67] font-bold hover:opacity-80 transition"
          >
            View all case studies →
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {data?.caseStudies?.map((caseStudy: any, index: number) => (
            <a
              key={index}
              href={`/case-studies/${caseStudy.slug?.current}`}
              className="group overflow-hidden rounded-3xl bg-white/[0.06] border border-white/10 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/10"
            >
              <div className="h-[240px] bg-white/10 overflow-hidden">
                {caseStudy?.image?.asset?.url && (
                  <Image
                    src={caseStudy.image.asset.url}
                    alt={caseStudy.title || 'Case study'}
                    width={700}
                    height={420}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  />
                )}
              </div>

              <div className="p-7">
                <p className="text-[#DFBA67] uppercase tracking-widest text-xs mb-3">
                  {caseStudy.category || 'Case Study'}
                </p>

                <h3 className="text-2xl font-bold mb-4">
                  {caseStudy.title}
                </h3>

                <p className="text-[#8A95A5] leading-relaxed mb-5">
                  {caseStudy.description || caseStudy.results}
                </p>

                <span className="text-[#DFBA67] font-bold">
                  View Case Study →
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* MISSION */}
      <section id="mission" className="bg-white/5 border-y border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
            Our Mission
          </p>

          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {homepage?.missionTitle}
          </h2>

          <p className="text-lg text-[#8A95A5] leading-relaxed">
            {homepage?.missionText}
          </p>
        </div>
      </section>

      {/* OUR WORK */}
      <section id="our-work" className="bg-white text-[#33314E]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="mb-12">
            <p className="text-[#DFBA67] uppercase tracking-widest mb-4">
              Selected Work
            </p>

            <h2 className="text-3xl md:text-5xl font-bold max-w-3xl">
              Work that turns attention into measurable growth.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {data?.works?.map((work: any, index: number) => (
              <a
                key={index}
                href={`/work/${work.slug?.current}`}
                className="group rounded-3xl overflow-hidden bg-[#F6F6F8] border border-black/5 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-black/5"
              >
                <div className="h-[340px] overflow-hidden bg-[#EDEDF0]">
                  {work?.image?.asset?.url ? (
                    <Image
                      src={work.image.asset.url}
                      alt={work.title || 'M&M Marketing work'}
                      width={900}
                      height={560}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#33314E]/40 text-xl font-bold">
                      No Image
                    </div>
                  )}
                </div>

                <div className="p-8">
                  <p className="text-sm uppercase tracking-widest text-[#DFBA67] mb-3">
                    {work.category}
                  </p>

                  <h3 className="text-3xl font-bold mb-3">
                    {work.title}
                  </h3>

                  <p className="text-[#6B7280] leading-relaxed">
                    {work.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          {homepage?.finalCtaTitle}
        </h2>

        <p className="text-[#8A95A5] mb-8 text-lg">
          {homepage?.finalCtaText}
        </p>

        <a
          href={homepage?.buttonLink || '/get-strategy'}
          className="inline-block bg-[#DFBA67] text-[#33314E] px-10 py-4 rounded-full font-bold hover:scale-[1.03] transition-all duration-300 shadow-lg shadow-[#DFBA67]/20"
        >
          {homepage?.buttonText || 'Get Your AI Growth Strategy'}
        </a>
      </section>

      {/* LATEST BLOGS */}
      {data?.posts?.length > 0 && (
        <section className="bg-white text-[#33314E]">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="text-center mb-14">
              <p className="inline-block bg-[#F6F6F8] text-[#33314E] px-5 py-2 rounded-full text-sm font-bold mb-6 shadow-sm">
                Daily News
              </p>

              <h2 className="text-3xl md:text-5xl font-bold mb-5">
                Read from our blog
              </h2>

              <p className="text-[#6B7280] text-lg max-w-2xl mx-auto mb-6">
                Insights on websites, SEO, social media, AI-driven growth, and revenue systems.
              </p>

              <a
                href="/blog"
                className="text-[#33314E] font-bold hover:text-[#DFBA67] transition"
              >
                Read more from the blog ›
              </a>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {data.posts.map((post: any, index: number) => (
                <a
                  key={index}
                  href={`/blog/${post.slug?.current}`}
                  className="group overflow-hidden rounded-3xl bg-white border border-black/5 shadow-xl shadow-black/10 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="h-[260px] overflow-hidden bg-[#F6F6F8]">
                    {post?.image?.asset?.url && (
                      <Image
                        src={post.image.asset.url}
                        alt={post.title || 'Blog article'}
                        width={700}
                        height={460}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                      />
                    )}
                  </div>

                  <div className="p-7">
                    <p className="inline-block bg-[#F0EEF8] text-[#33314E] px-3 py-1 rounded-md text-xs font-bold mb-5">
                      {post.category || 'Articles'}
                    </p>

                    <h3 className="text-2xl md:text-3xl font-bold leading-tight mb-4">
                      {post.title}
                    </h3>

                    <p className="text-[#6B7280] leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </PageLayout>
  )
}