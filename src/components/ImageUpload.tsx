// src/components/ImageUpload.tsx
import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import GradientText from './GradientText';

interface ImageUploadProps {
  onImageUpload: (imageData: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageUpload(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold mb-8 text-center">
        <GradientText>Transform Your Images</GradientText>
      </h2>
      <Card 
        className={`w-full max-w-2xl h-64 ${isDragging ? 'border-dashed border-4 border-primary' : ''}`}
      >
        <CardContent 
          className="flex flex-col items-center justify-center h-full"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Upload size={36} className="text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium">Drag & Drop or Click to Upload</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Supports PNG, JPG and JPEG (max 10MB)
              </p>
            </div>
            <Button onClick={handleButtonClick}>
              Select Image
            </Button>
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileChange}
            />
          </div>
        </CardContent>
      </Card>
      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold mb-4">
          <GradientText>Features</GradientText>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <FeatureCard 
            icon={<ImageIcon className="h-6 w-6" />}
            title="Background Removal"
            description="Remove white backgrounds with one click"
          />
          <FeatureCard 
            icon={<ImageIcon className="h-6 w-6" />}
            title="Crop & Resize"
            description="Easily crop and resize your images"
          />
          <FeatureCard 
            icon={<ImageIcon className="h-6 w-6" />}
            title="Image Filters"
            description="Apply filters to enhance your images"
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <Card className="p-4">
    <div className="flex flex-col items-center text-center">
      <div className="mb-2 text-primary">{icon}</div>
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </Card>
);

export default ImageUpload;