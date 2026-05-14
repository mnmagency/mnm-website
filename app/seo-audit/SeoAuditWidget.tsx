'use client'

import { useEffect, useId, useState } from 'react'

type Placeholders = {
  url?: string
  firstName?: string
  email?: string
  phone?: string
  submit?: string
}

type Props = {
  widgetTitle: string
  uid: string
  csrfToken: string
  placeholders?: Placeholders
  successMessage: string
}

const DOMAIN_RE =
  /^(https?:\/\/)?[a-z\d-]{1,62}\.[a-z\d-]{1,62}(\.[a-z\d-]{1,62})*$/i
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function SeoAuditWidget({
  widgetTitle,
  uid,
  csrfToken,
  placeholders,
  successMessage,
}: Props) {
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, '')
  const iframeName = `so-iframe-${reactId}`

  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')

  // The SEOptimer endpoint POSTs the form into a hidden iframe and we don't
  // get an explicit completion signal back. After submit we just show the
  // success message after a short delay so the user gets feedback.
  useEffect(() => {
    if (status !== 'submitting') return
    const t = setTimeout(() => setStatus('success'), 1200)
    return () => clearTimeout(t)
  }, [status])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget
    const domain = (form.elements.namedItem('domain') as HTMLInputElement)?.value?.trim()
    const firstName = (form.elements.namedItem('first_name') as HTMLInputElement)?.value?.trim()
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value?.trim()
    const phone = (form.elements.namedItem('phone') as HTMLInputElement)?.value?.trim()

    if (!domain || !DOMAIN_RE.test(domain)) {
      e.preventDefault()
      setStatus('error')
      setErrorMsg('Please enter a valid website URL.')
      return
    }
    if (!firstName) {
      e.preventDefault()
      setStatus('error')
      setErrorMsg('Please enter your first name.')
      return
    }
    if (!email || !EMAIL_RE.test(email)) {
      e.preventDefault()
      setStatus('error')
      setErrorMsg('Please enter a valid email address.')
      return
    }
    if (phone && phone.length < 7) {
      e.preventDefault()
      setStatus('error')
      setErrorMsg('Please enter a valid phone number.')
      return
    }

    setErrorMsg('')
    setStatus('submitting')
    // allow native submission to proceed into the hidden iframe
  }

  if (!uid || !csrfToken) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 text-amber-900 p-6 text-left">
        <p className="font-bold mb-1">SEO Audit widget not configured</p>
        <p className="text-sm">
          Set the <strong>SEOptimer UID</strong> and{' '}
          <strong>SEOptimer CSRF Token</strong> on the SEO Audit Page document
          in Sanity to enable the form.
        </p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl bg-[#F6F6F8] border border-black/5 p-8 text-[#33314E] text-left">
        <p className="text-xl font-bold mb-2">Thanks — request received.</p>
        <p className="text-[#6B7280]">{successMessage}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-xl shadow-black/5 p-8 text-left">
      <h2 className="text-2xl font-bold text-[#252f4a] mb-6 text-center">
        {widgetTitle}
      </h2>

      <iframe
        name={iframeName}
        title="SEO audit submission"
        className="absolute -bottom-px -left-px w-px h-px border-0 opacity-0"
        aria-hidden="true"
      />

      <form
        action="https://seo.mnmagency.com/process-embedded.inc"
        method="post"
        target={iframeName}
        onSubmit={handleSubmit}
        className="grid gap-3 max-w-md mx-auto"
      >
        <input type="hidden" name="type" value="pdf" />
        <input type="hidden" name="uid" value={uid} />
        <input type="hidden" name="csrf_token" value={csrfToken} />
        <input type="hidden" name="behaviour" value="be_in_touch" />
        <input type="hidden" name="template" value="0" />
        <input type="hidden" name="be_in_touch" value="1" />

        <input
          type="text"
          name="domain"
          required
          placeholder={placeholders?.url || 'Website URL'}
          className="border border-[#dbdfe9] rounded px-4 py-2.5 text-base text-[#4b5675] outline-none focus:border-[#DFBA67]"
        />

        <input
          type="text"
          name="first_name"
          required
          maxLength={120}
          placeholder={placeholders?.firstName || 'First Name'}
          className="border border-[#dbdfe9] rounded px-4 py-2.5 text-base text-[#4b5675] outline-none focus:border-[#DFBA67]"
        />

        <input
          type="email"
          name="email"
          required
          maxLength={254}
          placeholder={placeholders?.email || 'Email'}
          className="border border-[#dbdfe9] rounded px-4 py-2.5 text-base text-[#4b5675] outline-none focus:border-[#DFBA67]"
        />

        <input
          type="tel"
          name="phone"
          maxLength={40}
          placeholder={placeholders?.phone || 'Phone Number'}
          className="border border-[#dbdfe9] rounded px-4 py-2.5 text-base text-[#4b5675] outline-none focus:border-[#DFBA67]"
        />

        {status === 'error' && errorMsg && (
          <p role="alert" className="rounded bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="bg-[#e4be61] hover:bg-[#d4ae51] disabled:opacity-70 disabled:cursor-not-allowed text-white rounded px-6 py-2.5 text-base font-bold transition-colors"
        >
          {status === 'submitting'
            ? 'Submitting…'
            : placeholders?.submit || 'Check'}
        </button>
      </form>
    </div>
  )
}
