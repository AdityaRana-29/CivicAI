import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ReportDetail from './pages/ReportDetail';
import CreateReport from './pages/CreateReport';
import NotFound from './pages/NotFound';
import { Shield } from 'lucide-react';

// Loading screen
function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="mesh-bg" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center glow-blue float-anim">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-400 rounded-full"
          style={{ animation: 'spin 0.8s linear infinite' }} />
        <p className="text-[--text-secondary] text-sm">Loading CivicAI…</p>
      </div>
    </div>
  );
}

// Protected route wrapper
function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

// Home redirect based on role
function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'citizen') return <CitizenDashboard />;
  if (user.role === 'authority') return <AuthorityDashboard />;
  if (user.role === 'administrator') return <AdminDashboard />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <ErrorBoundary>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={!user ? <Login />    : <Navigate to="/" replace />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />

        {/* Home — role-based */}
        <Route path="/" element={<HomeRedirect />} />

        {/* Citizen */}
        <Route path="/report/new" element={
          <PrivateRoute roles={['citizen']}>
            <CreateReport />
          </PrivateRoute>
        } />

        {/* All authenticated users */}
        <Route path="/report/:id" element={
          <PrivateRoute>
            <ReportDetail />
          </PrivateRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}
