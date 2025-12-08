import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Moon, Sun, LogOut, User } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

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
            <div>
                <h2 className="text-lg font-semibold">
                    Welcome back, {user?.firstName}!
                </h2>
                <p className="text-sm text-muted-foreground">
                    {user?.role?.name || 'User'}
                </p>
            </div>

            <div className="flex items-center gap-2">
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
