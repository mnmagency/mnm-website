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
 * Numbers are generated after mount so server and client HTML always match.
 */
export default function HumanCheck({
  className = '',
  label = 'Spam check',
}: {
  className?: string
  label?: string
}) {
  const [a, setA] = useState<number | null>(null)
  const [b, setB] = useState<number | null>(null)

  useEffect(() => {
    setA(2 + Math.floor(Math.random() * 8))
    setB(2 + Math.floor(Math.random() * 8))
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
      <input type="hidden" name="humanA" value={a ?? ''} readOnly />
      <input type="hidden" name="humanB" value={b ?? ''} readOnly />
      <input
        name="humanCheck"
        type="text"
        inputMode="numeric"
        required
        aria-label={label}
        placeholder={a !== null && b !== null ? `${a} + ${b} = ?` : '… + … = ?'}
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
