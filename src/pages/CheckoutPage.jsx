import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lock, Truck, AlertTriangle, Package, Loader2, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT"
];

const CheckoutPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone_number: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nigeria',
  });

  const { cartItems, getTotalPrice, clearCart, isLoadingCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        phone_number: user.user_metadata?.phone || user.phone || '',
        address: user.user_metadata?.address || '',
        city: user.user_metadata?.city || '',
        state: user.user_metadata?.state || '',
        zipCode: user.user_metadata?.zipCode || '',
      }));
    }
  }, [user]);
  
  const calculateShipping = useCallback((selectedState) => {
    const stateLower = selectedState.toLowerCase();
    if (stateLower === 'ogun' || stateLower === 'lagos') {
      setShippingCost(2000);
    } else if (selectedState === '') {
      setShippingCost(0);
    }
    else {
      setShippingCost(5000);
    }
  }, []);

  useEffect(() => {
    if (formData.state) {
      calculateShipping(formData.state);
    } else {
      setShippingCost(0);
    }
  }, [formData.state, calculateShipping]);

  const totalAmount = getTotalPrice();
  const finalAmount = totalAmount + shippingCost;

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleStateChange = (value) => {
    setFormData(prev => ({ ...prev, state: value }));
  };

  const createOrderForBankTransfer = async () => {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return null;
    }
    if (!cartItems || cartItems.length === 0) {
        toast({ title: "Empty Cart", description: "Your cart is empty.", variant: "destructive" });
        return null;
    }

    const orderItemsDetailsForSnapshot = cartItems.map(item => ({
      id: item.id,
      productId: item.productId || null,
      customRequestId: item.customRequestId || null,
      customMockupId: item.mockupId || null,
      name: item.name,
      price_at_purchase: item.price,
      quantity: item.quantity,
      size: item.size || null,
      color: item.color || null,
      image_url: item.image_url || null,
      is_one_of_one: item.is_one_of_one || false,
      isCustom: item.isCustom || false
    }));

    const paymentCode = `PTTEE-${Date.now().toString(36).slice(-6).toUpperCase()}`;

    const orderData = {
      user_id: user.id,
      total_amount: finalAmount,
      status: 'Awaiting Payment',
      payment_code: paymentCode,
      shipping_address: {
        name: formData.name, address: formData.address, city: formData.city,
        state: formData.state, zipCode: formData.zipCode, country: formData.country, phone: formData.phone_number,
      },
      payment_details: { method: 'Bank Transfer' },
      order_items_details: orderItemsDetailsForSnapshot,
      shipping_cost: shippingCost, 
      subtotal: totalAmount,
    };

    const { data: order, error: orderError } = await supabase.from('orders').insert([orderData]).select().single();
    if (orderError) {
      console.error('Error creating order:', orderError);
      toast({ title: "Order Error", description: `Could not create order: ${orderError.message}`, variant: "destructive" });
      return null;
    }
    
    return order;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const requiredFields = ['name', 'email', 'phone_number', 'address', 'city', 'state'];
    for (const key of requiredFields) {
        if (!formData[key]) {
             toast({ title: "Missing Information", description: `Please fill in your ${key.replace('_', ' ')}.`, variant: "destructive" });
            setIsProcessing(false);
            return;
        }
    }
    if (!cartItems || cartItems.length === 0) {
        toast({ title: "Empty Cart", description: "Your cart is empty.", variant: "destructive" });
        setIsProcessing(false);
        return;
    }
    if (shippingCost === 0 && formData.state === '') {
        toast({ title: "Select State", description: "Please select your state for shipping.", variant: "destructive" });
        setIsProcessing(false);
        return;
    }

    const newOrder = await createOrderForBankTransfer();

    if (newOrder) {
      await clearCart(true);
      navigate(`/payment-instructions/${newOrder.id}`);
    } else {
      setIsProcessing(false);
    }
  };

  if (isLoadingCart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
      </div>
    );
  }

  if ((!cartItems || cartItems.length === 0) && !isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Card className="p-8 shadow-xl">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-6">Add some designs to your cart before checking out.</p>
            <Button onClick={() => navigate('/shop')} className="hero-gradient text-white">Shop Now</Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <Card className="bg-white/80 backdrop-blur-md border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800"><Package className="w-5 h-5 text-purple-600" /> Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems && cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <img  src={item.image_url || "https://via.placeholder.com/64"} alt={item.name} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                      <div>
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                        {(item.size || item.color) && <p className="text-sm text-gray-600">
                          {item.size && `Size: ${item.size}`} {item.size && item.color && ' - '} {item.color && `Color: ${item.color}`}
                        </p>}
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        {item.is_one_of_one && <Badge variant="secondary" className="text-xs mt-1">1-of-1 Exclusive</Badge>}
                        {item.isCustom && <Badge variant="outline" className="text-xs mt-1">Custom Design</Badge>}
                      </div>
                    </div>
                    <p className="font-semibold text-gray-800">₦{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <div className="pt-4 space-y-2 text-gray-700">
                  <div className="flex justify-between"><span>Subtotal</span><span>₦{totalAmount.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>{shippingCost > 0 ? `₦${shippingCost.toFixed(2)}` : (formData.state ? 'Calculated' : 'Select state')}</span></div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300 text-gray-900"><span>Total</span><span>₦{finalAmount.toFixed(2)}</span></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <Card className="bg-white/80 backdrop-blur-md border-0 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-gray-800"><Truck className="w-5 h-5 text-purple-600" /> Shipping & Payment</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">Contact & Shipping</h3>
                    <div><Label htmlFor="name">Full Name *</Label><Input id="name" name="name" value={formData.name} onChange={handleInputChange} required /></div>
                    <div><Label htmlFor="email">Email *</Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required /></div>
                    <div><Label htmlFor="phone_number">Phone Number *</Label><Input id="phone_number" name="phone_number" type="tel" value={formData.phone_number} onChange={handleInputChange} required /></div>
                    <div><Label htmlFor="address">Address *</Label><Input id="address" name="address" value={formData.address} onChange={handleInputChange} required /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label htmlFor="city">City *</Label><Input id="city" name="city" value={formData.city} onChange={handleInputChange} required /></div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Select name="state" value={formData.state} onValueChange={handleStateChange}>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Select state" /></SelectTrigger>
                          <SelectContent>{NIGERIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                     <div><Label htmlFor="zipCode">Zip/Postal Code (Optional)</Label><Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} /></div>
                  </div>
                  <p className="text-sm text-gray-600">You will proceed to a page with bank transfer instructions to complete your payment.</p>
                  <Button type="submit" className="w-full h-12 text-lg hero-gradient text-white" disabled={isProcessing || !cartItems || cartItems.length === 0 || (formData.state && shippingCost === 0 && formData.state !== 'Ogun' && formData.state !== 'Lagos' && getTotalPrice() > 0) }>
                    {isProcessing ? (
                      <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Placing Order...</div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">Place Order <Banknote className="w-4 h-4" /></div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;