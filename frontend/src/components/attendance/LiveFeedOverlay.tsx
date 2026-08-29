import React, { useEffect, useRef } from 'react'

interface FaceBox { 
  bbox: number[]; 
  status: string; 
  name?: string; 
  score?: number;
}

interface Props { 
  faces: FaceBox[]; 
  width: number; 
  height: number;
}

export const LiveFeedOverlay: React.FC<Props> = ({ faces, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous drawing
    ctx.clearRect(0, 0, width, height);

    faces.forEach((face) => {
      const [x, y, w, h] = face.bbox;
      
      // Determine colors based on status
      let strokeColor = '#ef4444'; // Red default (Unknown/Spoof)
      let fillColor = 'rgba(239, 68, 68, 0.2)';
      let labelBg = '#ef4444';
      
      if (face.status === 'PRESENT') {
        strokeColor = '#10b981'; // Green
        fillColor = 'rgba(16, 185, 129, 0.2)';
        labelBg = '#10b981';
      } else if (face.status === 'DUPLICATE') {
        strokeColor = '#f59e0b'; // Orange
        fillColor = 'rgba(245, 158, 11, 0.2)';
        labelBg = '#f59e0b';
      }

      // Draw box
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, w, h);

      // Draw label
      const labelText = face.name ? `${face.name} ${face.score ? `(${(face.score*100).toFixed(0)}%)` : ''}` : face.status;
      
      ctx.font = '14px Inter, sans-serif';
      const textMetrics = ctx.measureText(labelText);
      const padding = 6;
      
      // Label background
      ctx.fillStyle = labelBg;
      ctx.fillRect(x - 1.5, y - 24, textMetrics.width + padding * 2, 24);
      
      // Label text
      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, x + padding, y - 12);
    });
  }, [faces, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    />
  );
}
