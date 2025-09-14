import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Import contexts
import { SocketProvider } from './contexts/SocketContext';

// Import client pages
import HomePage from './pages/client/HomePage';
import ServicesPage from './pages/client/ServicesPage';
import ServiceDetail from './pages/client/ServiceDetail';
import BookingForm from './pages/client/BookingForm';
import BookingsPage from './pages/client/BookingsPage';
import ProfilePage from './pages/client/ProfilePage';
import LoginPage from './pages/client/LoginPage';
import RegisterPage from './pages/client/RegisterPage';

// Import provider pages
import Dashboard from './pages/provider/Dashboard';
import ProviderServicesPage from './pages/provider/ProviderServicesPage';
import ProviderMessagesPage from './pages/provider/ProviderMessagesPage';
import ProviderSchedulePage from './pages/provider/ProviderSchedulePage';
import ProviderReportsPage from './pages/provider/ProviderReportsPage';

// Import admin pages
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

// Import ProtectedRoute component
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';

function App() {
  return (
    <SocketProvider>
      <Router>
        <div className="App">
        <Routes>
          {/* Root path - redirect based on user role */}
          <Route path="/" element={<RoleBasedRedirect />} />
          
          {/* Public routes - no authentication required */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Customer/User routes - accessible by all authenticated users */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute allowedRoles={['customer', 'provider', 'admin']}>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/services" 
            element={
              <ProtectedRoute allowedRoles={['customer', 'provider', 'admin']}>
                <ServicesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/service/:id" 
            element={
              <ProtectedRoute allowedRoles={['customer', 'provider', 'admin']}>
                <ServiceDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/book-service/:id" 
            element={
              <ProtectedRoute allowedRoles={['customer', 'provider', 'admin']}>
                <BookingForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bookings" 
            element={
              <ProtectedRoute allowedRoles={['customer', 'provider', 'admin']}>
                <BookingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={['customer', 'provider', 'admin']}>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />

          {/* Provider routes - only accessible by providers (and admins for oversight) */}
          <Route 
            path="/provider" 
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/provider/services" 
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderServicesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/provider/messages" 
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderMessagesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/provider/schedule" 
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderSchedulePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/provider/reports" 
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderReportsPage />
              </ProtectedRoute>
            } 
          />

          {/* Admin routes - only accessible by admins */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsersPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/services" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminServicesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/bookings" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminBookingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/reviews" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReviewsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/reports" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReportsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/settings" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettingsPage />
              </ProtectedRoute>
            } 
          />

          {/* Backward compatibility redirect */}
          <Route path="/dashboard" element={<Navigate to="/provider" replace />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
    </SocketProvider>
  );
}

export default App;
