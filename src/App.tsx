// src/App.tsx
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './components/theme-provider';
import Navbar from './components/NavBar';
import ImageUpload from './components/ImageUpload';
import ImageEditor from './components/ImageEditor';
import { Toaster } from './components/ui/toaster';
import { useToast } from '@/hooks/use-toast';

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = (imageData: string) => {
    setImage(imageData);
    toast({
      title: "Image uploaded",
      description: "Your image is ready for editing",
    });
  };

  const handleImageEdit = (newImage: string) => {
    setEditedImage(newImage);
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          {!image ? (
            <ImageUpload onImageUpload={handleImageUpload} />
          ) : (
            <ImageEditor 
              image={image} 
              onImageEdit={handleImageEdit} 
              onReset={() => setImage(null)} 
            />
          )}
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;