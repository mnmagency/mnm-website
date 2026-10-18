'use client'

/** Button that tags the landing page form with an offer and scrolls to it. */
export default function LpOfferButton({
  tag,
  className,
  children,
  onClick,
}: {
  tag?: string
  className?: string
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <a
      href="#lp-form"
      className={className}
      onClick={() => {
        if (tag) window.dispatchEvent(new CustomEvent('lp:tag', { detail: tag }))
        onClick?.()
      }}
    >
      {children}
    </a>
  )
}
