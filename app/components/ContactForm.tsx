'use client'

export default function ContactForm({
  servicesOptions = [],
}: {
  servicesOptions?: string[]
}) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

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

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    const result = await response.json()
    
    console.log('FORM RESPONSE:', result)
    
    if (!response.ok || !result.success) {
      alert('Something went wrong. Check terminal.')
      return
    }
    
    alert('Message sent')
    form.reset()
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid md:grid-cols-2 gap-4">
        <input
          name="name"
          type="text"
          placeholder="Full Name"
          className="border border-black/10 rounded-xl px-5 py-4 outline-none focus:border-[#DFBA67]"
        />

        <input
          name="email"
          type="email"
          placeholder="Email Address"
          className="border border-black/10 rounded-xl px-5 py-4 outline-none focus:border-[#DFBA67]"
        />

        <input
          name="phone"
          type="tel"
          placeholder="Phone Number"
          className="border border-black/10 rounded-xl px-5 py-4 outline-none focus:border-[#DFBA67]"
        />

        <input
          name="company"
          type="text"
          placeholder="Company Name"
          className="border border-black/10 rounded-xl px-5 py-4 outline-none focus:border-[#DFBA67]"
        />
      </div>

      <select
        name="service"
        className="border border-black/10 rounded-xl px-5 py-4 outline-none focus:border-[#DFBA67] text-[#6B7280]"
      >
        <option value="">Select Service</option>
        {servicesOptions.map((service, index) => (
          <option key={index} value={service}>
            {service}
          </option>
        ))}
      </select>

      <textarea
        name="message"
        placeholder="Tell us about your project"
        rows={5}
        className="border border-black/10 rounded-xl px-5 py-4 outline-none focus:border-[#DFBA67]"
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
        <button
          type="submit"
          className="bg-[#33314E] text-white px-8 py-4 rounded-xl font-bold hover:scale-[1.02] transition"
        >
          Send Message
        </button>

        <p className="text-sm text-[#6B7280]">
          We respect your privacy.
        </p>
      </div>
    </form>
  )
} 