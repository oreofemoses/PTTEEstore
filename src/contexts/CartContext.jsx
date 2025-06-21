
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext'; 
import { supabase } from '@/lib/supabaseClient'; 

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(null);
  const { user, initialAuthCheckComplete } = useAuth(); 
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      if (!initialAuthCheckComplete) {
        return;
      }

      setLoading(true);

      if (user) {
        try {
          const { data: supabaseCartData, error: supabaseError } = await supabase
            .from('user_carts')
            .select('cart_data')
            .eq('user_id', user.id)
            .single();

          if (supabaseError && supabaseError.code !== 'PGRST116') {
            console.error("Error fetching cart from Supabase:", supabaseError);
            toast({ title: "Error", description: "Could not load your cart.", variant: "destructive" });
            setCartItems([]);
          } else {
            setCartItems(supabaseCartData?.cart_data || []);
          }
        } catch (e) {
          console.error("Exception fetching cart:", e);
          toast({ title: "Error", description: "An unexpected error occurred while loading your cart.", variant: "destructive" });
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
      
      setLoading(false);
    };

    fetchCart();
  }, [user, initialAuthCheckComplete]);

  const saveCartToSupabase = useCallback(async (itemsToSave) => {
    if (!user || isSyncing) return;
    
    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('user_carts')
        .upsert({ user_id: user.id, cart_data: itemsToSave }, { onConflict: 'user_id' });
      
      if (error) throw error;

    } catch (error) {
      console.error("Error saving cart to Supabase:", error);
      toast({ title: "Sync Error", description: "Could not save your cart changes online.", variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  }, [user, isSyncing]);

  useEffect(() => {
    if (loading || cartItems === null || !user) {
      return;
    }
    saveCartToSupabase(cartItems);
  }, [cartItems, user, loading, saveCartToSupabase]);

  const addToCart = (itemData) => {
    if (!user) {
      toast({ title: "Login Required", description: "Please log in to add items to your cart.", variant: "info" });
      return;
    }
    if (!itemData || (!itemData.productId && !itemData.customRequestId)) {
      toast({ title: "Error", description: "Invalid item data for cart.", variant: "destructive" });
      return;
    }

    let uniqueCartId;
    if (itemData.productId) {
      if (!itemData.size || !itemData.color) {
        toast({ title: "Selection Missing", description: "Please select size and color.", variant: "warning" });
        return;
      }
      uniqueCartId = `${itemData.productId}-${itemData.size}-${itemData.color}`;
    } else { 
      uniqueCartId = `${itemData.customRequestId}-${itemData.customMockupId || 'default'}-${itemData.size}-${itemData.color}`;
    }
    
    const cartItem = {
      id: uniqueCartId,
      productId: itemData.productId || null,
      customRequestId: itemData.customRequestId || null,
      customMockupId: itemData.customMockupId || null,
      name: itemData.name,
      price: itemData.price,
      image_url: itemData.image_url || null,
      size: itemData.size || null,
      color: itemData.color || null,
      quantity: itemData.quantity || 1,
      is_one_of_one: itemData.is_one_of_one || false,
      isCustom: itemData.isCustom || false,
      available: itemData.available !== undefined ? itemData.available : true,
    };

    setCartItems(prev => {
      const currentCart = prev || [];
      const existingItem = currentCart.find(item => item.id === cartItem.id);
      if (existingItem) {
        if (cartItem.is_one_of_one || cartItem.isCustom) {
          toast({ title: "Already in Cart", description: `${cartItem.name} is a unique item and is already in your cart.`, variant: "warning" });
          return currentCart;
        }
        return currentCart.map(item =>
          item.id === cartItem.id ? { ...item, quantity: item.quantity + (cartItem.quantity || 1) } : item
        );
      }
      return [...currentCart, cartItem];
    });

    toast({ title: "Added to cart!", description: `${cartItem.name} has been added.` });
  };

  const removeFromCart = (itemId) => {
    if (!user) return; 
    setCartItems(prev => (prev || []).filter(item => item.id !== itemId));
    toast({ title: "Removed from cart", description: "Item has been removed." });
  };

  const updateQuantity = (itemId, quantity) => {
    if (!user) return; 
    const itemToUpdate = (cartItems || []).find(item => item.id === itemId);
    if ((itemToUpdate?.is_one_of_one || itemToUpdate?.isCustom) && quantity > 1) {
      toast({ title: "Unique Item", description: "Only one unit can be purchased.", variant: "warning" });
      return;
    }
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prev => (prev || []).map(item => item.id === itemId ? { ...item, quantity } : item));
  };

  const clearCart = async (isOrderCompletion = false) => {
    setCartItems([]);
    if (user) {
       await saveCartToSupabase([]); 
    }
    if (!isOrderCompletion) {
        toast({ title: "Cart Cleared", description: "Your shopping cart is now empty."});
    }
  };
  
  const getTotalPrice = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    isLoadingCart: loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
