# 🍕 Foodify

A modern full-stack food ordering platform built with React and Laravel, featuring a modern UI, real-time cart management, and seamless order processing.

## ✨ Features

### 🎨 Frontend (React)
- **Modern UI/UX** - Clean, responsive design with smooth animations
- **Restaurant Browsing** - Search and filter restaurants by cuisine, rating, and delivery time
- **Menu Exploration** - View detailed restaurant menus with item descriptions and pricing
- **Smart Cart Management** - Session-based cart with real-time updates
- **Order Tracking** - Track order status from preparation to delivery
- **User Authentication** - Login and registration system
- **Interactive Chatbot** - Customer support with quick replies
- **Mobile Responsive** - Optimized for all device sizes

### 🚀 Backend (Laravel)
- **RESTful API** - Clean API architecture with proper HTTP methods
- **Database Management** - MySQL database with proper relationships
- **Session Handling** - Server-side cart management with cookies
- **Order Processing** - Complete order lifecycle management
- **Data Seeding** - Pre-populated restaurants and menu items
- **CORS Configuration** - Proper cross-origin resource sharing setup

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Query** - Server state management
- **Wouter** - Lightweight routing
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

### Backend
- **Laravel 10** - PHP web framework
- **MySQL** - Relational database
- **Eloquent ORM** - Database abstraction layer
- **Laravel Sanctum** - API authentication
- **CORS Middleware** - Cross-origin request handling

## 📁 Project Structure

```
FoodOrderPlatform/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions and API client
│   │   └── ...
│   ├── index.html
│   └── ...
├── backend/                  # Laravel application
│   ├── app/
│   │   ├── Http/Controllers/ # API controllers
│   │   ├── Models/          # Eloquent models
│   │   └── ...
│   ├── database/
│   │   ├── migrations/      # Database migrations
│   │   └── seeders/         # Database seeders
│   ├── routes/
│   │   └── api.php          # API routes
│   └── ...
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

## 🎯 Key Features Explained

### Session-Based Cart
- Cart data is stored server-side using Laravel sessions
- Persistent across page reloads without requiring user login
- Automatic cart synchronization between frontend and backend

### Real-Time Order Tracking
- Order status updates from "pending" to "delivered"
- Visual progress indicators
- Estimated delivery time calculations

### Responsive Design
- Mobile-first approach
- Smooth animations and transitions
- Touch-friendly interface

### Search & Filtering
- Real-time restaurant search
- Filter by cuisine type, rating, and delivery time
- Debounced search for optimal performance

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

### Code Style
- **Frontend**: ESLint + Prettier configuration
- **Backend**: PSR-12 PHP coding standards
- **Database**: Laravel naming conventions

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

