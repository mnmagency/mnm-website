import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { client } from '@/lib/sanity'
import {
  escapeHtml,
  getClientIp,
  isHoneypotTripped,
  isValidEmail,
  verifyHumanChallenge,
  rateLimit,
  sanitizeString,
} from '@/lib/security'

// Created per request, not at import time. Resend throws on a missing key, and
// the build imports this module to collect page data, so a top-level client
// breaks any build (e.g. Vercel Preview) that has no RESEND_API_KEY.
const getResend = () => new Resend(process.env.RESEND_API_KEY)

// Recipient is sourced from Sanity (contactPage.recipientEmail) at request
// time, with env var fallback. From-address stays env-driven since it must
// match a Resend-verified sender.
const FALLBACK_RECIPIENT =
  process.env.CONTACT_RECIPIENT_EMAIL || 'info@mnmagency.com'
const FROM_ADDRESS =
  process.env.CONTACT_FROM_ADDRESS || 'M&M Marketing <noreply@mnmagency.com>'

async function resolveRecipient(): Promise<string> {
  try {
    const cms = await client.fetch<{ recipientEmail?: string } | null>(
      `*[_type == "contactPage"][0]{ recipientEmail }`
    )
    const candidate = cms?.recipientEmail?.trim()
    if (candidate && isValidEmail(candidate)) return candidate
  } catch {
    // Fall through to env fallback if Sanity is unreachable.
  }
  return FALLBACK_RECIPIENT
}

const MAX_BODY_BYTES = 16 * 1024 // 16 KB is plenty for a contact form

export async function POST(req: Request) {
  // 1. Size guard
  const contentLength = Number(req.headers.get('content-length') || 0)
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { success: false, error: 'Payload too large' },
      { status: 413 }
    )
  }

  // 2. Rate limit by IP
  const ip = getClientIp(req)
  const rl = rateLimit(ip)
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 60) } }
    )
  }

  // 3. Parse JSON safely
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON' },
      { status: 400 }
    )
  }
  if (!raw || typeof raw !== 'object') {
    return NextResponse.json(
      { success: false, error: 'Invalid payload' },
      { status: 400 }
    )
  }

  // 4. Validate + sanitize fields
  const body = raw as Record<string, unknown>

  // 4b. Anti-spam: honeypot + calculator check (see lib/security.ts)
  if (isHoneypotTripped(body)) {
    // Pretend success so bots don't learn they were caught.
    return NextResponse.json({ success: true })
  }
  if (!verifyHumanChallenge(body)) {
    return NextResponse.json(
      { success: false, error: 'Spam check failed. Please answer the question correctly.' },
      { status: 400 }
    )
  }
  const name = sanitizeString(body.name, 120)
  const email = sanitizeString(body.email, 254)
  const phone = sanitizeString(body.phone, 40)
  const company = sanitizeString(body.company, 200)
  const service = sanitizeString(body.service, 120)
  const message = sanitizeString(body.message, 5000)

  if (!name) {
    return NextResponse.json(
      { success: false, error: 'Name is required' },
      { status: 400 }
    )
  }
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { success: false, error: 'A valid email is required' },
      { status: 400 }
    )
  }
  if (!message) {
    return NextResponse.json(
      { success: false, error: 'Message is required' },
      { status: 400 }
    )
  }

  // 5. Send — every interpolated value is HTML-escaped to neutralise injection
  const recipient = await resolveRecipient()
  try {
    await getResend().emails.send({
      from: FROM_ADDRESS,
      to: [recipient],
      replyTo: email,
      subject: 'New Contact Form Submission',
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Company:</strong> ${escapeHtml(company)}</p>
        <p><strong>Service:</strong> ${escapeHtml(service)}</p>
        <p><strong>Message:</strong> ${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact form send failed:', err)
    return NextResponse.json(
      { success: false, error: 'Unable to send message. Please try again later.' },
      { status: 500 }
    )
  }
}
