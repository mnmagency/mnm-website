import { createClient, type QueryParams } from 'next-sanity'

/**
 * Sanity read client for the website.
 *
 * Two layers keep us far below Sanity's API quota (250k uncached requests /
 * month) and make pages faster:
 *
 *  1. useCdn: true — reads go to Sanity's API CDN (separate 1M/month quota,
 *     edge-cached, invalidated automatically when content is published).
 *  2. Next.js Data Cache — every query result is cached for 60 seconds, so a
 *     burst of visitors or crawlers triggers at most one Sanity request per
 *     unique query per minute instead of ~10 per page view. Edits in Studio
 *     still appear on the site within about a minute.
 *
 * Pass `{ next: { revalidate: n } }` as the third argument to override.
 */
const base = createClient({
  projectId: 'q7p7mofd',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

type FetchOptions = { next?: { revalidate?: number | false; tags?: string[] } }

export const client = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- callers pass their own result type
  fetch<T = any>(query: string, params: QueryParams = {}, options: FetchOptions = {}): Promise<T> {
    return base.fetch<T>(query, params, { next: { revalidate: 60, ...options.next } })
  },
}
