import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const AdminRoute = ({ children }) => {
  const { loading, user, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!user) {
    toast({
      title: "Authentication Required",
      description: "You must be logged in to access this page.",
      variant: "destructive",
    });
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    toast({
      title: "Access Denied",
      description: "You do not have permission to access the admin area.",
      variant: "destructive",
    });
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  return children;
};

export default AdminRoute;