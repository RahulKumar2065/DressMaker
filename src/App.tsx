import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import CustomerDashboard from './pages/customer/Dashboard';
import TailorDetail from './pages/customer/TailorDetail';
import VirtualTryOn from './pages/customer/VirtualTryOn';
import Measurements from './pages/customer/Measurements';
import OrderDetail from './pages/customer/OrderDetail';

import TailorDashboard from './pages/tailor/Dashboard';

import AdminDashboard from './pages/admin/Dashboard';

import Chat from './pages/Chat';

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/customer/*"
          element={
            <ProtectedRoute requiredRole="customer">
              <div>
                <Navbar />
                <Routes>
                  <Route path="dashboard" element={<CustomerDashboard />} />
                  <Route path="tailor/:id" element={<TailorDetail />} />
                  <Route path="try-on" element={<VirtualTryOn />} />
                  <Route path="measurements" element={<Measurements />} />
                  <Route path="orders/:orderId" element={<OrderDetail />} />
                  <Route path="*" element={<Navigate to="/customer/dashboard" replace />} />
                </Routes>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:conversationId"
          element={
            <ProtectedRoute>
              <div>
                <Navbar />
                <Chat />
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tailor/*"
          element={
            <ProtectedRoute requiredRole="tailor">
              <div>
                <Navbar />
                <Routes>
                  <Route path="dashboard" element={<TailorDashboard />} />
                  <Route path="*" element={<Navigate to="/tailor/dashboard" replace />} />
                </Routes>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <div>
                <Navbar />
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </div>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
