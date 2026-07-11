/**
 * FeaturedSpotlightCarousel — the "Hot off the press" homepage section
 * turned into an auto-advancing carousel.
 *
 * Behaviour:
 *   • Auto-advances to the next case study every 10 seconds
 *   • Left / right arrows for manual navigation (mirrored in RTL)
 *   • Small dot indicators under the copy
 *   • Auto-pause on hover / touch so the reader isn't yanked away mid-read
 *   • Crossfades between slides — no jarring jumps
 *
 * Layout matches the original static design exactly:
 *   • Navy block bleeds to the LEFT edge in LTR / RIGHT edge in RTL
 *   • Image floats top-right in LTR / top-left in RTL
 *   • Copy sits inside the navy block, aligned to the max-w-7xl grid
 *
 * Server component pre-computes all strings/hrefs and passes them as
 * plain data — no functions crossing the server/client boundary.
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export type SpotlightSlide = {
  /** Pre-localised headline. */
  title: string
  /** Pre-localised description or results text. */
  description: string
  /** Full URL / path for both the CTA button and the image click target. */
  href: string
  /** Sanity CDN URL for the slide image. May be missing. */
  imageUrl?: string
  /** Alt text for the image. */
  imageAlt: string
}

export type SpotlightLabels = {
  eyebrow: string
  ctaText: string
  slideLabel: string
  prevLabel: string
  nextLabel: string
}

type Props = {
  slides: SpotlightSlide[]
  labels: SpotlightLabels
  isRtl: boolean
  /** Seconds between auto-advances. Default 10. */
  intervalSeconds?: number
}

export default function FeaturedSpotlightCarousel({
  slides,
  labels,
  isRtl,
  intervalSeconds = 10,
}: Props) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const count = slides.length

  const goTo = (next: number) => setIndex(((next % count) + count) % count)
  const next = () => goTo(index + 1)
  const prev = () => goTo(index - 1)

  // Auto-advance loop. Clears when count changes, when the section is
  // paused, or when the component unmounts.
  useEffect(() => {
    if (count <= 1 || paused) return
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % count)
    }, intervalSeconds * 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [count, paused, intervalSeconds])

  if (count === 0) return null
  const current = slides[index]

  return (
    <section
      className="bg-white pt-12 lg:pt-16 pb-12 lg:pb-20 relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setTimeout(() => setPaused(false), 5000)}
    >
      {/* NAVY BLOCK — in LTR bleeds to the LEFT edge; in RTL bleeds to the
         RIGHT edge so the layout mirrors properly. */}
      <div
        className={`text-white py-16 lg:py-24 lg:w-[73%] lg:min-h-[480px] flex flex-col justify-center ${
          isRtl ? 'lg:ml-auto' : ''
        }`}
        style={{ backgroundColor: '#0E1635' }}
      >
        <div
          className={`w-full px-6 ${
            isRtl
              ? 'lg:pr-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] lg:pl-16 pl-8'
              : 'lg:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] lg:pr-16 pr-8'
          }`}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/85 font-bold mb-7">
            {labels.eyebrow}
          </p>

          {/* Crossfade wrapper — FIXED, tight height so the section doesn't
             jump between slides AND there's no dead space when a short
             title is active.

             Trick: clamp the h2 to 3 lines and the paragraph to 3 lines
             via line-clamp. Long titles truncate cleanly with a browser
             ellipsis (visitors can read the full title on the case study
             page). Every slide now fits the same compact box:
               sm: 300px · md: 320px · lg: 340px · xl: 380px
             */}
          <div className="relative h-[300px] md:h-[320px] lg:h-[340px] xl:h-[380px]">
            {slides.map((s, i) => {
              const isActive = i === index
              return (
                <div
                  key={s.href || i}
                  // Using `inert` instead of `aria-hidden` — inert prevents both
                  // screen-reader access AND focusability of children. Fixes the
                  // Lighthouse "ARIA hidden element must not contain focusable
                  // descendants" audit for the case-study links inside each slide.
                  {...(!isActive && { inert: '' })}
                  className={`absolute inset-0 transition-opacity duration-700 flex flex-col ${
                    isActive
                      ? 'opacity-100 pointer-events-auto'
                      : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <h2 className="text-3xl md:text-4xl lg:text-[2.25rem] xl:text-[2.5rem] font-bold uppercase tracking-[-0.02em] leading-[1.05] mb-6 max-w-2xl lg:max-w-[28rem] xl:max-w-[32rem] line-clamp-3">
                    {s.title}
                  </h2>

                  <p className="text-base lg:text-lg text-white/90 leading-relaxed mb-8 max-w-md lg:max-w-[24rem] xl:max-w-[28rem] line-clamp-3">
                    {s.description}
                  </p>

                  <a
                    href={s.href}
                    className="group self-start inline-flex items-center gap-2.5 bg-[#DFBA67] text-[#0E1635] px-7 py-3.5 font-bold text-sm hover:bg-white transition mt-auto"
                  >
                    <span>{labels.ctaText}</span>
                    <span
                      className={`${
                        isRtl ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'
                      } transition-transform text-lg`}
                    >
                      {isRtl ? '‹' : '›'}
                    </span>
                  </a>
                </div>
              )
            })}
          </div>

          {count > 1 && (
            <div className="mt-10 flex items-center gap-4">
              {/* Prev / Next arrows. In RTL the arrow glyphs flip so
                 "previous" is still on the reading-start side. */}
              <button
                type="button"
                onClick={() => (isRtl ? next() : prev())}
                aria-label={labels.prevLabel}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-white/30 text-white hover:bg-[#DFBA67] hover:text-[#0E1635] hover:border-[#DFBA67] transition"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => (isRtl ? prev() : next())}
                aria-label={labels.nextLabel}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-white/30 text-white hover:bg-[#DFBA67] hover:text-[#0E1635] hover:border-[#DFBA67] transition"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {/* Dots — clickable, indicate which slide is active */}
              <div className="flex items-center gap-2 ml-2">
                {slides.map((_, i) => {
                  const isActive = i === index
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`${labels.slideLabel} ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isActive
                          ? 'w-8 bg-[#DFBA67]'
                          : 'w-2 bg-white/30 hover:bg-white/60'
                      }`}
                    />
                  )
                })}
              </div>

              {/* Slide counter */}
              <span className="ml-auto text-xs text-white/50 uppercase tracking-widest tabular-nums">
                {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* IMAGE — floats to the top-right in LTR, top-left in RTL. Fades
         between slides. */}
      <div
        className={`lg:absolute lg:top-0 ${
          isRtl ? 'lg:left-[12%] xl:left-[12%]' : 'lg:right-[12%] xl:right-[12%]'
        } mt-6 lg:mt-0 w-full lg:w-[40%] aspect-[3/2] z-20 overflow-hidden lg:-mt-4 xl:-mt-6`}
      >
        <a href={current.href} className="block relative w-full h-full group">
          {slides.map((s, i) => {
            if (!s.imageUrl) return null
            const isActive = i === index
            return (
              <Image
                key={s.href || i}
                src={s.imageUrl}
                alt={s.imageAlt}
                width={1100}
                height={733}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  isActive ? 'opacity-100 group-hover:scale-[1.02]' : 'opacity-0'
                } transition-transform`}
              />
            )
          })}
        </a>
      </div>
    </section>
  )
}
