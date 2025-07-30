# 🍕 Foodify

A modern full-stack food ordering platform built with React and Laravel, featuring a modern UI, real-time cart management, and seamless order processing.

**Live Demo**: [https://foodify-f30o0p7xb-sachin-nks-projects.vercel.app/](https://foodify-f30o0p7xb-sachin-nks-projects.vercel.app/)

## ✨ Features

### 🎨 Frontend (React)
- **Modern UI/UX** - Clean, responsive design with smooth animations
- **🌙 Dark Mode Toggle** - Seamless light/dark theme switching with system preference detection
- **Restaurant Browsing** - Search and filter restaurants by cuisine, rating, and delivery time
- **Menu Exploration** - View detailed restaurant menus with item descriptions and pricing
- **Smart Cart Management** - Session-based cart with real-time updates
- **Order Tracking** - Track order status from preparation to delivery
- **User Authentication** - Login and registration system
- **Restaurant Management** - Complete restaurant owner dashboard with menu management
- **Interactive Chatbot** - Customer support with quick replies
- **Mobile Responsive** - Optimized for all device sizes
- **Accessibility Compliant** - WCAG AA standards with keyboard navigation and screen reader support

### 🚀 Backend (Laravel)
- **RESTful API** - Clean API architecture with proper HTTP methods
- **Database Management** - MySQL database with proper relationships
- **Session Handling** - Server-side cart management with cookies
- **Order Processing** - Complete order lifecycle management
- **Restaurant Owner System** - Multi-restaurant management with role-based access
- **Menu Management** - CRUD operations for restaurant menus and categories
- **Data Seeding** - Pre-populated restaurants and menu items
- **CORS Configuration** - Proper cross-origin resource sharing setup


## 📁 Project Structure

```
FoodOrderPlatform/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/          # Shadcn/ui components
│   │   │   ├── ThemeToggle.jsx # Dark mode toggle component
│   │   │   └── ...
│   │   ├── pages/           # Page components
│   │   │   ├── Home.jsx     # Landing page
│   │   │   ├── Browse.jsx   # Restaurant browsing
│   │   │   ├── Restaurant.jsx # Individual restaurant page
│   │   │   ├── RestaurantDashboard.jsx # Restaurant owner dashboard
│   │   │   ├── RestaurantMenu.jsx # Menu management
│   │   │   └── ...
│   │   ├── context/         # React context providers
│   │   │   ├── ThemeContext.jsx # Dark mode theme management
│   │   │   ├── AuthContext.jsx  # Authentication state
│   │   │   └── CartContext.jsx  # Shopping cart state
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions and API client
│   │   └── ...
│   ├── index.html
│   └── ...
├── backend/                  # Laravel application
│   ├── app/
│   │   ├── Http/Controllers/ # API controllers
│   │   │   └── Api/         # API-specific controllers
│   │   ├── Models/          # Eloquent models
│   │   ├── Middleware/      # Custom middleware
│   │   └── ...
│   ├── database/
│   │   ├── migrations/      # Database migrations
│   │   └── seeders/         # Database seeders
│   ├── routes/
│   │   └── api.php          # API routes
│   └── ...
├── .kiro/                   # Kiro IDE specifications
│   └── specs/               # Feature specifications
├── package.json             # Frontend dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **PHP** (v8.1 or higher)
- **Composer** (PHP package manager)
- **MySQL** (v8.0 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FoodOrderPlatform
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   composer install
   ```

4. **Environment Setup**
   ```bash
   # In the backend directory
   cp .env.example .env
   php artisan key:generate
   ```

5. **Database Configuration**
   
   Update your `.env` file in the backend directory:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=foodify_db
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```

6. **Create Database**
   ```sql
   CREATE DATABASE foodify_db;
   ```

7. **Run Migrations and Seeders**
   ```bash
   cd backend
   php artisan migrate
   php artisan db:seed
   ```

### 🏃‍♂️ Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   php artisan serve
   ```
   Backend will be available at: `http://127.0.0.1:8000`

2. **Start the Frontend Development Server**
   ```bash
   # In the root directory
   npm run dev
   ```
   Frontend will be available at: `http://localhost:5173` (or similar)

## 📚 API Documentation

### Base URL
```
http://127.0.0.1:8000/api
```

### Endpoints

#### Restaurants
- `GET /restaurants` - Get all restaurants with filtering
- `GET /restaurants/{id}` - Get specific restaurant
- `GET /restaurants/{id}/menu` - Get restaurant menu

#### Cart Management
- `GET /cart` - Get cart contents
- `POST /cart` - Add item to cart
- `PUT /cart/{itemId}` - Update cart item quantity
- `DELETE /cart/{itemId}` - Remove item from cart
- `DELETE /cart` - Clear entire cart

#### Orders
- `POST /orders` - Place new order
- `GET /orders/{orderNumber}` - Get order details
- `GET /orders/{orderNumber}/track` - Track order status

#### Restaurant Owner Management
- `GET /restaurant-owner/restaurants` - Get owned restaurants
- `POST /restaurant-owner/restaurants` - Create new restaurant
- `PUT /restaurant-owner/restaurants/{id}` - Update restaurant details
- `GET /restaurant-owner/restaurants/{id}/menu` - Get restaurant menu items
- `POST /restaurant-owner/restaurants/{id}/menu` - Add menu item
- `PUT /restaurant-owner/restaurants/{id}/menu/{itemId}` - Update menu item
- `DELETE /restaurant-owner/restaurants/{id}/menu/{itemId}` - Delete menu item

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/user` - Get authenticated user details

## 🎯 Key Features Explained

### 🌙 Dark Mode System
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

## 🔧 Development

### Available Scripts

#### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

#### Backend
```bash
php artisan serve           # Start development server
php artisan migrate        # Run database migrations
php artisan db:seed        # Seed database with sample data
php artisan migrate:fresh --seed  # Fresh migration with seeding
```


### Theme System Architecture

The dark mode system is built with:

#### ThemeContext (React Context)
```javascript
// Theme states: 'light', 'dark', 'system'
const { theme, effectiveTheme, toggleTheme, setTheme } = useTheme();
```

## 🚀 Deployment

### Frontend (Vite Build)
```bash
npm run build
```
Deploy the `dist/` folder to your web server.

### Backend (Laravel)
1. Set up production environment variables
2. Run migrations on production database
3. Configure web server (Apache/Nginx)
4. Set proper file permissions

### Environment Variables

#### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.com/api
```

#### Backend (.env)
```env
APP_NAME=Foodify
APP_ENV=production
APP_KEY=base64:your-app-key
APP_DEBUG=false
APP_URL=https://your-backend-url.com

DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_PORT=3306
DB_DATABASE=foodify_db
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=your-domain.com
SESSION_SECURE_COOKIES=true
```



## 🔧 Troubleshooting

### Common Issues

#### Frontend Development Server Issues
```bash
# If port 5173 is in use
npm run dev  # Vite will automatically try another port

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Backend Issues
```bash
# Clear Laravel cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Regenerate application key
php artisan key:generate

# Reset database
php artisan migrate:fresh --seed
```

#### Theme Not Switching
- Check browser console for JavaScript errors
- Ensure localStorage is enabled
- Clear browser cache and localStorage

#### CORS Issues
- Verify `FRONTEND_URL` in backend `.env`
- Check CORS middleware configuration
- Ensure credentials are included in API requests

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the existing code style and conventions
4. Add tests for new functionality
5. Ensure all tests pass
6. Update documentation as needed
7. Commit your changes (`git commit -m 'Add new feature'`)
8. Push to the branch (`git push origin feature`)
9. Open a Pull Request




