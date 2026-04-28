import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Login } from './pages/Login'
import { LandingPage } from './pages/LandingPage'
import { Menu } from './pages/Menu'
import { Cart } from './pages/Cart'
import { Payment } from './pages/Payment'
import { Orders } from './pages/Orders'
import { VendorDashboard } from './pages/VendorDashboard'
import { Tracking } from './pages/Tracking'
import { useAuth } from './hooks/useAuth'
import ClickSpark from '@/components/Effects/ClickSpark'
import { useEffect } from 'react'
import { apiClient } from './services/api/client'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/menu" replace />;
  }
  return children;
};

function App() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    const helloWorldApi = async () => {
      try {
        const data = await apiClient('/');
        console.log('API Status:', data.status);
      } catch (e) {
        console.error('API connection failed:', e);
      }
    };
    helloWorldApi();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {isAuthenticated && <Navbar />}
        <ClickSpark
          sparkColor="#f97316"
          sparkSize={10}
          sparkRadius={15}
          sparkCount={8}
          duration={400}
        >
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={isAuthenticated ? <Navigate to="/menu" replace /> : <Login />} />
              <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/vendor" element={<ProtectedRoute requireAdmin={true}><VendorDashboard /></ProtectedRoute>} />
              <Route path="/tracking/:id" element={<ProtectedRoute><Tracking /></ProtectedRoute>} />
            </Routes>
          </div>
        </ClickSpark>
      </div>
    </Router>
  )
}

export default App
