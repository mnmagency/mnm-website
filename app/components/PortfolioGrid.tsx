'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'

export type PortfolioCard = {
  href: string
  title: string
  clientName?: string
  category?: string
  projectType?: string
  summary?: string
  technologies?: string[]
  imageUrl?: string
  imageAlt?: string
  logoUrl?: string
}

/** Filterable grid of portfolio cards. All text arrives as props from Sanity. */
export default function PortfolioGrid({
  cards,
  allText,
  ctaText,
}: {
  cards: PortfolioCard[]
  allText: string
  ctaText: string
}) {
  const categories = useMemo(
    () => Array.from(new Set(cards.map((c) => c.category).filter(Boolean))) as string[],
    [cards],
  )
  const [active, setActive] = useState<string | null>(null)
  const shown = active ? cards.filter((c) => c.category === active) : cards

  return (
    <>
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-3 mb-12" role="group">
          {[null, ...categories].map((cat) => {
            const isActive = active === cat
            return (
              <button
                key={cat ?? '__all'}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActive(cat)}
                className={`min-h-11 px-5 rounded-full text-sm font-bold border transition ${
                  isActive
                    ? 'bg-[#DFBA67] text-[#0E1635] border-[#DFBA67]'
                    : 'border-white/20 text-white/80 hover:border-[#DFBA67] hover:text-[#DFBA67]'
                }`}
              >
                {cat ?? allText}
              </button>
            )
          })}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {shown.map((card) => (
          <a
            key={card.href}
            href={card.href}
            className="group overflow-hidden rounded-3xl bg-white/[0.06] border border-white/10 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/10 flex flex-col"
          >
            <div className="relative aspect-[16/10] bg-white/10 overflow-hidden">
              {card.imageUrl && (
                <Image
                  src={card.imageUrl}
                  alt={card.imageAlt || card.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-top group-hover:scale-105 transition duration-700"
                />
              )}
              {card.logoUrl && (
                <div className="absolute bottom-4 left-4 h-12 w-20 rounded-lg bg-white p-1.5 shadow-lg">
                  <div className="relative h-full w-full">
                    <Image src={card.logoUrl} alt="" fill sizes="80px" className="object-contain" />
                  </div>
                </div>
              )}
            </div>
            <div className="p-7 flex flex-col flex-1">
              <p className="text-[#DFBA67] uppercase tracking-widest text-xs mb-3">
                {[card.category, card.projectType].filter(Boolean).join(' · ')}
              </p>
              <h2 className="text-2xl font-bold mb-2">{card.title}</h2>
              {card.clientName && card.clientName !== card.title && (
                <p className="text-sm text-white/60 mb-3">{card.clientName}</p>
              )}
              {card.summary && <p className="text-[#8A95A5] leading-relaxed mb-5 line-clamp-3">{card.summary}</p>}
              {card.technologies && card.technologies.length > 0 && (
                <ul className="flex flex-wrap gap-2 mb-5">
                  {card.technologies.slice(0, 4).map((t) => (
                    <li key={t} className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/80">{t}</li>
                  ))}
                </ul>
              )}
              <span className="mt-auto text-[#DFBA67] font-bold">{ctaText}</span>
            </div>
          </a>
        ))}
      </div>
    </>
  )
}
