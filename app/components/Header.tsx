// Header Component (CMS Navigation + Mega Menu + Mobile CSS Menu)

import { client } from '@/lib/sanity'

export default async function Header() {
  const nav = await client.fetch(`
    *[_type == "navigation"][0]{
      logo{
        asset->{url}
      },
      items[]{
        label,
        link,
        hasMegaMenu,
        megaItems[]{
          title,
          description,
          link
        }
      },
      ctaText,
      ctaLink
    }
  `)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#33314E]/90 backdrop-blur border-b border-white/10">
      <input id="mobile-menu-toggle" type="checkbox" className="peer hidden" />

      <div className="relative max-w-7xl mx-auto px-6 py-6 lg:pt-14 flex items-center justify-between">
        <a href="/" className="flex items-center">
          {nav?.logo?.asset?.url ? (
            <img
              src={nav.logo.asset.url}
              alt="M&M Marketing"
              className="h-12 md:h-16 w-auto"
            />
          ) : (
            <span className="text-xl font-bold text-[#DFBA67]">
              M&M Marketing
            </span>
          )}
        </a>

        <a
          href="/seo-audit"
          className="hidden lg:inline-block absolute top-0 left-1/2 -translate-x-1/2 z-10 bg-[#e4be61] hover:bg-[#d4ae51] text-white text-sm font-medium px-6 py-2 transition-colors"
        >
          Audit Your Website&apos;s SEO Now!
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
          {nav?.items?.map((item: any, index: number) => (
            <div key={index} className="relative group">
              {item?.hasMegaMenu ? (
                <>
                  <button className="hover:text-[#DFBA67] transition flex items-center gap-1">
                    {item.label}
                    <span className="text-xs">▾</span>
                  </button>

                  <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 absolute left-1/2 -translate-x-1/2 top-full pt-6">
                    <div className="w-[820px] rounded-3xl bg-white text-[#33314E] border border-black/5 shadow-2xl shadow-black/30 p-8">
                      <div className="mb-5">
                        <p className="text-[#DFBA67] uppercase tracking-widest text-xs font-bold mb-2">
                          {item.label}
                        </p>
                        <h3 className="text-3xl font-bold leading-tight">
                          Growth systems built to generate revenue
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {item?.megaItems?.map((mega: any, megaIndex: number) => (
                          <a
                            key={megaIndex}
                            href={mega.link}
                            className="block rounded-2xl p-4 hover:bg-[#F6F6F8] hover:scale-[1.02] transition-all duration-300"
                          >
                            <h4 className="font-bold text-lg mb-2">
                              {mega.title}
                            </h4>

                            <p className="text-sm text-[#6B7280] leading-relaxed">
                              {mega.description}
                            </p>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <a href={item.link} className="hover:text-[#DFBA67] transition">
                  {item.label}
                </a>
              )}
            </div>
          ))}
        </nav>

        <a
          href={nav?.ctaLink || '/get-strategy'}
          className="hidden md:inline-block bg-[#DFBA67] text-[#33314E] px-5 py-3 rounded-full font-bold text-sm hover:scale-[1.03] transition-all duration-300 shadow-lg shadow-[#DFBA67]/20"
        >
          {nav?.ctaText || 'Get Strategy'}
        </a>

        <label
          htmlFor="mobile-menu-toggle"
          className="md:hidden text-white text-3xl cursor-pointer"
        >
          ☰
        </label>
      </div>

      <div className="hidden peer-checked:block md:hidden bg-[#33314E] border-t border-white/10 px-6 pb-6">
        <div className="flex flex-col gap-5 pt-5">
          {nav?.items?.map((item: any, index: number) => (
            <div key={index}>
              {item?.hasMegaMenu ? (
                <div>
                  <p className="text-[#DFBA67] font-bold mb-3">
                    {item.label}
                  </p>

                  <div className="flex flex-col gap-3 pl-4">
                    {item?.megaItems?.map((mega: any, megaIndex: number) => (
                      <a
                        key={megaIndex}
                        href={mega.link}
                        className="text-white/80 text-sm"
                      >
                        {mega.title}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <a href={item.link} className="text-white/90">
                  {item.label}
                </a>
              )}
            </div>
          ))}

          <a
            href={nav?.ctaLink || '/get-strategy'}
            className="bg-[#DFBA67] text-[#33314E] px-5 py-3 rounded-full font-bold text-center"
          >
            {nav?.ctaText || 'Get Strategy'}
          </a>
        </div>
      </div>
    </header>
  )
}