'use client'

/**
 * LpForm: wraps StrategyForm so a lead-magnet button elsewhere on the page
 * can switch the lead tag (e.g. "Free Website Review") before the visitor
 * fills the form. Fire `window.dispatchEvent(new CustomEvent('lp:tag', { detail: 'Tag' }))`.
 */

import { useEffect, useState, type ComponentProps } from 'react'
import StrategyForm from './StrategyForm'

type Props = ComponentProps<typeof StrategyForm> & { tagNote?: string }

export default function LpForm({ tagNote, ...props }: Props) {
  const [tag, setTag] = useState(props.defaultService || '')
  const [switched, setSwitched] = useState(false)

  useEffect(() => {
    const onTag = (e: Event) => {
      const next = (e as CustomEvent<string>).detail
      if (next) {
        setTag(next)
        setSwitched(true)
      }
    }
    window.addEventListener('lp:tag', onTag)
    return () => window.removeEventListener('lp:tag', onTag)
  }, [])

  return (
    <>
      {switched && tagNote && (
        <p className="mb-4 rounded-xl bg-[#DFBA67]/15 text-[#0E1635] px-4 py-3 text-sm font-bold">
          {tagNote}: {tag}
        </p>
      )}
      <StrategyForm key={tag} {...props} defaultService={tag} />
    </>
  )
}
