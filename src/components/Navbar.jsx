import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, User, Menu, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import AuthModal from '@/components/AuthModal';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { getTotalItems } = useCart();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();

  const handleUserClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2"
              >
                <img 
                  src="https://blqxddeddsleqfjuoinm.supabase.co/storage/v1/object/public/product-images/public/PTTEE_icon%20no%20bg.png" 
                  alt="PTTEE Brand Icon" 
                  className="w-10 h-10 object-contain" 
                />
                <span className="text-2xl font-bold text-black">PTTEE</span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors">
                Home
              </Link>
              <Link to="/shop" className="text-gray-700 hover:text-purple-600 transition-colors">
                Shop
              </Link>
              <Link to="/custom-design" className="text-gray-700 hover:text-purple-600 transition-colors">
                Custom Design
              </Link>
              {user && isAdmin && ( 
                <Link to="/admin" className="text-gray-700 hover:text-purple-600 transition-colors flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1" /> Admin
                </Link>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/wishlist" className="relative">
                <Button variant="ghost" size="icon">
                  <Heart className="w-5 h-5" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistItems.length}
                    </span>
                  )}
                </Button>
              </Link>
              
              <Link to="/cart" className="relative">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="w-5 h-5" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </Button>
              </Link>

              <Button variant="ghost" size="icon" onClick={handleUserClick}>
                <User className="w-5 h-5" />
              </Button>

              {user && (
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-4">
              <Link
                to="/"
                className="block text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/shop"
                className="block text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                to="/custom-design"
                className="block text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Custom Design
              </Link>
              {user && isAdmin && ( 
                <Link
                  to="/admin"
                  className="block text-gray-700 hover:text-purple-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShieldCheck className="w-4 h-4 mr-1 inline-block" /> Admin
                </Link>
              )}
              
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" size="icon">
                    <Heart className="w-5 h-5" />
                    {wishlistItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {wishlistItems.length}
                      </span>
                    )}
                  </Button>
                </Link>
                
                <Link to="/cart" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" size="icon">
                    <ShoppingCart className="w-5 h-5" />
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {getTotalItems()}
                      </span>
                    )}
                  </Button>
                </Link>

                <Button variant="ghost" size="icon" onClick={() => { handleUserClick(); setIsMenuOpen(false); }}>
                  <User className="w-5 h-5" />
                </Button>

                {user && (
                  <Button variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

export default Navbar;