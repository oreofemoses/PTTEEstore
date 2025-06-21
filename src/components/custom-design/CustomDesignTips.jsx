import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const CustomDesignTips = () => {
  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-0 shadow-xl">
      <CardContent className="p-6">
        <h3 className="font-bold text-lg mb-3 text-purple-700">💡 Customization Tips</h3>
        <ul className="space-y-1.5 text-sm text-gray-700 list-disc list-inside">
          <li>Be specific: colors, style, themes, text.</li>
          <li>Mention placement: front, back, sleeve.</li>
          <li>Upload clear reference images for your changes.</li>
          <li>Describe the overall vibe or feeling.</li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default CustomDesignTips;