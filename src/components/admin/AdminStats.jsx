import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Eye, DollarSign, Heart, Users, ShoppingBag, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    availableProducts: 0,
    soldProducts: 0,
    totalWishlists: 0,
    pendingRequests: 0,
    totalRevenue: 0,
    totalOrders: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Products Stats
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('available, wishlist_count, price, sold_at');

      // Custom Design Requests Stats
      const { data: requests, error: requestsError } = await supabase
        .from('custom_design_requests')
        .select('status')
        .in('status', ['Under Review', 'In Progress']);
      
      // Orders Stats
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, status')
        .eq('status', 'Completed');


      if (productsError || requestsError || ordersError) {
        console.error('Error fetching stats:', productsError || requestsError || ordersError);
        return;
      }

      const totalProducts = products.length;
      const availableProducts = products.filter(p => p.available).length;
      const soldProductsCount = products.filter(p => !p.available && p.sold_at).length;
      const totalWishlists = products.reduce((sum, p) => sum + (p.wishlist_count || 0), 0);
      const pendingRequests = requests.length;
      
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const totalOrders = orders.length;


      setStats({
        totalProducts,
        availableProducts,
        soldProducts: soldProductsCount,
        totalWishlists,
        pendingRequests,
        totalRevenue,
        totalOrders,
      });
    };

    fetchStats();
  }, []);
  
  const statCards = [
    { title: 'Total Revenue', value: `₦${stats.totalRevenue.toLocaleString()}`, icon: BarChart3, color: 'text-teal-600' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-cyan-600' },
    { title: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-blue-600' },
    { title: 'Available', value: stats.availableProducts, icon: Eye, color: 'text-green-600' },
    { title: 'Sold Items', value: stats.soldProducts, icon: DollarSign, color: 'text-red-600' },
    { title: 'Total Wishlists', value: stats.totalWishlists, icon: Heart, color: 'text-purple-600' },
    { title: 'Pending Requests', value: stats.pendingRequests, icon: Users, color: 'text-orange-600' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map(stat => (
        <Card key={stat.title} className="bg-white/80 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStats;