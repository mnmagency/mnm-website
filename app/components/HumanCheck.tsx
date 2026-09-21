'use client'

import { useEffect, useState } from 'react'

/**
 * "Calculator" anti-spam check shared by all site forms.
 *
 * Renders e.g. "3 + 6 = ?" — the visitor types 9. The two numbers travel
 * with the submission as hidden fields so the API can re-verify the sum
 * server-side (bots that POST straight to the API fail it), and a hidden
 * "website" honeypot field catches bots that auto-fill every input.
 *
 * The challenge is issued and HMAC-signed by /api/human-challenge so bots
 * cannot substitute their own numbers; it is fetched after mount so server
 * and client HTML always match.
 */
export default function HumanCheck({
  className = '',
  label = 'Spam check',
}: {
  className?: string
  label?: string
}) {
  const [ch, setCh] = useState<{ a: number; b: number; iat: number; sig: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/human-challenge')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.a === 'number') setCh(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      {/* Honeypot — visually hidden; humans never fill it, bots do. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
      />
      <input type="hidden" name="humanA" value={ch?.a ?? ''} readOnly />
      <input type="hidden" name="humanB" value={ch?.b ?? ''} readOnly />
      <input type="hidden" name="humanIat" value={ch?.iat ?? ''} readOnly />
      <input type="hidden" name="humanSig" value={ch?.sig ?? ''} readOnly />
      <input
        name="humanCheck"
        type="text"
        inputMode="numeric"
        required
        aria-label={label}
        placeholder={ch ? `${ch.a} + ${ch.b} = ?` : '… + … = ?'}
        className={className}
      />
    </>
  )
}

/** Client-side pre-check so visitors get a friendly error before the API call. */
export function humanCheckPasses(formData: FormData): boolean {
  return (
    Number(formData.get('humanA')) + Number(formData.get('humanB')) ===
    Number(formData.get('humanCheck'))
  )
}
