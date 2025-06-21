import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import ProductFormDialog from '@/components/admin/ProductFormDialog';
import ProductAdminCard from '@/components/admin/ProductAdminCard';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productCount, setProductCount] = useState(0);


  const fetchProducts = useCallback(async () => {
    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error fetching products", description: error.message, variant: "destructive" });
    } else {
      setProducts(data);
      setProductCount(count || 0);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleProductSaved = () => {
    fetchProducts();
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (product) => {
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('id')
      .eq('product_id', product.id)
      .limit(1);

    if (orderItemsError) {
      toast({ title: "Error Checking Orders", description: orderItemsError.message, variant: "destructive" });
      return;
    }

    if (orderItems && orderItems.length > 0) {
      toast({ title: "Cannot Delete Product", description: "This product is part of an existing order. Consider marking it as unavailable.", variant: "warning", duration: 7000 });
      return;
    }

    const { error } = await supabase.from('products').delete().eq('id', product.id);
    if (error) {
      toast({ title: "Error Deleting Product", description: error.message, variant: "destructive" });
    } else {
      if (product.image_url) {
        try {
          const urlParts = product.image_url.split('/');
          const imagePath = urlParts.slice(urlParts.indexOf('product-images') + 1).join('/');
          if (imagePath && imagePath !== 'product-images' && !imagePath.startsWith('public/https')) {
             await supabase.storage.from('product-images').remove([imagePath]);
          }
        } catch (storageError) {
          console.error("Error deleting from storage, but product deleted from DB:", storageError);
          toast({ title: "Storage Deletion Notice", description: "Product deleted from database, but image might remain in storage.", variant: "warning"});
        }
      }
      toast({ title: "Product Deleted", description: "The product has been removed." });
      fetchProducts();
    }
  };

  const handleMarkAsSold = async (productId) => {
    const { error } = await supabase
      .from('products')
      .update({ available: false, sold_at: new Date().toISOString() })
      .eq('id', productId);
    
    if (error) {
      toast({ title: "Update Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Marked as Sold", description: "Product availability updated." });
      fetchProducts();
    }
  };
  
  const handleMarkAsAvailable = async (productId) => {
    const { error } = await supabase
      .from('products')
      .update({ available: true, sold_at: null })
      .eq('id', productId);
    
    if (error) {
      toast({ title: "Update Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Marked as Available", description: "Product availability updated." });
      fetchProducts();
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-md border-0 shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Product Inventory ({productCount})</CardTitle>
          <Button onClick={openAddModal} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No products found. Add some to get started!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductAdminCard
                key={product.id}
                product={product}
                onEdit={openEditModal}
                onDelete={handleDeleteProduct}
                onMarkSold={handleMarkAsSold}
                onMarkAvailable={handleMarkAsAvailable}
              />
            ))}
          </div>
        )}
      </CardContent>

      <ProductFormDialog
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingProduct={editingProduct}
        onProductSaved={handleProductSaved}
        productCount={productCount}
      />
    </Card>
  );
};

export default ProductManagement;