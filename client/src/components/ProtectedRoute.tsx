import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface ProtectedRouteProps {
    children?: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const localToken = localStorage.getItem('token')
    const location = useLocation()

    if (!isAuthenticated && !localToken) {
        // Smart Redirection: If the path is attendance related, go to the operational login
        if (location.pathname.startsWith('/attendance')) {
            return <Navigate to="/attendance/login" replace />
        }
        return <Navigate to="/login" replace />
    }

    return children ? <>{children}</> : <Outlet />
}
