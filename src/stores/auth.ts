import { Store } from '@tanstack/react-store'

// Define authentication state structure
interface AuthState {
  token: string | null
  user: { email: string } | null
}

// Retrieve token from local storage on app initialization
const savedToken = localStorage.getItem('token')

export const authStore = new Store<AuthState>({
  token: savedToken,
  user: null,
})

// Save token and update auth state on successful login
export const login = (token: string) => {
  localStorage.setItem('token', token)
  authStore.setState((state) => ({
    ...state,
    token,
  }))
}

// Clear token and reset auth state on logout
export const logout = () => {
  localStorage.removeItem('token')
  authStore.setState((state) => ({
    ...state,
    token: null,
    user: null,
  }))
}