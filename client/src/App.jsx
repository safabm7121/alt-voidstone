import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import CreateProduct from './pages/CreateProduct';
import AdminHero from './pages/AdminHero';
import Contact from './pages/Contact';
import { Toaster } from 'react-hot-toast';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './index.css';
import Wishlist from './pages/Wishlist';
import AdminNewsletter from './pages/AdminNewsletter';
// ...


gsap.registerPlugin(ScrollTrigger);

// Component to clean up GSAP/ScrollTrigger on route changes
const ScrollTriggerCleanup = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Kill all ScrollTriggers when navigating away
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger && typeof trigger.kill === 'function') {
        trigger.kill();
      }
    });
    // Refresh ScrollTrigger to clean up any remaining references
    ScrollTrigger.refresh();
  }, [location]);
  
  return null;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 1000,
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid #333',
                borderRadius: '12px',
                fontSize: '14px',
              },
            }}
          />
          <ScrollTriggerCleanup />
       <Routes>
  <Route element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="products/:id" element={<ProductDetail />} />
    <Route path="checkout" element={<Checkout />} />
  </Route>

  {/* These now render independently with their own Navbar */}
  <Route path="/products" element={<Products />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/cart" element={<Cart />} />
  <Route path="/wishlist" element={<Wishlist />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/verify-email" element={<VerifyEmail />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password" element={<ResetPassword />} />
  <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/admin/create-product" element={<CreateProduct />} />
  <Route path="/admin/hero" element={<AdminHero />} />
  <Route path="/admin/newsletter" element={<AdminNewsletter />} />
</Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;