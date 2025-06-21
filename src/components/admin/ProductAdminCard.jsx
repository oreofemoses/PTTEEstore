import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ProductAdminCard = ({ product, onEdit, onDelete, onMarkSold, onMarkAvailable }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg border overflow-hidden shadow-md hover:shadow-lg transition-shadow ${!product.available ? 'bg-gray-100 opacity-70' : 'bg-white'}`}
    >
      <img 
        alt={product.name}
        className="w-full h-48 object-cover"
        src={product.image_url || `https://via.placeholder.com/300x200.png?text=${encodeURIComponent(product.name)}`} 
        onError={(e) => { e.target.onerror = null; e.target.src=`https://via.placeholder.com/300x200.png?text=${encodeURIComponent(product.name)}`; }}
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{product.name}</h3>
          <Badge variant={product.available ? 'default' : 'destructive'} className={product.available ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
            {product.available ? 'Available' : 'Sold'}
          </Badge>
        </div>
        {product.is_one_of_one && <Badge variant="secondary" className="mb-1 text-xs">1 of 1 Exclusive</Badge>}
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{product.description}</p>
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="font-bold text-xl text-purple-600">₦{product.price}</span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-xs text-gray-500 line-through ml-1">₦{product.original_price}</span>
            )}
          </div>
          <span className="text-xs text-gray-500">Wishlisted: {product.wishlist_count || 0}</span>
        </div>
        {!product.available && product.sold_at && (
          <p className="text-xs text-red-600 mb-2">Sold on: {new Date(product.sold_at).toLocaleDateString()}</p>
        )}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(product)} className="flex-1">
              <Edit className="w-3 h-3 mr-1" /> Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(product)} className="flex-1">
              <Trash2 className="w-3 h-3 mr-1" /> Delete
            </Button>
          </div>
          {product.available ? (
            <Button size="sm" variant="outline" onClick={() => onMarkSold(product.id)} className="w-full">
              Mark Sold
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => onMarkAvailable(product.id)} className="w-full">
              Mark Available
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductAdminCard;