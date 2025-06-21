import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, Heart, Palette, ShieldCheck, Shirt, Ligature as Hanger } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import QuickViewModal from '@/components/QuickViewModal';

import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('available', true)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) {
        toast({ title: "Error", description: "Could not fetch featured products.", variant: "destructive" });
      } else {
        setFeaturedProducts(data);
      }
    };
    fetchFeaturedProducts();
  }, []);

  const handleQuickView = (product) => {
    setSelectedProduct(product);
  };

  const floatingIcons = [
    { Icon: Sparkles, className: "w-12 h-12 text-yellow-300", initialY: 0, animateY: -20, duration: 3, top: "20%", left: "10%" },
    { Icon: Zap, className: "w-16 h-16 text-blue-300", initialY: 0, animateY: 20, duration: 4, bottom: "20%", right: "10%" },
    { Icon: Shirt, className: "w-14 h-14 text-pink-300", initialY: 0, animateY: -15, duration: 3.5, top: "50%", left: "5%" },
    { Icon: Hanger, className: "w-12 h-12 text-green-300", initialY: 0, animateY: 15, duration: 4.5, bottom: "10%", right: "15%" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient text-white">
        <div className="absolute inset-0 bg-black/30 dark:bg-black/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              One Design.
              <br />
              <span className="text-yellow-300">One Owner.</span>
              <br />
              Forever.
            </h1>
            <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Welcome to PTTEE, where every t-shirt design is truly unique. Once purchased, 
              it disappears forever - making you the exclusive owner of that design.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/shop">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 dark:bg-slate-100 dark:text-purple-700 dark:hover:bg-slate-200 text-lg px-8 py-4">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Shop Exclusive Designs
                </Button>
              </Link>
              <Link to="/custom-design">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white bg-transparent hover:bg-white hover:text-purple-600 dark:hover:text-purple-700 text-lg px-8 py-4"
                >
                  <Palette className="w-5 h-5 mr-2" />
                  Create Custom Design
                </Button>
              </Link>
              {user && isAdmin && (
                <Link to="/admin">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-yellow-300 text-yellow-300 bg-transparent hover:bg-yellow-300 hover:text-purple-700 text-lg px-8 py-4"
                  >
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    Admin Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Floating Elements */}
        {floatingIcons.map((item, index) => (
          <div key={index} className={`absolute opacity-20 dark:opacity-30`} style={{ top: item.top, left: item.left, bottom: item.bottom, right: item.right }}>
            <motion.div
              animate={{ y: [item.initialY, item.animateY, item.initialY] }}
              transition={{ duration: item.duration, repeat: Infinity, ease: "easeInOut" }}
            >
              <item.Icon className={item.className} />
            </motion.div>
          </div>
        ))}
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-secondary dark:bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold gradient-text mb-6">
              Available Now
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              These exclusive designs are waiting for their perfect owner. Once claimed, they're gone forever.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <ProductCard 
                  product={product} 
                  onQuickView={handleQuickView}
                />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mt-12"
          >
            <Link to="/shop">
              <Button size="lg" className="hero-gradient text-white text-lg px-8 py-4">
                View All Designs
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold gradient-text mb-6">
              Why PTTEE is Different
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're revolutionizing fashion with true exclusivity and personalization
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-center p-8 rounded-2xl bg-card card-hover border dark:border-slate-700"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-card-foreground">True Exclusivity</h3>
              <p className="text-muted-foreground">
                Once a design is purchased, it's gone forever. You become the sole owner of that unique piece.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center p-8 rounded-2xl bg-card card-hover border dark:border-slate-700"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-card-foreground">Wishlist Magic</h3>
              <p className="text-muted-foreground">
                See how many people want each design. High wishlist counts create urgency and show popularity.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center p-8 rounded-2xl bg-card card-hover border dark:border-slate-700"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-card-foreground">Custom Creations</h3>
              <p className="text-muted-foreground">
                Can't find what you want? Describe your dream design and we'll create a mockup just for you.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Own Something Unique?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Join the PTTEE community and become the exclusive owner of one-of-a-kind designs. 
              Your style, your story, your shirt.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/shop">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 dark:bg-slate-100 dark:text-purple-700 dark:hover:bg-slate-200 text-lg px-8 py-4">
                  Start Shopping
                </Button>
              </Link>
              <Link to="/custom-design">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white bg-transparent hover:bg-white hover:text-purple-600 dark:hover:text-purple-700 text-lg px-8 py-4"
                >
                  Design Your Own
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};

export default HomePage;