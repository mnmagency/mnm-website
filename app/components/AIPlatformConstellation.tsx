/**
 * AIPlatformConstellation — SVG-based hero graphic for the "SEO & GEO
 * are the next frontier of marketing" section.
 *
 * Renders a constellation of stylised platform tiles connected by soft
 * gold light lines that pulse gently. Each tile has an abstract glyph
 * (not a copy of any brand mark) plus a text label so the viewer knows
 * exactly which platforms this M&M service targets.
 *
 * Pure SVG + CSS animations — no external libs, no JS state, no image
 * assets, and drops straight into any responsive container.
 */

type Props = {
  className?: string
}

// Positions expressed as percentages of the 800×600 viewBox so the
// composition scales cleanly at every size.
const nodes = [
  {id: 'chatgpt',    label: 'ChatGPT',       x: 200, y: 130, glyph: 'knot'     },
  {id: 'gemini',     label: 'Gemini',        x: 570, y: 90,  glyph: 'sparkle'  },
  {id: 'perplexity', label: 'Perplexity',    x: 690, y: 300, glyph: 'starburst'},
  {id: 'claude',     label: 'Claude',        x: 500, y: 470, glyph: 'asterisk' },
  {id: 'google',     label: 'Google AI',     x: 140, y: 380, glyph: 'orbit'    },
  {id: 'meta',       label: 'Meta AI',       x: 340, y: 290, glyph: 'infinity' },
] as const

// Edges (which nodes are visually connected). Sparse — enough lines to
// look "networked" without becoming noisy.
const edges: Array<[string, string]> = [
  ['chatgpt', 'gemini'],
  ['chatgpt', 'meta'],
  ['chatgpt', 'google'],
  ['gemini', 'perplexity'],
  ['perplexity', 'claude'],
  ['claude', 'meta'],
  ['google', 'meta'],
  ['meta', 'gemini'],
]

const findNode = (id: string) => nodes.find((n) => n.id === id)!

// ─── Glyphs: abstract geometric shapes, all in currentColor (gold) ────
// None of these are copies of the real brand marks. They're generic
// visual motifs that read as "AI/tech tile".

function Glyph({ kind }: { kind: (typeof nodes)[number]['glyph'] }) {
  const s = 32
  switch (kind) {
    case 'knot':
      return (
        <g fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
          <path d={`M${-s * 0.5} 0 Q0 ${-s * 0.5} ${s * 0.5} 0 Q0 ${s * 0.5} ${-s * 0.5} 0 Z`} />
          <path d={`M0 ${-s * 0.5} Q${s * 0.5} 0 0 ${s * 0.5} Q${-s * 0.5} 0 0 ${-s * 0.5} Z`} />
        </g>
      )
    case 'sparkle':
      return (
        <g fill="currentColor">
          <path d={`M0 ${-s * 0.6} L${s * 0.14} ${-s * 0.14} L${s * 0.6} 0 L${s * 0.14} ${s * 0.14} L0 ${s * 0.6} L${-s * 0.14} ${s * 0.14} L${-s * 0.6} 0 L${-s * 0.14} ${-s * 0.14} Z`} />
        </g>
      )
    case 'starburst':
      return (
        <g stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 8
            const x1 = Math.cos(angle) * s * 0.2
            const y1 = Math.sin(angle) * s * 0.2
            const x2 = Math.cos(angle) * s * 0.55
            const y2 = Math.sin(angle) * s * 0.55
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
          })}
          <circle r={s * 0.12} fill="currentColor" />
        </g>
      )
    case 'asterisk':
      return (
        <g stroke="currentColor" strokeWidth={2.6} strokeLinecap="round">
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 6 - Math.PI / 12
            const x2 = Math.cos(angle) * s * 0.5
            const y2 = Math.sin(angle) * s * 0.5
            return <line key={i} x1={0} y1={0} x2={x2} y2={y2} />
          })}
        </g>
      )
    case 'orbit':
      return (
        <g fill="none" stroke="currentColor" strokeWidth={2.2}>
          <circle r={s * 0.5} />
          <ellipse rx={s * 0.5} ry={s * 0.22} transform="rotate(30)" />
          <circle r={s * 0.11} fill="currentColor" />
        </g>
      )
    case 'infinity':
      return (
        <path
          d={`M${-s * 0.55} 0 C${-s * 0.55} ${-s * 0.35}, ${-s * 0.15} ${-s * 0.35}, 0 0 C${s * 0.15} ${s * 0.35}, ${s * 0.55} ${s * 0.35}, ${s * 0.55} 0 C${s * 0.55} ${-s * 0.35}, ${s * 0.15} ${-s * 0.35}, 0 0 C${-s * 0.15} ${s * 0.35}, ${-s * 0.55} ${s * 0.35}, ${-s * 0.55} 0 Z`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
        />
      )
  }
}

export default function AIPlatformConstellation({ className = '' }: Props) {
  return (
    <div className={`relative w-full ${className}`}>
      <svg
        viewBox="0 0 800 600"
        className="w-full h-auto"
        role="img"
        aria-label="A constellation of leading AI search platforms — ChatGPT, Gemini, Perplexity, Claude, Google AI, and Meta AI — connected by pulsing gold light lines."
      >
        <defs>
          {/* Gold gradient for the edges */}
          <linearGradient id="gold-line" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#DFBA67" stopOpacity="0.15" />
            <stop offset="50%"  stopColor="#DFBA67" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#DFBA67" stopOpacity="0.15" />
          </linearGradient>

          {/* Radial glow behind each tile */}
          <radialGradient id="tile-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#DFBA67" stopOpacity="0.35" />
            <stop offset="60%"  stopColor="#DFBA67" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#DFBA67" stopOpacity="0" />
          </radialGradient>

          {/* Soft ambient background wash */}
          <radialGradient id="bg-wash" cx="50%" cy="50%" r="70%">
            <stop offset="0%"   stopColor="#1A2854" stopOpacity="1" />
            <stop offset="100%" stopColor="#0E1635" stopOpacity="1" />
          </radialGradient>
        </defs>

        {/* Background — rich navy with a subtle centre wash */}
        <rect x="0" y="0" width="800" height="600" fill="url(#bg-wash)" />

        {/* Subtle "cosmic dust" — small stationary gold dots */}
        {Array.from({ length: 60 }).map((_, i) => {
          // Deterministic pseudo-random positioning (no hydration mismatch)
          const x = ((i * 137) % 800) + ((i * 41) % 27) - 13
          const y = ((i * 97) % 600) + ((i * 53) % 21) - 10
          const r = 0.5 + (i % 4) * 0.35
          const op = 0.15 + (i % 5) * 0.08
          return <circle key={i} cx={x} cy={y} r={r} fill="#DFBA67" opacity={op} />
        })}

        {/* Edges — soft gold lines between nodes with pulsing animation */}
        {edges.map(([a, b], i) => {
          const na = findNode(a)
          const nb = findNode(b)
          return (
            <g key={`edge-${i}`}>
              <line
                x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                stroke="url(#gold-line)" strokeWidth={1.2}
              />
              {/* Travelling light pulse along the line */}
              <circle r={3} fill="#DFBA67" opacity={0.9}>
                <animateMotion
                  dur={`${5 + i * 0.7}s`}
                  repeatCount="indefinite"
                  path={`M${na.x} ${na.y} L${nb.x} ${nb.y}`}
                  begin={`${i * 0.4}s`}
                />
                <animate
                  attributeName="opacity"
                  values="0;0.9;0.9;0"
                  dur={`${5 + i * 0.7}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.4}s`}
                />
              </circle>
            </g>
          )
        })}

        {/* Nodes — glowing tiles with abstract glyphs + labels */}
        {nodes.map((n, i) => (
          <g key={n.id} transform={`translate(${n.x} ${n.y})`}>
            {/* Radial glow behind the tile */}
            <circle r={68} fill="url(#tile-glow)" />

            {/* Gently breathing outer ring */}
            <circle r={44} fill="none" stroke="#DFBA67" strokeOpacity="0.28" strokeWidth={1}>
              <animate
                attributeName="r"
                values="44;48;44"
                dur={`${3.5 + i * 0.4}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-opacity"
                values="0.28;0.5;0.28"
                dur={`${3.5 + i * 0.4}s`}
                repeatCount="indefinite"
              />
            </circle>

            {/* Tile — rounded square with gold border on navy */}
            <rect
              x={-32} y={-32} width={64} height={64} rx={16}
              fill="#0E1635"
              stroke="#DFBA67"
              strokeWidth={1.5}
              strokeOpacity={0.85}
            />

            {/* Abstract glyph (not a copy of any brand mark) */}
            <g style={{ color: '#DFBA67' }}>
              <Glyph kind={n.glyph} />
            </g>

            {/* Label */}
            <text
              y={58}
              textAnchor="middle"
              fill="#DFBA67"
              fontSize="14"
              fontWeight="600"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="0.02em"
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
