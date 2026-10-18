/**
 * LpShowcase: real portfolio screenshots in a browser frame, cross-fading
 * on a CSS-only loop (no JS). Used as the landing page hero asset.
 */

import Image from 'next/image'

export type ShowcaseSlide = { src: string; alt: string; label: string; host?: string }

export default function LpShowcase({ slides }: { slides: ShowcaseSlide[] }) {
  if (slides.length === 0) return null
  const n = slides.length
  const step = 4 // seconds per slide
  const total = n * step
  // Visible share of the cycle, plus a short fade at each edge.
  const on = (100 / n).toFixed(2)
  const fade = Math.min(4, 100 / n / 4).toFixed(2)

  return (
    <figure className="relative" aria-label={slides.map((s) => s.label).join(', ')}>
      <style>{`
        @keyframes lpShow {
          0% { opacity: 0 }
          ${fade}% { opacity: 1 }
          ${on}% { opacity: 1 }
          ${(Number(on) + Number(fade)).toFixed(2)}% { opacity: 0 }
          100% { opacity: 0 }
        }
        .lp-slide { animation: lpShow ${total}s infinite; opacity: 0 }
        .lp-slide:first-child { opacity: 1 }
        @media (prefers-reduced-motion: reduce) {
          .lp-slide { animation: none; opacity: 0 }
          .lp-slide:first-child { opacity: 1 }
        }
      `}</style>

      <div className="rounded-2xl md:rounded-[1.5rem] overflow-hidden bg-[#0B1230] ring-1 ring-white/15 shadow-2xl shadow-black/50">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.06] border-b border-white/10" dir="ltr">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          <div className="relative ms-3 flex-1 h-7 rounded-full bg-white/10 overflow-hidden">
            {slides.map((s, i) => (
              <span
                key={i}
                className="lp-slide absolute inset-0 flex items-center px-4 text-xs text-white/70 truncate"
                style={{ animationDelay: `${i * step}s` }}
              >
                {s.host || s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Screens */}
        <div className="relative aspect-[16/10]">
          {slides.map((s, i) => (
            <div key={i} className="lp-slide absolute inset-0" style={{ animationDelay: `${i * step}s` }}>
              <Image
                src={s.src}
                alt={s.alt}
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-top"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Caption pills */}
      <figcaption className="relative mt-4 h-6 overflow-hidden">
        {slides.map((s, i) => (
          <span
            key={i}
            className="lp-slide absolute inset-0 text-center text-sm text-[#C9D1DC] truncate"
            style={{ animationDelay: `${i * step}s` }}
          >
            {s.label}
          </span>
        ))}
      </figcaption>
    </figure>
  )
}
