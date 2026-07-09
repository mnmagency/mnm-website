/**
 * FloatingWhatsAppCta — site-wide floating WhatsApp button that opens a
 * popup panel listing every service configured in Sanity. The visitor
 * picks the service they need, and WhatsApp opens with the matching
 * number + pre-filled message.
 *
 * All numbers, labels, and messages come from the navigation.whatsapp
 * object in Sanity, so marketing can edit routing without code changes.
 *
 * Behaviour:
 *   • Green WhatsApp circle bottom-right (official #25D366).
 *   • Click → popup panel appears above the button.
 *   • Panel lists every route from Sanity (label + arrow).
 *   • Click a route → opens wa.me/{number}?text={message} in a new tab.
 *   • Panel closes on outside-click, Escape, or the ✕ button.
 *   • If no routes are configured, the button opens the default number
 *     directly (no popup).
 */

'use client'

import { useEffect, useRef, useState } from 'react'

export type WhatsAppRoute = {
  label?: string
  number?: string
  message?: string
  matchPaths?: string[]
}

type Props = {
  enabled?: boolean
  defaultNumber?: string
  defaultMessage?: string
  routes?: WhatsAppRoute[]
  ariaLabel?: string
  /** Heading shown in the popup ("Chat with us on WhatsApp"). */
  panelTitle?: string
  /** Sub-heading shown under the title ("Which service can we help with?"). */
  panelSubtitle?: string
}

const sanitizeNumber = (raw?: string): string =>
  (raw || '').replace(/[^\d]/g, '')

const buildUrl = (number: string, message?: string) =>
  `https://wa.me/${sanitizeNumber(number)}` +
  (message ? `?text=${encodeURIComponent(message)}` : '')

// Small inline WhatsApp glyph, reused in the button and each route icon.
const WhatsAppGlyph = ({ className }: { className: string }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <path d="M16.02 2.667c-7.361 0-13.333 5.972-13.333 13.333 0 2.353.617 4.65 1.789 6.677l-1.893 6.923 7.083-1.859a13.28 13.28 0 0 0 6.354 1.62h.006c7.36 0 13.333-5.973 13.333-13.334 0-3.562-1.387-6.912-3.907-9.432a13.24 13.24 0 0 0-9.432-3.928Zm0 24.334h-.005a11.06 11.06 0 0 1-5.633-1.544l-.404-.24-4.198 1.101 1.12-4.093-.263-.42a11.036 11.036 0 0 1-1.692-5.904c0-6.113 4.973-11.087 11.087-11.087 2.96 0 5.742 1.154 7.834 3.247a11.008 11.008 0 0 1 3.247 7.84c0 6.113-4.972 11.1-11.093 11.1Zm6.084-8.311c-.334-.167-1.973-.973-2.278-1.084-.305-.11-.527-.167-.75.167s-.862 1.084-1.056 1.306c-.194.222-.389.25-.723.083-.334-.167-1.409-.52-2.685-1.657-.992-.884-1.662-1.977-1.856-2.311-.194-.334-.02-.514.147-.68.15-.15.334-.389.5-.583.167-.194.222-.334.334-.556.111-.222.056-.417-.028-.583-.083-.167-.75-1.806-1.028-2.472-.271-.65-.545-.562-.75-.573l-.639-.011c-.222 0-.583.083-.889.417-.305.334-1.167 1.14-1.167 2.778 0 1.638 1.195 3.222 1.361 3.444.167.223 2.353 3.59 5.703 5.033.797.344 1.418.549 1.903.702.8.254 1.528.219 2.103.133.641-.096 1.974-.806 2.253-1.583.278-.777.278-1.444.194-1.583-.083-.14-.305-.222-.639-.389Z" />
  </svg>
)

export default function FloatingWhatsAppCta({
  enabled = true,
  defaultNumber,
  defaultMessage,
  routes,
  ariaLabel = 'Chat on WhatsApp',
  panelTitle = 'Chat with us on WhatsApp',
  panelSubtitle = 'Which service can we help you with?',
}: Props) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Only routes that have a number + a label are usable.
  const validRoutes = (routes || []).filter(
    (r): r is Required<Pick<WhatsAppRoute, 'number' | 'label'>> & WhatsAppRoute =>
      Boolean(r.number && r.label),
  )

  const hasChoices = validRoutes.length > 0
  const directNumber = sanitizeNumber(defaultNumber)

  // Close panel on outside click.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
    }
  }, [open])

  // Close panel on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  if (!enabled) return null
  if (!hasChoices && !directNumber) return null

  const handleButtonClick = () => {
    if (hasChoices) {
      setOpen((v) => !v)
    } else {
      // No routes configured — fall back to opening WhatsApp directly.
      window.open(buildUrl(defaultNumber || '', defaultMessage), '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <>
      {/* ─── Popup panel ─────────────────────────────────────────────── */}
      {open && hasChoices && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="wa-panel-title"
          className="fixed bottom-24 right-6 z-40 w-[calc(100vw-3rem)] sm:w-[22rem] max-w-sm rounded-2xl bg-white text-[#0E1635] shadow-2xl shadow-black/40 border border-black/5 overflow-hidden animate-[fadeInUp_180ms_ease-out]"
          style={{
            transformOrigin: 'bottom right',
          }}
        >
          {/* Header — green WhatsApp band */}
          <div className="bg-[#25D366] text-white px-5 py-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <WhatsAppGlyph className="w-5 h-5 fill-white" />
              </span>
              <div>
                <p id="wa-panel-title" className="font-bold text-[15px] leading-tight">
                  {panelTitle}
                </p>
                <p className="text-white/90 text-xs leading-snug mt-0.5">
                  {panelSubtitle}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="flex-shrink-0 w-8 h-8 rounded-full text-white/90 hover:bg-white/15 transition flex items-center justify-center text-xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Route list */}
          <ul className="divide-y divide-black/5">
            {validRoutes.map((route, i) => {
              const url = buildUrl(route.number, route.message || defaultMessage)
              return (
                <li key={i}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-3 px-5 py-4 hover:bg-[#FAF7F2] transition-colors"
                  >
                    <span className="flex-shrink-0 w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
                      <WhatsAppGlyph className="w-5 h-5 fill-[#25D366]" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-bold text-[#0E1635] leading-snug">
                        {route.label}
                      </span>
                      <span className="block text-xs text-[#6B7280] mt-0.5">
                        Chat now on WhatsApp
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="flex-shrink-0 text-[#DFBA67] text-xl group-hover:translate-x-1 transition-transform"
                    >
                      ›
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* ─── Floating button ─────────────────────────────────────────── */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls="wa-panel-title"
        title={ariaLabel}
        className="group fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-2xl shadow-black/30 hover:scale-110 hover:shadow-[#25D366]/40 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
      >
        {/* Pulsing ring only when panel is closed */}
        {!open && (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping"
            style={{ animationDuration: '2.4s' }}
          />
        )}
        <WhatsAppGlyph className="relative w-7 h-7 fill-white" />
      </button>

      {/* Simple entrance keyframe — scoped via arbitrary-value animation above. */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  )
}
