import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const ProductFormDialog = ({ isOpen, onOpenChange, editingProduct, onProductSaved, productCount }) => {
  const initialFormState = {
    id: null,
    name: '',
    description: '',
    price: '',
    original_price: '',
    sale_price: '',
    image_url: '',
    category: '',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Navy'],
    available: true,
    is_one_of_one: true,
    sold_at: null,
  };

  const [productForm, setProductForm] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (editingProduct) {
      setProductForm({
        ...editingProduct,
        price: editingProduct.price || '',
        original_price: editingProduct.original_price || editingProduct.price || '',
        sale_price: editingProduct.sale_price || '',
        sizes: editingProduct.sizes || ['S', 'M', 'L', 'XL'],
        colors: editingProduct.colors || ['Black', 'White', 'Navy'],
        sold_at: editingProduct.sold_at ? editingProduct.sold_at.substring(0, 16) : null,
      });
      setImagePreview(editingProduct.image_url);
    } else {
      setProductForm(initialFormState);
      setImagePreview(null);
    }
    setImageFile(null); // Reset image file on product change or new product
  }, [editingProduct, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(editingProduct ? editingProduct.image_url : null);
    }
  };

  const handleArrayInputChange = (field, value) => {
    setProductForm(prev => ({ ...prev, [field]: value.split(',').map(s => s.trim()) }));
  };

  const resetForm = () => {
    setProductForm(initialFormState);
    setImageFile(null);
    setImagePreview(null);
    onOpenChange(false); // Close dialog
  };
  
  const sanitizeFilename = (name) => {
    return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_.-]/g, '');
  };

  const handleSubmitProduct = async () => {
    if (!productForm.name || !productForm.price) {
      toast({ title: "Error", description: "Name and Price are required.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    let imageUrl = productForm.image_url;
    let imagePathToDelete = null;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const baseName = productForm.name ? sanitizeFilename(productForm.name) : `product_${productCount + 1}`;
      const uniqueFileName = `public/${baseName}_${Date.now()}.${fileExt}`;

      if (editingProduct && editingProduct.image_url) {
        try {
          const oldUrlParts = editingProduct.image_url.split('/');
          imagePathToDelete = oldUrlParts.slice(oldUrlParts.indexOf('product-images') + 1).join('/');
        } catch (e) {
          console.warn("Could not parse old image URL for deletion:", editingProduct.image_url);
        }
      }
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(uniqueFileName, imageFile, {
          cacheControl: '3600',
          upsert: false 
        });

      if (uploadError) {
        toast({ title: "Image Upload Error", description: uploadError.message, variant: "destructive" });
        setIsUploading(false);
        return;
      }
      
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(uniqueFileName);
      imageUrl = publicUrl;

      if (imagePathToDelete && imageUrl !== editingProduct.image_url && imagePathToDelete !== 'product-images' && !imagePathToDelete.startsWith('public/https')) {
        try {
          await supabase.storage.from('product-images').remove([imagePathToDelete]);
        } catch (deleteError) {
          console.warn("Failed to delete old image from storage:", deleteError);
        }
      }
    }

    const productData = {
      ...productForm,
      price: parseFloat(productForm.price),
      original_price: productForm.original_price ? parseFloat(productForm.original_price) : parseFloat(productForm.price),
      sale_price: productForm.sale_price ? parseFloat(productForm.sale_price) : null,
      image_url: imageUrl,
      sold_at: productForm.available ? null : (productForm.sold_at || new Date().toISOString()),
    };
    
    if (editingProduct) {
      delete productData.id; 
      const { error: updateError } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
      if (updateError) {
        toast({ title: "Database Error", description: updateError.message, variant: "destructive" });
      } else {
        toast({ title: "Product Updated", description: `${productForm.name} has been updated.` });
        onProductSaved();
        resetForm();
      }
    } else {
      delete productData.id;
      const { error: insertError } = await supabase.from('products').insert([productData]);
      if (insertError) {
        toast({ title: "Database Error", description: insertError.message, variant: "destructive" });
      } else {
        toast({ title: "Product Added", description: `${productForm.name} is now available.` });
        onProductSaved();
        resetForm();
      }
    }
    setIsUploading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(openStatus) => {
      onOpenChange(openStatus);
      if (!openStatus) {
        setProductForm(initialFormState); // Reset form when dialog is closed
        setImageFile(null);
        setImagePreview(null);
      }
    }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="productName">Name</Label>
            <Input id="productName" name="name" value={productForm.name} onChange={handleInputChange} />
          </div>
          <div>
            <Label htmlFor="productDescription">Description</Label>
            <Textarea id="productDescription" name="description" value={productForm.description} onChange={handleInputChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="productOriginalPrice">Original Price (Optional)</Label>
              <Input id="productOriginalPrice" name="original_price" type="number" value={productForm.original_price} onChange={handleInputChange} placeholder="e.g. 5000" />
            </div>
            <div>
              <Label htmlFor="productSalePrice">Sale Price (Optional)</Label>
              <Input id="productSalePrice" name="sale_price" type="number" value={productForm.sale_price} onChange={handleInputChange} placeholder="e.g. 4500" />
            </div>
            <div>
              <Label htmlFor="productPrice">Current Price *</Label>
              <Input id="productPrice" name="price" type="number" value={productForm.price} onChange={handleInputChange} placeholder="e.g. 4500 or 5000" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Current Price is what the item sells for. If on sale, this should be the Sale Price. Otherwise, it's the Original Price.</p>
          
          <div>
            <Label htmlFor="productImage">Product Image</Label>
            <div className="flex items-center gap-4 mt-1">
              <Input id="productImage" type="file" accept="image/*" onChange={handleImageChange} className="flex-1" />
            </div>
            {imagePreview && <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-md object-cover mt-2 border" />}
          </div>
          <div>
            <Label htmlFor="productCategory">Category</Label>
            <Input id="productCategory" name="category" value={productForm.category} onChange={handleInputChange} />
          </div>
          <div>
            <Label htmlFor="productSizes">Sizes (comma-separated)</Label>
            <Input id="productSizes" name="sizes" value={Array.isArray(productForm.sizes) ? productForm.sizes.join(', ') : ''} onChange={(e) => handleArrayInputChange('sizes', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="productColors">Colors (comma-separated)</Label>
            <Input id="productColors" name="colors" value={Array.isArray(productForm.colors) ? productForm.colors.join(', ') : ''} onChange={(e) => handleArrayInputChange('colors', e.target.value)} />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="is_one_of_one" name="is_one_of_one" checked={productForm.is_one_of_one} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
            <Label htmlFor="is_one_of_one">This is a 1-of-1 Exclusive Item</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="available" name="available" checked={productForm.available} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
            <Label htmlFor="available">Currently Available for Sale</Label>
          </div>
          {!productForm.available && (
            <div>
              <Label htmlFor="sold_at">Sold At Date (if marking as sold)</Label>
              <Input id="sold_at" name="sold_at" type="datetime-local" value={productForm.sold_at || ''} onChange={handleInputChange} />
            </div>
          )}
        </div>
        <DialogClose asChild>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSubmitProduct} disabled={isUploading}>
              {isUploading ? 'Saving...' : (editingProduct ? 'Save Changes' : 'Add Product')}
            </Button>
          </div>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;