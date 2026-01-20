# Foodify

A modern full-stack food ordering platform built with React and Laravel, featuring a modern UI, real-time cart management, and seamless order processing.


##  Features

###  Frontend (React)
- **Modern UI/UX** - Clean, responsive design with smooth animations
- **Dark Mode Toggle** - Seamless light/dark theme switching with system preference detection
- **Restaurant Browsing** - Search and filter restaurants by cuisine, rating, and delivery time
- **Menu Exploration** - View detailed restaurant menus with item descriptions and pricing
- **Smart Cart Management** - Session-based cart with real-time updates
- **Order Tracking** - Track order status from preparation to delivery
- **User Authentication** - Login and registration system
- **Restaurant Management** - Complete restaurant owner dashboard with menu management
- **Interactive Chatbot** - Customer support with quick replies
- **Mobile Responsive** - Optimized for all device sizes
- **Accessibility Compliant** - WCAG AA standards with keyboard navigation and screen reader support

###  Backend (Laravel)
- **RESTful API** - Clean API architecture with proper HTTP methods
- **Database Management** - MySQL database with proper relationships
- **Session Handling** - Server-side cart management with cookies
- **Order Processing** - Complete order lifecycle management
- **Restaurant Owner System** - Multi-restaurant management with role-based access
- **Menu Management** - CRUD operations for restaurant menus and categories
- **Data Seeding** - Pre-populated restaurants and menu items
- **CORS Configuration** - Proper cross-origin resource sharing setup



## Features

### Dark Mode System
- **Seamless Theme Switching** - Toggle between light and dark modes with smooth transitions
- **System Preference Detection** - Automatically detects and respects user's OS theme preference
- **Persistent Settings** - Theme preference saved in localStorage across sessions
- **WCAG AA Compliant** - All color combinations meet accessibility standards
- **Performance Optimized** - GPU-accelerated transitions with minimal repaints

### Session-Based Cart
- Cart data is stored server-side using Laravel sessions
- Persistent across page reloads without requiring user login
- Automatic cart synchronization between frontend and backend

### Restaurant Management System
- **Multi-Role Support** - Customers, restaurant owners, and administrators
- **Restaurant Dashboard** - Complete management interface for restaurant owners
- **Menu Management** - CRUD operations for menu items, categories, and pricing
- **Real-time Updates** - Instant menu changes and availability updates

### Real-Time Order Tracking
- Order status updates from "pending" to "delivered"
- Visual progress indicators
- Estimated delivery time calculations

### Responsive Design
- Mobile-first approach
- Smooth animations and transitions
- Touch-friendly interface
- Optimized for all screen sizes

### Search & Filtering
- Real-time restaurant search
- Filter by cuisine type, rating, and delivery time
- Debounced search for optimal performance

### Accessibility Features
- **Keyboard Navigation** - Full keyboard support for all interactive elements
- **Screen Reader Support** - Proper ARIA labels and semantic HTML
- **High Contrast Support** - Enhanced visibility for users with visual impairments
- **Reduced Motion Support** - Respects user's motion preferences


