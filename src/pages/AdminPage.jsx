import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Users, Settings, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // Added Button import
import { useToast } from '@/components/ui/use-toast'; // Added useToast import
import AdminStats from '@/components/admin/AdminStats';
import ProductManagement from '@/components/admin/ProductManagement';
import CustomRequestManagement from '@/components/admin/CustomRequestManagement';
import OrderManagement from '@/components/admin/OrderManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GettingStartedGuide from '@/components/admin/GettingStartedGuide';
import { supabase } from '@/lib/supabaseClient';

const AdminPage = () => {
  const [productCount, setProductCount] = useState(null);
  const { toast } = useToast(); // Initialized toast

  useEffect(() => {
    const getProductCount = async () => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        setProductCount(count);
      } else {
        setProductCount(1); // Default to 1 to avoid showing guide if error
      }
    };
    getProductCount();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              PTTEE Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Manage your exclusive one-of-one designs, orders, and more.</p>
          </div>

          {productCount === 0 && <GettingStartedGuide />}
          
          <AdminStats />

          <Tabs defaultValue="products" className="w-full mt-8">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white/80 backdrop-blur-md shadow-md">
              <TabsTrigger value="products" className="flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">
                <Package className="w-5 h-5" /> Products
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">
                <ShoppingBag className="w-5 h-5" /> Orders
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">
                <Users className="w-5 h-5" /> Custom Requests
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">
                <Settings className="w-5 h-5" /> Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="products" className="mt-6">
              <ProductManagement />
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <OrderManagement />
            </TabsContent>
            
            <TabsContent value="requests" className="mt-6">
              <CustomRequestManagement />
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card className="bg-white/80 backdrop-blur-md border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Application Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    General application settings and configurations will be available here.
                    (e.g., Payment Gateway Setup, Email Notifications, Discount Codes)
                  </p>
                   <Button className="mt-4" onClick={() => toast({ title: "🚧 Feature Not Implemented", description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"})}>
                    Configure Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPage;