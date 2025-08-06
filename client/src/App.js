import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import all page components
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetail from './pages/ServiceDetail';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import BookingsPage from './pages/BookingsPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
