import { Routes, Route, Navigate } from 'react-router-dom'
import EntryPage from './pages/EntryPage.jsx'
import GalleryPage from './pages/GalleryPage.jsx'
import CaseDetailPage from './pages/CaseDetailPage.jsx'
import OwnerLayout from './pages/OwnerLayout.jsx'
import DesignerLayout from './pages/DesignerLayout.jsx'
import OwnerHome from './pages/OwnerHome.jsx'
import EstimatePage from './pages/EstimatePage.jsx'
import DesignPage from './pages/DesignPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import ProjectDetailPage from './pages/ProjectDetailPage.jsx'
import DesignerHome from './pages/DesignerHome.jsx'
import PlatformPage from './pages/PlatformPage.jsx'
import CooperationPage from './pages/CooperationPage.jsx'
import CoopFormPage from './pages/CoopFormPage.jsx'
import Mascot from './components/Mascot.jsx'

// Admin
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminLoginPage from './pages/AdminLoginPage.jsx'
import AdminSignupPage from './pages/AdminSignupPage.jsx'
import AdminLayout from './pages/AdminLayout.jsx'
import AdminDesignRequestsPage from './pages/AdminDesignRequestsPage.jsx'
import AdminEstimateRecordsPage from './pages/AdminEstimateRecordsPage.jsx'
import AdminProjectsPage from './pages/AdminProjectsPage.jsx'
import AdminCoopApplicationsPage from './pages/AdminCoopApplicationsPage.jsx'

export default function App() {
  return (
    <div className="app-frame">
      <Routes>
        {/* 入口頁 */}
        <Route path="/" element={<EntryPage />} />

        {/* 我喜歡的家（獨立，不需登入） */}
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/gallery/:caseId" element={<CaseDetailPage />} />

        {/* 屋主端 */}
        <Route path="/owner" element={<OwnerLayout />}>
          <Route index element={<OwnerHome />} />
          <Route path="estimate" element={<EstimatePage />} />
          <Route path="design" element={<DesignPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
        </Route>

        {/* 設計師端 */}
        <Route path="/designer" element={<DesignerLayout />}>
          <Route index element={<DesignerHome />} />
          <Route path="platform" element={<PlatformPage />} />
          <Route path="cooperation" element={<CooperationPage />} />
          <Route path="cooperation/apply" element={<CoopFormPage />} />
        </Route>

        {/* Admin 後台 */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/signup" element={<AdminSignupPage />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDesignRequestsPage />} />
          <Route path="estimates" element={<AdminEstimateRecordsPage />} />
          <Route path="projects" element={<AdminProjectsPage />} />
          <Route path="coop" element={<AdminCoopApplicationsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* 吉祥物精靈 — 全站飄浮（admin 隱藏）*/}
      <Mascot />
    </div>
  )
}
