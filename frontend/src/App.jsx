import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
// import Tiers from './pages/Tiers';
// import Debts from './pages/Debts';
// import Voiture from './pages/Voiture';
// import Charges from './pages/Charges';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Protected Application Routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        {/* <Route path="/tiers" element={<ProtectedRoute><Tiers /></ProtectedRoute>} />
        <Route path="/debts" element={<ProtectedRoute><Debts /></ProtectedRoute>} />
        <Route path="/voiture" element={<ProtectedRoute><Voiture /></ProtectedRoute>} />
        <Route path="/charges" element={<ProtectedRoute><Charges /></ProtectedRoute>} /> 
        */}
      </Routes>
    </Router>
  );
}