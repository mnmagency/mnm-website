'use client'

/**
 * Mobile sticky CTA for landing pages. Appears once the visitor scrolls past
 * the hero and hides while the form is on screen. Leaves room on the right
 * for the floating WhatsApp button.
 */

import { useEffect, useState } from 'react'

export default function LpStickyCta({ text }: { text: string }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const form = document.getElementById('lp-form')
    let formVisible = false
    const update = () => setShow(window.scrollY > window.innerHeight * 0.8 && !formVisible)
    const io = form
      ? new IntersectionObserver(([e]) => {
          formVisible = e.isIntersecting
          update()
        })
      : null
    if (form && io) io.observe(form)
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => {
      window.removeEventListener('scroll', update)
      io?.disconnect()
    }
  }, [])

  return (
    <a
      href="#lp-form"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      className={`md:hidden fixed bottom-6 start-4 end-24 z-30 flex items-center justify-center min-h-14 rounded-full bg-[#DFBA67] text-[#0E1635] font-bold shadow-2xl shadow-black/40 transition-all duration-300 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
    >
      {text}
    </a>
  )
}
