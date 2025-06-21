import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useWishlist } from '@/contexts/WishlistContext';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, onQuickView }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    onQuickView(product);
  };

  const handleCardClick = () => {
    if (product.available) {
      navigate(`/product/${product.id}`);
    } else {
      navigate(`/sold-out/${product.id}`);
    }
  };

  const handleCustomizeClick = (e) => {
    e.stopPropagation();
    navigate(`/custom-design?baseProductId=${product.id}&baseImageUrl=${encodeURIComponent(product.image_url || '')}&baseName=${encodeURIComponent(product.name)}&baseDescription=${encodeURIComponent(product.description || '')}`);
  };

  const placeholderImage = `https://via.placeholder.com/400x300.png?text=${encodeURIComponent(product.name)}`;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card 
        className="overflow-hidden cursor-pointer card-hover group"
        onClick={handleCardClick}
      >
        <div className="relative">
          <img
            src={product.image_url || placeholderImage}
            alt={product.name}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.target.onerror = null; e.target.src=placeholderImage; }}
          />
          
          {!product.available && (
            <div className="absolute inset-0 sold-overlay flex items-center justify-center">
              <div className="text-white text-center">
                <h3 className="text-2xl font-bold">CLAIMED</h3>
                <p className="text-sm">This 1-of-1 design has been claimed</p>
              </div>
            </div>
          )}

          {product.wishlist_count > 0 && (
            <Badge className="absolute top-3 left-3 wishlist-badge text-white">
              ❤️ {product.wishlist_count} wishlisted
            </Badge>
          )}

          <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              onClick={handleWishlistToggle}
              className={`${inWishlist ? 'bg-red-500 text-white' : 'bg-white'}`}
              title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
            </Button>
            
            {product.available && (
              <>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={handleQuickView}
                  className="bg-white"
                  title="Quick View"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={handleCustomizeClick}
                  className="bg-white"
                  title="Customize This Design"
                >
                  <Palette className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          <Badge className="absolute bottom-3 left-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            1 of 1
          </Badge>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-purple-600">
              ₦{product.price}
            </span>
            
            {product.available ? (
              <Button 
                size="sm" 
                className="hero-gradient text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/product/${product.id}`);
                }}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy Now
              </Button>
            ) : (
              <Badge variant="secondary" className="text-gray-500">
                Sold Out
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductCard;