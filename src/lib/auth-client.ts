import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields } from 'better-auth/client/plugins'
import type { auth } from '../../backend/auth'

export const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
export const authClient = createAuthClient({
  baseURL: `${apiBaseUrl}/api/auth`,
  fetchOptions: { credentials: 'include' },
  plugins: [inferAdditionalFields<typeof auth>()],
})
