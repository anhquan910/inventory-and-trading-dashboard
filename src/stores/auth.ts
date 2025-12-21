import { Store } from '@tanstack/react-store'

interface AuthState {
  token: string | null
  user: { email: string } | null
}

const savedToken = localStorage.getItem('token')

export const authStore = new Store<AuthState>({
  token: savedToken,
  user: null,
})

export const login = (token: string) => {
  localStorage.setItem('token', token)
  authStore.setState((state) => ({
    ...state,
    token,
  }))
}

export const logout = () => {
  localStorage.removeItem('token')
  authStore.setState((state) => ({
    ...state,
    token: null,
    user: null,
  }))
}