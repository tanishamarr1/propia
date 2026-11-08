import { Navigate, Route, Routes } from 'react-router-dom'
import { configured } from '../lib/supabase'
import { useAuth } from '../features/auth/AuthProvider'
import LoginPage from '../features/auth/LoginPage'
import Onboarding from '../features/auth/Onboarding'
import Layout from '../components/Layout'
import DashboardPage from '../features/dashboard/DashboardPage'
import PropertiesPage from '../features/properties/PropertiesPage'
import PaymentsPage from '../features/payments/PaymentsPage'
import MaintenancePage from '../features/maintenance/MaintenancePage'
import TenantsPage from '../features/tenants/TenantsPage'
import ContractsPage from '../features/contracts/ContractsPage'
import SalesPage from '../features/sales/SalesPage'
import ReportsPage from '../features/reports/ReportsPage'
import DocumentsPage from '../features/documents/DocumentsPage'

export default function App() {
  const { session, loading, orgId } = useAuth()
  if (!configured) return (
    <div className="grid min-h-screen place-items-center bg-[#f5f5f7] p-6">
      <div className="card max-w-md text-center">
        <h1 className="text-xl font-bold">Falta configurar la conexión</h1>
        <p className="mt-2 text-[15px] text-slate-500">Agrega las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu hosting (Vercel → Settings → Environment Variables) y vuelve a desplegar.</p>
      </div>
    </div>
  )
  if (loading) return <div className="grid min-h-screen place-items-center text-slate-500">Cargando…</div>
  if (!session) return <LoginPage />
  if (!orgId) return <Onboarding />
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="propiedades" element={<PropertiesPage />} />
        <Route path="cobros" element={<PaymentsPage />} />
        <Route path="inquilinos" element={<TenantsPage />} />
        <Route path="contratos" element={<ContractsPage />} />
        <Route path="mantenimiento" element={<MaintenancePage />} />
        <Route path="ventas" element={<SalesPage />} />
        <Route path="reportes" element={<ReportsPage />} />
        <Route path="documentos" element={<DocumentsPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  )
}