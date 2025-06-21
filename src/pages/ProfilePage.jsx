import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, LogOut, Edit2, Sparkles, Palette, Image as ImageIcon, CreditCard, ShoppingBag, Camera, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; 
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const ProfilePage = () => {
  const { user, logout, profile: authDbProfile, loading: authLoading, updateUserProfile, fetchFullUserProfile } = useAuth();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar_url: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [userCustomRequests, setUserCustomRequests] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (authDbProfile) { // Use data from 'profiles' table primarily
      setProfileData({
        name: authDbProfile.full_name || user?.email?.split('@')[0] || '',
        email: authDbProfile.email || user?.email || '',
        phone: authDbProfile.phone_number || '',
        address: authDbProfile.address || '',
        avatar_url: authDbProfile.avatar_url || user?.user_metadata?.avatar_url || ''
      });
      setAvatarPreview(authDbProfile.avatar_url || user?.user_metadata?.avatar_url || null);
    } else if (user) { // Fallback to user_metadata if profile table data isn't loaded yet
       setProfileData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        address: user.user_metadata?.address || '',
        avatar_url: user.user_metadata?.avatar_url || ''
      }));
      setAvatarPreview(user.user_metadata?.avatar_url || null);
    }
  }, [user, authDbProfile]);

  useEffect(() => {
    const fetchRelatedData = async () => {
      if (!user) {
        setUserCustomRequests([]);
        setUserOrders([]);
        return;
      }
      setLoadingRequests(true);
      setLoadingOrders(true);
      try {
        const [{ data: requestsData, error: requestsError }, { data: ordersData, error: ordersError }] = await Promise.all([
          supabase.from('custom_design_requests').select('*, orders(id, status)').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('orders').select('id, created_at, total_amount, status, shipping_address, order_items_details').eq('user_id', user.id).order('created_at', { ascending: false })
        ]);
        if (requestsError) throw requestsError;
        setUserCustomRequests(requestsData || []);
        if (ordersError) throw ordersError;
        setUserOrders(ordersData || []);
      } catch (error) {
        toast({ title: "Error fetching data", description: error.message, variant: "destructive" });
      } finally {
        setLoadingRequests(false);
        setLoadingOrders(false);
      }
    };
    fetchRelatedData();
  }, [user]);

  const handleInputChange = (e) => {
    setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    const profileDetailsToUpdate = {
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        // avatar_url will be handled by updateUserProfile if avatarFile is present
    };

    const result = await updateUserProfile(profileDetailsToUpdate, avatarFile);
    
    if (result.success) {
      setIsEditing(false);
      setAvatarFile(null); // Reset avatar file after successful upload
      // Profile data and preview should update via useEffect listening to authDbProfile
    }
    // Toast notifications are handled within updateUserProfile
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setAvatarFile(null);
    // Revert changes to what's in authDbProfile
    if (authDbProfile) {
      setProfileData({
        name: authDbProfile.full_name || user?.email?.split('@')[0] || '',
        email: authDbProfile.email || user?.email || '',
        phone: authDbProfile.phone_number || '',
        address: authDbProfile.address || '',
        avatar_url: authDbProfile.avatar_url || user?.user_metadata?.avatar_url || ''
      });
      setAvatarPreview(authDbProfile.avatar_url || user?.user_metadata?.avatar_url || null);
    }
  };


  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  const getStatusColor = (status, orderStatus = null) => {
    if (status === 'Completed' && orderStatus === 'Pending') return 'bg-yellow-500 text-black'; 
    if (status === 'Completed' && orderStatus !== 'Pending') return 'bg-green-600 text-white'; 
    if (status === 'Mockup Ready') return 'bg-green-500 text-white';
    if (status === 'Under Review') return 'bg-yellow-400 text-black';
    if (status === 'In Progress') return 'bg-blue-500 text-white';
    if (status === 'Cancelled') return 'bg-red-500 text-white';
    if (status === 'Failed') return 'bg-red-600 text-white'; 
    if (status === 'Pending') return 'bg-orange-400 text-black'; 
    return 'bg-gray-400 text-white';
  };

  const getCustomRequestStatusText = (status, orderStatus) => {
    if (status === 'Completed' && orderStatus === 'Pending') return 'Payment Pending';
    if (status === 'Completed' && orderStatus !== 'Pending') return 'Paid & Completed';
    return status;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  const userInitial = profileData.name ? profileData.name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || '?');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-gray-600 mt-2">Manage your account and view your exclusive collection</p>
            </div>
            {user && (
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            )}
            {!user && (
                 <Button onClick={() => navigate('/')} className="flex items-center gap-2">
                    Login to View Profile
                 </Button>
            )}
          </div>

          {user ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                  <CardHeader className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4 group">
                       <Avatar className="w-24 h-24 text-3xl">
                         <AvatarImage src={avatarPreview || profileData.avatar_url} alt={profileData.name} />
                         <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            {userInitial}
                         </AvatarFallback>
                       </Avatar>
                      {isEditing && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute bottom-0 right-0 rounded-full bg-white/80 hover:bg-white w-8 h-8"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Camera className="w-4 h-4 text-purple-600" />
                        </Button>
                      )}
                    </div>
                     <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                    <CardTitle className="text-xl">
                      {profileData.name || user.email?.split('@')[0]}
                    </CardTitle>
                    <p className="text-gray-600">{profileData.email}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" name="name" value={profileData.name} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" name="email" type="email" value={profileData.email} onChange={handleInputChange} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" name="phone" value={profileData.phone} onChange={handleInputChange} placeholder="+234..."/>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Shipping Address</Label>
                          <Textarea id="address" name="address" value={profileData.address} onChange={handleInputChange} placeholder="123 Fashion St, Style City, State" />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveProfile} className="flex-1 flex items-center gap-1">
                            <Save className="w-4 h-4"/>Save
                          </Button>
                          <Button variant="outline" onClick={handleCancelEdit} className="flex items-center gap-1">
                            <X className="w-4 h-4"/>Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-3 text-sm">
                          {profileData.phone && <div><span className="font-medium text-gray-700">Phone:</span><p className="text-gray-600">{profileData.phone}</p></div>}
                          {profileData.address && <div><span className="font-medium text-gray-700">Address:</span><p className="text-gray-600 whitespace-pre-line">{profileData.address}</p></div>}
                          {(!profileData.phone && !profileData.address && (!avatarPreview || avatarPreview === profileData.avatar_url)) && 
                           (!authDbProfile?.phone_number && !authDbProfile?.address && !authDbProfile?.avatar_url) &&
                           <p className="text-gray-500 italic text-center py-2">Complete your profile for a better experience!</p>
                          }
                        </div>
                        <Button onClick={() => setIsEditing(true)} className="w-full flex items-center gap-2">
                          <Edit2 className="w-4 h-4" />Edit Profile
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
                 <Card className="mt-6 backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-pink-500" />Quick Stats</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between"><span className="text-gray-600">Orders Placed</span><Badge variant="secondary">{userOrders.length}</Badge></div>
                    <div className="flex justify-between"><span className="text-gray-600">Wishlist Items</span><Badge variant="secondary">{wishlistItems.length}</Badge></div>
                    <div className="flex justify-between"><span className="text-gray-600">Custom Requests</span><Badge variant="secondary">{userCustomRequests.length}</Badge></div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2 space-y-8">
                 <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Palette className="w-6 h-6 text-green-500" /> My Custom Design Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingRequests ? ( <p className="text-center text-gray-500 py-4">Loading requests...</p> ) 
                    : userCustomRequests.length === 0 ? (
                      <div className="text-center py-12">
                        <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No custom requests yet</h3>
                        <p className="text-gray-600 mb-6">Ready to design something unique?</p>
                        <Button onClick={() => navigate('/custom-design')}>Request a Design</Button>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                        {userCustomRequests.map((request) => (
                          <motion.div key={request.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold">Request ID: {request.id.substring(0, 8)}...</h3>
                                <p className="text-sm text-gray-500">Submitted: {new Date(request.created_at).toLocaleDateString()}</p>
                                {request.base_product_name && <p className="text-xs text-gray-500 italic">Based on: {request.base_product_name}</p>}
                              </div>
                              <Badge className={`${getStatusColor(request.status, request.orders?.status)}`}>{getCustomRequestStatusText(request.status, request.orders?.status)}</Badge>
                            </div>
                            <p className="text-sm text-gray-700 mb-3 line-clamp-2">"{request.description}"</p>
                            {request.final_price && <p className="text-sm font-medium text-purple-600">Price: ₦{request.final_price.toLocaleString()}</p>}
                            
                            {request.status === 'Mockup Ready' && !request.order_id && (
                              <Button size="sm" onClick={() => navigate(`/mockup-review/${request.id}`)} className="bg-purple-500 hover:bg-purple-600 mt-2">
                                <Sparkles className="w-4 h-4 mr-2"/> Review & Pay
                              </Button>
                            )}
                            {request.order_id && request.orders?.status === 'Pending' && (
                                 <Button size="sm" onClick={() => navigate(`/checkout?custom_request_id=${request.id}`)} className="bg-yellow-500 hover:bg-yellow-600 text-black mt-2">
                                    <CreditCard className="w-4 h-4 mr-2"/> Complete Payment
                                </Button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <ShoppingBag className="w-6 h-6 text-blue-500" /> Order History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingOrders ? ( <p className="text-center text-gray-500 py-4">Loading orders...</p> )
                    : userOrders.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-600 mb-6">Start building your exclusive collection today!</p>
                        <Button onClick={() => navigate('/shop')}>Browse Designs</Button>
                      </div>
                    ) : (
                      <div className="space-y-6 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                        {userOrders.map((order) => (
                          <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold text-lg">Order ID: {order.id.substring(0,8)}...</h3>
                                <p className="text-gray-600 text-sm">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                              </div>
                              <Badge className={`${getStatusColor(order.status)}`}>{order.status}</Badge>
                            </div>
                            <div className="space-y-3 mb-3">
                              {order.order_items_details && order.order_items_details.map((item, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                  <div className="flex items-center gap-2">
                                      <img src={item.image_url || 'https://via.placeholder.com/40'} alt={item.name} className="w-10 h-10 object-cover rounded"/>
                                      <div>
                                        <p className="font-medium text-sm">{item.name}</p>
                                        <p className="text-xs text-gray-500">Qty: {item.quantity}{item.size ? `, Size: ${item.size}` : ''}{item.color ? `, Color: ${item.color}` : ''}</p>
                                        {(item.is_one_of_one || item.isCustom) && <Badge variant="outline" className="mt-1 text-xs">🏆 Exclusive</Badge>}
                                      </div>
                                  </div>
                                  <p className="font-semibold text-sm">₦{item.price_at_purchase.toLocaleString()}</p>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                              <span className="font-semibold">Total: ₦{order.total_amount.toLocaleString()}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <User className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Your Profile</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">Please log in to view your profile, manage custom designs, and see your order history.</p>
              <Button onClick={() => navigate('/')} className="hero-gradient text-white text-lg px-8 py-3">
                Login or Sign Up
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;