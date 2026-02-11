import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface ProtectedRouteProps {
    children?: React.ReactNode
    allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, user } = useAuthStore()
    const localToken = localStorage.getItem('token')
    const location = useLocation()

    if (!isAuthenticated && !localToken) {
        // Redirección inteligente: si es una ruta de asistencia, ir al login operativo
        if (location.pathname.startsWith('/attendance')) {
            return <Navigate to="/attendance/login" replace />
        }
        return <Navigate to="/login" replace />
    }

    // 1. Verificar roles si están especificados
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        console.warn(`Acceso denegado: El rol ${user.role} no tiene permiso para esta sección.`)
        // Si intenta entrar a asistencia sin ser HR, mandarlo al login de asistencia (o dashboard)
        if (location.pathname.startsWith('/attendance')) {
            return <Navigate to="/attendance/login" state={{ error: 'Acceso Restringido: Personal Autorizado' }} replace />
        }
        return <Navigate to="/dashboard" replace />
    }

    // 2. Nota: El backend ya bloquea las peticiones (503). 
    // Podríamos añadir un check de estado global aquí si el store tuviera el flag de mantenimiento.

    return children ? <>{children}</> : <Outlet />
}
