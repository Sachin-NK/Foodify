// Main routing and component imports
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";

// UI Component imports
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Context providers for global state management
import { CartProvider } from "./context/CartContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ChatProvider } from "./context/ChatContext.jsx";

// Core components
import ErrorBoundary from "./components/ErrorBoundary.jsx";
// Page components
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Browse from "@/pages/Browse";
import Restaurant from "@/pages/Restaurant";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import TrackOrder from "@/pages/TrackOrder";
import Orders from "@/pages/Orders";

// Authentication pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Admin and restaurant management pages
import Admin from "@/pages/Admin";
import RestaurantRegister from "@/pages/RestaurantRegister";
import RestaurantDashboard from "@/pages/RestaurantDashboard";
import RestaurantMenu from "@/pages/RestaurantMenu";

// Layout and interactive components
import Navbar from "@/components/Navbar";
import Chatbot from "@/components/Chatbot.jsx";

/**
 * Router component - Defines all application routes
 * Handles navigation between different pages and components
 */
function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/browse" component={Browse} />
      <Route path="/restaurant/:id" component={Restaurant} />
      
      {/* Shopping and order routes */}
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/orders" component={Orders} />
      <Route path="/track-order/:id?" component={TrackOrder} />
      
      {/* Authentication routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Admin and restaurant management routes */}
      <Route path="/admin" component={Admin} />
      <Route path="/restaurant-register" component={RestaurantRegister} />
      <Route path="/restaurant-dashboard/:id" component={RestaurantDashboard} />
      <Route path="/restaurant-menu/:restaurantId" component={RestaurantMenu} />
      
      {/* 404 fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * Main App component - Root component that wraps the entire application
 * Sets up all context providers and global components
 */
function App() {
  return (
    <ErrorBoundary>
      {/* React Query for server state management */}
      <QueryClientProvider client={queryClient}>
        {/* UI tooltip provider for enhanced UX */}
        <TooltipProvider>
          {/* Theme context for dark/light mode */}
          <ThemeProvider>
            {/* Authentication context for user management */}
            <AuthProvider>
              {/* Shopping cart context for cart state */}
              <CartProvider>
                {/* AI chatbot context for customer support */}
                <ChatProvider>
                  <div className="min-h-screen bg-background text-foreground theme-transition">
                    {/* Global navigation bar */}
                    <Navbar />
                    
                    {/* Main application router */}
                    <Router />
                    
                    {/* AI-powered chatbot for customer assistance */}
                    <Chatbot />
                  </div>
                  
                  {/* Global toast notifications */}
                  <Toaster />
                </ChatProvider>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;