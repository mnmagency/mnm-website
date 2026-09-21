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

import { createHash, createHmac, timingSafeEqual } from 'crypto'

/**
 * "Calculator" human check, server-issued and signed.
 *
 * /api/human-challenge hands the browser two numbers plus an HMAC signature
 * over (a, b, issued-at). The form must send them back untouched together
 * with the visitor's answer. That closes both bot paths:
 *  - a bot can't invent its own easy numbers (signature won't match), and
 *  - a bot that fetches a real challenge and answers instantly is caught by
 *    the minimum-age gate (no human submits a form 4s after it loads).
 *
 * Secret: HUMAN_CHECK_SECRET env var if set; otherwise derived by hashing the
 * Resend key so it is stable across restarts without extra configuration
 * (the key itself is never exposed — only a one-way hash of it is used).
 */
const CHALLENGE_SECRET =
  process.env.HUMAN_CHECK_SECRET ||
  createHash('sha256')
    .update('mnm-human-challenge:' + (process.env.RESEND_API_KEY || 'static-fallback'))
    .digest('hex')

const CHALLENGE_MIN_AGE_MS = 4_000 // faster than any human fills a form
const CHALLENGE_MAX_AGE_MS = 30 * 60_000 // stale after 30 minutes

function signChallenge(a: number, b: number, iat: number): string {
  return createHmac('sha256', CHALLENGE_SECRET)
    .update(`${a}.${b}.${iat}`)
    .digest('hex')
}

export function issueHumanChallenge(): { a: number; b: number; iat: number; sig: string } {
  const a = 2 + Math.floor(Math.random() * 8)
  const b = 2 + Math.floor(Math.random() * 8)
  const iat = Date.now()
  return { a, b, iat, sig: signChallenge(a, b, iat) }
}

export function verifyHumanChallenge(body: Record<string, unknown>): boolean {
  const a = Number(body.humanA)
  const b = Number(body.humanB)
  const iat = Number(body.humanIat)
  const answer = Number(body.humanCheck)
  const sig = typeof body.humanSig === 'string' ? body.humanSig : ''

  if (!Number.isInteger(a) || !Number.isInteger(b) || !Number.isInteger(answer)) return false
  if (!Number.isFinite(iat) || !sig) return false
  if (a < 1 || a > 20 || b < 1 || b > 20) return false

  const expected = signChallenge(a, b, iat)
  const sigBuf = Buffer.from(sig)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return false

  const age = Date.now() - iat
  if (age < CHALLENGE_MIN_AGE_MS || age > CHALLENGE_MAX_AGE_MS) return false

  return a + b === answer
}

/** Hidden "website" honeypot field: humans never see it, bots auto-fill it. */
export function isHoneypotTripped(body: Record<string, unknown>): boolean {
  return typeof body.website === 'string' && body.website.trim() !== ''
}
