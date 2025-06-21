import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, X, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (product && isOpen) {
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      } else {
        setSelectedSize('');
      }
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      } else {
        setSelectedColor('');
      }
    }
  }, [product, isOpen]);

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const placeholderImage = `https://via.placeholder.com/600x600.png?text=${encodeURIComponent(product.name)}`;
  
  const uniqueCartIdForProduct = product ? `${product.id}-${selectedSize}-${selectedColor}` : '';
  const isProductInCart = cartItems.some(item => item.id === uniqueCartIdForProduct);

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
    onClose();
  };

  const handleBuyNow = () => {
    if (!selectedSize || !selectedColor) {
      toast({ title: "Selection Missing", description: "Please select size and color.", variant: "warning" });
      return;
    }
    if (isProductInCart && product.is_one_of_one) {
        navigate('/checkout');
        onClose();
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
    onClose();
  };

  const handleCustomizeClick = () => {
    onClose(); 
    navigate(`/custom-design?baseProductId=${product.id}&baseImageUrl=${encodeURIComponent(product.image_url || '')}&baseName=${encodeURIComponent(product.name)}&baseDescription=${encodeURIComponent(product.description || '')}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative">
            <img
              src={product.image_url || placeholderImage}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
              onError={(e) => { e.target.onerror = null; e.target.src=placeholderImage; }}
            />
            {product.wishlist_count > 0 && (
              <Badge className="absolute top-4 left-4 wishlist-badge text-white">
                ❤️ {product.wishlist_count} wishlisted
              </Badge>
            )}
            <Badge className="absolute bottom-4 left-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              1 of 1
            </Badge>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">{product.name}</h2>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="text-3xl font-bold text-purple-600">
                ₦{product.price}
              </div>
            </div>

            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Size</h3>
                <div className="flex gap-2">
                  {(product.sizes).map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSize(size)}
                      className={selectedSize === size ? 'bg-purple-600' : ''}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Color</h3>
                <div className="flex gap-2">
                  {(product.colors).map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedColor(color)}
                      className={selectedColor === color ? 'bg-purple-600' : ''}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={(!selectedSize || !selectedColor) || (isProductInCart && product.is_one_of_one)}
                  className="flex-1 hero-gradient text-white"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {(isProductInCart && product.is_one_of_one) ? 'In Cart' : 'Add to Cart'}
                </Button>
                <Button
                  onClick={handleWishlistToggle}
                  variant="outline"
                  className={inWishlist ? 'bg-red-50 border-red-200' : ''}
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>

              <Button
                onClick={handleBuyNow}
                disabled={!selectedSize || !selectedColor}
                variant="outline"
                className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                Buy Now
              </Button>

              <Button
                onClick={handleCustomizeClick}
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Palette className="w-4 h-4 mr-2" />
                Customize This Design
              </Button>

              {(!selectedSize || !selectedColor) && (
                <p className="text-sm text-gray-500 text-center">
                  Please select size and color to add to cart or buy
                </p>
              )}
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">🌟 Exclusive Design</h4>
              <p className="text-sm text-purple-700">
                This is a one-of-one design. Once purchased, it will be removed from our store forever, 
                making you the exclusive owner of this unique piece.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;