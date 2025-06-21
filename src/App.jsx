import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import Navbar from '@/components/Navbar';
import HomePage from '@/pages/HomePage';
import ShopPage from '@/pages/ShopPage';
import CustomDesignPage from '@/pages/CustomDesignPage';
import ProductPage from '@/pages/ProductPage';
import CartPage from '@/pages/CartPage';
import WishlistPage from '@/pages/WishlistPage';
import CheckoutPage from '@/pages/CheckoutPage';
import AdminPage from '@/pages/AdminPage';
import ProfilePage from '@/pages/ProfilePage';
import SoldOutPage from '@/pages/SoldOutPage';
import MockupReviewPage from '@/pages/MockupReviewPage';
import PaymentInstructionsPage from '@/pages/PaymentInstructionsPage';
import AdminRoute from '@/components/AdminRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <MainContent />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

const MainContent = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/custom-design" element={<CustomDesignPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/sold-out/:id" element={<SoldOutPage />} />
        <Route path="/mockup-review/:requestId" element={<MockupReviewPage />} />
        <Route path="/payment-instructions/:orderId" element={<PaymentInstructionsPage />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;