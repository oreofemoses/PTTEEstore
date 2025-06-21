import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const SubmittedView = ({ onResetForm }) => {
  const navigate = useNavigate();

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
              onClick={onResetForm}
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
};

export default SubmittedView;