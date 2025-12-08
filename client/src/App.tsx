import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import PatientsPage from '@/pages/patients/PatientsPage'
import DoctorsPage from '@/pages/doctors/DoctorsPage'
import AppointmentsPage from '@/pages/appointments/AppointmentsPage'
import PharmacyPage from '@/pages/pharmacy/PharmacyPage'
import LaboratoryPage from '@/pages/laboratory/LaboratoryPage'
import BillingPage from '@/pages/billing/BillingPage'
import ReportsPage from '@/pages/reports/ReportsPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import AIPage from '@/pages/ai/AIPage'
import PublicScreenPage from '@/pages/PublicScreenPage'
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="medisync-theme">
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/public-screen" element={<PublicScreenPage />} />

                    {/* Protected routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/patients" element={<PatientsPage />} />
                            <Route path="/doctors" element={<DoctorsPage />} />
                            <Route path="/appointments" element={<AppointmentsPage />} />
                            <Route path="/pharmacy" element={<PharmacyPage />} />
                            <Route path="/laboratory" element={<LaboratoryPage />} />
                            <Route path="/billing" element={<BillingPage />} />
                            <Route path="/reports" element={<ReportsPage />} />
                            <Route path="/ai" element={<AIPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                        </Route>
                    </Route>
                </Routes>
                <Toaster />
            </BrowserRouter>
        </ThemeProvider>
    )
}

export default App
