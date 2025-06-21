import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, Image as ImageIcon, FileText, Sparkles } from 'lucide-react';

const GettingStartedGuide = () => {
  const steps = [
    {
      icon: <FileText className="w-5 h-5 text-purple-600" />,
      title: "Add Product Details",
      description: "Go to the 'Products' tab and click '+ Add Product'. Fill in the t-shirt's name, description, and price.",
    },
    {
      icon: <ImageIcon className="w-5 h-5 text-blue-600" />,
      title: "Upload Your Design",
      description: "In the same form, upload a high-quality image of your unique t-shirt design. This is what customers will see!",
    },
    {
      icon: <Sparkles className="w-5 h-5 text-yellow-500" />,
      title: "Go Live!",
      description: "Click 'Add Product' to save. Your design will instantly appear on the homepage and shop page, ready for its first owner!",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="mb-8"
    >
      <Card className="bg-gradient-to-r from-purple-50 via-white to-blue-50 border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full shadow-md">
              <Rocket className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">Welcome! Let's Stock Your Store</CardTitle>
              <p className="text-gray-600">Your website is live, but empty. Follow these simple steps to add your first product.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 flex items-center justify-center bg-white rounded-full mb-4 shadow-sm">
                  {step.icon}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GettingStartedGuide;