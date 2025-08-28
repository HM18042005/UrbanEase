# UrbanEase URL Structure & Routing Guide

## Overview
This document outlines the complete URL structure and routing configuration for the UrbanEase platform, organized by user type and functionality.

## Base URL Structure
```
Production: https://urbanease.com
Development: http://localhost:3000
API Base: http://localhost:5000/api
```

## 🌐 Public Routes (No Authentication Required)

### Landing & Authentication
| Route | Component | Purpose | File Location |
|-------|-----------|---------|---------------|
| `/` | LandingPage | Platform introduction and hero section | `client/src/pages/client/LandingPage.js` |
| `/login` | LoginPage | User authentication | `client/src/pages/client/LoginPage.js` |
| `/register` | RegisterPage | New user registration | `client/src/pages/client/RegisterPage.js` |

### Service Discovery
| Route | Component | Purpose | File Location |
|-------|-----------|---------|---------------|
| `/services` | ServicesPage | Browse all available services | `client/src/pages/client/ServicesPage.js` |
| `/services/:id` | ServiceDetail | Individual service details and booking | `client/src/pages/client/ServiceDetail.js` |
| `/services/category/:category` | ServicesPage | Filter services by category | `client/src/pages/client/ServicesPage.js` |

## 👥 Client/Customer Routes (Authentication Required)

### Dashboard & Profile
| Route | Component | Purpose | File Location |
|-------|-----------|---------|---------------|
| `/dashboard` | Dashboard | Customer main dashboard | `client/src/pages/client/Dashboard.js` |
| `/profile` | ProfilePage | User profile management | `client/src/pages/client/ProfilePage.js` |
| `/home` | HomePage | Service discovery homepage | `client/src/pages/client/HomePage.js` |

### Booking Management
| Route | Component | Purpose | File Location |
|-------|-----------|---------|---------------|
| `/bookings` | BookingsPage | View and manage bookings | `client/src/pages/client/BookingsPage.js` |
| `/bookings/:id` | BookingDetail | Individual booking details | `client/src/pages/client/BookingDetail.js` |
| `/book/:serviceId` | BookingForm | Create new booking | `client/src/pages/client/BookingForm.js` |

## 💼 Provider Routes (Provider Authentication Required)

### Provider Dashboard
| Route | Component | Purpose | File Location |
|-------|-----------|---------|---------------|
| `/provider` | ProviderDashboard | Provider main dashboard | `client/src/pages/provider/ProviderDashboard.js` |
| `/provider/messages` | ProviderMessagesPage | Customer communication hub | `client/src/pages/provider/ProviderMessagesPage.js` |
| `/provider/schedule` | ProviderSchedulePage | Availability management | `client/src/pages/provider/ProviderSchedulePage.js` |
| `/provider/services` | ProviderServicesPage | Service listings management | `client/src/pages/provider/ProviderServicesPage.js` |
| `/provider/reports` | ProviderReportsPage | Business analytics | `client/src/pages/provider/ProviderReportsPage.js` |

### Provider Management
| Route | Component | Purpose | File Location |
|-------|-----------|---------|---------------|
| `/provider/profile` | ProviderProfile | Provider profile settings | `client/src/pages/provider/ProviderProfile.js` |
| `/provider/earnings` | ProviderEarnings | Payment and earnings | `client/src/pages/provider/ProviderEarnings.js` |

## 🔧 Admin Routes (Admin Authentication Required)

### Admin Dashboard
| Route | Component | Purpose | File Location |
|-------|-----------|---------|---------------|
| `/admin` | AdminDashboard | Admin main dashboard | `client/src/pages/admin/AdminDashboard.js` |
| `/admin/users` | AdminUsersPage | User management | `client/src/pages/admin/AdminUsersPage.js` |
| `/admin/services` | AdminServicesPage | Service category management | `client/src/pages/admin/AdminServicesPage.js` |
| `/admin/bookings` | AdminBookingsPage | Platform booking oversight | `client/src/pages/admin/AdminBookingsPage.js` |
| `/admin/reviews` | AdminReviewsPage | Review moderation | `client/src/pages/admin/AdminReviewsPage.js` |
| `/admin/reports` | AdminReportsPage | Platform analytics | `client/src/pages/admin/AdminReportsPage.js` |
| `/admin/settings` | AdminSettingsPage | Platform configuration | `client/src/pages/admin/AdminSettingsPage.js` |

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Purpose | Controller |
|--------|----------|---------|------------|
| `POST` | `/api/auth/register` | User registration | `authController.js` |
| `POST` | `/api/auth/login` | User login | `authController.js` |
| `POST` | `/api/auth/logout` | User logout | `authController.js` |
| `GET` | `/api/auth/me` | Get current user | `authController.js` |

### Services
| Method | Endpoint | Purpose | Controller |
|--------|----------|---------|------------|
| `GET` | `/api/services` | Get all services | `serviceController.js` |
| `GET` | `/api/services/:id` | Get service by ID | `serviceController.js` |
| `GET` | `/api/services/category/:category` | Get services by category | `serviceController.js` |
| `POST` | `/api/services` | Create new service | `serviceController.js` |
| `PUT` | `/api/services/:id` | Update service | `serviceController.js` |
| `DELETE` | `/api/services/:id` | Delete service | `serviceController.js` |

### Bookings
| Method | Endpoint | Purpose | Controller |
|--------|----------|---------|------------|
| `GET` | `/api/bookings` | Get user bookings | `bookingController.js` |
| `GET` | `/api/bookings/:id` | Get booking by ID | `bookingController.js` |
| `POST` | `/api/bookings` | Create new booking | `bookingController.js` |
| `PUT` | `/api/bookings/:id` | Update booking | `bookingController.js` |
| `DELETE` | `/api/bookings/:id` | Cancel booking | `bookingController.js` |

### Users
| Method | Endpoint | Purpose | Controller |
|--------|----------|---------|------------|
| `GET` | `/api/users` | Get all users (admin) | `userController.js` |
| `GET` | `/api/users/:id` | Get user by ID | `userController.js` |
| `PUT` | `/api/users/:id` | Update user | `userController.js` |
| `DELETE` | `/api/users/:id` | Delete user (admin) | `userController.js` |

### Reviews
| Method | Endpoint | Purpose | Controller |
|--------|----------|---------|------------|
| `GET` | `/api/reviews` | Get all reviews | `reviewController.js` |
| `GET` | `/api/reviews/service/:serviceId` | Get service reviews | `reviewController.js` |
| `POST` | `/api/reviews` | Create review | `reviewController.js` |
| `PUT` | `/api/reviews/:id` | Update review | `reviewController.js` |
| `DELETE` | `/api/reviews/:id` | Delete review | `reviewController.js` |

### Messages
| Method | Endpoint | Purpose | Controller |
|--------|----------|---------|------------|
| `GET` | `/api/messages` | Get user messages | `messageController.js` |
| `POST` | `/api/messages` | Send message | `messageController.js` |
| `PUT` | `/api/messages/:id` | Mark as read | `messageController.js` |

## 🛡️ Route Protection

### Authentication Guards
```javascript
// Public routes - no authentication required
const publicRoutes = ['/', '/login', '/register', '/services', '/services/:id'];

// Client routes - requires user authentication
const clientRoutes = ['/dashboard', '/profile', '/bookings', '/home'];

// Provider routes - requires provider role
const providerRoutes = ['/provider/*'];

// Admin routes - requires admin role
const adminRoutes = ['/admin/*'];
```

### Role-Based Access
| User Type | Accessible Routes | Restrictions |
|-----------|------------------|--------------|
| **Guest** | Public routes only | Cannot access dashboard, bookings |
| **Client** | Public + Client routes | Cannot access provider/admin areas |
| **Provider** | Public + Client + Provider routes | Cannot access admin areas |
| **Admin** | All routes | Full platform access |

## 📱 URL Patterns & Query Parameters

### Search & Filtering
```
/services?category=cleaning&location=city&price_min=20&price_max=100
/services?search=house+cleaning&sort=rating&order=desc
```

### Pagination
```
/services?page=2&limit=10
/admin/users?page=1&limit=20
```

### Booking States
```
/bookings?status=pending
/bookings?status=completed
/provider/bookings?date=2025-08-28
```

## 🔄 Redirects & Navigation

### Authentication Redirects
- Unauthenticated access to protected routes → `/login`
- Successful login → Previous intended route or `/dashboard`
- Logout → `/`

### Role-Based Redirects
- Client accessing provider routes → `/dashboard`
- Provider accessing admin routes → `/provider`
- Admin login → `/admin`

## 🚀 Deep Linking Support

### Shareable URLs
```
/services/123 - Direct service link
/services/category/cleaning - Category filter link
/provider/reports?month=2025-08 - Provider monthly report
```

### Booking Flow URLs
```
/book/service-123 - Direct booking for service
/book/service-123?date=2025-08-28&time=14:00 - Pre-filled booking
```

## 📋 Implementation Notes

### React Router Configuration
```javascript
// Main routing structure in App.js
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  
  {/* Protected Client Routes */}
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  
  {/* Protected Provider Routes */}
  <Route path="/provider/*" element={<ProviderRoute><ProviderLayout /></ProviderRoute>} />
  
  {/* Protected Admin Routes */}
  <Route path="/admin/*" element={<AdminRoute><AdminLayout /></AdminRoute>} />
</Routes>
```

### Navigation Guards
- Authentication status checked on route change
- User role validated for protected areas
- Automatic redirects for unauthorized access

This URL structure provides clear organization, intuitive navigation, and proper security boundaries for all user types in the UrbanEase platform.
