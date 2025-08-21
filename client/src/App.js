import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import all page components
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetail from './pages/ServiceDetail';
import Dashboard from './pages/Dashboard';
import ProviderServicesPage from './pages/ProviderServicesPage';
import ProviderMessagesPage from './pages/ProviderMessagesPage';
import ProviderSchedulePage from './pages/ProviderSchedulePage';
import ProviderReportsPage from './pages/ProviderReportsPage';
import AdminDashboard from './pages/AdminDashboard';
import BookingsPage from './pages/BookingsPage';
import ProfilePage from './pages/ProfilePage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminServicesPage from './pages/AdminServicesPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminReviewsPage from './pages/AdminReviewsPage';
import AdminReportsPage from './pages/AdminReportsPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          {/* Provider routes */}
          <Route path="/provider" element={<Dashboard />} />
          <Route path="/provider/services" element={<ProviderServicesPage />} />
          <Route path="/provider/messages" element={<ProviderMessagesPage />} />
          <Route path="/provider/schedule" element={<ProviderSchedulePage />} />
          <Route path="/provider/reports" element={<ProviderReportsPage />} />
          {/* Backward compatibility redirect */}
          <Route path="/dashboard" element={<Navigate to="/provider" replace />} />
          <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/services" element={<AdminServicesPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/reviews" element={<AdminReviewsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
