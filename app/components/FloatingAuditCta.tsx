/**
 * Elegant floating vertical CTA — pinned to the right edge of the viewport.
 *
 * Replaces the old "Audit Your Website's SEO Now!" horizontal banner that
 * used to sit above the header. Same Sanity field (`navigation.promoBanner`)
 * controls the text + link, so editors update it in one place.
 *
 * Visual:
 *   ┌──┐
 *   │ A│
 *   │ U│   ← writes top-to-bottom on the right edge
 *   │ D│
 *   │ I│
 *   │ T│
 *   └──┘
 */

import { client } from '@/lib/sanity'
import { localize, localizePath } from '@/lib/locale'
import { getLocale } from '@/lib/locale-server'

type LocaleField = { en?: string; ar?: string } | string | null | undefined

type PromoBanner = {
  enabled?: boolean
  text?: LocaleField
  link?: string
} | null

export default async function FloatingAuditCta() {
  const locale = await getLocale()
  const promo = await client.fetch<PromoBanner>(`
    *[_type == "navigation"][0].promoBanner
  `)

  if (!promo?.enabled) return null

  const text = localize(promo.text, locale) || (locale === 'ar' ? 'تدقيق SEO مجاني' : 'Audit your SEO for Free')
  const href = promo.link ? localizePath(promo.link, locale) : localizePath('/seo-audit', locale)

  // In Arabic the page is RTL — anchor the floater on the LEFT edge so it
  // appears on the same "outside-of-content" side as the English version.
  const isRtl = locale === 'ar'

  return (
    <a
      href={href}
      aria-label={text}
      className={`
        group fixed top-1/2 -translate-y-1/2 z-40 hidden md:flex
        ${isRtl ? 'left-0 rounded-r-2xl' : 'right-0 rounded-l-2xl'}
        items-center justify-center gap-2
        bg-gradient-to-b from-[#DFBA67] to-[#C9A256] text-[#0E1635]
        font-bold text-xs uppercase tracking-[0.25em]
        py-7 px-3
        shadow-2xl shadow-black/40
        hover:from-[#E5C375] hover:to-[#D4AC60]
        transition-all duration-300
        ${isRtl ? 'hover:translate-x-1' : 'hover:-translate-x-1'}
      `}
    >
      <span
        style={{
          writingMode: 'vertical-rl',
          transform: isRtl ? 'rotate(180deg)' : 'none',
        }}
      >
        {text}
      </span>
    </a>
  )
}
