
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, ArrowLeft, Star, Shield, Truck, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart, cartItems } = useCart(); 

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        toast({ title: "Error", description: "Product not found.", variant: "destructive" });
        navigate('/shop');
      } else {
        if (!data.available && data.sold_at) { 
          navigate(`/sold-out/${id}`); 
          return;
        }
        setProduct(data);
        if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
        if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  const placeholderImage = `https://via.placeholder.com/800x800.png?text=${encodeURIComponent(product.name)}`;
  const inWishlist = isInWishlist(product.id);
  
  const uniqueCartIdForProduct = product ? `${product.id}-${selectedSize}-${selectedColor}` : '';
  const isProductInCart = (cartItems || []).some(item => item.id === uniqueCartIdForProduct);


  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast({ title: "Selection Missing", description: "Please select size and color.", variant: "warning" });
      return;
    }
    if (isProductInCart && product.is_one_of_one) {
        toast({
            title: "Already in Cart",
            description: "This exclusive item is already in your cart.",
            variant: "warning"
        });
        return;
    }
    const itemToAdd = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      size: selectedSize,
      color: selectedColor,
      quantity: 1, 
      is_one_of_one: product.is_one_of_one,
      available: product.available 
    };
    addToCart(itemToAdd);
  };

  const handleBuyNow = () => {
    if (!selectedSize || !selectedColor) {
      toast({ title: "Selection Missing", description: "Please select size and color.", variant: "warning" });
      return;
    }
     if (isProductInCart && product.is_one_of_one) {
        navigate('/checkout'); 
        return;
    }
    const itemToAdd = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
      is_one_of_one: product.is_one_of_one,
      available: product.available
    };
    addToCart(itemToAdd);
    navigate('/checkout');
  };

  const handleCustomizeClick = () => {
    navigate(`/custom-design?baseProductId=${product.id}&baseImageUrl=${encodeURIComponent(product.image_url || '')}&baseName=${encodeURIComponent(product.name)}&baseDescription=${encodeURIComponent(product.description || '')}`);
  };

  const displayPrice = product.sale_price && product.sale_price < product.price ? product.sale_price : product.price;
  const originalPrice = product.original_price && product.original_price > displayPrice ? product.original_price : (product.price > displayPrice ? product.price : null);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/shop')}
            className="flex items-center text-gray-600 hover:text-purple-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
              <img
                src={product.image_url || placeholderImage}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src=placeholderImage; }}
              />
            </div>
            
            <div className="absolute top-6 left-6 space-y-2 z-10">
              {product.is_one_of_one && (
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  1 of 1 Exclusive
                </Badge>
              )}
              {product.wishlist_count > 0 && (
                <Badge className="wishlist-badge text-white">
                  ❤️ {product.wishlist_count} wishlisted
                </Badge>
              )}
               {!product.available && product.sold_at && (
                <Badge variant="destructive" className="bg-red-600 text-white">SOLD OUT</Badge>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              <p className="text-xl text-gray-600 mb-6">{product.description}</p>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                ₦{displayPrice.toLocaleString()}
              </div>
              {originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  ₦{originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Size</h3>
                <div className="flex gap-3">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 ${selectedSize === size ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                      disabled={!product.available}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Color</h3>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? "default" : "outline"}
                      onClick={() => setSelectedColor(color)}
                      className={`${selectedColor === color ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                      disabled={!product.available}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {product.available ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 hero-gradient text-white text-lg py-6"
                  disabled={(isProductInCart && product.is_one_of_one) || !selectedSize || !selectedColor}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {(isProductInCart && product.is_one_of_one) ? 'In Cart' : 'Add to Cart'}
                </Button>
                <Button
                  onClick={handleWishlistToggle}
                  variant="outline"
                  className={`px-6 py-6 ${inWishlist ? 'bg-red-50 border-red-200' : ''}`}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>

              <Button
                onClick={handleBuyNow}
                variant="outline"
                className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 text-lg py-6"
                disabled={!selectedSize || !selectedColor}
              >
                Buy Now
              </Button>
              <Button
                onClick={handleCustomizeClick}
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 text-lg py-6"
              >
                <Palette className="w-5 h-5 mr-2" />
                Customize This Design
              </Button>
            </div>
            ) : (
                <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
                    <CardContent className="p-6 text-center">
                        <h4 className="font-bold text-red-700 mb-3 text-2xl">SOLD OUT</h4>
                        <p className="text-red-600">
                            This exclusive piece has found its owner and is no longer available.
                        </p>
                        <Button onClick={() => navigate('/sold-out')} className="mt-4 bg-red-500 hover:bg-red-600 text-white">
                            View Sold Archive
                        </Button>
                    </CardContent>
                </Card>
            )}


            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-6">
                <h4 className="font-bold text-purple-800 mb-3 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Exclusive Ownership Guarantee
                </h4>
                <p className="text-purple-700 mb-4">
                  This is a one-of-one design. Once you purchase it, this exact design will be 
                  removed from our store forever, making you the exclusive owner worldwide.
                </p>
                <div className="flex items-center text-sm text-purple-600">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  <span>Truly unique • Never reproduced • Yours forever</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Truck className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <h4 className="font-semibold mb-1">Free Shipping</h4>
                  <p className="text-sm text-gray-600">On all orders over ₦20,000</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <h4 className="font-semibold mb-1">Quality Guarantee</h4>
                  <p className="text-sm text-gray-600">Premium materials only</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
