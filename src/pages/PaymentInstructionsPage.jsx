import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Banknote, Upload, Clipboard, ClipboardCheck, CheckCircle } from 'lucide-react';

const PaymentInstructionsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);
  
  const accountDetails = {
    name: 'Adenubi Oreofe Moses',
    number: '9059685896',
    bank: 'Opay',
  };

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      if (!orderId || !user) {
        toast({ title: "Error", description: "Order not found or you are not logged in.", variant: "destructive" });
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        toast({ title: "Error", description: "Could not retrieve your order details.", variant: "destructive" });
        navigate('/profile');
      } else {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId, user, navigate]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied!", description: "Account number copied to clipboard." });
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload a file smaller than 5MB.", variant: "destructive" });
        return;
      }
      if (!validTypes.includes(file.type)) {
        toast({ title: "Invalid file type", description: "Please upload a JPG, PNG, or PDF file.", variant: "destructive" });
        return;
      }
      setReceiptFile(file);
    }
  };

  const handleUploadReceipt = async () => {
    if (!receiptFile) {
      toast({ title: "No file selected", description: "Please select your payment receipt to upload.", variant: "warning" });
      return;
    }
    setUploading(true);

    const fileExt = receiptFile.name.split('.').pop();
    const fileName = `${user.id}/${orderId}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('payment-receipts')
      .upload(filePath, receiptFile, {
          cacheControl: '3600',
          upsert: true
      });
      
    if (uploadError) {
      toast({ title: "Upload Failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        payment_receipt_url: filePath,
        status: 'Pending Confirmation'
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      toast({ title: "Order Update Failed", description: updateError.message, variant: "destructive" });
    } else {
      setOrder(updatedOrder);
      toast({ title: "Receipt Submitted!", description: "Your order is now pending confirmation. We'll notify you soon." });
    }
    setUploading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <p>Order not found.</p>
      </div>
    );
  }
  
  const isPaid = order.status !== 'Awaiting Payment';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="bg-white/80 backdrop-blur-md border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold gradient-text">
              {isPaid ? "Payment Submitted" : "Complete Your Order"}
            </CardTitle>
            <CardDescription>
                {isPaid ? "Your payment receipt has been submitted for verification." : "Please make a payment to the account below to finalize your order."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {isPaid ? (
              <div className="text-center p-8 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-800">Thank You!</h3>
                <p className="text-gray-600 mt-2">
                  Your order status is now <span className="font-semibold">{order.status}</span>. We will review your payment and update you on the progress via email.
                </p>
                <Button onClick={() => navigate('/profile')} className="mt-6 hero-gradient text-white">
                  View My Orders
                </Button>
              </div>
            ) : (
              <>
                <div className="p-6 bg-purple-50 rounded-lg border border-purple-200 space-y-4">
                  <h3 className="text-lg font-semibold text-purple-800">Bank Transfer Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium text-gray-600">Account Name:</span> {accountDetails.name}</p>
                    <div className="flex items-center gap-4">
                      <p><span className="font-medium text-gray-600">Account Number:</span> {accountDetails.number}</p>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(accountDetails.number)}>
                        {copied ? <ClipboardCheck className="w-4 h-4 text-green-500"/> : <Clipboard className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p><span className="font-medium text-gray-600">Bank:</span> {accountDetails.bank}</p>
                  </div>
                </div>

                <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-300">
                   <h3 className="text-lg font-semibold text-yellow-800">Important Information</h3>
                    <ul className="list-disc list-inside mt-2 text-yellow-900 space-y-1 text-sm">
                        <li>Total Amount to Pay: <span className="font-bold text-xl">₦{order.total_amount.toLocaleString()}</span></li>
                        <li>Your Unique Payment Code: <span className="font-bold text-xl text-red-600">{order.payment_code}</span></li>
                        <li>Please use the payment code as the transaction reference/narration.</li>
                    </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Upload Payment Receipt</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="receipt-upload" className="sr-only">Upload Receipt</Label>
                      <Input id="receipt-upload" type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, application/pdf" />
                    </div>
                    {receiptFile && <p className="text-sm text-gray-600">Selected file: {receiptFile.name}</p>}
                    <Button onClick={handleUploadReceipt} disabled={uploading || !receiptFile} className="w-full hero-gradient text-white">
                      {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      Submit Receipt
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentInstructionsPage;