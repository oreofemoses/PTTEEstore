import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomDesignForm from '@/components/custom-design/CustomDesignForm';
import CustomDesignHowItWorks from '@/components/custom-design/CustomDesignHowItWorks';
import CustomDesignTips from '@/components/custom-design/CustomDesignTips';
import CustomDesignHeader from '@/components/custom-design/CustomDesignHeader';

const CustomDesignPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const initialFormDataState = {
    description: '',
    shirt_color: 'Black',
    shirt_style: 'Classic Tee',
    email: '',
    name: '',
    base_product_id: null,
    base_image_url: null,
    base_product_name: null,
  };

  const [formData, setFormData] = useState(initialFormDataState);
  const [referenceImages, setReferenceImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const shirtColors = ['Black', 'White', 'Navy', 'Gray', 'Red', 'Blue', 'Green', 'Purple'];
  const shirtStyles = ['Classic Tee', 'V-Neck', 'Tank Top', 'Long Sleeve', 'Hoodie'];

  const getInitialDescription = (baseName, baseDescription) => {
    let initialDesc = '';
    if (baseName) {
      initialDesc = `Based on design: "${decodeURIComponent(baseName)}".\nMy customization ideas: \n`;
    } else if (baseDescription) {
      initialDesc = `Based on description: "${decodeURIComponent(baseDescription)}".\nMy customization ideas: \n`;
    }
    return initialDesc;
  };
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const baseProductId = params.get('baseProductId');
    const baseImageUrl = params.get('baseImageUrl');
    const baseName = params.get('baseName');
    const baseDescriptionParam = params.get('baseDescription');

    const initialDescription = getInitialDescription(baseName, baseDescriptionParam);

    setFormData(prev => ({
      ...initialFormDataState, 
      email: user?.email || '',
      name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
      base_product_id: baseProductId,
      base_image_url: baseImageUrl ? decodeURIComponent(baseImageUrl) : null,
      base_product_name: baseName ? decodeURIComponent(baseName) : null,
      description: initialDescription,
    }));
  }, [user, location.search]);


  const handleSubmit = async (currentFormData, currentReferenceImages) => {
    if (!user && (!currentFormData.email || !currentFormData.name)) {
      toast({
        title: "Information Missing",
        description: "Please provide your name and email if you're not logged in.",
        variant: "destructive",
      });
      return;
    }
     if (!currentFormData.description.trim()) {
       toast({
        title: "Description Missing",
        description: "Please describe your design idea or modifications.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);

    try {
      const uploadedImagePaths = [];
      for (const img of currentReferenceImages) {
        if (img.file && !img.uploadPath) {
          const fileName = `custom_requests/${user?.id || 'guest'}/${Date.now()}_${img.file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, img.file);
          
          if (uploadError) throw uploadError;
          
          const { data: publicUrlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(uploadData.path);
          uploadedImagePaths.push(publicUrlData.publicUrl);
        } else if (img.uploadPath) {
          uploadedImagePaths.push(img.uploadPath);
        }
      }

      const { data, error } = await supabase
        .from('custom_design_requests')
        .insert([{ 
          user_id: user?.id, 
          user_email: user ? user.email : currentFormData.email,
          user_name: user ? (user.user_metadata?.full_name || user.email.split('@')[0]) : currentFormData.name,
          description: currentFormData.description,
          shirt_color: currentFormData.shirt_color,
          shirt_style: currentFormData.shirt_style,
          reference_images: uploadedImagePaths,
          status: 'Under Review',
          base_product_id: currentFormData.base_product_id,
          base_image_url: currentFormData.base_image_url,
          base_product_name: currentFormData.base_product_name,
        }])
        .select();

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Design submitted successfully!",
        description: "We'll review your request and get back to you with mockups.",
      });

    } catch (error) {
      console.error("Error submitting custom design:", error);
      toast({
        title: "Submission failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setIsSubmitted(false);
    const params = new URLSearchParams(location.search);
    const baseProductId = params.get('baseProductId');
    const baseImageUrl = params.get('baseImageUrl');
    const baseName = params.get('baseName');
    const baseDescriptionParam = params.get('baseDescription');
    
    const initialDescription = getInitialDescription(baseName, baseDescriptionParam);
    
    setFormData({
      ...initialFormDataState,
      description: initialDescription,
      email: user?.email || '', 
      name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
      base_product_id: baseProductId, 
      base_image_url: baseImageUrl ? decodeURIComponent(baseImageUrl) : null, 
      base_product_name: baseName ? decodeURIComponent(baseName) : null,
    });
    setReferenceImages([]);
    if (!baseProductId) { 
        navigate('/custom-design', { replace: true });
    }
  };


  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-md">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-4 gradient-text">Design Submitted!</h1>
            <p className="text-gray-600 text-center mb-6">
              Thank you! Our team will create mockups and you'll be able to review them in your profile.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={resetForm}
                className="w-full hero-gradient text-white"
              >
                Submit Another Design
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/profile')}>
                View My Requests
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <CustomDesignHeader 
        baseProductName={formData.base_product_name} 
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <CustomDesignForm
                formData={formData}
                setFormData={setFormData}
                referenceImages={referenceImages}
                setReferenceImages={setReferenceImages}
                shirtColors={shirtColors}
                shirtStyles={shirtStyles}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                user={user}
              />
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <CustomDesignHowItWorks />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
              <CustomDesignTips />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomDesignPage;