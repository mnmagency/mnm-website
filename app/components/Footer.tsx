import { client } from '@/lib/sanity'
import SocialIcons from '@/app/components/SocialIcons'
import { localize, localizePath } from '@/lib/locale'
import { getLocale } from '@/lib/locale-server'

type LocaleField = { en?: string; ar?: string } | string | null | undefined

type FooterLink = { label?: LocaleField; link?: string }
type FooterColumn = { columnTitle?: LocaleField; links?: FooterLink[] }

export default async function Footer() {
  const locale = await getLocale()

  const nav = await client.fetch(`
    *[_type == "navigation"][0]{
      brandName,
      logo{
        asset->{url}
      },
      copyright,
      contactColumnTitle,
      footerColumns[]{
        columnTitle,
        links[]{
          label,
          link
        }
      },
      items[]{
        label,
        link
      },
      ctaText,
      ctaLink,
      footerDescription,
      address,
      phone,
      email,
      socials{
        instagram,
        facebook,
        x,
        youtube
      }
    }
  `)

  const brand = nav?.brandName || 'M&M Marketing'
  const contactColumnTitle = localize(nav?.contactColumnTitle, locale) || 'Contact'
  const year = new Date().getFullYear()
  const copyrightTemplate = localize(nav?.copyright, locale) || `© {year} ${brand}. All rights reserved.`
  const copyright = copyrightTemplate.replace('{year}', String(year))
  const ctaText = localize(nav?.ctaText, locale) || 'Get Strategy'
  const ctaLink = nav?.ctaLink ? localizePath(nav.ctaLink, locale) : localizePath('/get-strategy', locale)
  const footerDescription = localize(nav?.footerDescription, locale)
  const address = localize(nav?.address, locale)

  const footerColumns: FooterColumn[] = nav?.footerColumns?.length
    ? nav.footerColumns
    : [
        {
          columnTitle: { en: 'Navigation', ar: 'القائمة' },
          links: nav?.items || [],
        },
      ]

  return (
    <footer className="bg-[#25243A] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-4 gap-10">

          {/* BRAND */}
          <div className="lg:col-span-2">
            {nav?.logo?.asset?.url ? (
              <img
                src={nav.logo.asset.url}
                alt={brand}
                className="h-14 w-auto mb-6"
              />
            ) : (
              <h3 className="text-[#DFBA67] text-2xl font-bold mb-4">
                {brand}
              </h3>
            )}

            {footerDescription && (
              <p className="text-white/60 max-w-md leading-relaxed text-sm">
                {footerDescription}
              </p>
            )}

            <div className="mt-6 flex gap-4">
              {nav?.phone && (
                <a href={`tel:${nav.phone}`} className="text-[#DFBA67] text-sm hover:opacity-80">
                  {locale === 'ar' ? 'اتصل' : 'Call'}
                </a>
              )}

              {nav?.email && (
                <a href={`mailto:${nav.email}`} className="text-[#DFBA67] text-sm hover:opacity-80">
                  {locale === 'ar' ? 'البريد' : 'Email'}
                </a>
              )}
            </div>
          </div>

          {/* CMS FOOTER COLUMNS */}
          <div className="lg:col-span-1">
            <div className="grid grid-cols-2 gap-10">
              {footerColumns.map((column: FooterColumn, index: number) => (
                <div key={index}>
                  <h4 className="text-[#DFBA67] font-bold mb-5">
                    {localize(column.columnTitle, locale)}
                  </h4>

                  <div className="flex flex-col gap-3 text-white/60">
                    {column?.links?.map((item: FooterLink, itemIndex: number) => (
                      <a
                        key={itemIndex}
                        href={item.link ? localizePath(item.link, locale) : '#'}
                        className="hover:text-[#DFBA67] transition"
                      >
                        {localize(item.label, locale)}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CONTACT ALWAYS VISIBLE */}
          <div>
            <h4 className="text-[#DFBA67] font-bold mb-5">
              {contactColumnTitle}
            </h4>

            <div className="flex flex-col gap-3 text-white/60">
              {address && <p>{address}</p>}

              {nav?.phone && (
                <a href={`tel:${nav.phone}`} className="hover:text-[#DFBA67] transition">
                  {nav.phone}
                </a>
              )}

              {nav?.email && (
                <a href={`mailto:${nav.email}`} className="hover:text-[#DFBA67] transition">
                  {nav.email}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-white/40 text-sm">
          <p>{copyright}</p>

          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <SocialIcons
              socials={nav?.socials}
              showLabel
              labelClassName="text-sm text-white/60"
            />

            <a
              href={ctaLink}
              className="text-[#DFBA67] font-bold"
            >
              {ctaText}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
