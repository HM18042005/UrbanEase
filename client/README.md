# UrbanEase - Service Marketplace Application

A modern React.js application for connecting customers with service providers for various urban services like cleaning, handyman work, pet care, and more.

## 🚀 Features

### For Customers
- **Service Discovery**: Browse and search for services by category
- **Detailed Service Views**: View service details, provider information, and customer reviews
- **Easy Booking**: Simple booking process with flexible scheduling
- **User Authentication**: Secure login and registration system

### For Service Providers
- **Provider Dashboard**: Track earnings, manage bookings, and view performance metrics
- **Availability Management**: Control when you're available for new bookings
- **Customer Reviews**: Monitor feedback and maintain service quality
- **Earnings Analytics**: Visual charts showing income over time

### For Administrators
- **Admin Dashboard**: Comprehensive platform oversight and management
- **User Management**: Monitor user activity and platform usage
- **Performance Metrics**: Track platform growth and service popularity
- **Content Moderation**: Manage user feedback and platform content

## 📱 Pages & Components

### Pages Created

1. **LandingPage** (`/`)
   - **What**: Login and signup page with tab-based interface
   - **When**: First page users see when visiting the application
   - **Why**: Handles user authentication and registration
   - **Features**: Form validation, responsive design, user type selection

2. **HomePage** (`/home`)
   - **What**: Main dashboard with featured services and categories
   - **When**: Displayed after user login
   - **Why**: Provides easy access to services and helps users discover what they need
   - **Features**: Search functionality, featured services, service categories, quick stats

3. **ServicesPage** (`/services`)
   - **What**: Browse and filter services by category
   - **When**: Accessed from main navigation or search results
   - **Why**: Allows users to explore all available services with filtering
   - **Features**: Category tabs, search filtering, service grid display

4. **ServiceDetail** (`/service/:id`)
   - **What**: Detailed view of specific service with booking functionality
   - **When**: Accessed when user clicks on a service card
   - **Why**: Provides comprehensive service information and enables booking
   - **Features**: Image gallery, service details, provider info, customer reviews, booking form

5. **Dashboard** (`/dashboard`)
   - **What**: Service provider's business dashboard
   - **When**: Accessed by service providers to manage their business
   - **Why**: Provides business performance overview and service management
   - **Features**: Earnings charts, availability toggle, customer reviews, quick actions

6. **AdminDashboard** (`/admin`)
   - **What**: Administrative dashboard for platform management
   - **When**: Accessed by admin users for platform oversight
   - **Why**: Provides comprehensive platform metrics and management tools
   - **Features**: User statistics, activity monitoring, performance metrics, quick admin actions

### Components Created

1. **Header**
   - **What**: Navigation header with logo, menu, and user actions
   - **When**: Used on all pages except landing page
   - **Why**: Provides consistent navigation and branding
   - **Features**: Responsive menu, search functionality, profile dropdown

2. **ServiceCard**
   - **What**: Displays individual service information in card format
   - **When**: Used on home page and services page
   - **Why**: Provides consistent service display with action capabilities
   - **Features**: Service images, ratings, pricing, responsive design

## 🛠 Tech Stack

### Frontend
- **React.js 19.1.0**: Modern UI library for building user interfaces
- **React Router DOM**: Client-side routing for single-page application navigation
- **CSS3**: Custom styling with responsive design principles
- **Modern JavaScript (ES6+)**: Latest JavaScript features for clean, maintainable code

### Key Libraries Used
- **react-router-dom**: For handling navigation between pages
- **axios**: For making HTTP requests to the backend API (prepared for future integration)

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Navigate to the client directory**:
   ```bash
   cd client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** and visit `http://localhost:3000`

## 📱 Application Features & Design Decisions

This application demonstrates modern React.js development practices, responsive design principles, and creates a solid foundation for a real-world service marketplace platform.

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
