import axios from 'axios'

const TOKEN_KEY = 'built_not_bought_token'

export const api = axios.create({
  baseURL: '/api/v1',
})

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

api.interceptors.request.use(config => {
  const token = getAuthToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (axios.isAxiosError(error) && error.response?.status == 401) {
      setAuthToken(null)
    }

    return Promise.reject(error)
  },
)
