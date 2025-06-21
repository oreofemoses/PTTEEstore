import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CustomDesignHowItWorks = () => {
  const steps = [
    { num: 1, title: "Describe Your Vision", desc: "Tell us exactly what you want on your shirt, or how to modify an existing design." },
    { num: 2, title: "We Create Mockups", desc: "Our designers bring your idea to life." },
    { num: 3, title: "Review & Approve", desc: "Check mockups in your profile, request changes." },
    { num: 4, title: "Order Your 1-of-1", desc: "Purchase your exclusive, never-to-be-repeated design." }
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-md border-0 shadow-xl">
      <CardHeader><CardTitle>How It Works</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {steps.map(step => (
          <div key={step.num} className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">{step.num}</div>
            <div>
              <h4 className="font-semibold">{step.title}</h4>
              <p className="text-sm text-gray-600">{step.desc}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CustomDesignHowItWorks;