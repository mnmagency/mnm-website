type Socials = {
  instagram?: string
  facebook?: string
  x?: string
  youtube?: string
}

type Props = {
  socials?: Socials
  showLabel?: boolean
  className?: string
  iconClassName?: string
  labelClassName?: string
}

export default function SocialIcons({
  socials,
  showLabel = false,
  className = '',
  iconClassName = 'w-5 h-5',
  labelClassName = 'text-sm text-white/70',
}: Props) {
  if (!socials) return null

  const items: Array<{ key: keyof Socials; href?: string; label: string; svg: React.ReactNode }> = [
    {
      key: 'instagram',
      href: socials.instagram,
      label: 'Instagram',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={iconClassName}>
          <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.37 1.06.42 2.23.06 1.26.07 1.65.07 4.85s0 3.6-.07 4.85c-.05 1.17-.25 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.17-1.06.37-2.23.42-1.26.06-1.65.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.42a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.17-.42-.37-1.06-.42-2.23C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.85c.05-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.06-.37 2.23-.42C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.15 0-3.5 0-4.74.07-1.07.05-1.65.23-2.04.38-.51.2-.88.44-1.27.83a3.4 3.4 0 0 0-.83 1.27c-.15.39-.33.97-.38 2.04C2.7 8.5 2.7 8.85 2.7 12s0 3.5.07 4.74c.05 1.07.23 1.65.38 2.04.2.51.44.88.83 1.27.39.39.76.63 1.27.83.39.15.97.33 2.04.38 1.24.07 1.59.07 4.74.07s3.5 0 4.74-.07c1.07-.05 1.65-.23 2.04-.38.51-.2.88-.44 1.27-.83.39-.39.63-.76.83-1.27.15-.39.33-.97.38-2.04.07-1.24.07-1.59.07-4.74s0-3.5-.07-4.74c-.05-1.07-.23-1.65-.38-2.04a3.4 3.4 0 0 0-.83-1.27 3.4 3.4 0 0 0-1.27-.83c-.39-.15-.97-.33-2.04-.38C15.5 4 15.15 4 12 4zm0 3.05a4.95 4.95 0 1 1 0 9.9 4.95 4.95 0 0 1 0-9.9zm0 1.8a3.15 3.15 0 1 0 0 6.3 3.15 3.15 0 0 0 0-6.3zm5.15-2.06a1.16 1.16 0 1 1 0 2.32 1.16 1.16 0 0 1 0-2.32z" />
        </svg>
      ),
    },
    {
      key: 'facebook',
      href: socials.facebook,
      label: 'Facebook',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={iconClassName}>
          <path d="M22 12.07C22 6.49 17.52 2 11.93 2 6.35 2 1.86 6.49 1.86 12.07c0 5.04 3.69 9.21 8.51 9.94v-7.03H7.84v-2.91h2.53V9.83c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.77l-.44 2.91h-2.33V22c4.82-.73 8.51-4.9 8.51-9.93z" />
        </svg>
      ),
    },
    {
      key: 'x',
      href: socials.x,
      label: 'X',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={iconClassName}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      key: 'youtube',
      href: socials.youtube,
      label: 'YouTube',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={iconClassName}>
          <path d="M23.5 6.2a3.02 3.02 0 0 0-2.13-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.37.51A3.02 3.02 0 0 0 .5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3.02 3.02 0 0 0 2.13 2.14c1.87.51 9.37.51 9.37.51s7.5 0 9.37-.51a3.02 3.02 0 0 0 2.13-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.8zM9.6 15.57V8.43L15.82 12 9.6 15.57z" />
        </svg>
      ),
    },
  ]

  const visible = items.filter((i) => i.href)
  if (visible.length === 0) return null

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabel && <span className={labelClassName}>Follow Us:</span>}
      {visible.map((item) => (
        <a
          key={item.key}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
          className="text-white/70 hover:text-[#DFBA67] transition-colors"
        >
          {item.svg}
        </a>
      ))}
    </div>
  )
}
