'use client'

/**
 * Exit-intent popup for landing pages. Desktop only (pointer leaves through
 * the top of the window), at most once per browser session, never before the
 * visitor has spent a few seconds on the page.
 */

import { useEffect, useState } from 'react'
import LpOfferButton from './LpOfferButton'

type Props = {
  storageKey: string
  title: string
  text?: string
  buttonText: string
  dismissText: string
  tag?: string
}

export default function ExitIntentOffer({ storageKey, title, text, buttonText, dismissText, tag }: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches) return
    const seen = () => {
      try {
        return sessionStorage.getItem(storageKey) === '1'
      } catch {
        return false
      }
    }
    if (seen()) return
    const armedAt = Date.now() + 8000
    const onLeave = (e: MouseEvent) => {
      if (e.clientY > 0 || e.relatedTarget || Date.now() < armedAt || seen()) return
      try {
        sessionStorage.setItem(storageKey, '1')
      } catch {
        /* storage blocked: still show once for this page view */
      }
      setOpen(true)
      document.removeEventListener('mouseout', onLeave)
    }
    document.addEventListener('mouseout', onLeave)
    return () => document.removeEventListener('mouseout', onLeave)
  }, [storageKey])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1635]/70 backdrop-blur-sm p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-offer-title"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white text-[#0E1635] p-8 md:p-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-4 end-4 w-9 h-9 rounded-full text-[#6B7280] hover:bg-[#F3F5F8]"
          aria-label={dismissText}
        >
          ✕
        </button>
        <h2 id="exit-offer-title" className="text-2xl md:text-3xl font-bold mb-3 pe-8">{title}</h2>
        {text && <p className="text-[#475569] leading-relaxed mb-7">{text}</p>}
        <div className="flex flex-col sm:flex-row gap-3">
          <LpOfferButton
            tag={tag}
            onClick={() => setOpen(false)}
            className="inline-flex justify-center items-center min-h-12 bg-[#0E1635] text-white px-7 rounded-full font-bold hover:bg-[#DFBA67] hover:text-[#0E1635] transition"
          >
            {buttonText}
          </LpOfferButton>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="min-h-12 px-5 rounded-full font-bold text-[#6B7280] hover:text-[#0E1635]"
          >
            {dismissText}
          </button>
        </div>
      </div>
    </div>
  )
}
