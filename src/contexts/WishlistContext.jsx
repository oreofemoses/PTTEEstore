import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false); // Renamed from isLoadingWishlist for clarity
  const { user, initialAuthCheckComplete } = useAuth();

  const fetchWishlist = useCallback(async () => {
    if (!initialAuthCheckComplete) {
      setLoading(true); // Still loading if auth isn't complete
      return;
    }

    if (!user) {
      setWishlistItems([]); // Clear wishlist for anonymous users
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('product_id, products(*)') // Assuming 'products' is the related table
        .eq('user_id', user.id);

      if (error) {
        console.error("Error fetching wishlist:", error);
        const errMessage = error.message?.toLowerCase() || '';
        if (errMessage.includes('failed to fetch')) {
          toast({ title: "Network Error", description: "Could not load wishlist. Check connection.", variant: "destructive" });
        } else {
          toast({ title: "Error fetching wishlist", description: error.message, variant: "destructive" });
        }
        setWishlistItems([]); // Clear on error
      } else {
        setWishlistItems(data.map(item => item.products).filter(Boolean));
      }
    } catch (e) {
      console.error("Wishlist fetch exception:", e);
      toast({ title: "Error", description: "An unexpected error occurred while fetching wishlist.", variant: "destructive" });
      setWishlistItems([]); // Clear on exception
    } finally {
      setLoading(false);
    }
  }, [user, initialAuthCheckComplete]);

  useEffect(() => {
    fetchWishlist();
  }, [user, initialAuthCheckComplete, fetchWishlist]);


  const addToWishlist = async (product) => {
    if (!user) {
      toast({ title: "Please log in", description: "You need to be logged in to add items to your wishlist.", variant: "destructive" });
      return;
    }
    if (!product || !product.id) {
      toast({ title: "Error", description: "Invalid product data.", variant: "destructive" });
      return;
    }
    if (wishlistItems.find(item => item.id === product.id)) {
      toast({ title: "Already in Wishlist", description: `${product.name} is already in your wishlist.` });
      return; 
    }
    
    setLoading(true);
    try {
      const { error: insertError } = await supabase
        .from('wishlists')
        .insert([{ user_id: user.id, product_id: product.id }]);

      if (insertError) throw insertError;

      const { error: rpcError } = await supabase.rpc('increment_wishlist_count', { prod_id: product.id });
      if (rpcError) console.warn('Failed to increment wishlist count, proceeding with UI update.', rpcError);
      
      setWishlistItems(prev => [...prev, product]);
      toast({ title: "Added to wishlist!", description: `${product.name} has been added to your wishlist.` });

    } catch (error) {
      console.error("Error adding to wishlist:", error);
      const errMessage = error.message?.toLowerCase() || '';
      if (errMessage.includes('failed to fetch')) {
        toast({ title: "Network Error", description: "Could not add to wishlist. Check connection.", variant: "destructive" });
      } else {
        toast({ title: "Error adding to wishlist", description: error.message, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from('wishlists')
        .delete()
        .match({ user_id: user.id, product_id: productId });

      if (deleteError) throw deleteError;

      const { error: rpcError } = await supabase.rpc('decrement_wishlist_count', { prod_id: productId });
      if (rpcError) console.warn('Failed to decrement wishlist count, proceeding with UI update.', rpcError);

      setWishlistItems(prev => prev.filter(item => item.id !== productId));
      toast({ title: "Removed from wishlist", description: "Item has been removed from your wishlist." });

    } catch (error) {
      console.error("Error removing from wishlist:", error);
      const errMessage = error.message?.toLowerCase() || '';
      if (errMessage.includes('failed to fetch')) {
        toast({ title: "Network Error", description: "Could not remove from wishlist. Check connection.", variant: "destructive" });
      } else {
        toast({ title: "Error removing from wishlist", description: error.message, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item && item.id === productId);
  };

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    loadingWishlist: loading, // Changed prop name for clarity
    fetchWishlist 
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};