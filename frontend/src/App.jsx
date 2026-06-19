import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminProducts from './pages/AdminProducts';
import AdminInventory from './pages/AdminInventory';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-amber-50/20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-600 mx-auto"></div>
          <p className="text-coffee-800 text-sm font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but keep current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to home if user does not have permission
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout Wrapper to render Sidebar conditionally
const LayoutWrapper = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Pages that do NOT show the sidebar
  const noSidebarPaths = ['/', '/login', '/register', '/forgot-password'];
  const showSidebar = user && !noSidebarPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        {showSidebar && <Sidebar role={user.role} />}
        <main className="flex-1 flex flex-col min-w-0">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Customer Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/menu" element={
              <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
                <Menu />
              </ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
                <Cart />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
                <Orders />
              </ProtectedRoute>
            } />

            {/* Admin Protected Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <AdminOrders />
              </ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <AdminProducts />
              </ProtectedRoute>
            } />
            <Route path="/admin/inventory" element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <AdminInventory />
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      {/* AI Chatbot Widget for customers */}
      {user && user.role === 'ROLE_CUSTOMER' && <Chatbot />}
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <LayoutWrapper />
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
