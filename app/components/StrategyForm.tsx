'use client'

export default function StrategyForm({
  countries = [],
  humanQuestion = '',
  humanAnswer = '',
}: {
  countries?: any[]
  humanQuestion?: string
  humanAnswer?: string
}) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = e.currentTarget
    const formData = new FormData(form)

    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      country: formData.get('country'),
      phone: formData.get('phone'),
      company: formData.get('company'),
      budget: formData.get('budget'),
      message: formData.get('message'),
    }

    const response = await fetch('/api/strategy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      alert('Something went wrong')
      return
    }

    alert('Strategy request sent')
    form.reset()
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <input
        name="name"
        type="text"
        required
        placeholder="Your Name"
        className="w-full p-4 rounded bg-white/10 outline-none"
      />

      <input
        name="email"
        type="email"
        required
        placeholder="Email Address"
        className="w-full p-4 rounded bg-white/10 outline-none"
      />

      <div className="grid grid-cols-[150px_1fr] gap-3">
        <select
          name="country"
          required
          className="w-full p-4 rounded bg-white/10 outline-none"
        >
          {countries.map((c: any, index: number) => (
            <option key={index} value={`${c.dialCode} ${c.countryName}`}>
              {c.flag} {c.dialCode}
            </option>
          ))}
        </select>

        <input
          name="phone"
          type="text"
          required
          placeholder="Phone Number"
          inputMode="numeric"
          className="w-full p-4 rounded bg-white/10 outline-none"
        />
      </div>

      <input
        name="company"
        type="text"
        required
        placeholder="Company Name"
        className="w-full p-4 rounded bg-white/10 outline-none"
      />

      <input
        name="budget"
        type="text"
        placeholder="Monthly Marketing Budget"
        className="w-full p-4 rounded bg-white/10 outline-none"
      />

      <textarea
        name="message"
        required
        placeholder="What do you want to achieve?"
        className="w-full p-4 rounded bg-white/10 outline-none min-h-[140px]"
      />

      <input
        name="humanCheck"
        type="text"
        required
        pattern={humanAnswer || ''}
        placeholder={humanQuestion}
        title="Incorrect answer"
        className="w-full p-4 rounded bg-white/10 outline-none"
      />

      <button className="w-full bg-[#DFBA67] text-[#33314E] p-4 rounded font-bold hover:scale-[1.02] transition-all duration-300">
        Get Strategy
      </button>
    </form>
  )
}