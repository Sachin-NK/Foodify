import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "./context/CartContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ChatProvider } from "./context/ChatContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
// CSRF token initialization removed as per requirements
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Browse from "@/pages/Browse";
import Restaurant from "@/pages/Restaurant";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import TrackOrder from "@/pages/TrackOrder";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Admin from "@/pages/Admin";
import RestaurantRegister from "@/pages/RestaurantRegister";
import RestaurantDashboard from "@/pages/RestaurantDashboard";
import RestaurantMenu from "@/pages/RestaurantMenu";
// Debug pages removed
import Navbar from "@/components/Navbar";
import Chatbot from "@/components/Chatbot.jsx";
// useEffect import removed since CSRF initialization is no longer needed

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/browse" component={Browse} />
      <Route path="/restaurant/:id" component={Restaurant} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/track-order/:id?" component={TrackOrder} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/admin" component={Admin} />
      <Route path="/restaurant-register" component={RestaurantRegister} />
      <Route path="/restaurant-dashboard/:id" component={RestaurantDashboard} />
      <Route path="/restaurant-menu/:restaurantId" component={RestaurantMenu} />
      {/* Debug routes removed */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // CSRF token initialization removed as per requirements

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <ChatProvider>
                  <div className="min-h-screen bg-background text-foreground theme-transition">
                    <Navbar />
                    <Router />
                    <Chatbot />
                  </div>
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