import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ReportDetail from './pages/ReportDetail';
import CreateReport from './pages/CreateReport';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              {user?.role === 'citizen' && <CitizenDashboard />}
              {user?.role === 'authority' && <AuthorityDashboard />}
              {user?.role === 'administrator' && <AdminDashboard />}
            </PrivateRoute>
          }
        />

        <Route
          path="/report/new"
          element={
            <PrivateRoute roles={['citizen']}>
              <CreateReport />
            </PrivateRoute>
          }
        />

        <Route
          path="/report/:id"
          element={
            <PrivateRoute>
              <ReportDetail />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
