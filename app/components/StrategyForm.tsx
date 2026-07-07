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

type Variant = 'dark' | 'light'

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
  /**
   * Visual variant. `dark` (default) renders white-on-translucent inputs for
   * use on dark backgrounds. `light` renders navy-on-light-gray inputs with
   * gold focus rings — use when the form sits on a white/cream card.
   */
  variant?: Variant
}

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Variant-specific class strings. Keeping them centralized avoids the
// per-input ternary mess in the JSX below.
function classes(variant: Variant) {
  if (variant === 'light') {
    const field =
      'w-full p-4 rounded-xl bg-[#FAF7F2] border border-black/10 text-[#0E1635] placeholder:text-[#6B7280] outline-none focus:border-[#DFBA67] focus:ring-2 focus:ring-[#DFBA67]/30 transition'
    return {
      field,
      // Selects need a dropdown-arrow tweak so the chevron stays visible on light bg.
      select: field + ' appearance-none bg-no-repeat pr-10 cursor-pointer',
      // Background image for the chevron — gold colored to match the focus ring.
      selectStyle: {
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23DFBA67' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
        backgroundPosition: 'right 1rem center',
        backgroundSize: '1.15rem 1.15rem',
      } as React.CSSProperties,
      optionClass: 'text-[#0E1635] bg-white',
      successBox:
        'rounded-2xl bg-[#FAF7F2] border border-[#DFBA67]/30 p-6 text-[#0E1635]',
      successTitle: 'text-xl font-bold text-[#0E1635] mb-2',
      successButton: 'text-[#DFBA67] font-bold hover:opacity-80 mt-2',
      errorBox:
        'rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm',
      submit:
        'w-full bg-[#0E1635] text-white p-4 rounded-xl font-bold hover:bg-[#DFBA67] hover:text-[#0E1635] hover:shadow-xl hover:shadow-[#DFBA67]/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed',
    }
  }

  // Dark (default) — original treatment for navy backgrounds.
  const field =
    'w-full p-4 rounded bg-white/10 text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-[#DFBA67]/40 transition'
  return {
    field,
    select: field + ' text-white/80',
    selectStyle: undefined,
    optionClass: 'text-[#0E1635]',
    successBox: 'rounded-2xl bg-white/[0.06] border border-white/10 p-6',
    successTitle: 'text-xl font-bold text-[#DFBA67] mb-2',
    successButton: 'text-[#DFBA67] font-bold hover:opacity-80 mt-2',
    errorBox:
      'rounded-xl bg-red-500/15 border border-red-400/30 text-red-200 px-4 py-3 text-sm',
    submit:
      'w-full bg-[#DFBA67] text-[#0E1635] p-4 rounded font-bold hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100',
  }
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
  variant = 'dark',
}: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const c = classes(variant)

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
      <div className={c.successBox}>
        <p className={c.successTitle}>
          {successMessage}
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className={c.successButton}
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
        className={c.field}
      />

      <input
        name="email"
        type="email"
        required
        maxLength={254}
        placeholder={placeholders?.email || 'Email Address'}
        className={c.field}
      />

      <div className="grid grid-cols-[150px_1fr] gap-3">
        <select
          name="country"
          required
          className={c.select}
          style={c.selectStyle}
          defaultValue=""
        >
          <option value="" disabled className={c.optionClass}>
            {placeholders?.country || 'Country'}
          </option>
          {countries.map((country, index) => (
            <option key={index} value={`${country.dialCode} ${country.countryName}`} className={c.optionClass}>
              {country.flag} {country.dialCode}
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
          className={c.field}
        />
      </div>

      <input
        name="company"
        type="text"
        required
        maxLength={200}
        placeholder={placeholders?.company || 'Company Name'}
        className={c.field}
      />

      {defaultService ? (
        <input type="hidden" name="service" value={defaultService} />
      ) : (
        services.length > 0 && (
          <select
            name="service"
            className={c.select}
            style={c.selectStyle}
            defaultValue=""
          >
            <option value="" disabled className={c.optionClass}>
              {placeholders?.service || 'Select Service'}
            </option>
            {services.map((service, index) => (
              <option key={index} value={service} className={c.optionClass}>
                {service}
              </option>
            ))}
          </select>
        )
      )}

      {budgetOptions.length > 0 ? (
        <select
          name="budget"
          className={c.select}
          style={c.selectStyle}
          defaultValue=""
        >
          <option value="" disabled className={c.optionClass}>
            {placeholders?.budget || 'Monthly Marketing Budget'}
          </option>
          {budgetOptions.map((budget, index) => (
            <option key={index} value={budget} className={c.optionClass}>
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
          className={c.field}
        />
      )}

      <textarea
        name="message"
        required
        maxLength={5000}
        placeholder={placeholders?.message || 'What do you want to achieve?'}
        className={c.field + ' min-h-[140px] resize-y'}
      />

      {humanQuestion && (
        <input
          name="humanCheck"
          type="text"
          required
          pattern={humanPattern}
          placeholder={humanQuestion}
          title="Incorrect answer"
          className={c.field}
        />
      )}

      {status === 'error' && errorMsg && (
        <p
          role="alert"
          className={c.errorBox}
        >
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={c.submit}
      >
        {submitting ? 'Sending…' : submitText}
      </button>
    </form>
  )
}
