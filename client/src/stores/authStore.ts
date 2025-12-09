import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type UserRole = 'ADMIN' | 'DOCTOR' | 'LAB' | 'PHARMACY' | 'HR' | 'RECEPTIONIST'

interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    role: UserRole
    avatar?: string
}

interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    setUser: (user: User | null) => void
    setToken: (token: string | null) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            setToken: (token) => set({ token }),
            logout: () => set({ user: null, token: null, isAuthenticated: false }),
        }),
        {
            name: 'medisync-auth',
        }
    )
)
