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
import AnalyticsPage from '@/pages/analytics/AnalyticsPage'
import WaitingRoomPage from '@/pages/waiting-room/WaitingRoomPage'
import { AttendanceLayout } from '@/components/attendance/AttendanceLayout'
import AttendancePage from '@/pages/attendance/AttendancePage'
import EmergencyPage from '@/pages/emergency/EmergencyPage'
import EmergencyCaseProfilePage from '@/pages/emergency/EmergencyCaseProfilePage'
import BedManagementPage from '@/pages/beds/BedManagementPage'
import AdminPage from '@/pages/admin/AdminPage'
import AuditLogsPage from '@/pages/admin/AuditLogsPage'
import MessagesPage from '@/pages/messages/MessagesPage'

// Patient Portal imports
import PatientLoginPage from '@/pages/patient-portal/PatientLoginPage'
import PatientDashboardPage from '@/pages/patient-portal/PatientDashboardPage'
import PatientAppointmentsPage from '@/pages/patient-portal/PatientAppointmentsPage'
import PatientMedicalHistoryPage from '@/pages/patient-portal/PatientMedicalHistoryPage'
import PatientLabResultsPage from '@/pages/patient-portal/PatientLabResultsPage'
import PatientBillingPage from '@/pages/patient-portal/PatientBillingPage'
import PatientProfilePagePortal from '@/pages/patient-portal/PatientProfilePage'
import PatientPortalLayout from '@/components/patient-portal/PatientPortalLayout'

import AttendanceLoginPage from '@/pages/attendance/AttendanceLoginPage'

function App() {
    return (
        <ThemeProvider defaultTheme="light" storageKey="medisync-theme">
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/attendance/login" element={<AttendanceLoginPage />} />
                    <Route path="/public-screen" element={<PublicScreenPage />} />

                    {/* Patient Portal Routes */}
                    <Route path="/patient-portal/login" element={<PatientLoginPage />} />
                    <Route path="/patient-portal/*" element={
                        <PatientPortalLayout>
                            <Routes>
                                <Route path="dashboard" element={<PatientDashboardPage />} />
                                <Route path="appointments" element={<PatientAppointmentsPage />} />
                                <Route path="history" element={<PatientMedicalHistoryPage />} />
                                <Route path="lab-results" element={<PatientLabResultsPage />} />
                                <Route path="billing" element={<PatientBillingPage />} />
                                <Route path="profile" element={<PatientProfilePagePortal />} />
                            </Routes>
                        </PatientPortalLayout>
                    } />

                    {/* Attendance Portal Context (Standalone) */}

                    <Route path="/attendance/*" element={
                        <ProtectedRoute allowedRoles={['HR', 'ADMIN']}>
                            <AttendanceLayout>
                                <Routes>
                                    <Route path="/" element={<AttendancePage />} />
                                    <Route path="ops" element={<AttendancePage />} />
                                    <Route path="shifts" element={<AttendancePage />} />
                                    <Route path="payroll" element={<AttendancePage />} />
                                    <Route path="staff" element={<AttendancePage />} />
                                    <Route path="rules" element={<AttendancePage />} />
                                    <Route path="audit" element={<AttendancePage />} />
                                    <Route path="settings" element={<AttendancePage />} />
                                </Routes>
                            </AttendanceLayout>
                        </ProtectedRoute>
                    } />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/patients" element={<PatientsPage />} />
                            <Route path="/patients/:id" element={<PatientProfilePage />} />
                            <Route path="/doctors" element={<DoctorsPage />} />
                            <Route path="/doctors/:id" element={<DoctorProfilePage />} />
                            <Route path="/appointments" element={<AppointmentsPage />} />
                            <Route path="/appointments/:id" element={<AppointmentDetailsPage />} />
                            <Route path="/waiting-room" element={<WaitingRoomPage />} />
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
                            <Route path="/admin/audit" element={<AuditLogsPage />} />
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
