// React 17+ JSX runtime: no explicit React import needed
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import { SocketProvider } from './contexts/SocketContext';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import BookingsPage from './pages/client/BookingsPage';
import BookService from './pages/client/BookService';
import HomePage from './pages/client/HomePage';
import LoginPage from './pages/client/LoginPage';
import MessagesPage from './pages/client/MessagesPage';
import ProfilePage from './pages/client/ProfilePage';
import RegisterPage from './pages/client/RegisterPage';
import ServiceDetail from './pages/client/ServiceDetail';
import ServicesPage from './pages/client/ServicesPage';
import Dashboard from './pages/provider/Dashboard';
import ProviderBookingsPage from './pages/provider/ProviderBookingsPage';
import ProviderMessagesPage from './pages/provider/ProviderMessagesPage';
import ProviderSchedulePage from './pages/provider/ProviderSchedulePage';
import ProviderServicesPage from './pages/provider/ProviderServicesPage';

const App = () => {
  return (
    <SocketProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
                  <BookService />
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
            <Route
              path="/messages"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <MessagesPage />
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
              path="/provider/bookings"
              element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <ProviderBookingsPage />
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
};

export default App;
