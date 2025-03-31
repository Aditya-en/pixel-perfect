import React, { useState, useRef, useEffect } from 'react';
import {
  Crop,
  Trash2,
  Download,
  RefreshCw,
  Scissors,
  Image as ImageIcon,
  SlidersHorizontal,
  Undo,
  Save,
  Check,
  X
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import GradientText from './GradientText';

interface ImageEditorProps {
  image: string;
  onImageEdit: (editedImage: string) => void;
  onReset: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  image,
  onImageEdit,
  onReset
}) => {
  const [currentImage, setCurrentImage] = useState<string>(image);
  const [history, setHistory] = useState<string[]>([image]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragType, setDragType] = useState<'create' | 'move' | 'resize'>('create');
  const [resizeHandle, setResizeHandle] = useState<string>('');
  
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Keep track of editing history
  useEffect(() => {
    if (currentImage !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(currentImage);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      onImageEdit(currentImage);
    }
  }, [currentImage]);

  // Reset crop area when starting to crop
  useEffect(() => {
    if (isCropping && imageRef.current) {
      // Initialize crop area to 80% of the image dimensions
      const imgWidth = imageRef.current.clientWidth;
      const imgHeight = imageRef.current.clientHeight;
      
      setCropArea({
        x: imgWidth * 0.1,
        y: imgHeight * 0.1,
        width: imgWidth * 0.8,
        height: imgHeight * 0.8
      });
    }
  }, [isCropping]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentImage(history[historyIndex - 1]);
    }
  };

  // Remove background (transparent white pixels)
  const removeBackground = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        // Threshold for white (adjust as needed)
        const threshold = 240;
        for (let i = 0; i < data.length; i += 4) {
          // If pixel is close to white
          if (
            data[i] > threshold &&
            data[i + 1] > threshold &&
            data[i + 2] > threshold
          ) {
            // Set alpha to 0 (transparent)
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        setCurrentImage(canvas.toDataURL('image/png'));
      }
    };
    img.src = currentImage;
  };

  // Apply filters (brightness, contrast, saturation)
  const applyFilters = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        ctx.drawImage(img, 0, 0);
        setCurrentImage(canvas.toDataURL('image/jpeg'));
      }
    };
    img.src = image; // Apply to original image
  };

  // Crop functionality
  const startCropping = () => {
    setIsCropping(true);
  };

  const cancelCropping = () => {
    setIsCropping(false);
    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
  };

  const confirmCrop = () => {
    if (!imageRef.current) return;
    
    // Create a new image to get natural dimensions
    const img = new Image();
    img.src = currentImage;
    
    // We need to wait for the image to load to get its natural dimensions
    img.onload = () => {
      // Get the displayed dimensions of the image
      const displayRect = imageRef.current!.getBoundingClientRect();
      const displayWidth = displayRect.width;
      const displayHeight = displayRect.height;
      
      // Calculate the scale factor between the displayed image and the actual image
      const scaleX = img.naturalWidth / displayWidth;
      const scaleY = img.naturalHeight / displayHeight;
      
      // Calculate the offset of the image within the container
      const containerRect = imageContainerRef.current!.getBoundingClientRect();
      const offsetX = (containerRect.width - displayWidth) / 2;
      const offsetY = (containerRect.height - displayHeight) / 2;
      
      // Adjust crop area to account for the image's position in the container
      const adjustedCropArea = {
        x: Math.max(0, cropArea.x - offsetX),
        y: Math.max(0, cropArea.y - offsetY),
        width: cropArea.width,
        height: cropArea.height
      };
      
      // Only apply the crop if it's actually on the image
      if (adjustedCropArea.x < displayWidth && adjustedCropArea.y < displayHeight) {
        // Scale the crop area to the actual image dimensions
        const scaledCropArea = {
          x: adjustedCropArea.x * scaleX,
          y: adjustedCropArea.y * scaleY,
          width: adjustedCropArea.width * scaleX,
          height: adjustedCropArea.height * scaleY
        };
        
        // Create a canvas to draw the cropped image
        const canvas = document.createElement('canvas');
        canvas.width = scaledCropArea.width;
        canvas.height = scaledCropArea.height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            img,
            scaledCropArea.x, scaledCropArea.y,
            scaledCropArea.width, scaledCropArea.height,
            0, 0,
            scaledCropArea.width, scaledCropArea.height
          );
          
          setCurrentImage(canvas.toDataURL('image/png'));
        }
      }
      
      setIsCropping(false);
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isCropping || !imageContainerRef.current) return;
    
    e.preventDefault();
    const container = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - container.left;
    const y = e.clientY - container.top;
    
    setIsDragging(true);
    setDragStart({ x, y });
    
    // Check if we're near a resize handle
    const edgeThreshold = 10;
    const isNearLeftEdge = Math.abs(x - cropArea.x) < edgeThreshold;
    const isNearRightEdge = Math.abs(x - (cropArea.x + cropArea.width)) < edgeThreshold;
    const isNearTopEdge = Math.abs(y - cropArea.y) < edgeThreshold;
    const isNearBottomEdge = Math.abs(y - (cropArea.y + cropArea.height)) < edgeThreshold;
    
    if (isNearLeftEdge && isNearTopEdge) {
      setDragType('resize');
      setResizeHandle('top-left');
    } else if (isNearRightEdge && isNearTopEdge) {
      setDragType('resize');
      setResizeHandle('top-right');
    } else if (isNearLeftEdge && isNearBottomEdge) {
      setDragType('resize');
      setResizeHandle('bottom-left');
    } else if (isNearRightEdge && isNearBottomEdge) {
      setDragType('resize');
      setResizeHandle('bottom-right');
    } else if (isNearLeftEdge) {
      setDragType('resize');
      setResizeHandle('left');
    } else if (isNearRightEdge) {
      setDragType('resize');
      setResizeHandle('right');
    } else if (isNearTopEdge) {
      setDragType('resize');
      setResizeHandle('top');
    } else if (isNearBottomEdge) {
      setDragType('resize');
      setResizeHandle('bottom');
    } else if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
              y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      // Inside the crop area - move the entire selection
      setDragType('move');
    } else {
      // Outside the crop area - create a new selection
      setDragType('create');
      setCropArea({
        x,
        y,
        width: 0,
        height: 0
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isCropping || !isDragging || !imageContainerRef.current) return;
    
    const container = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - container.left, container.width));
    const y = Math.max(0, Math.min(e.clientY - container.top, container.height));
    
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;
    
    if (dragType === 'create') {
      setCropArea({
        x: Math.min(dragStart.x, x),
        y: Math.min(dragStart.y, y),
        width: Math.abs(x - dragStart.x),
        height: Math.abs(y - dragStart.y)
      });
    } else if (dragType === 'move') {
      // Move the entire selection
      const newX = Math.max(0, Math.min(cropArea.x + deltaX, container.width - cropArea.width));
      const newY = Math.max(0, Math.min(cropArea.y + deltaY, container.height - cropArea.height));
      
      setCropArea({
        ...cropArea,
        x: newX,
        y: newY
      });
      
      setDragStart({ x, y });
    } else if (dragType === 'resize') {
      let newCropArea = { ...cropArea };
      
      switch (resizeHandle) {
        case 'top-left':
          newCropArea = {
            x: Math.min(cropArea.x + cropArea.width, x),
            y: Math.min(cropArea.y + cropArea.height, y),
            width: Math.abs(cropArea.x + cropArea.width - x),
            height: Math.abs(cropArea.y + cropArea.height - y)
          };
          break;
        case 'top-right':
          newCropArea = {
            x: cropArea.x,
            y: Math.min(cropArea.y + cropArea.height, y),
            width: Math.max(0, x - cropArea.x),
            height: Math.abs(cropArea.y + cropArea.height - y)
          };
          break;
        case 'bottom-left':
          newCropArea = {
            x: Math.min(cropArea.x + cropArea.width, x),
            y: cropArea.y,
            width: Math.abs(cropArea.x + cropArea.width - x),
            height: Math.max(0, y - cropArea.y)
          };
          break;
        case 'bottom-right':
          newCropArea = {
            ...cropArea,
            width: Math.max(0, x - cropArea.x),
            height: Math.max(0, y - cropArea.y)
          };
          break;
        case 'left':
          newCropArea = {
            x: Math.min(cropArea.x + cropArea.width, x),
            y: cropArea.y,
            width: Math.abs(cropArea.x + cropArea.width - x),
            height: cropArea.height
          };
          break;
        case 'right':
          newCropArea = {
            ...cropArea,
            width: Math.max(0, x - cropArea.x)
          };
          break;
        case 'top':
          newCropArea = {
            x: cropArea.x,
            y: Math.min(cropArea.y + cropArea.height, y),
            width: cropArea.width,
            height: Math.abs(cropArea.y + cropArea.height - y)
          };
          break;
        case 'bottom':
          newCropArea = {
            ...cropArea,
            height: Math.max(0, y - cropArea.y)
          };
          break;
      }
      
      setCropArea(newCropArea);
    }
  };

  const handleMouseUp = () => {
    if (!isCropping) return;
    setIsDragging(false);
  };

  const downloadImage = () => {
    const a = document.createElement('a');
    a.href = currentImage;
    a.download = 'edited-image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getCursorStyle = () => {
    if (!isCropping) return 'default';
    
    if (isDragging) {
      if (dragType === 'move') return 'move';
      if (dragType === 'resize') {
        switch (resizeHandle) {
          case 'top-left':
          case 'bottom-right':
            return 'nwse-resize';
          case 'top-right':
          case 'bottom-left':
            return 'nesw-resize';
          case 'left':
          case 'right':
            return 'ew-resize';
          case 'top':
          case 'bottom':
            return 'ns-resize';
        }
      }
      return 'crosshair';
    }
    
    return 'crosshair';
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">
          <GradientText>Image Editor</GradientText>
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleUndo} disabled={historyIndex === 0}>
            <Undo className="mr-2 h-4 w-4" /> Undo
          </Button>
          <Button variant="outline" onClick={onReset}>
            <RefreshCw className="mr-2 h-4 w-4" /> New Image
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardContent className="p-1">
              <div 
                ref={imageContainerRef}
                className="bg-checkered relative min-h-80 flex items-center justify-center"
                style={{ cursor: getCursorStyle() }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  ref={imageRef}
                  src={currentImage}
                  alt="Editing preview"
                  className="max-w-full max-h-96 object-contain"
                />
                {isCropping && (
                  <div className="absolute inset-0">
                    {/* Semi-transparent overlay */}
                    <div className="absolute inset-0 bg-black/50"></div>
                    
                    {/* Crop Window */}
                    <div
                      className="absolute border-2 border-white"
                      style={{
                        left: `${cropArea.x}px`,
                        top: `${cropArea.y}px`,
                        width: `${cropArea.width}px`,
                        height: `${cropArea.height}px`,
                      }}
                    >
                      {/* Resize handles */}
                      <div className="absolute w-3 h-3 bg-white rounded-full -left-1.5 -top-1.5" style={{ cursor: 'nwse-resize' }}></div>
                      <div className="absolute w-3 h-3 bg-white rounded-full -right-1.5 -top-1.5" style={{ cursor: 'nesw-resize' }}></div>
                      <div className="absolute w-3 h-3 bg-white rounded-full -left-1.5 -bottom-1.5" style={{ cursor: 'nesw-resize' }}></div>
                      <div className="absolute w-3 h-3 bg-white rounded-full -right-1.5 -bottom-1.5" style={{ cursor: 'nwse-resize' }}></div>
                      
                      <div className="absolute w-3 h-3 bg-white rounded-full -left-1.5 top-1/2 -translate-y-1/2" style={{ cursor: 'ew-resize' }}></div>
                      <div className="absolute w-3 h-3 bg-white rounded-full -right-1.5 top-1/2 -translate-y-1/2" style={{ cursor: 'ew-resize' }}></div>
                      <div className="absolute w-3 h-3 bg-white rounded-full left-1/2 -top-1.5 -translate-x-1/2" style={{ cursor: 'ns-resize' }}></div>
                      <div className="absolute w-3 h-3 bg-white rounded-full left-1/2 -bottom-1.5 -translate-x-1/2" style={{ cursor: 'ns-resize' }}></div>
                    </div>
                    
                    {/* Crop controls */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      <Button onClick={confirmCrop} variant="default">
                        <Check className="mr-2 h-4 w-4" /> Apply Crop
                      </Button>
                      <Button onClick={cancelCropping} variant="secondary">
                        <X className="mr-2 h-4 w-4" /> Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Tabs defaultValue="tools" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="tools" className="flex-1">Tools</TabsTrigger>
              <TabsTrigger value="adjust" className="flex-1">Adjust</TabsTrigger>
            </TabsList>
            <TabsContent value="tools" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={removeBackground} className="flex-1">
                  <Scissors className="mr-2 h-4 w-4" /> Remove Background
                </Button>
                <Button onClick={startCropping} className="flex-1" disabled={isCropping}>
                  <Crop className="mr-2 h-4 w-4" /> Crop
                </Button>
                <Button onClick={downloadImage} className="flex-1" variant="secondary">
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
                <Button onClick={() => setCurrentImage(image)} className="flex-1" variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="adjust" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="brightness">Brightness</Label>
                    <span className="text-sm">{brightness}%</span>
                  </div>
                  <Slider
                    id="brightness"
                    min={0}
                    max={200}
                    step={1}
                    value={[brightness]}
                    onValueChange={(value) => setBrightness(value[0])}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="contrast">Contrast</Label>
                    <span className="text-sm">{contrast}%</span>
                  </div>
                  <Slider
                    id="contrast"
                    min={0}
                    max={200}
                    step={1}
                    value={[contrast]}
                    onValueChange={(value) => setContrast(value[0])}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="saturation">Saturation</Label>
                    <span className="text-sm">{saturation}%</span>
                  </div>
                  <Slider
                    id="saturation"
                    min={0}
                    max={200}
                    step={1}
                    value={[saturation]}
                    onValueChange={(value) => setSaturation(value[0])}
                  />
                </div>
                <Button onClick={applyFilters} className="w-full">
                  <SlidersHorizontal className="mr-2 h-4 w-4" /> Apply Filters
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;