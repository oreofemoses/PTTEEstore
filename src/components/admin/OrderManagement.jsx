import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ClipboardList, PackageCheck, Truck, CheckCircle, XCircle, RefreshCw, Paperclip, Hourglass } from 'lucide-react';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const baseSelectQuery = `
    id, user_id, total_amount, status, shipping_address, payment_details, created_at, updated_at,
    order_items_details, payment_code, payment_receipt_url,
    profiles!fk_orders_user_id (email, full_name)
    order_items!fk_order_items_order_id ( name, quantity, price, image_url, is_custom_design, size, color )
  `;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(baseSelectQuery)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      toast({ title: "Error fetching orders", description: error.message, variant: "destructive" });
      setOrders([]);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  }, [baseSelectQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select(baseSelectQuery)
      .single();

    if (error) {
      toast({ title: "Update Error", description: `Failed to update order status: ${error.message}`, variant: "destructive" });
    } else {
      toast({ title: "Status Updated", description: `Order ${orderId.substring(0,8)} status changed to ${newStatus}.` });
      setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? data : o));
    }
  };

  const handleViewReceipt = async (receiptPath) => {
    if (!receiptPath) return;
    try {
      const { data, error } = await supabase
        .storage
        .from('payment-receipts')
        .createSignedUrl(receiptPath, 60); // 60 seconds validity

      if (error) {
        throw error;
      }
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error creating signed URL:', error);
      toast({
        title: "Error",
        description: "Could not display receipt. " + error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Awaiting Payment': return 'bg-orange-400 text-black';
      case 'Pending Confirmation': return 'bg-yellow-400 text-black';
      case 'Processing': return 'bg-blue-500 text-white';
      case 'Shipped': return 'bg-indigo-500 text-white';
      case 'Delivered': return 'bg-green-500 text-white';
      case 'Completed': return 'bg-green-600 text-white';
      case 'Cancelled': return 'bg-red-500 text-white';
      case 'Failed': return 'bg-red-600 text-white';
      default: return 'bg-gray-400 text-black';
    }
  };
  
  const orderStatusOptions = ['Awaiting Payment', 'Pending Confirmation', 'Processing', 'Shipped', 'Delivered', 'Completed', 'Cancelled'];

  if (loading) {
    return <div className="flex justify-center items-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>;
  }

  return (
    <Card className="bg-white/80 backdrop-blur-md border-0 shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2"><ClipboardList className="w-6 h-6 text-purple-600"/> Order Fulfillment</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh Orders
          </Button>
        </div>
        <CardDescription>Manage and update the status of customer orders.</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No orders found yet.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="border rounded-lg p-4 sm:p-6 bg-white shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-purple-700">Order ID: {order.id.substring(0, 8)}...</h3>
                    <p className="text-sm text-gray-600">Customer: {order.profiles?.full_name || 'N/A'} ({order.profiles?.email || 'N/A'})</p>
                    <p className="text-xs text-gray-500">Date: {new Date(order.created_at).toLocaleString()}</p>
                    {order.payment_code && <p className="text-xs text-gray-500">Payment Code: <span className="font-mono text-red-600">{order.payment_code}</span></p>}
                  </div>
                  <Badge className={`${getStatusBadgeVariant(order.status)} mt-2 sm:mt-0`}>
                    {order.status}
                  </Badge>
                </div>

                <div className="mb-3">
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Items:</h4>
                  <ul className="list-disc list-inside pl-1 space-y-1 text-sm">
                    {(order.order_items_details)?.map((item, index) => (
                       <li key={index} className="text-gray-600 flex items-center mb-2">
                         {item.image_url && (
                           <img src={item.image_url} alt={item.name} className="w-10 h-10 object-cover rounded mr-2" />
                         )}
                         <div>
                           {item.quantity}x {item.name} - ₦{(item.price || item.price_at_purchase)?.toLocaleString()} each
                           {(item.size || item.color) && (
                             <p className="text-xs text-gray-500">
                               {item.size && `Size: ${item.size}`}
                               {item.size && item.color && ' | '}
                               {item.color && `Color: ${item.color}`}
                             </p>
                           )}
                           {item.is_custom_design && <Badge variant="outline" className="ml-2 text-xs">Custom</Badge>}
                           {item.isCustom && <Badge variant="outline" className="ml-2 text-xs">Custom Design</Badge>}
                         </div>
                       </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Total Amount:</h4>
                  <p className="font-semibold text-purple-600">₦{order.total_amount?.toLocaleString()}</p>
                </div>
                
                {order.payment_receipt_url && (
                    <div className="mb-4">
                        <h4 className="font-medium text-sm text-gray-700 mb-1">Payment Receipt:</h4>
                        <Button
                            variant="link"
                            className="text-purple-600 h-auto p-0 inline-flex items-center gap-1 text-sm"
                            onClick={() => handleViewReceipt(order.payment_receipt_url)}
                        >
                            <Paperclip className="w-4 h-4" /> View Receipt
                        </Button>
                    </div>
                )}

                {order.shipping_address && (
                  <div className="mb-4 text-sm">
                    <h4 className="font-medium text-gray-700 mb-1">Shipping Address:</h4>
                    <p className="text-gray-600">{order.shipping_address.name}</p>
                    <p className="text-gray-600">{order.shipping_address.address}, {order.shipping_address.city}</p>
                    <p className="text-gray-600">{order.shipping_address.state}, {order.shipping_address.zipCode} - {order.shipping_address.country}</p>
                    {order.shipping_address.phone && <p className="text-gray-600">Phone: {order.shipping_address.phone}</p>}
                  </div>
                )}
                
                <CardFooter className="p-0 pt-4 border-t">
                  <div className="flex items-center gap-3 w-full">
                    <Label htmlFor={`status-${order.id}`} className="text-sm font-medium">Update Status:</Label>
                    <Select value={order.status} onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}>
                      <SelectTrigger id={`status-${order.id}`} className="w-auto min-w-[150px] bg-white">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {orderStatusOptions.map(statusOption => (
                          <SelectItem key={statusOption} value={statusOption}>
                            {statusOption === 'Awaiting Payment' && <Hourglass className="w-4 h-4 mr-2 inline-block text-orange-500" />}
                            {statusOption === 'Pending Confirmation' && <Hourglass className="w-4 h-4 mr-2 inline-block text-yellow-500" />}
                            {statusOption === 'Processing' && <PackageCheck className="w-4 h-4 mr-2 inline-block" />}
                            {statusOption === 'Shipped' && <Truck className="w-4 h-4 mr-2 inline-block" />}
                            {statusOption === 'Delivered' && <CheckCircle className="w-4 h-4 mr-2 inline-block" />}
                            {statusOption === 'Completed' && <CheckCircle className="w-4 h-4 mr-2 inline-block text-green-500" />}
                            {statusOption === 'Cancelled' && <XCircle className="w-4 h-4 mr-2 inline-block text-red-500" />}
                            {statusOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardFooter>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderManagement;
