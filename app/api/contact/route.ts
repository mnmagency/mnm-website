import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const body = await req.json()

  const { name, email, phone, company, service, message } = body

  try {
    const result = await resend.emails.send({
      from: 'M&M Marketing <noreply@mnmagency.com>',
      to: ['info@mnmagency.com'],
      subject: 'New Contact Form Submission',
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    })

    console.log('RESEND RESULT:', result)

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('RESEND ERROR:', error)
    return NextResponse.json({ success: false, error }, { status: 500 })
  }
}