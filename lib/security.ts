/**
 * Lightweight security helpers for public API routes.
 *
 * Rate limiter is an in-memory map keyed by IP. This works on a single Vercel
 * function instance and resets on cold start — good enough as a first defence
 * against form spam, but if traffic grows or we deploy multi-region, move to
 * Vercel KV / Upstash Redis.
 */

const WINDOW_MS = 60_000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5

type Entry = { count: number; windowStart: number }
const buckets = new Map<string, Entry>()

export function rateLimit(ip: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now()
  const existing = buckets.get(ip)

  if (!existing || now - existing.windowStart >= WINDOW_MS) {
    buckets.set(ip, { count: 1, windowStart: now })
    return { ok: true }
  }

  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - existing.windowStart)) / 1000)
    return { ok: false, retryAfter }
  }

  existing.count += 1
  return { ok: true }
}

export function getClientIp(req: Request): string {
  // Vercel/most proxies set x-forwarded-for. First IP is the client.
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real
  return 'unknown'
}

/** HTML-escape user-supplied strings before interpolating into email HTML. */
export function escapeHtml(value: unknown): string {
  if (value == null) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Trim and bound a string. Returns '' if not a string or empty after trim. */
export function sanitizeString(value: unknown, maxLen = 1000): string {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (trimmed.length === 0) return ''
  return trimmed.slice(0, maxLen)
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  if (!value || value.length > 254) return false
  return EMAIL_RE.test(value)
}

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }
