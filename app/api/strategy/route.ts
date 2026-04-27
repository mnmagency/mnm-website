import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const body = await req.json()

  const {
    name,
    email,
    phone,
    company,
    service,
    budget,
    message,
  } = body

  try {
    await resend.emails.send({
      from: 'M&M Marketing Website <noreply@mnmagency.com>',
      to: ['info@mnmagency.com'],
      replyTo: email,
      subject: 'New Strategy Request',
      html: `
        <h2>New Strategy Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Budget:</strong> ${budget}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('STRATEGY ERROR:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}