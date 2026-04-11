import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Tiers from './pages/TiersPage';
import Debts from './pages/DebtsPage';
import Voiture from './pages/VoiturePage';
import Charges from './pages/ChargesPage';
import Maintenance from './pages/MaintenancePage';
import Notifications from './pages/NotificationsPage';
import { useAuth } from './context/AuthContext.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2196F3]"></div>
      </div>
    );
  }

  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Application Routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/tiers" element={<ProtectedRoute><Tiers /></ProtectedRoute>} />
        <Route path="/debts" element={<ProtectedRoute><Debts /></ProtectedRoute>} />
        <Route path="/voiture" element={<ProtectedRoute><Voiture /></ProtectedRoute>} />
        <Route path="/voiture_maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
        <Route path="/charges" element={<ProtectedRoute><Charges /></ProtectedRoute>} /> 
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}