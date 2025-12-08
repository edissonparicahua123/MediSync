import { create } from 'zustand'

interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    role: any
}

interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    login: (user: User, token: string) => void
    logout: () => void
    setUser: (user: User) => void
}

// Initialize from localStorage
const getInitialState = () => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    const user = userStr ? JSON.parse(userStr) : null

    return {
        user,
        token,
        isAuthenticated: !!token,
    }
}

export const useAuthStore = create<AuthState>((set) => ({
    ...getInitialState(),
    login: (user, token) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        set({ user, token, isAuthenticated: true })
    },
    logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({ user: null, token: null, isAuthenticated: false })
    },
    setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user))
        set({ user })
    },
}))
