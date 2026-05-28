import { prisma } from '@/lib/db'

export async function sendBookingNotification(params: {
  customerName: string
  phone: string
  email: string
  date: string
  time: string
  partySize: number
  tableLabel: string
  notes?: string | null
}) {
  const recipients = await prisma.notificationEmail.findMany({ orderBy: { createdAt: 'asc' } })
  if (recipients.length === 0) return { sent: 0 }

  const appUrl = process.env.NEXTAUTH_URL ?? ''
  let hostname = 'uzbekcorner'
  try { if (appUrl) hostname = new URL(appUrl).hostname } catch { /* ignore */ }
  const senderDomain = hostname.split('.').length >= 2 ? hostname : 'mail.abacusai.app'

  const escape = (s: string) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#1a1a1a">
      <div style="background:#131d57;color:#fff;padding:24px;border-radius:10px 10px 0 0">
        <div style="font-size:13px;letter-spacing:3px;color:#c8a45c;text-transform:uppercase">Uzbek Corner London</div>
        <h2 style="margin:6px 0 0;font-weight:600">New table booking</h2>
      </div>
      <div style="background:#f7f6f2;padding:24px;border-radius:0 0 10px 10px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#555">Guest</td><td style="padding:6px 0;font-weight:600">${escape(params.customerName)}</td></tr>
          <tr><td style="padding:6px 0;color:#555">Phone</td><td style="padding:6px 0">${escape(params.phone)}</td></tr>
          <tr><td style="padding:6px 0;color:#555">Email</td><td style="padding:6px 0">${escape(params.email)}</td></tr>
          <tr><td style="padding:6px 0;color:#555">Date</td><td style="padding:6px 0;font-weight:600">${escape(params.date)}</td></tr>
          <tr><td style="padding:6px 0;color:#555">Time</td><td style="padding:6px 0;font-weight:600">${escape(params.time)}</td></tr>
          <tr><td style="padding:6px 0;color:#555">Party size</td><td style="padding:6px 0">${escape(String(params.partySize))}</td></tr>
          <tr><td style="padding:6px 0;color:#555">Table</td><td style="padding:6px 0">${escape(params.tableLabel)}</td></tr>
          ${params.notes ? `<tr><td style="padding:6px 0;color:#555;vertical-align:top">Notes</td><td style="padding:6px 0;white-space:pre-wrap">${escape(params.notes)}</td></tr>` : ''}
        </table>
        <p style="margin-top:20px;color:#777;font-size:12px">Login to the admin panel to confirm or cancel this booking.</p>
      </div>
    </div>
  `

  let sent = 0
  for (const r of recipients) {
    try {
      const resp = await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deployment_token: process.env.ABACUSAI_API_KEY,
          app_id: process.env.WEB_APP_ID,
          notification_id: process.env.NOTIF_ID_NEW_BOOKING,
          subject: `New booking — ${params.customerName} · ${params.date} ${params.time}`,
          body: html,
          is_html: true,
          recipient_email: r.email,
          sender_email: `noreply@${senderDomain}`,
          sender_alias: 'Uzbek Corner London',
        }),
      })
      const result = await resp.json().catch(() => ({}))
      if (result?.success || result?.notification_disabled) sent += 1
      else console.warn('Notification not sent to', r.email, result)
    } catch (e) {
      console.warn('Notification error for', r.email, e)
    }
  }
  return { sent }
}
