/**
 * Locale helpers — pure utilities. Safe to import from both server and client
 * components.
 *
 * The server-only `getLocale()` / `getPathname()` helpers live in
 * `lib/locale-server.ts` so they don't drag `next/headers` into the client
 * bundle.
 */

export type Locale = 'en' | 'ar'

export const LOCALES: Locale[] = ['en', 'ar']
export const DEFAULT_LOCALE: Locale = 'en'

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
}

/** Direction for the current locale (used on <html dir>). */
export function dir(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr'
}

/** ISO lang code for <html lang>. */
export function htmlLang(locale: Locale): string {
  return locale === 'ar' ? 'ar' : 'en'
}

type LocaleField = { en?: string; ar?: string } | string | null | undefined

/**
 * Resolve a localized field to a string for the active locale.
 *
 *   localize({en: 'Hello', ar: 'مرحبا'}, 'ar') → 'مرحبا'
 *   localize({en: 'Hello', ar: ''},       'ar') → 'Hello' (fallback)
 *   localize('Hello',                      'ar') → 'Hello' (legacy string)
 *   localize(undefined,                    'ar') → ''
 */
export function localize(field: LocaleField, locale: Locale): string {
  if (field == null) return ''
  if (typeof field === 'string') return field
  if (typeof field !== 'object') return ''

  const active = field[locale]
  if (typeof active === 'string' && active.trim().length > 0) return active

  const fallback = field.en ?? field.ar
  return typeof fallback === 'string' ? fallback : ''
}

/** Build a URL path with the correct locale prefix. */
export function localizePath(path: string, locale: Locale): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  if (locale === 'en') return cleanPath
  if (cleanPath === '/') return '/ar'
  return `/ar${cleanPath}`
}

/** Strip the /ar prefix from a path if present. */
export function stripLocale(path: string): string {
  if (path === '/ar') return '/'
  if (path.startsWith('/ar/')) return path.slice(3)
  return path
}
