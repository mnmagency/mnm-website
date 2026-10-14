import 'server-only'
import { getLocale } from './locale-server'

export const SITE_URL = 'https://mnmagency.com'

/** Absolute URL for a locale. `path` is the English path, e.g. '/services/seo'. */
export function localeUrl(path: string, locale: 'en' | 'ar'): string {
  if (locale === 'en') return `${SITE_URL}${path}`
  return path === '/' ? `${SITE_URL}/ar` : `${SITE_URL}/ar${path}`
}

/**
 * Self-referencing canonical plus hreflang for the current page.
 *
 * Next shallow-merges metadata, so a page that sets `alternates` replaces the
 * whole object from the root layout. Every page therefore has to supply both
 * the canonical and the language alternates itself, which this does.
 *
 * The canonical always points at the page's own URL in the visitor's locale
 * (the /ar page canonicals to /ar, not to the English page). It deliberately
 * ignores any `seo.canonicalUrl` typed into Sanity, because those values were
 * hardcoded to the English URL and broke the Arabic pages.
 */
export async function pageAlternates(path: string) {
  const locale = await getLocale()
  const en = localeUrl(path, 'en')
  const ar = localeUrl(path, 'ar')
  return {
    canonical: locale === 'ar' ? ar : en,
    languages: { en, ar, 'x-default': en },
  }
}

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`

/**
 * Open Graph block for a page. Next shallow-merges metadata, so a page that
 * sets `openGraph` replaces the root one; this restores siteName, locale and
 * the page URL, and falls back to the default share image when the page has
 * none of its own.
 */
export async function pageOpenGraph(
  path: string,
  og: { title?: string; description?: string; images?: string[] } = {},
) {
  const locale = await getLocale()
  return {
    type: 'website' as const,
    siteName: 'M&M Marketing',
    locale: locale === 'ar' ? 'ar_QA' : 'en_US',
    alternateLocale: locale === 'ar' ? 'en_US' : 'ar_QA',
    ...og,
    url: localeUrl(path, locale),
    images: og.images && og.images.length ? og.images : [DEFAULT_OG_IMAGE],
  }
}

/** BreadcrumbList JSON-LD. `items` are English paths; names are already localized. */
export function breadcrumbLd(locale: 'en' | 'ar', items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: localeUrl(it.path, locale),
    })),
  }
}
