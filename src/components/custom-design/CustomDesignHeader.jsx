import React from 'react';
import { motion } from 'framer-motion';

const CustomDesignHeader = ({ baseProductName }) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl lg:text-5xl font-bold gradient-text mb-4">
            {baseProductName ? `Customize "${baseProductName}"` : "Create Your Dream Design"}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {baseProductName 
              ? "Use this design as a starting point and tell us your modifications." 
              : "Describe your vision and we'll bring it to life. Every custom design becomes a unique 1-of-1 piece."
            }
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomDesignHeader;