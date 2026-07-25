'use client';

import { useRef, useState, useEffect } from 'react';
import { Pen, Eraser, RotateCcw, Trash2, Upload, Sparkles } from 'lucide-react';
import SamplePresets from './SamplePresets';

interface DrawingCanvasProps {
  onGenerate: (image: string, textPrompt: string) => void;
  isGenerating: boolean;
}

export default function DrawingCanvas({ onGenerate, isGenerating }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [textPrompt, setTextPrompt] = useState('');

  // Undo stack
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set initial background to black
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveState(canvas);
      }
    }
  }, []);

  const saveState = (canvas: HTMLCanvasElement) => {
    setHistory(prev => [...prev, canvas.toDataURL()]);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        saveState(canvas);
      }
    }
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const { x, y } = getCoordinates(e);

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#000000' : color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveState(canvas);
    }
  };

  const undo = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // remove current state
      const previousState = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        const img = new Image();
        img.src = previousState;
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (ctx && canvas) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Draw image scaled to fit
            const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
            const x = (canvas.width / 2) - (img.width / 2) * scale;
            const y = (canvas.height / 2) - (img.height / 2) * scale;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            saveState(canvas);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const loadPreset = (imageSrc: string, prompt: string) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveState(canvas);
      }
    };
    setTextPrompt(prompt);
  };

  const submitGenerate = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onGenerate(dataUrl, textPrompt);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-white">
      {/* Toolbar */}
      <div className="flex items-center gap-4 p-3 border-b border-neutral-800 bg-neutral-950">
        <button 
          onClick={() => setTool('pen')} 
          className={`p-2 rounded ${tool === 'pen' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'}`}
          title="Pen"
        >
          <Pen size={18} />
        </button>
        <button 
          onClick={() => setTool('eraser')} 
          className={`p-2 rounded ${tool === 'eraser' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'}`}
          title="Eraser"
        >
          <Eraser size={18} />
        </button>
        
        <div className="h-6 w-px bg-neutral-700 mx-2"></div>
        
        <input 
          type="color" 
          value={color} 
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
          title="Color"
        />
        
        <input 
          type="range" 
          min="2" 
          max="20" 
          value={brushSize} 
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="w-24 accent-blue-500"
          title="Brush Size"
        />
        
        <div className="h-6 w-px bg-neutral-700 mx-2 flex-grow"></div>
        
        <button onClick={undo} className="p-2 text-neutral-400 hover:text-white" title="Undo">
          <RotateCcw size={18} />
        </button>
        <button onClick={clearCanvas} className="p-2 text-neutral-400 hover:text-red-400" title="Clear Canvas">
          <Trash2 size={18} />
        </button>
        <label className="p-2 text-neutral-400 hover:text-white cursor-pointer" title="Upload Image">
          <Upload size={18} />
          <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleImageUpload} />
        </label>
      </div>

      {/* Canvas Area */}
      <div className="flex-grow relative overflow-hidden bg-black flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="cursor-crosshair w-full h-full object-contain touch-none"
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onMouseMove={draw}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchMove={draw}
        />
      </div>

      {/* Prompts and Action */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex flex-col gap-3">
        <SamplePresets onLoadPreset={loadPreset} />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g., Make it dark mode and add a search bar..."
            className="flex-grow bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
            disabled={isGenerating}
          />
          <button
            onClick={submitGenerate}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Vibing...
              </span>
            ) : (
              <>
                <Sparkles size={18} />
                Vibe Code App
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
