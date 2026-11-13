import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { captcha } from 'better-auth/plugins'
import { db } from './db/index.js'
import { account, session, user, verification } from './db/schema.js'
import { sendAuthEmail } from './email.js'

const isProduction = process.env.NODE_ENV === 'production'
const appUrl = process.env.APP_URL ?? (isProduction ? '' : 'http://localhost:5173')
const authUrl = process.env.BETTER_AUTH_URL ?? (isProduction ? '' : `http://localhost:${process.env.PORT ?? '3001'}`)
if (isProduction && (!appUrl || !authUrl || !process.env.BETTER_AUTH_SECRET)) {
  throw new Error('Production auth requires APP_URL, BETTER_AUTH_URL, and BETTER_AUTH_SECRET.')
}
const trustedOrigins = appUrl ? [appUrl] : []
if (!isProduction) {
  for (let port = 5173; port <= 5199; port++) trustedOrigins.push(`http://localhost:${port}`, `http://127.0.0.1:${port}`)
}
const socialProviders = {
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
    google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET, requireEmailVerification: true },
  } : {}),
  ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? {
    github: { clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET, requireEmailVerification: true },
  } : {}),
}

export const auth = betterAuth({
  appName: 'PojokPixel',
  baseURL: authUrl,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins,
  database: drizzleAdapter(db, { provider: 'pg', schema: { user, session, account, verification } }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    minPasswordLength: 8,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user: newUser, url }) => {
      await sendAuthEmail({
        to: newUser.email,
        subject: 'Verifikasi akun PojokPixel',
        text: `Akun PojokPixel berhasil didaftarkan. Verifikasi email kamu melalui tautan ini: ${url}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#303236"><p style="color:#e65416;font-weight:bold">POJOKPIXEL</p><h1>Akunmu hampir siap.</h1><p>Akun PojokPixel berhasil didaftarkan. Verifikasi alamat email ini untuk mulai masuk ke dashboard.</p><p><a href="${url}" style="display:inline-block;background:#303236;color:#fff;padding:13px 18px;text-decoration:none">Verifikasi email</a></p><p style="font-size:12px;color:#777">Jika kamu tidak mendaftar, abaikan email ini.</p></div>`,
      })
    },
  },
  user: {
    additionalFields: {
      username: { type: 'string', required: false, unique: true },
      birthDate: { type: 'string', required: false },
    },
  },
  socialProviders,
  plugins: [captcha({
    provider: 'cloudflare-turnstile',
    secretKey: process.env.TURNSTILE_SECRET_KEY ?? '',
    endpoints: ['/sign-up/email'],
  })],
})
