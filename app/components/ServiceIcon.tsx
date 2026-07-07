/**
 * ServiceIcon — single-source SVG icons used across the site for each
 * M&M service. Keyed by service slug so we never store icon assets in
 * Sanity; pages just pass `slug` and get a consistent gold line-style
 * icon. New services that don't have a custom icon yet fall back to the
 * "default" sparkle so the layout never breaks.
 *
 * Visual language: 1.5px stroke, rounded caps, 24×24 viewBox, currentColor
 * for stroke so it can be themed via Tailwind text-* classes.
 */

type Props = {
  /** Service slug (e.g. "seo", "web-development", "branding"). */
  slug?: string | null
  /** Tailwind size + color classes. Defaults to gold, 32px. */
  className?: string
}

export default function ServiceIcon({ slug, className = 'w-8 h-8 text-[#DFBA67]' }: Props) {
  const Icon = ICONS[normalize(slug)] || ICONS.default
  return <Icon className={className} />
}

const normalize = (s?: string | null): IconKey => {
  if (!s) return 'default'
  const key = s.trim().toLowerCase()
  if (key in ICONS) return key as IconKey
  // Friendly aliases — accept different ways a service might be referenced.
  const aliases: Record<string, IconKey> = {
    'web-dev':        'web-development',
    'website':        'web-development',
    'websites':       'web-development',
    'social':         'social-media',
    'sms':            'bulk-sms',
    'paid-media':     'paid-ads',
    'paid-advertising': 'paid-ads',
    'ads':            'paid-ads',
    'ai':             'ai-llmo-geo',
    'llmo':           'ai-llmo-geo',
    'geo':            'ai-llmo-geo',
    'ai-seo':         'ai-llmo-geo',
    'brand':          'branding',
    'video':          'videography',
    'videos':         'videography',
    'film':           'videography',
    'filmmaking':     'videography',
    'production':     'videography',
  }
  return aliases[key] || 'default'
}

type IconKey =
  | 'web-development'
  | 'seo'
  | 'social-media'
  | 'bulk-sms'
  | 'branding'
  | 'paid-ads'
  | 'ai-llmo-geo'
  | 'videography'
  | 'default'

type IconComponent = (props: { className?: string }) => React.ReactElement

// Shared SVG wrapper — keeps the stroke/cap config consistent across icons.
const Svg = ({
  children,
  className,
  title,
}: {
  children: React.ReactNode
  className?: string
  title: string
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-label={title}
    className={className}
  >
    <title>{title}</title>
    {children}
  </svg>
)

const ICONS: Record<IconKey, IconComponent> = {
  // </> — code brackets with a baseline cursor
  'web-development': ({ className }) => (
    <Svg className={className} title="Web Development">
      <path d="M8 9 4.5 12 8 15" />
      <path d="M16 9 19.5 12 16 15" />
      <path d="M14 6.5 10 17.5" />
    </Svg>
  ),

  // Magnifying glass with a rising trendline inside — SEO/search visibility
  seo: ({ className }) => (
    <Svg className={className} title="SEO">
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.35-4.35" />
      <path d="M8 13.5 10.5 11l1.8 1.8L14.5 9.5" />
    </Svg>
  ),

  // Chat bubble with three dots + tail — social conversation
  'social-media': ({ className }) => (
    <Svg className={className} title="Social Media">
      <path d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H9.5L6 20.5V17H7a3 3 0 0 1-3-3Z" />
      <circle cx="9" cy="10.5" r=".7" fill="currentColor" stroke="none" />
      <circle cx="12" cy="10.5" r=".7" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10.5" r=".7" fill="currentColor" stroke="none" />
    </Svg>
  ),

  // Envelope with motion/send waves — bulk SMS broadcast
  'bulk-sms': ({ className }) => (
    <Svg className={className} title="Bulk SMS">
      <rect x="3" y="6" width="14" height="11" rx="2" />
      <path d="m3 7 7 5 7-5" />
      <path d="M19 9.5h2" />
      <path d="M19 12h2.5" />
      <path d="M19 14.5h2" />
    </Svg>
  ),

  // Sparkle + tilted pen-nib — branding / identity craft
  branding: ({ className }) => (
    <Svg className={className} title="Branding">
      <path d="M14 4 17 7l-9 9-3.5.5L5 13Z" />
      <path d="m14 4 3 3" />
      <path d="M18 14v3" />
      <path d="M16.5 15.5h3" />
      <path d="M19 4v2" />
      <path d="M18 5h2" />
    </Svg>
  ),

  // Bullseye + arrow — paid acquisition / targeting
  'paid-ads': ({ className }) => (
    <Svg className={className} title="Paid Ads">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <path d="m18 6-3 3" />
      <path d="M15 6h3v3" />
    </Svg>
  ),

  // Film clapboard + play triangle — videography / filmmaking
  videography: ({ className }) => (
    <Svg className={className} title="Videography">
      <rect x="3" y="7" width="14" height="11" rx="1.5" />
      <path d="M17 10.5 21 8v9l-4-2.5" />
      <path d="M6 7 7.5 5" />
      <path d="M10 7 11.5 5" />
      <path d="M14 7 15.5 5" />
    </Svg>
  ),

  // Chip with sparkle — AI / LLMO / GEO
  'ai-llmo-geo': ({ className }) => (
    <Svg className={className} title="AI Visibility">
      <rect x="6" y="6" width="12" height="12" rx="2.5" />
      <path d="M9 9.5h6v5H9z" />
      <path d="M9 4v2" />
      <path d="M15 4v2" />
      <path d="M9 18v2" />
      <path d="M15 18v2" />
      <path d="M4 9h2" />
      <path d="M4 15h2" />
      <path d="M18 9h2" />
      <path d="M18 15h2" />
      <path d="m19 4 .5 1.5L21 6l-1.5.5L19 8l-.5-1.5L17 6l1.5-.5Z" fill="currentColor" stroke="none" />
    </Svg>
  ),

  // Generic gold sparkle — fallback for any unknown slug
  default: ({ className }) => (
    <Svg className={className} title="Service">
      <path d="m12 4 1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6Z" />
      <path d="M18 16.5 18.6 18 20 18.6 18.6 19 18 20.5 17.4 19 16 18.6l1.4-.6Z" fill="currentColor" stroke="none" />
    </Svg>
  ),
}
