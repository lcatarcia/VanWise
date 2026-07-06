import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { CamperDetailPage } from './pages/CamperDetailPage'
import { CamperFormPage } from './pages/CamperFormPage'
import { CampersPage } from './pages/CampersPage'
import { ChecklistPage } from './pages/ChecklistPage'
import { ComparatorPage } from './pages/ComparatorPage'
import { DashboardPage } from './pages/DashboardPage'
import { FinancingPage } from './pages/FinancingPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="campers" element={<CampersPage />} />
        <Route path="campers/new" element={<CamperFormPage />} />
        <Route path="campers/:id" element={<CamperDetailPage />} />
        <Route path="campers/:id/edit" element={<CamperFormPage />} />
        <Route path="comparator" element={<ComparatorPage />} />
        <Route path="financing" element={<FinancingPage />} />
        <Route path="checklist" element={<ChecklistPage />} />
      </Route>
    </Routes>
  )
}

export default App
