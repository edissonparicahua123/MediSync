import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import PatientsPage from '@/pages/patients/PatientsPage'
import PatientProfilePage from '@/pages/patients/PatientProfilePage'
import DoctorsPage from '@/pages/doctors/DoctorsPage'
import DoctorProfilePage from '@/pages/doctors/DoctorProfilePage'
import AppointmentsPage from '@/pages/appointments/AppointmentsPage'
import AppointmentDetailsPage from '@/pages/appointments/AppointmentDetailsPage'
import PharmacyPage from '@/pages/pharmacy/PharmacyPage'
import LaboratoryPage from '@/pages/laboratory/LaboratoryPage'
import BillingPage from '@/pages/billing/BillingPage'
import ReportsPage from '@/pages/reports/ReportsPage'
import AIPage from '@/pages/ai/AIPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import PublicScreenPage from '@/pages/PublicScreenPage'
import HRPage from '@/pages/hr/HRPage'
import EmergencyPage from '@/pages/emergency/EmergencyPage'
import EmergencyCaseProfilePage from '@/pages/emergency/EmergencyCaseProfilePage'
import BedManagementPage from '@/pages/beds/BedManagementPage'
import AdminPage from '@/pages/admin/AdminPage'
import MessagesPage from '@/pages/messages/MessagesPage'
import AnalyticsPage from '@/pages/analytics/AnalyticsPage'

function App() {
    return (
        <ThemeProvider defaultTheme="light" storageKey="medisync-theme">
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/public-screen" element={<PublicScreenPage />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/patients" element={<PatientsPage />} />
                            <Route path="/patients/:id" element={<PatientProfilePage />} />
                            <Route path="/doctors" element={<DoctorsPage />} />
                            <Route path="/doctors/:id" element={<DoctorProfilePage />} />
                            <Route path="/appointments" element={<AppointmentsPage />} />
                            <Route path="/appointments/:id" element={<AppointmentDetailsPage />} />
                            <Route path="/hr" element={<HRPage />} />
                            <Route path="/emergency" element={<EmergencyPage />} />
                            <Route path="/emergency/:id" element={<EmergencyCaseProfilePage />} />
                            <Route path="/beds" element={<BedManagementPage />} />
                            <Route path="/pharmacy" element={<PharmacyPage />} />
                            <Route path="/laboratory" element={<LaboratoryPage />} />
                            <Route path="/billing" element={<BillingPage />} />
                            <Route path="/reports" element={<ReportsPage />} />
                            <Route path="/analytics" element={<AnalyticsPage />} />
                            <Route path="/ai" element={<AIPage />} />
                            <Route path="/messages" element={<MessagesPage />} />
                            <Route path="/admin" element={<AdminPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                        </Route>
                    </Route>

                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
            <Toaster />
        </ThemeProvider>
    )
}

export default App
