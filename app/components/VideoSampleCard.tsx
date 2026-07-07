/**
 * VideoSampleCard — renders a single CMS-managed video sample.
 *
 * Accepts a YouTube link (watch / youtu.be / Shorts), a Vimeo link,
 * or a direct MP4/WebM URL, and picks the right player automatically.
 *
 * Uses a click-to-load pattern: the thumbnail is shown by default;
 * clicking it swaps in the actual <iframe>/<video>. This keeps the
 * page light when there are many samples and avoids 8 YouTube iframes
 * loading on first paint.
 */

'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'

type Aspect = '16-9' | '9-16' | '1-1'

export type VideoSample = {
  title?: string
  description?: string
  videoUrl?: string
  videoFile?: { asset?: { url?: string } }
  thumbnail?: { asset?: { url?: string } }
  aspectRatio?: Aspect
}

type Props = {
  sample: VideoSample
}

const aspectClass: Record<Aspect, string> = {
  '16-9': 'aspect-video',
  '9-16': 'aspect-[9/16]',
  '1-1': 'aspect-square',
}

// Parse a URL and return { kind, embedUrl } so the right element gets rendered.
function classifyVideo(url?: string): {
  kind: 'youtube' | 'vimeo' | 'file' | 'none'
  src?: string
} {
  if (!url) return { kind: 'none' }

  // YouTube — watch, youtu.be, shorts, embed
  const ytMatch =
    url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/)
  if (ytMatch) {
    const id = ytMatch[1]
    return {
      kind: 'youtube',
      src: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
    }
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) {
    const id = vimeoMatch[1]
    return {
      kind: 'vimeo',
      src: `https://player.vimeo.com/video/${id}?autoplay=1&playsinline=1`,
    }
  }

  // Direct file (.mp4 / .webm / .mov / any other path that ends in a video ext)
  if (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url)) {
    return { kind: 'file', src: url }
  }

  // Unknown URL — fall back to file player so it at least tries to play.
  return { kind: 'file', src: url }
}

export default function VideoSampleCard({ sample }: Props) {
  const [playing, setPlaying] = useState(false)

  const url = sample.videoUrl || sample.videoFile?.asset?.url
  const { kind, src } = useMemo(() => classifyVideo(url), [url])
  const aspect = aspectClass[sample.aspectRatio || '16-9']
  const thumb = sample.thumbnail?.asset?.url

  return (
    <figure className="group bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden hover:border-[#DFBA67]/40 transition-colors">
      <div className={`relative ${aspect} bg-[#0E1635]`}>
        {!playing ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={sample.title ? `Play ${sample.title}` : 'Play video'}
            className="absolute inset-0 group/play"
          >
            {thumb ? (
              <Image
                src={thumb}
                alt={sample.title || 'Video thumbnail'}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="object-cover group-hover/play:scale-[1.03] transition-transform duration-500"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(135deg, #0E1635 0%, #1A2854 60%, #DFBA67 200%)',
                }}
              />
            )}

            {/* Dark gradient + play button */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex items-center justify-center w-16 h-16 rounded-full bg-[#DFBA67] text-[#0E1635] shadow-2xl shadow-black/40 group-hover/play:scale-110 transition-transform duration-300">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 translate-x-[2px]" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </div>
          </button>
        ) : kind === 'file' ? (
          <video
            src={src}
            poster={thumb}
            autoPlay
            controls
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : src ? (
          <iframe
            src={src}
            title={sample.title || 'Video sample'}
            loading="lazy"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/60 text-sm">
            No video URL set
          </div>
        )}
      </div>

      {(sample.title || sample.description) && (
        <figcaption className="p-5">
          {sample.title && (
            <h3 className="font-bold text-white text-lg leading-tight mb-1">
              {sample.title}
            </h3>
          )}
          {sample.description && (
            <p className="text-[#8A95A5] text-sm leading-relaxed line-clamp-2">
              {sample.description}
            </p>
          )}
        </figcaption>
      )}
    </figure>
  )
}
