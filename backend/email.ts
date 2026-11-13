import nodemailer from 'nodemailer'

type AuthEmail = { to: string; subject: string; text: string; html: string }

export async function sendAuthEmail({ to, subject, text, html }: AuthEmail) {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? 587)
  const from = process.env.SMTP_FROM
  if (!host || !from) {
    throw new Error('SMTP_HOST dan SMTP_FROM harus diatur untuk mengirim email autentikasi.')
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  })

  await transporter.sendMail({ from, to, subject, text, html })
}
