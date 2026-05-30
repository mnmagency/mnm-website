'use client'

import { useMemo, useState } from 'react'

type Status = 'idle' | 'submitting' | 'success' | 'error'

type Country = {
  flag?: string
  countryName?: string
  dialCode?: string
  phoneLength?: number
}

type Placeholders = {
  name?: string
  email?: string
  country?: string
  phone?: string
  company?: string
  budget?: string
  message?: string
  service?: string
}

type Props = {
  countries?: Country[]
  humanQuestion?: string
  humanAnswer?: string
  placeholders?: Placeholders
  services?: string[]
  budgetOptions?: string[]
  submitText?: string
  successMessage?: string
  errorMessage?: string
  /**
   * If set, the "Select Service" dropdown is replaced with a hidden input
   * carrying this value. Used by campaign landing pages so the lead arrives
   * pre-tagged with the source service (e.g. "SEO Retainer Qatar").
   */
  defaultService?: string
}

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default function StrategyForm({
  countries = [],
  humanQuestion = '',
  humanAnswer = '',
  placeholders,
  services = [],
  budgetOptions = [],
  submitText = 'Get Strategy',
  successMessage = "Thanks — we'll be in touch shortly.",
  errorMessage = 'Sorry, something went wrong. Please try again or email us directly.',
  defaultService,
}: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')

  const humanPattern = useMemo(
    () => (humanAnswer ? escapeForRegex(humanAnswer) : undefined),
    [humanAnswer]
  )

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
      country: formData.get('country'),
      phone: formData.get('phone'),
      company: formData.get('company'),
      service: formData.get('service'),
      budget: formData.get('budget'),
      message: formData.get('message'),
    }

    try {
      const response = await fetch('/api/strategy', {
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
      setErrorMsg('Network error. Please check your connection and try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-6">
        <p className="text-xl font-bold text-[#DFBA67] mb-2">
          {successMessage}
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="text-[#DFBA67] font-bold hover:opacity-80 mt-2"
        >
          Submit another request
        </button>
      </div>
    )
  }

  const submitting = status === 'submitting'

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <input
        name="name"
        type="text"
        required
        maxLength={120}
        placeholder={placeholders?.name || 'Your Name'}
        className="w-full p-4 rounded bg-white/10 outline-none"
      />

      <input
        name="email"
        type="email"
        required
        maxLength={254}
        placeholder={placeholders?.email || 'Email Address'}
        className="w-full p-4 rounded bg-white/10 outline-none"
      />

      <div className="grid grid-cols-[150px_1fr] gap-3">
        <select
          name="country"
          required
          className="w-full p-4 rounded bg-white/10 outline-none"
          defaultValue=""
        >
          <option value="" disabled>
            {placeholders?.country || 'Country'}
          </option>
          {countries.map((c, index) => (
            <option key={index} value={`${c.dialCode} ${c.countryName}`}>
              {c.flag} {c.dialCode}
            </option>
          ))}
        </select>

        <input
          name="phone"
          type="text"
          required
          placeholder={placeholders?.phone || 'Phone Number'}
          inputMode="numeric"
          maxLength={40}
          className="w-full p-4 rounded bg-white/10 outline-none"
        />
      </div>

      <input
        name="company"
        type="text"
        required
        maxLength={200}
        placeholder={placeholders?.company || 'Company Name'}
        className="w-full p-4 rounded bg-white/10 outline-none"
      />

      {defaultService ? (
        <input type="hidden" name="service" value={defaultService} />
      ) : (
        services.length > 0 && (
          <select
            name="service"
            className="w-full p-4 rounded bg-white/10 outline-none text-white/80"
            defaultValue=""
          >
            <option value="" disabled>
              {placeholders?.service || 'Select Service'}
            </option>
            {services.map((service, index) => (
              <option key={index} value={service} className="text-[#33314E]">
                {service}
              </option>
            ))}
          </select>
        )
      )}

      {budgetOptions.length > 0 ? (
        <select
          name="budget"
          className="w-full p-4 rounded bg-white/10 outline-none text-white/80"
          defaultValue=""
        >
          <option value="" disabled>
            {placeholders?.budget || 'Monthly Marketing Budget'}
          </option>
          {budgetOptions.map((budget, index) => (
            <option key={index} value={budget} className="text-[#33314E]">
              {budget}
            </option>
          ))}
        </select>
      ) : (
        <input
          name="budget"
          type="text"
          maxLength={120}
          placeholder={placeholders?.budget || 'Monthly Marketing Budget'}
          className="w-full p-4 rounded bg-white/10 outline-none"
        />
      )}

      <textarea
        name="message"
        required
        maxLength={5000}
        placeholder={placeholders?.message || 'What do you want to achieve?'}
        className="w-full p-4 rounded bg-white/10 outline-none min-h-[140px]"
      />

      {humanQuestion && (
        <input
          name="humanCheck"
          type="text"
          required
          pattern={humanPattern}
          placeholder={humanQuestion}
          title="Incorrect answer"
          className="w-full p-4 rounded bg-white/10 outline-none"
        />
      )}

      {status === 'error' && errorMsg && (
        <p
          role="alert"
          className="rounded-xl bg-red-500/15 border border-red-400/30 text-red-200 px-4 py-3 text-sm"
        >
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#DFBA67] text-[#33314E] p-4 rounded font-bold hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
      >
        {submitting ? 'Sending…' : submitText}
      </button>
    </form>
  )
}
