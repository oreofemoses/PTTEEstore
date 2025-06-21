import React from 'react';
import { Upload, Palette, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CustomDesignForm = ({
  formData,
  setFormData,
  referenceImages,
  setReferenceImages,
  shirtColors,
  shirtStyles,
  onSubmit,
  isSubmitting,
  user
}) => {

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImagePreviews = [];
    for (const file of files) {
      newImagePreviews.push({
        id: Date.now() + Math.random(),
        name: file.name,
        url: URL.createObjectURL(file), 
        file: file,
        uploadPath: null, 
      });
    }
    setReferenceImages(prev => [...prev, ...newImagePreviews]);
  };

  const removeImage = (imageId) => {
    setReferenceImages(prev => prev.filter(img => img.id !== imageId));
  };

  const localHandleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, referenceImages);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-md border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Palette className="w-6 h-6 mr-2 text-purple-600" />
          Design Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={localHandleSubmit} className="space-y-6">
          {formData.base_image_url && (
            <div className="mb-6 p-4 border rounded-lg bg-slate-50">
              <Label className="block text-sm font-medium text-gray-700 mb-2">Customizing Based On:</Label>
              <div className="flex items-center gap-4">
                <img src={formData.base_image_url} alt={formData.base_product_name || "Base design"} className="w-24 h-24 object-cover rounded-md border" />
                <div>
                  <p className="font-semibold">{formData.base_product_name || "Selected Design"}</p>
                  <p className="text-xs text-gray-500">Describe your changes below.</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required disabled={!!user} />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required disabled={!!user} />
            </div>
          </div>

          <div>
            <Label htmlFor="description">
              {formData.base_product_name ? "Describe Your Customizations" : "Design Description"}
            </Label>
            <Textarea
              id="description" name="description" value={formData.description} onChange={handleInputChange} required
              placeholder={
                formData.base_product_name 
                ? "e.g., Change text to 'My Custom Text', add a star on the sleeve, make the background blue..."
                : "Describe your dream t-shirt design in detail. Include colors, style, themes, text, or any specific elements you want..."
              }
              className="min-h-[120px]"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label>Shirt Color</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {shirtColors.map((color) => (
                  <Badge key={color} variant={formData.shirt_color === color ? "default" : "outline"}
                    className={`cursor-pointer ${formData.shirt_color === color ? 'bg-purple-600 text-white' : 'hover:bg-purple-100'}`}
                    onClick={() => setFormData(prev => ({ ...prev, shirt_color: color }))}>
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Shirt Style</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {shirtStyles.map((style) => (
                  <Badge key={style} variant={formData.shirt_style === style ? "default" : "outline"}
                    className={`cursor-pointer ${formData.shirt_style === style ? 'bg-purple-600 text-white' : 'hover:bg-purple-100'}`}
                    onClick={() => setFormData(prev => ({ ...prev, shirt_style: style }))}>
                    {style}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label>Reference Images for Your Customizations (Optional)</Label>
            <div className="mt-2">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each</p>
                </div>
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            {referenceImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                {referenceImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img src={image.url} alt={image.name} className="w-full h-24 object-cover rounded-lg border" />
                    <button type="button" onClick={() => removeImage(image.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full hero-gradient text-white text-lg py-3">
            {isSubmitting ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Submitting Customization...</>
            ) : (
              <><Sparkles className="w-5 h-5 mr-2" />Submit Custom Design</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomDesignForm;