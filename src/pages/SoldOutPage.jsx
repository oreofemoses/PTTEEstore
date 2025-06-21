import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, ArrowLeft, Sparkles, ArchiveX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

const SoldOutPage = () => {
  const navigate = useNavigate();
  const { id: specificProductId } = useParams(); // Check if a specific product ID is in URL
  const [soldProducts, setSoldProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highlightedProduct, setHighlightedProduct] = useState(null);

  useEffect(() => {
    const fetchSoldProducts = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('products')
          .select('*')
          .not('sold_at', 'is', null) 
          .order('sold_at', { ascending: false });
        
        // If a specific product ID is provided, we might want to ensure it's part of the list
        // or fetch it separately to highlight. For simplicity, we fetch all and then find.
        const { data, error } = await query;

        if (error) {
          throw error;
        }
        setSoldProducts(data || []);

        if (specificProductId && data) {
          const foundProduct = data.find(p => p.id === specificProductId);
          setHighlightedProduct(foundProduct);
        }

      } catch (error) {
        console.error("Error fetching sold out products:", error);
        toast({
          title: "Error fetching archive",
          description: error.message || "Could not load sold out items.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSoldProducts();
  }, [specificProductId]);

  // Scroll to highlighted product if it exists
  useEffect(() => {
    if (highlightedProduct) {
      const element = document.getElementById(`product-${highlightedProduct.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedProduct]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              The PTTEE Archive
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              These exclusive one-of-one designs have found their forever homes. 
              Once sold, they're <span className="font-semibold text-purple-600">never available again</span> - 
              making each piece truly unique and irreplaceable.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/shop')} 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Shop Available Designs
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="px-8 py-3"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>

          {highlightedProduct && (
             <motion.div 
                id={`product-${highlightedProduct.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-12"
             >
                <Card className="group relative overflow-hidden backdrop-blur-sm bg-white/90 border-2 border-purple-400 shadow-2xl transition-all duration-300">
                     <div className="relative">
                        <img
                            src={highlightedProduct.image_url || "https://via.placeholder.com/600x600.png?text=Image+Not+Available"}
                            alt={highlightedProduct.name}
                            className="w-full h-96 object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4">
                            <div className="text-center text-white">
                                <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-2xl mb-3">
                                    SOLD OUT
                                </div>
                                <p className="text-md opacity-90">
                                    Claimed on {new Date(highlightedProduct.sold_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                         {highlightedProduct.is_one_of_one && (
                            <div className="absolute top-4 left-4">
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                🏆 1 OF 1
                            </div>
                            </div>
                        )}
                    </div>
                    <CardContent className="p-6">
                        <h3 className="text-2xl font-bold mb-2 text-gray-800">
                            {highlightedProduct.name}
                        </h3>
                        <p className="text-md text-gray-600 mb-3">{highlightedProduct.description}</p>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xl font-semibold text-gray-600 line-through">
                            ₦{highlightedProduct.price}
                            </span>
                            <div className="flex items-center text-sm text-gray-500">
                            <Heart className="w-4 h-4 mr-1 text-pink-400" />
                            {highlightedProduct.wishlist_count || 0} wishlisted
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                            <p className="text-sm text-gray-700 text-center">
                            <span className="font-semibold">This exclusive item is now part of PTTEE history!</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <p className="text-center text-gray-600 mt-6 font-semibold">Explore other archived treasures below</p>
                <hr className="my-8 border-gray-300" />
            </motion.div>
          )}


          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading archived treasures...</p>
            </div>
          ) : soldProducts.filter(p => !highlightedProduct || p.id !== highlightedProduct.id).length === 0 && !highlightedProduct ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <Card className="max-w-lg mx-auto backdrop-blur-sm bg-white/80 border-0 shadow-xl p-8">
                <ArchiveX className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 mb-3">The Archive is Empty (For Now!)</h2>
                <p className="text-gray-600 mb-6">
                  No designs have been marked as sold out yet. Keep an eye on our shop for exclusive items!
                </p>
                <Button onClick={() => navigate('/shop')}>Explore Current Collection</Button>
              </Card>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {soldProducts.filter(p => !highlightedProduct || p.id !== highlightedProduct.id).map((design, index) => (
                <motion.div
                  key={design.id}
                  id={`product-${design.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className={`group relative overflow-hidden backdrop-blur-sm bg-white/80 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 ${highlightedProduct && design.id === highlightedProduct.id ? 'border-2 border-purple-500' : ''}`}>
                    <div className="relative">
                      <img
                        src={design.image_url || "https://via.placeholder.com/400x400.png?text=Image+Not+Available"}
                        alt={design.name}
                        className="w-full h-64 object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                      
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg mb-2">
                            SOLD OUT
                          </div>
                          <p className="text-sm opacity-90">
                            Claimed on {new Date(design.sold_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {design.is_one_of_one && (
                        <div className="absolute top-4 left-4">
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            🏆 1 OF 1
                          </div>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-gray-800">
                        {design.name}
                      </h3>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold text-gray-600 line-through">
                          ₦{design.price}
                        </span>
                        <div className="flex items-center text-sm text-gray-500">
                          <Heart className="w-4 h-4 mr-1 text-pink-400" />
                          {design.wishlist_count || 0} wishlisted
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                        <p className="text-sm text-gray-700 text-center">
                          <span className="font-semibold">This design is now exclusive</span> to its owner. 
                          It will never be reproduced or sold again, making it a truly unique piece of wearable art.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: soldProducts.length > 0 ? 0.5 : 0.2 }}
            className="text-center mt-16"
          >
            <Card className="max-w-2xl mx-auto backdrop-blur-sm bg-gradient-to-r from-purple-50 to-pink-50 border-0 shadow-xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Don't Miss Out on Current Designs!
                </h2>
                <p className="text-gray-600 mb-6">
                  Every design in our current collection is one purchase away from joining this exclusive archive. 
                  Secure your favorite pieces before someone else claims them forever.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/shop')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3"
                  >
                    Browse Available Designs
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/custom-design')}
                    className="px-8 py-3"
                  >
                    Create Custom Design
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SoldOutPage;