import { apiBaseUrl } from './auth-client'

export interface CreatorData {
  profile: Record<string, unknown>
  projects: Record<string, unknown>[]
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as { error?: string }
    throw new Error(error.error || 'Gagal menyinkronkan data. Coba lagi.')
  }
  return response.json() as Promise<T>
}

export const getCreatorData = () => request<CreatorData | null>('/api/creator-data')
export const saveCreatorData = (data: CreatorData) => request<CreatorData>('/api/creator-data', {
  method: 'PUT',
  body: JSON.stringify(data),
})
export const deleteCreatorData = () => request<{ success: boolean }>('/api/creator-data', { method: 'DELETE' })
export const getPublicCreatorProducts = () => request<Record<string, unknown>[]>('/api/creator-products')
