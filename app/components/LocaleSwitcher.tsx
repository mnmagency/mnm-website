'use client'

import { usePathname } from 'next/navigation'
import { LOCALE_LABELS, type Locale } from '@/lib/locale'

type Props = {
  /**
   * The locale currently rendered on this page (resolved on the server from
   * the middleware-injected x-locale header). Passing this in is the only
   * reliable way to know which locale is active — `usePathname()` on its own
   * can lie when middleware rewrites are in play.
   */
  currentLocale: Locale
  className?: string
  labelClassName?: string
}

function buildAlternateHref(currentLocale: Locale, rawPath: string): string {
  // Strip any /ar prefix so we work with the canonical English path, then
  // re-add the prefix only for Arabic.
  const stripped = rawPath === '/ar' || rawPath === '/ar/'
    ? '/'
    : rawPath.startsWith('/ar/')
      ? rawPath.slice(3)
      : rawPath

  const target: Locale = currentLocale === 'ar' ? 'en' : 'ar'
  if (target === 'en') return stripped
  return stripped === '/' ? '/ar' : `/ar${stripped}`
}

export default function LocaleSwitcher({
  currentLocale,
  className = '',
  labelClassName = '',
}: Props) {
  const pathname = usePathname() || '/'
  const targetLocale: Locale = currentLocale === 'ar' ? 'en' : 'ar'
  const href = buildAlternateHref(currentLocale, pathname)

  // Plain <a> (not next/link) so the browser does a full page load. That
  // forces middleware to re-run and the server to re-render with the new
  // locale — soft nav reuses cached RSC payloads keyed on the underlying
  // (rewritten) path and serves the old language.
  return (
    <a
      href={href}
      aria-label={`Switch to ${LOCALE_LABELS[targetLocale]}`}
      className={`flex items-center gap-2 text-white/80 hover:text-[#DFBA67] transition ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="w-5 h-5"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>

      <span className={`text-sm font-medium ${labelClassName}`}>
        {LOCALE_LABELS[targetLocale]}
      </span>
    </a>
  )
}
