import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RequireRole from './RequireRole';
import Login from '@/features/auth/pages/Login';
import ChangePassword from '@/features/auth/pages/ChangePassword';
import ForgotPassword from '@/features/auth/pages/ForgotPassword';
import AppLayout from '@/features/dashboard/layout/AppLayout';
import Welcome from '@/features/dashboard/pages/Welcome';
import Forbidden from './pages/Forbidden';
import OperationsPage from '@/features/operations/pages/OperationsPage';
import PromptTemplatesPage from '@/features/prompts/pages/PromptTemplatesPage';
import StyleLibrariesPage from '@/features/prompts/pages/StyleLibrariesPage';
import HintsPage from '@/features/prompts/pages/HintsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      {/* Admin-only routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RequireRole roles={["admin"]}>
              <AppLayout />
            </RequireRole>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/welcome" replace />} />
        <Route path="welcome" element={<Welcome />} />
        <Route path="operations" element={<OperationsPage />} />
        <Route path="prompt-templates" element={<PromptTemplatesPage />} />
        <Route path="style-libraries" element={<StyleLibrariesPage />} />
        <Route path="hints" element={<HintsPage />} />
      </Route>

      <Route path="/welcome" element={
        <ProtectedRoute>
          <RequireRole roles={["admin"]}>
            <Welcome />
          </RequireRole>
        </ProtectedRoute>
      } />

      <Route path="/forbidden" element={<Forbidden />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
