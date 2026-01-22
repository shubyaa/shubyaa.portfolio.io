import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  const { record } = await req.json()
  
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'Portfolio <noreply@yourdomain.com>',
      to: ['shubhped0712@gmail.com'],
      subject: `New Contact Form Submission from ${record.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${record.name}</p>
        <p><strong>Email:</strong> ${record.email}</p>
        <p><strong>Project Type:</strong> ${record.project_type || 'Not specified'}</p>
        <p><strong>Message:</strong></p>
        <p>${record.message}</p>
        <p><strong>Submitted:</strong> ${new Date(record.created_at).toLocaleString()}</p>
      `
    })
  })

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})