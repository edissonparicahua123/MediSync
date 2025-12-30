import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Moon, Sun, LogOut, User } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import GlobalSearch from '@/components/GlobalSearch'
import NotificationCenter from '@/components/NotificationCenter'

export default function Header() {
    const user = useAuthStore((state) => state.user)
    const logout = useAuthStore((state) => state.logout)
    const navigate = useNavigate()
    const { theme, setTheme } = useTheme()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div>
                    <h2 className="text-lg font-semibold">
                        ¡Hola, {user?.firstName}!
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {({
                            'ADMIN': 'Administrador',
                            'DOCTOR': 'Doctor',
                            'NURSE': 'Enfermero/a',
                            'RECEPTIONIST': 'Recepcionista',
                            'LAB': 'Laboratorista',
                            'PHARMACY': 'Farmacéutico/a',
                            'HR': 'Recursos Humanos'
                        } as Record<string, string>)[(typeof user?.role === 'object' ? (user.role as any).name : user?.role) || ''] || (typeof user?.role === 'object' ? (user.role as any).name : user?.role) || 'Usuario'}
                    </p>
                </div>
            </div>

            <div className="flex-1 max-w-xl mx-4">
                <GlobalSearch />
            </div>

            <div className="flex items-center gap-2">
                <NotificationCenter />

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                    {theme === 'dark' ? (
                        <Sun className="h-5 w-5" />
                    ) : (
                        <Moon className="h-5 w-5" />
                    )}
                </Button>

                <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                </Button>

                <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </header>
    )
}

