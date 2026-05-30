// Header Component (CMS Navigation + Mega Menu + Mobile CSS Menu + Locale Switcher)

import Link from 'next/link'
import { client } from '@/lib/sanity'
import SocialIcons from '@/app/components/SocialIcons'
import LocaleSwitcher from '@/app/components/LocaleSwitcher'
import { localize, localizePath } from '@/lib/locale'
import { getLocale } from '@/lib/locale-server'

type LocaleField = { en?: string; ar?: string } | string | null | undefined

type MegaItem = { title?: LocaleField; description?: LocaleField; link?: string }
type NavItem = {
  label?: LocaleField
  link?: string
  hasMegaMenu?: boolean
  megaHeadline?: LocaleField
  megaItems?: MegaItem[]
}

export default async function Header() {
  const locale = await getLocale()

  const nav = await client.fetch(`
    *[_type == "navigation"][0]{
      brandName,
      logo{
        asset->{url}
      },
      promoBanner{
        enabled,
        text,
        link
      },
      items[]{
        label,
        link,
        hasMegaMenu,
        megaHeadline,
        megaItems[]{
          title,
          description,
          link
        }
      },
      ctaText,
      ctaLink,
      socials{
        instagram,
        facebook,
        x,
        youtube
      }
    }
  `)

  const brand = nav?.brandName || 'M&M Marketing'
  const promo = nav?.promoBanner
  const promoText = localize(promo?.text, locale)
  const ctaText = localize(nav?.ctaText, locale) || 'Get Strategy'
  const ctaLink = nav?.ctaLink ? localizePath(nav.ctaLink, locale) : localizePath('/get-strategy', locale)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#33314E]/90 backdrop-blur border-b border-white/10">
      <input id="mobile-menu-toggle" type="checkbox" className="peer hidden" />

      <div className="relative max-w-7xl mx-auto px-6 py-4 lg:pt-12 lg:pb-3 flex items-center justify-between">
        <Link href={localizePath('/', locale)} className="flex items-center">
          {nav?.logo?.asset?.url ? (
            <img
              src={nav.logo.asset.url}
              alt={brand}
              className="h-12 md:h-16 w-auto"
            />
          ) : (
            <span className="text-xl font-bold text-[#DFBA67]">
              {brand}
            </span>
          )}
        </Link>

        {promo?.enabled && promoText && (
          <a
            href={promo.link ? localizePath(promo.link, locale) : '#'}
            className="hidden lg:inline-block absolute top-0 left-1/2 -translate-x-1/2 z-10 bg-[#e4be61] hover:bg-[#d4ae51] text-white text-sm font-medium px-6 py-2 transition-colors"
          >
            {promoText}
          </a>
        )}

        <nav className="hidden lg:flex items-center gap-8 text-sm text-white/80">
          {nav?.items?.map((item: NavItem, index: number) => {
            const label = localize(item.label, locale)
            const itemLink = item.link ? localizePath(item.link, locale) : '#'
            const megaHeadline = localize(item.megaHeadline, locale)

            return (
              <div key={index} className="relative group">
                {item?.hasMegaMenu ? (
                  <>
                    <button className="hover:text-[#DFBA67] transition flex items-center gap-1">
                      {label}
                      <span className="text-xs">▾</span>
                    </button>

                    <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 absolute left-0 top-full pt-6">
                      <div className="w-[min(820px,calc(100vw-3rem))] rounded-3xl bg-white text-[#33314E] border border-black/5 shadow-2xl shadow-black/30 p-8">
                        <div className="mb-5">
                          <p className="text-[#DFBA67] uppercase tracking-widest text-xs font-bold mb-2">
                            {label}
                          </p>
                          {megaHeadline && (
                            <h3 className="text-3xl font-bold leading-tight">
                              {megaHeadline}
                            </h3>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {item?.megaItems?.map((mega: MegaItem, megaIndex: number) => (
                            <a
                              key={megaIndex}
                              href={mega.link ? localizePath(mega.link, locale) : '#'}
                              className="block rounded-2xl p-4 hover:bg-[#F6F6F8] hover:scale-[1.02] transition-all duration-300"
                            >
                              <h4 className="font-bold text-lg mb-2">
                                {localize(mega.title, locale)}
                              </h4>

                              <p className="text-sm text-[#6B7280] leading-relaxed">
                                {localize(mega.description, locale)}
                              </p>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <a href={itemLink} className="hover:text-[#DFBA67] transition">
                    {label}
                  </a>
                )}
              </div>
            )
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-5">
          <LocaleSwitcher currentLocale={locale} />
          <SocialIcons socials={nav?.socials} iconClassName="w-4 h-4" />

          <a
            href={ctaLink}
            className="bg-[#DFBA67] text-[#33314E] px-5 py-3 rounded-full font-bold text-sm hover:scale-[1.03] transition-all duration-300 shadow-lg shadow-[#DFBA67]/20"
          >
            {ctaText}
          </a>
        </div>

        <label
          htmlFor="mobile-menu-toggle"
          className="lg:hidden text-white text-3xl cursor-pointer"
        >
          ☰
        </label>
      </div>

      <div className="hidden peer-checked:block lg:hidden bg-[#33314E] border-t border-white/10 px-6 pb-6">
        <div className="flex flex-col gap-5 pt-5">
          {nav?.items?.map((item: NavItem, index: number) => {
            const label = localize(item.label, locale)
            const itemLink = item.link ? localizePath(item.link, locale) : '#'

            return (
              <div key={index}>
                {item?.hasMegaMenu ? (
                  <div>
                    <p className="text-[#DFBA67] font-bold mb-3">
                      {label}
                    </p>

                    <div className="flex flex-col gap-3 pl-4">
                      {item?.megaItems?.map((mega: MegaItem, megaIndex: number) => (
                        <a
                          key={megaIndex}
                          href={mega.link ? localizePath(mega.link, locale) : '#'}
                          className="text-white/80 text-sm"
                        >
                          {localize(mega.title, locale)}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <a href={itemLink} className="text-white/90">
                    {label}
                  </a>
                )}
              </div>
            )
          })}

          <LocaleSwitcher currentLocale={locale} labelClassName="text-white/90 font-medium" />

          <a
            href={ctaLink}
            className="bg-[#DFBA67] text-[#33314E] px-5 py-3 rounded-full font-bold text-center"
          >
            {ctaText}
          </a>
        </div>
      </div>
    </header>
  )
}
