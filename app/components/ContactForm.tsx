'use client'

import { useState } from 'react'

type Status = 'idle' | 'submitting' | 'success' | 'error'

type Placeholders = {
  name?: string
  email?: string
  phone?: string
  company?: string
  service?: string
  message?: string
}

type Props = {
  servicesOptions?: string[]
  placeholders?: Placeholders
  submitText?: string
  successTitle?: string
  successText?: string
  errorMessage?: string
  privacyNote?: string
}

export default function ContactForm({
  servicesOptions = [],
  placeholders,
  submitText = 'Send Message',
  successTitle = 'Thanks — your message is on its way.',
  successText = 'Our team will get back to you shortly.',
  errorMessage = 'Sorry, something went wrong. Please try again or email us directly.',
  privacyNote = 'We respect your privacy.',
}: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'submitting') return

    setStatus('submitting')
    setErrorMsg('')

    const form = e.currentTarget
    const formData = new FormData(form)

    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      company: formData.get('company'),
      service: formData.get('service'),
      message: formData.get('message'),
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        setStatus('error')
        setErrorMsg(result.error || errorMessage)
        return
      }

      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
      setErrorMsg(
        'Network error. Please check your connection and try again.'
      )
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl bg-[#F6F6F8] border border-black/5 p-6 text-[#33314E]">
        <p className="text-lg font-bold mb-1">{successTitle}</p>
        <p className="text-sm text-[#6B7280]">{successText}</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-4 text-[#DFBA67] font-bold hover:opacity-80"
        >
          Send another message
        </button>
      </div>
    )
  }

  const submitting = status === 'submitting'

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      <div className="grid md:grid-cols-2 gap-4">
        <input
          name="name"
          type="text"
          required
          maxLength={120}
          placeholder={placeholders?.name || 'Full Name'}
          className="border border-black/10 rounded-xl px-5 py-4 outline-none focus:border-[#DFBA67]"
        />

        <input
          name="email"
          type="email"
          required
          maxLength={254}
          placeholder={placeholders?.email || 'Email Address'}
          className="border border-black/10 rounded-xl px-5 py-4 outline-none focus:border-[#DFBA67]"
        />

        <input
          name="phone"
          type="tel"
          maxLength={40}
          placeholder={placeholders?.phone || 'Phone Number'}
          className="border border-black/10 rounded-xl px-5 py-4 outline-none focus:border-[#DFBA67]"
        />

        <input
          name="company"
          type="text"
          maxLength={200}
          placeholder={placeholders?.company || 'Company Name'}
          className="border border-black/10 rounded-xl px-5 py-4 outline-none focus:border-[#DFBA67]"
        />
      </div>

      <select
        name="service"
        className="border border-black/10 rounded-xl px-5 py-4 outline-none focus:border-[#DFBA67] text-[#6B7280]"
        defaultValue=""
      >
        <option value="">{placeholders?.service || 'Select Service'}</option>
        {servicesOptions.map((service, index) => (
          <option key={index} value={service}>
            {service}
          </option>
        ))}
      </select>

      <textarea
        name="message"
        required
        maxLength={5000}
        placeholder={placeholders?.message || 'Tell us about your project'}
        rows={5}
        className="border border-black/10 rounded-xl px-5 py-4 outline-none focus:border-[#DFBA67]"
      />

      {status === 'error' && errorMsg && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm"
        >
          {errorMsg}
        </p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#33314E] text-white px-8 py-4 rounded-xl font-bold hover:scale-[1.02] transition disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
        >
          {submitting ? 'Sending…' : submitText}
        </button>

        <p className="text-sm text-[#6B7280]">
          {privacyNote}
        </p>
      </div>
    </form>
  )
}
