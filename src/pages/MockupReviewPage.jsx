
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, CheckCircle, ShoppingCart, Palette, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabaseClient'; 

const MockupReviewPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  const [requestDetails, setRequestDetails] = useState(null);
  const [selectedMockup, setSelectedMockup] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [loading, setLoading] = useState(true);

  const TSHIRT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    const fetchRequestDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('custom_design_requests')
          .select('*')
          .eq('id', requestId)
          .single();

        if (error || !data) {
          throw new Error(error?.message || "Request not found");
        }
        
        setRequestDetails(data);
        setSelectedColor(data.shirt_color || ''); 
        if (data.mockups && data.mockups.length > 0) {
          setSelectedMockup(data.mockups[0]);
        }

      } catch (error) {
        toast({
          title: "Request Not Found",
          description: error.message || "The custom design request could not be found.",
          variant: "destructive",
        });
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchRequestDetails();
    }
  }, [requestId, navigate]);

  const handleSelectMockup = (mockup) => {
    setSelectedMockup(mockup);
  };
  
  const uniqueCartIdForMockup = selectedMockup ? 
    `${requestDetails?.id}-${selectedMockup.id || selectedMockup.name.replace(/\s+/g, '-')}-${selectedSize}-${selectedColor}` 
    : '';
  const isMockupInCart = (cartItems || []).some(item => item.id === uniqueCartIdForMockup);

  const handleAddToCart = () => {
    if (!selectedMockup || !selectedSize || !selectedColor) {
      toast({
        title: "Selection Missing",
        description: "Please select a mockup, size, and color.",
        variant: "destructive",
      });
      return;
    }
    if (isMockupInCart) {
        toast({
            title: "Already in Cart",
            description: "This custom design is already in your cart.",
            variant: "warning"
        });
        return;
    }
    
    const productToAdd = {
      customRequestId: requestDetails.id,
      customMockupId: selectedMockup.id || selectedMockup.name.replace(/\s+/g, '-'),
      name: selectedMockup.name,
      price: selectedMockup.price,
      image_url: selectedMockup.url, 
      size: selectedSize,
      color: selectedColor,
      quantity: 1, 
      isCustom: true,
      is_one_of_one: true, 
    };

    addToCart(productToAdd);
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!requestDetails) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
            <Card className="max-w-md mx-auto p-8 bg-white/80 backdrop-blur-md shadow-xl text-center">
                <Palette className="w-16 h-16 text-red-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Request Not Found</h2>
                <p className="text-gray-600 mb-6">
                    We couldn't find the custom design request you're looking for. It might have been removed or the link is incorrect.
                </p>
                <Button onClick={() => navigate('/profile')} variant="outline">
                    Back to Profile
                </Button>
            </Card>
        </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Button variant="ghost" onClick={() => navigate('/profile')} className="flex items-center text-gray-600 hover:text-purple-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </motion.div>

        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-3xl font-bold gradient-text">
              Your Custom Design Mockups
            </CardTitle>
            <p className="text-gray-600">Request ID: {requestDetails.id.substring(0,8)}...</p>
            <p className="text-gray-700 mt-2">Original Request: "{requestDetails.description}"</p>
            <Badge className="mt-2">{requestDetails.status}</Badge>
          </CardHeader>
        </Card>

        {requestDetails.mockups && requestDetails.mockups.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-md sticky top-24">
                <CardContent className="p-6">
                  {selectedMockup ? (
                    <>
                      <img 
                        alt={selectedMockup.name}
                        className="w-full h-auto max-h-[500px] object-contain rounded-lg mb-6 shadow-lg border"
                       src={selectedMockup.url || `https://via.placeholder.com/600x600.png?text=${encodeURIComponent(selectedMockup.name)}`} />
                      <h2 className="text-2xl font-bold mb-2">{selectedMockup.name}</h2>
                      <p className="text-3xl font-semibold text-purple-600 mb-4">₦{selectedMockup.price}</p>
                      
                      <div className="space-y-4 mb-6">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Select Size:</Label>
                          <div className="flex gap-2 mt-1">
                            {TSHIRT_SIZES.map(size => (
                              <Button
                                key={size}
                                variant={selectedSize === size ? "default" : "outline"}
                                onClick={() => setSelectedSize(size)}
                                className={selectedSize === size ? "bg-purple-600" : ""}
                              >
                                {size}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Confirm Color: (Original: {requestDetails.shirt_color})</Label>
                           <Input 
                            type="text" 
                            value={selectedColor} 
                            onChange={(e) => setSelectedColor(e.target.value)}
                            className="mt-1"
                            placeholder="Enter preferred color"
                          />
                        </div>
                      </div>

                      <Button 
                        onClick={handleAddToCart} 
                        className="w-full hero-gradient text-white text-lg py-3"
                        disabled={!selectedMockup || !selectedSize || !selectedColor || isMockupInCart}
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {isMockupInCart ? 'Already In Cart' : 'Add to Cart & Order'}
                      </Button>
                      <p className="text-xs text-gray-500 mt-2 text-center">This will be a 1-of-1 exclusive item!</p>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">Select a mockup to view details.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-4 custom-scrollbar overflow-y-auto max-h-[calc(100vh-10rem)] pr-2"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Available Mockups ({requestDetails.mockups.length})</h3>
              {requestDetails.mockups.map((mockup, index) => (
                <Card 
                  key={mockup.id || `mockup-${index}`} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedMockup?.id === mockup.id || (selectedMockup && selectedMockup.name === mockup.name && selectedMockup.url === mockup.url) ? 'ring-2 ring-purple-500 shadow-lg' : 'border-gray-200'} bg-white/90`}
                  onClick={() => handleSelectMockup(mockup)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <img 
                      alt={mockup.name}
                      className="w-20 h-20 object-cover rounded-md border"
                     src={mockup.url || `https://via.placeholder.com/100x100.png?text=${encodeURIComponent(mockup.name)}`} />
                    <div>
                      <h4 className="font-semibold text-gray-900">{mockup.name}</h4>
                      <p className="text-purple-600 font-medium">₦{mockup.price}</p>
                    </div>
                    {(selectedMockup?.id === mockup.id || (selectedMockup && selectedMockup.name === mockup.name && selectedMockup.url === mockup.url)) && <CheckCircle className="w-5 h-5 text-purple-600 ml-auto" />}
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <Card className="max-w-md mx-auto p-8 bg-white/80 backdrop-blur-md shadow-xl">
              <Palette className="w-16 h-16 text-purple-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Mockups Coming Soon!</h2>
              <p className="text-gray-600 mb-6">
                Our designers are hard at work crafting your custom mockups. 
                You'll be notified once they are ready for review.
              </p>
              <Button onClick={() => navigate('/shop')} variant="outline">
                Explore Other Designs
              </Button>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MockupReviewPage;
