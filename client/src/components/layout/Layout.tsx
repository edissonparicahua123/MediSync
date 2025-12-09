import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useAuthStore } from '@/stores/authStore'

export default function Layout() {
    const user = useAuthStore((state) => state.user)

    return (
        <div className="flex h-screen bg-background">
            <Sidebar userRole={user?.role || 'ADMIN'} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
