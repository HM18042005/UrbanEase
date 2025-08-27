# UrbanEase API Documentation

## Base URL
`http://localhost:5000/api`

## Authentication
Most endpoints require authentication via JWT token sent in cookies or Authorization header as `Bearer <token>`.

## Response Format
All responses follow this format:
```json
{
  "success": true/false,
  "message": "Description",
  "data": {}, // actual response data
  "pagination": {} // for paginated responses
}
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer" // customer, provider, admin
}
```

### POST /auth/login
Login user
**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### POST /auth/logout
Logout user (clears JWT cookie)

### GET /auth/me
Get current user info (requires auth)

### PUT /auth/update-password
Update user password
**Body:**
```json
{
  "currentPassword": "oldpass",
  "newPassword": "newpass"
}
```

### POST /auth/forgot-password
Request password reset
**Body:**
```json
{
  "email": "john@example.com"
}
```

### POST /auth/reset-password/:token
Reset password with token
**Body:**
```json
{
  "password": "newpassword"
}
```

---

## Profile Endpoints

### GET /profile
Get current user profile (requires auth)

### PUT /profile
Update current user profile
**Body:**
```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "dateOfBirth": "1990-01-01",
  "bio": "Professional service provider"
}
```

---

## Service Endpoints

### GET /services
Get all services with filtering and pagination
**Query params:**
- `category` - Filter by category
- `location` - Filter by location
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `search` - Search in title/description
- `sortBy` - Sort by field (createdAt, price, rating)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### GET /services/categories
Get all service categories

### GET /services/search
Advanced search for services
**Query params:**
- `q` - Search query
- `category` - Filter by category
- `location` - Filter by location
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `rating` - Minimum rating
- `sortBy` - Sort by (relevance, price-low, price-high, rating, newest)

### GET /services/popular
Get popular services
**Query params:**
- `limit` - Number of services (default: 8)

### GET /services/:id
Get single service by ID

### POST /services
Create new service (providers only)
**Body:**
```json
{
  "title": "House Cleaning",
  "description": "Professional house cleaning service",
  "price": 100,
  "category": "Cleaning",
  "location": "New York"
}
```

### PUT /services/:id
Update service (provider - own services only)

### DELETE /services/:id
Delete service (provider - own services only)

### GET /services/provider/stats
Get service statistics for current provider (requires auth)

### GET /services/provider/my-services
Get current provider's services (requires auth)

### GET /services/provider/:providerId
Get services by specific provider ID

### PATCH /services/:id/toggle-availability
Toggle service availability (provider only)

---

## Booking Endpoints

### GET /bookings/available-slots
Get available time slots for a service
**Query params:**
- `serviceId` - Service ID (required)
- `date` - Date in YYYY-MM-DD format (required)

### GET /bookings
Get user's bookings with filtering
**Query params:**
- `status` - Filter by status
- `role` - customer or provider
- `page` - Page number
- `limit` - Items per page

### GET /bookings/stats
Get booking statistics for dashboard
**Query params:**
- `role` - customer or provider

### GET /bookings/upcoming
Get upcoming bookings
**Query params:**
- `role` - customer or provider
- `limit` - Number of bookings

### GET /bookings/history
Get booking history (completed/cancelled)
**Query params:**
- `role` - customer or provider
- `page` - Page number
- `limit` - Items per page

### GET /bookings/:id
Get single booking by ID

### POST /bookings
Create new booking (customers only)
**Body:**
```json
{
  "serviceId": "service_id",
  "date": "2024-01-15T10:00:00Z",
  "address": "123 Service Address"
}
```

### PUT /bookings/:id/status
Update booking status
**Body:**
```json
{
  "status": "confirmed" // pending, confirmed, completed, cancelled
}
```

### PUT /bookings/:id/cancel
Cancel booking

### PUT /bookings/:id/reschedule
Reschedule booking
**Body:**
```json
{
  "newDate": "2024-01-20T14:00:00Z"
}
```

---

## Review Endpoints

### GET /reviews/service/:serviceId
Get reviews for a service
**Query params:**
- `page` - Page number
- `limit` - Items per page
- `sortBy` - Sort by (newest, oldest, rating-high, rating-low)

### GET /reviews/user
Get current user's reviews

### GET /reviews/provider
Get reviews for provider's services

### GET /reviews/recent
Get recent reviews (admin only)

### GET /reviews/:id
Get single review by ID

### POST /reviews
Create new review (customers only, requires completed booking)
**Body:**
```json
{
  "serviceId": "service_id",
  "rating": 5,
  "comment": "Excellent service!"
}
```

### PUT /reviews/:id
Update review (own reviews only)

### DELETE /reviews/:id
Delete review (own reviews only)

---

## Message Endpoints

### GET /messages/conversations
Get list of conversations

### GET /messages/user/:userId
Get messages with specific user
**Query params:**
- `page` - Page number
- `limit` - Items per page

### GET /messages/booking/:bookingId
Get messages for specific booking

### GET /messages/unread-count
Get unread message count

### GET /messages/search
Search messages
**Query params:**
- `query` - Search term
- `userId` - Filter by user
- `page` - Page number
- `limit` - Items per page

### POST /messages
Send message
**Body:**
```json
{
  "receiverId": "user_id",
  "content": "Hello there!",
  "bookingId": "booking_id" // optional
}
```

### PUT /messages/:messageId/read
Mark message as read

### PUT /messages/user/:userId/read-all
Mark all messages from user as read

### DELETE /messages/:messageId
Delete message (sender only)

---

## User Endpoints

### GET /users/search
Search users
**Query params:**
- `query` - Search term (name, email)
- `role` - Filter by role (customer, provider, admin)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### GET /users/providers
Get all service providers with enhanced data
**Query params:**
- `category` - Filter by service category
- `location` - Filter by provider location
- `rating` - Minimum rating filter
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)

### GET /users/:id
Get user profile by ID (includes services, stats for providers)

### GET /users/me/dashboard
Get current user's dashboard data (requires auth)
- For providers: services, recent bookings, reviews, upcoming bookings
- For customers: recent bookings, reviews, upcoming bookings

### GET /users/me/stats
Get current user's statistics (requires auth)
- For providers: service stats, booking stats, revenue, ratings
- For customers: booking history, spending, review stats

### GET /users/me/notifications
Get user notifications (requires auth)

### PUT /users/me/profile
Update current user's profile (requires auth)
**Body:**
```json
{
  "name": "Updated Name",
  "phone": "+1234567890",
  "address": "New Address",
  "city": "New City",
  "state": "NY",
  "zipCode": "10001",
  "bio": "Updated bio"
}
```

---

## Admin Endpoints

### GET /admin/dashboard
Get admin dashboard statistics

### GET /admin/users
Get all users with filtering
**Query params:**
- `role` - Filter by role
- `search` - Search term
- `sortBy` - Sort field
- `order` - asc or desc
- `page` - Page number
- `limit` - Items per page

### GET /admin/users/:userId
Get detailed user information

### PUT /admin/users/:userId
Update user (admin only)

### DELETE /admin/users/:userId
Deactivate user

### PUT /admin/users/:userId/reactivate
Reactivate user

### GET /admin/services
Get all services with admin controls

### DELETE /admin/services/:serviceId
Delete service (admin only)

### GET /admin/bookings
Get all bookings with filtering

### PUT /admin/bookings/:bookingId/status
Update booking status (admin only)

### GET /admin/analytics
Get platform analytics
**Query params:**
- `period` - 7d, 30d, 90d, 1y

### GET /admin/reports
Get system reports
**Query params:**
- `type` - summary, users, bookings, revenue, services
- `startDate` - Start date
- `endDate` - End date

---

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Rate Limiting
API implements rate limiting to prevent abuse. Current limits:
- General endpoints: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes

## Pagination
Paginated responses include:
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```
