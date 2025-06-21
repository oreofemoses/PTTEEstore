import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ImageGridShowcase = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const BUCKET_NAME = 'homepage-mockup';

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) {
        console.error('Error fetching images from bucket:', error);
        toast({
          title: 'Error loading showcase',
          description: `Could not load images for the homepage grid. Error: ${error.message}`,
          variant: 'destructive',
        });
        setImages([]);
      } else {
        const imageFiles = data.filter(file => file.name && !file.name.endsWith('.emptyFolderPlaceholder')); 
        const imageUrls = imageFiles.map(file => {
          const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(file.name);
          return {
            url: publicUrl,
            name: file.name,
            id: file.id || file.name, 
          };
        });
        setImages(imageUrls);
      }
      setLoading(false);
    };

    fetchImages();
  }, []);

  const gridItemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  };

  const spanClasses = [
    'col-span-1 row-span-1 min-h-[150px] min-w-[150px]', // Added min height/width for debugging
    'col-span-1 row-span-2 min-h-[300px] min-w-[150px]',
    'col-span-2 row-span-1 min-h-[150px] min-w-[300px]',
    'col-span-2 row-span-2 min-h-[300px] min-w-[300px]',
    'col-span-1 row-span-1 min-h-[150px] min-w-[150px]',
  ];

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-purple-200 mb-4"></div>
          <p className="text-purple-600 font-semibold">Loading Visuals...</p>
        </div>
      </div>
    );
  }

  if (!loading && images.length === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-700 mb-2">Our Showcase is Getting Ready!</h2>
          <p className="text-slate-500">Fresh designs are being uploaded. Check back soon or ensure images are in the '{BUCKET_NAME}' bucket.</p>
        </div>
      </div>
    );
  }
  
  console.log("Processed images state for display:", images);

  return (
    <section className="w-full py-8 md:py-12 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-800 dark:via-purple-900 dark:to-blue-900">
      <div className="container mx-auto px-4">
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4 max-h-[80vh] overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          {images.slice(0, 10).map((image, index) => {
            if (!image || !image.url) {
              console.warn(`Image at index ${index} is missing or has no URL:`, image);
              return null; 
            }
            return (
              <motion.div
                key={image.id || image.name || index} 
                className={`group relative overflow-hidden rounded-lg shadow-lg ${spanClasses[index % spanClasses.length]}`}
                variants={gridItemVariants}
                custom={index}
                whileHover={{ scale: 1.03, zIndex: 10 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Link to="/shop" aria-label={`View shop, image ${image.name}`}>
                  <img 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110 border-2 border-red-500"
                    alt={`Homepage mockup image ${index + 1} - ${image.name}`}
                    src={image.url} 
                    onError={(e) => { 
                      console.error('Image failed to load:', image.url, e);
                      e.target.style.display='none';
                      toast({title: "Image Error", description: `Could not load: ${image.name}`, variant: "destructive"});
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
                  <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 p-2 bg-black/50 rounded">
                    <p className="text-xs md:text-sm font-semibold text-white truncate max-w-[100px] md:max-w-[150px]">
                      {image.name ? image.name.split('.')[0].replace(/[-_]/g, ' ') : 'Image'}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
        <motion.div 
          className="text-center mt-8 md:mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: images.slice(0,10).length * 0.1 + 0.5, duration: 0.5 }}
        >
          <Link to="/shop">
            <Button size="lg" className="hero-gradient text-white text-lg px-10 py-4 shadow-lg hover:shadow-xl transition-shadow">
              Explore All Designs
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ImageGridShowcase;