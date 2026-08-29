import React, { useRef, useState, useCallback } from 'react'
import Webcam from 'react-webcam'
import { Button } from '@/components/ui/Button'
import { Camera, X, Check } from 'lucide-react'

interface Props { 
  onCapture: (images: string[]) => void; 
  maxImages?: number;
}

export const CameraCapture: React.FC<Props> = ({ onCapture, maxImages = 5 }) => {
  const webcamRef = useRef<Webcam>(null);
  const [images, setImages] = useState<string[]>([]);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const capture = useCallback(() => {
    if (images.length >= maxImages) return;
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImages(prev => [...prev, imageSrc]);
    }
  }, [webcamRef, images, maxImages]);

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDone = () => {
    onCapture(images);
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-lg bg-black aspect-video flex items-center justify-center">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode, width: 1280, height: 720 }}
          className="w-full h-full object-cover"
          mirrored={facingMode === 'user'}
        />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
          <Button 
            onClick={capture} 
            disabled={images.length >= maxImages}
            className="rounded-full w-16 h-16 p-0 bg-white/20 hover:bg-white/40 border-4 border-white backdrop-blur-sm"
          >
            <Camera className="w-8 h-8 text-white" />
          </Button>
          <Button 
            variant="outline"
            onClick={toggleCamera} 
            className="rounded-full absolute right-4 bottom-2 bg-black/50 text-white border-white/20 hover:bg-black/70"
          >
            Switch Cam
          </Button>
        </div>
        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
          {images.length} / {maxImages} Captured
        </div>
      </div>

      {images.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Preview</h4>
          <div className="flex flex-wrap gap-2">
            {images.map((src, index) => (
              <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border">
                <img src={src} alt={`Capture ${index}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <Button 
            onClick={handleDone} 
            className="w-full mt-2" 
            disabled={images.length === 0}
          >
            <Check className="w-4 h-4 mr-2" />
            Done ({images.length} images)
          </Button>
        </div>
      )}
    </div>
  )
}
