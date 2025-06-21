
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

const PaymentStatusPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearCart } = useCart();
  const [status, setStatus] = useState('loading'); 
  const [message, setMessage] = useState('Verifying your payment...');
  const [orderId, setOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderIdParam = params.get('order_id');
    const txRefParam = params.get('tx_ref');
    const transactionIdParam = params.get('transaction_id'); 

    setOrderId(orderIdParam);

    if (!orderIdParam || !txRefParam) {
      setStatus('error');
      setMessage('Invalid payment information. Please contact support if you have been charged.');
      toast({ title: 'Error', description: 'Missing order or transaction reference.', variant: 'destructive' });
      return;
    }
    
    const verifyPayment = async () => {
      try {
        const { data, error: functionError } = await supabase.functions.invoke('verify-flutterwave-payment', {
          body: { transaction_id: transactionIdParam, tx_ref: txRefParam },
        });

        if (functionError) throw new Error(`Function error: ${functionError.message}`);
        if (data.error) throw new Error(data.error);

        if (data.status === 'successful') {
          const { error: orderUpdateError } = await supabase.from('orders').update({ 
            status: 'Completed', 
            payment_details: supabase.sql`payment_details || '{"transaction_id": "${transactionIdParam}", "flutterwave_status": "successful"}'::jsonb` 
          }).eq('id', orderIdParam);
          if (orderUpdateError) throw new Error(`Failed to update order: ${orderUpdateError.message}`);
          
          const { data: fetchedOrder, error: fetchOrderError } = await supabase
            .from('orders').select('*, order_items_details').eq('id', orderIdParam).single();
          if (fetchOrderError || !fetchedOrder) throw new Error('Could not retrieve order details after payment.');
          setOrderDetails(fetchedOrder);

          if (fetchedOrder.order_items_details) {
            for (const item of fetchedOrder.order_items_details) {
              if (item.productId && item.is_one_of_one) { 
                await supabase.from('products').update({ available: false, sold_at: new Date().toISOString() }).eq('id', item.productId);
              } else if (item.isCustom && item.customRequestId) { 
                 await supabase.from('custom_design_requests').update({ status: 'Completed', final_price: item.price_at_purchase }).eq('id', item.customRequestId);
              }
            }
          }
          
          setStatus('success');
          setMessage('Your payment was successful and your order is confirmed!');
          toast({ title: 'Payment Success!', description: 'Your order has been placed.'});
          clearCart(true);

        } else if (data.status === 'pending') {
          setStatus('pending');
          setMessage('Your payment is pending. We will update you once confirmed.');
          toast({ title: 'Payment Pending', description: 'Awaiting confirmation from payment gateway.', variant: 'default' });
        } else { 
          await supabase.from('orders').update({ 
            status: 'Failed',
            payment_details: supabase.sql`payment_details || '{"transaction_id": "${transactionIdParam}", "flutterwave_status": "${data.status}"}'::jsonb`
          }).eq('id', orderIdParam);
          setStatus('failed');
          setMessage(`Your payment ${data.status || 'failed'}. Please try again or contact support.`);
          toast({ title: 'Payment Failed', description: data.message || 'The payment could not be completed.', variant: 'destructive'});
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus('error');
        setMessage(`An error occurred during payment verification: ${error.message}. Please contact support.`);
        toast({ title: 'Verification Error', description: 'Could not verify payment. Contact support.', variant: 'destructive'});
      }
    };

    verifyPayment();

  }, [location.search, navigate, clearCart]);

  const renderIcon = () => {
    switch (status) {
      case 'success': return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'failed': return <XCircle className="w-16 h-16 text-red-500" />;
      case 'pending': return <AlertTriangle className="w-16 h-16 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-16 h-16 text-red-500" />;
      default: return <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg w-full">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-6">{renderIcon()}</div>
            <CardTitle className="text-3xl font-bold">
              {status === 'loading' && 'Verifying Payment...'}
              {status === 'success' && 'Payment Successful!'}
              {status === 'failed' && 'Payment Failed'}
              {status === 'pending' && 'Payment Pending'}
              {status === 'error' && 'Verification Error'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600 text-lg">{message}</p>
            {orderId && <p className="text-sm text-gray-500">Order ID: {orderId}</p>}
            {status === 'success' && orderDetails && (
              <div className="text-left p-4 bg-green-50 border border-green-200 rounded-md">
                <h4 className="font-semibold text-green-700 mb-2">Order Summary:</h4>
                {orderDetails.order_items_details && orderDetails.order_items_details.map(item => (
                    <div key={item.id || item.productId || item.customRequestId} className="flex justify-between text-sm py-1">
                        <span>{item.name} (x{item.quantity})</span>
                        <span>₦{(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
                <div className="font-bold flex justify-between text-sm mt-2 pt-2 border-t border-green-300">
                    <span>Total Paid:</span>
                    <span>₦{orderDetails.total_amount.toFixed(2)}</span>
                </div>
                <p className="text-xs text-green-600 mt-3">An email confirmation has been sent to you.</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/shop')} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                <ShoppingBag className="w-4 h-4 mr-2" /> Continue Shopping
              </Button>
              {user && <Button variant="outline" onClick={() => navigate('/profile')}>View My Orders</Button>}
            </div>
             {(status === 'failed' || status === 'error') && (
                <p className="text-xs text-gray-500">If you believe this is an error, please <Link to="/contact" className="underline text-purple-600">contact support</Link>.</p>
             )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentStatusPage;
