/**
 * Server-only locale helpers. These pull from request headers set by
 * `middleware.ts` and therefore can only be called from server components or
 * server actions. Client components should call `useLocale()` instead (or
 * derive the locale from `usePathname()`).
 */

import 'server-only'
import { headers } from 'next/headers'
import type { Locale } from './locale'

/** Read the current request's locale (set by middleware.ts). */
export async function getLocale(): Promise<Locale> {
  const h = await headers()
  const value = h.get('x-locale')
  return value === 'ar' ? 'ar' : 'en'
}

/** Read the original request pathname (before middleware rewrite). */
export async function getPathname(): Promise<string> {
  const h = await headers()
  return h.get('x-pathname') || '/'
}
