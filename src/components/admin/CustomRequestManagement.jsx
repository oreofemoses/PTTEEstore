import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { Upload, Trash2, PlusCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CustomRequestManagement = () => {
  const [customRequests, setCustomRequestsState] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isMockupModalOpen, setIsMockupModalOpen] = useState(false);
  const [mockupForm, setMockupForm] = useState({ name: '', price: '', url: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomRequests();
  }, []);

  const fetchCustomRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('custom_design_requests')
      .select('*, orders(id, status)') // Also fetch related order status
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching custom requests:', error);
      toast({ title: "Error", description: "Could not fetch custom requests.", variant: "destructive" });
    } else {
      setCustomRequestsState(data || []);
    }
    setLoading(false);
  };

  const updateRequestStatus = async (requestId, status, finalPrice = null) => {
    const updateData = { status };
    if (finalPrice !== null && status === 'Completed') {
      updateData.final_price = parseFloat(finalPrice);
    }

    const { data, error } = await supabase
      .from('custom_design_requests')
      .update(updateData)
      .eq('id', requestId)
      .select();

    if (error) {
      toast({ title: "Error", description: "Could not update status.", variant: "destructive" });
    } else {
      fetchCustomRequests(); // Re-fetch to update UI
      toast({ title: "Status Updated", description: `Request marked as ${status}.` });
    }
  };

  const handleMockupFormChange = (e) => {
    setMockupForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openAddMockupModal = (request) => {
    setSelectedRequest(request);
    setMockupForm({ name: '', price: request.final_price || '', url: '' });
    setIsMockupModalOpen(true);
  };

  const handleAddMockup = async () => {
    if (!mockupForm.name || !mockupForm.price || !mockupForm.url || !selectedRequest) {
      toast({ title: "Error", description: "All mockup fields and a selected request are required.", variant: "destructive" });
      return;
    }
    
    const currentMockups = selectedRequest.mockups || [];
    const newMockup = {
      id: `mockup-${selectedRequest.id}-${Date.now()}`,
      name: mockupForm.name,
      price: parseFloat(mockupForm.price),
      url: mockupForm.url,
    };

    const { data, error } = await supabase
      .from('custom_design_requests')
      .update({ 
        mockups: [...currentMockups, newMockup],
        status: 'Mockup Ready',
        final_price: parseFloat(mockupForm.price) // Also update final_price from the last mockup added
      })
      .eq('id', selectedRequest.id);

    if (error) {
      toast({ title: "Error", description: "Could not add mockup.", variant: "destructive" });
    } else {
      fetchCustomRequests();
      setIsMockupModalOpen(false);
      toast({ title: "Mockup Added", description: `New mockup for request ${selectedRequest.id.substring(0,8)}.` });
    }
  };
  
  const handleDeleteMockup = async (requestId, mockupId) => {
    const requestToUpdate = customRequests.find(req => req.id === requestId);
    if (!requestToUpdate) return;

    const updatedMockups = requestToUpdate.mockups.filter(m => m.id !== mockupId);

    const { data, error } = await supabase
      .from('custom_design_requests')
      .update({ mockups: updatedMockups })
      .eq('id', requestId);

    if (error) {
      toast({ title: "Error", description: "Could not delete mockup.", variant: "destructive" });
    } else {
      fetchCustomRequests();
      toast({ title: "Mockup Deleted", description: `Mockup ${mockupId} removed.`});
    }
  };

  const getStatusBadgeVariant = (status, orderStatus) => {
    if (status === 'Completed' && orderStatus === 'Pending') return 'bg-yellow-500 text-black'; // Payment Pending
    if (status === 'Completed') return 'bg-green-600'; // Paid
    if (status === 'Mockup Ready') return 'bg-green-500';
    if (status === 'Under Review') return 'bg-yellow-400 text-black';
    if (status === 'In Progress') return 'bg-blue-500';
    if (status === 'Cancelled') return 'bg-red-500';
    return 'default';
  };

  const getStatusText = (status, orderStatus) => {
    if (status === 'Completed' && orderStatus === 'Pending') return 'Payment Pending';
    if (status === 'Completed') return 'Paid & Completed';
    return status;
  };


  if (loading) {
    return <div className="flex justify-center items-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>;
  }

  return (
    <Card className="bg-white/80 backdrop-blur-md border-0 shadow-xl">
      <CardHeader>
        <CardTitle>Custom Design Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {customRequests.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No custom design requests yet.</p>
        ) : (
          <div className="space-y-6">
            {customRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="border rounded-lg p-6 bg-white shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{request.user_name || `Request ${request.id.substring(0,8)}`}</h3>
                    <p className="text-sm text-gray-600">{request.user_email}</p>
                    <p className="text-xs text-gray-500">
                      Submitted: {new Date(request.created_at).toLocaleDateString()}
                    </p>
                    {request.final_price && <p className="text-sm font-semibold text-purple-600">Final Price: ₦{request.final_price}</p>}
                  </div>
                  <Badge 
                    className={getStatusBadgeVariant(request.status, request.orders?.status)}
                  >
                    {getStatusText(request.status, request.orders?.status)}
                  </Badge>
                </div>
                
                <p className="text-gray-700 mb-3"><span className="font-medium">Description:</span> {request.description}</p>
                <p className="text-sm text-gray-600">Color: {request.shirt_color}, Style: {request.shirt_style}</p>
                {request.base_product_name && <p className="text-sm text-gray-600 italic">Based on: {request.base_product_name}</p>}
                {request.base_image_url && <img  alt="Base design" className="w-20 h-20 object-cover rounded-md my-2" src={request.base_image_url} />}


                {request.reference_images && request.reference_images.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium">Reference Images:</h4>
                     <div className="flex gap-2 mt-1 flex-wrap">
                        {request.reference_images.map((imgUrl, idx) => (
                           <a key={idx} href={imgUrl} target="_blank" rel="noopener noreferrer" className="block">
                             <img  alt={`Reference ${idx + 1}`} className="w-16 h-16 object-cover rounded-md border hover:opacity-80" src={imgUrl} />
                           </a>
                        ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Mockups ({request.mockups?.length || 0}):</h4>
                    {request.mockups && request.mockups.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                            {request.mockups.map(mockup => (
                                <div key={mockup.id} className="border p-2 rounded-md bg-gray-50 relative">
                                    <a href={mockup.url} target="_blank" rel="noopener noreferrer">
                                        <img  alt={mockup.name} className="w-full h-24 object-cover rounded-md mb-1" src={mockup.url || "https://images.unsplash.com/photo-1701330415757-c1d36ca4d2af"} />
                                    </a>
                                    <p className="text-xs font-medium truncate">{mockup.name}</p>
                                    <p className="text-xs text-purple-600">₦{mockup.price}</p>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="absolute top-1 right-1 h-6 w-6 text-red-500 hover:bg-red-100"
                                      onClick={() => handleDeleteMockup(request.id, mockup.id)}
                                      disabled={request.status === 'Completed' || request.status === 'Paid & Completed'}
                                    >
                                      <Trash2 className="h-3 w-3"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                     { request.status !== 'Completed' && request.status !== 'Paid & Completed' && request.status !== 'Cancelled' && (
                        <Button size="sm" variant="outline" onClick={() => openAddMockupModal(request)} className="flex items-center gap-1">
                            <PlusCircle className="w-3 h-3"/> Add/Edit Mockup
                        </Button>
                     )}
                </div>

                <div className="flex gap-2 mt-4 border-t pt-4 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => updateRequestStatus(request.id, 'In Progress')} disabled={request.status === 'In Progress' || request.status === 'Mockup Ready' || request.status === 'Completed' || request.status === 'Paid & Completed' || request.status === 'Cancelled'}>
                    Start Work
                  </Button>
                  <Button size="sm" onClick={() => updateRequestStatus(request.id, 'Mockup Ready')} disabled={request.status === 'Mockup Ready' || !request.mockups || request.mockups.length === 0 || request.status === 'Completed' || request.status === 'Paid & Completed' || request.status === 'Cancelled'}>
                    Finalize Mockups
                  </Button>
                  {request.status === 'Mockup Ready' && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => navigate(`/mockup-review/${request.id}`)}>
                        <ExternalLink className="w-3 h-3 mr-1"/> View User Link
                    </Button>
                  )}
                   <Button size="sm" variant="destructive" onClick={() => updateRequestStatus(request.id, 'Cancelled')} disabled={request.status === 'Completed' || request.status === 'Paid & Completed' || request.status === 'Cancelled'}>
                    Cancel Request
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
      <Dialog open={isMockupModalOpen} onOpenChange={setIsMockupModalOpen}>
          <DialogContent className="max-w-md">
              <DialogHeader>
                  <DialogTitle>Add/Edit Mockup for Request {selectedRequest?.id.substring(0,8)}</DialogTitle>
                  <p className="text-xs text-gray-500">Adding a new mockup will update the request's final price.</p>
              </DialogHeader>
              <div className="space-y-3 py-3">
                  <div>
                      <Label htmlFor="mockupName">Mockup Name</Label>
                      <Input id="mockupName" name="name" value={mockupForm.name} onChange={handleMockupFormChange} placeholder="e.g., Design Option A"/>
                  </div>
                  <div>
                      <Label htmlFor="mockupPrice">Price (₦)</Label>
                      <Input id="mockupPrice" name="price" type="number" value={mockupForm.price} onChange={handleMockupFormChange} placeholder="5000.00"/>
                  </div>
                  <div>
                      <Label htmlFor="mockupUrl">Image URL</Label>
                      <Input id="mockupUrl" name="url" value={mockupForm.url} onChange={handleMockupFormChange} placeholder="https://example.com/mockup.jpg"/>
                  </div>
              </div>
              <DialogClose asChild>
                  <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsMockupModalOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddMockup}>Save Mockup</Button>
                  </div>
              </DialogClose>
          </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CustomRequestManagement;