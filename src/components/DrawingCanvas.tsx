"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  Pen,
  Eraser,
  RotateCcw,
  Trash2,
  Upload,
  Sparkles,
  Highlighter,
  Camera,
  X,
  ZoomIn,
  ZoomOut,
  Square,
  Circle,
  Type,
} from "lucide-react";
import SamplePresets from "./SamplePresets";

interface DrawingCanvasProps {
  onGenerate: (image: string, textPrompt: string) => void;
  isGenerating: boolean;
}

type Tool = "pen" | "eraser" | "highlighter" | "rectangle" | "circle" | "text";

const QUICK_COLORS = [
  "#ffffff",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#f97316",
  "#06b6d4",
];

export default function DrawingCanvas({
  onGenerate,
  isGenerating,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const shapeStartRef = useRef<{ x: number; y: number } | null>(null);
  const shapeCurrentRef = useRef<{ x: number; y: number } | null>(null);

  const [color, setColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState<Tool>("pen");
  const [textPrompt, setTextPrompt] = useState("");
  const [textBoxContent, setTextBoxContent] = useState("Type here");
  const [history, setHistory] = useState<string[]>([]);

  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoCaptureCanvasRef = useRef<HTMLCanvasElement>(null);

  const saveState = useCallback((canvas: HTMLCanvasElement) => {
    setHistory((prev) => [...prev, canvas.toDataURL()]);
  }, []);

  const clearPreviewCanvas = useCallback(() => {
    const previewCanvas = previewCanvasRef.current;
    const previewCtx = previewCanvas?.getContext("2d");
    if (previewCanvas && previewCtx) {
      previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveState(canvas);
      }
    }
  }, [saveState]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraStream]);

  useEffect(() => {
    if (showCamera && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [showCamera, cameraStream]);

  const openCamera = async () => {
    setCameraError(null);
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
        audio: false,
      });
      setCameraStream(stream);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setCameraError("Camera access denied: " + message);
    }
  };

  const closeCamera = () => {
    setShowCamera(false);
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setCameraError(null);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const captureCanvas = photoCaptureCanvasRef.current;
    const mainCanvas = canvasRef.current;
    if (!video || !captureCanvas || !mainCanvas) return;

    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    const captureCtx = captureCanvas.getContext("2d");
    if (!captureCtx) return;
    captureCtx.drawImage(video, 0, 0);

    const mainCtx = mainCanvas.getContext("2d");
    if (!mainCtx) return;
    mainCtx.fillStyle = "#000000";
    mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

    const scale = Math.min(
      mainCanvas.width / captureCanvas.width,
      mainCanvas.height / captureCanvas.height,
    );
    const x = mainCanvas.width / 2 - (captureCanvas.width / 2) * scale;
    const y = mainCanvas.height / 2 - (captureCanvas.height / 2) * scale;
    mainCtx.drawImage(
      captureCanvas,
      x,
      y,
      captureCanvas.width * scale,
      captureCanvas.height * scale,
    );
    clearPreviewCanvas();
    saveState(mainCanvas);
    closeCamera();
  };

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const wrapText = (
    text: string,
    maxWidth: number,
    ctx: CanvasRenderingContext2D,
  ) => {
    if (!text.trim()) return [""];

    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (
        ctx.measureText(testLine).width <= maxWidth ||
        currentLine.length === 0
      ) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const drawShapeToCanvas = (
    ctx: CanvasRenderingContext2D,
    shape: "rectangle" | "circle" | "text",
    start: { x: number; y: number },
    end: { x: number; y: number },
    stroke: string,
    lineWidth: number,
  ) => {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.max(Math.abs(end.x - start.x), 40);
    const height = Math.max(Math.abs(end.y - start.y), 40);

    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.fillStyle = "transparent";
    ctx.lineWidth = Math.max(lineWidth, 1);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (shape === "rectangle") {
      ctx.strokeRect(x, y, width, height);
    } else if (shape === "circle") {
      const centerX = (start.x + end.x) / 2;
      const centerY = (start.y + end.y) / 2;
      const radiusX = Math.max(Math.abs(end.x - start.x) / 2, 20);
      const radiusY = Math.max(Math.abs(end.y - start.y) / 2, 20);
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      const fontSize = Math.max(16, Math.min(24, lineWidth * 4));
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillStyle = stroke;
      ctx.textBaseline = "top";

      const padding = 0;
      const lines = wrapText(
        textBoxContent,
        Math.max(width - padding * 2, 80),
        ctx,
      );
      const lineHeight = fontSize * 1.2;
      let currentY = y + padding;

      lines.forEach((line) => {
        ctx.fillText(line, x + padding, currentY);
        currentY += lineHeight;
      });
    }

    ctx.restore();
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const point = getCoordinates(e);
    isDrawingRef.current = true;
    lastPointRef.current = point;
    shapeStartRef.current = point;
    shapeCurrentRef.current = point;
    clearPreviewCanvas();

    if (tool === "pen") {
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    } else if (tool === "highlighter") {
      ctx.globalAlpha = 0.25;
      ctx.globalCompositeOperation = "screen";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    } else if (tool === "eraser") {
      ctx.globalAlpha = 1.0;
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    }
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const { x, y } = getCoordinates(e);
    const prev = lastPointRef.current;

    if (tool === "rectangle" || tool === "circle" || tool === "text") {
      shapeCurrentRef.current = { x, y };
      const previewCanvas = previewCanvasRef.current;
      const previewCtx = previewCanvas?.getContext("2d");
      if (!previewCanvas || !previewCtx) return;

      previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      previewCtx.save();
      previewCtx.strokeStyle = color;
      previewCtx.fillStyle = "transparent";
      previewCtx.lineWidth = Math.max(brushSize, 1);
      previewCtx.lineCap = "round";
      previewCtx.lineJoin = "round";

      const start = shapeStartRef.current ?? { x, y };
      const x1 = Math.min(start.x, x);
      const y1 = Math.min(start.y, y);
      const width = Math.max(Math.abs(x - start.x), 40);
      const height = Math.max(Math.abs(y - start.y), 40);

      if (tool === "rectangle") {
        previewCtx.strokeRect(x1, y1, width, height);
      } else if (tool === "circle") {
        const centerX = (start.x + x) / 2;
        const centerY = (start.y + y) / 2;
        const radiusX = Math.max(Math.abs(x - start.x) / 2, 20);
        const radiusY = Math.max(Math.abs(y - start.y) / 2, 20);
        previewCtx.beginPath();
        previewCtx.ellipse(
          centerX,
          centerY,
          radiusX,
          radiusY,
          0,
          0,
          Math.PI * 2,
        );
        previewCtx.stroke();
      } else {
        const fontSize = Math.max(16, Math.min(24, brushSize * 4));
        previewCtx.font = `${fontSize}px sans-serif`;
        previewCtx.fillStyle = color;
        previewCtx.textBaseline = "top";

        const padding = 0;
        const lines = wrapText(
          textBoxContent,
          Math.max(width - padding * 2, 80),
          previewCtx,
        );
        const lineHeight = fontSize * 1.2;
        let currentY = y1 + padding;

        lines.forEach((line) => {
          previewCtx.fillText(line, x1 + padding, currentY);
          currentY += lineHeight;
        });
      }

      previewCtx.restore();
      lastPointRef.current = { x, y };
      return;
    }

    ctx.lineWidth =
      tool === "highlighter" ? Math.max(brushSize * 5, 20) : brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "eraser") {
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "#000000";
    } else if (tool === "highlighter") {
      ctx.globalAlpha = 0.25;
      ctx.globalCompositeOperation = "screen";
      ctx.strokeStyle = color;
    } else {
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
    }

    ctx.beginPath();
    if (prev) {
      ctx.moveTo(prev.x, prev.y);
    } else {
      ctx.moveTo(x, y);
    }
    ctx.lineTo(x, y);

    if (tool === "highlighter") {
      const highlightWidth = Math.max(brushSize * 6, 20);
      const edgeWidth = Math.max(brushSize * 0.9, 2);
      ctx.lineWidth = highlightWidth;
      ctx.stroke();

      ctx.globalAlpha = 0.95;
      ctx.lineWidth = edgeWidth;
      ctx.stroke();
    } else {
      ctx.stroke();
    }

    lastPointRef.current = { x, y };
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;

    if (tool === "rectangle" || tool === "circle" || tool === "text") {
      const start = shapeStartRef.current;
      const end = shapeCurrentRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx && canvas && start && end) {
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = "source-over";
        drawShapeToCanvas(
          ctx,
          tool === "text" ? "text" : tool === "circle" ? "circle" : "rectangle",
          start,
          end,
          color,
          brushSize,
        );
        saveState(canvas);
      }
      clearPreviewCanvas();
      shapeStartRef.current = null;
      shapeCurrentRef.current = null;
      return;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        saveState(canvas);
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      clearPreviewCanvas();
      saveState(canvas);
    }
  };

  const undo = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const previousState = newHistory[newHistory.length - 1];
      setHistory(newHistory);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx && canvas) {
        const img = new Image();
        img.src = previousState;
        img.onload = () => {
          ctx.globalAlpha = 1.0;
          ctx.globalCompositeOperation = "source-over";
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
      }
      clearPreviewCanvas();
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
          const ctx = canvas?.getContext("2d");
          if (ctx && canvas) {
            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = "source-over";
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const scale = Math.min(
              canvas.width / img.width,
              canvas.height / img.height,
            );
            const x = canvas.width / 2 - (img.width / 2) * scale;
            const y = canvas.height / 2 - (img.height / 2) * scale;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            clearPreviewCanvas();
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
      const ctx = canvas?.getContext("2d");
      if (ctx && canvas) {
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        clearPreviewCanvas();
        saveState(canvas);
      }
    };
    setTextPrompt(prompt);
  };

  const submitGenerate = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      onGenerate(dataUrl, textPrompt);
    }
  };

  const toolBtn = (
    id: Tool,
    icon: React.ReactNode,
    label: string,
    activeBg: string,
  ) => (
    <button
      onClick={() => setTool(id)}
      title={label}
      className={`p-2 rounded flex items-center gap-1 text-xs transition-colors ${
        tool === id
          ? `${activeBg} text-white`
          : "text-neutral-400 hover:text-white"
      }`}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-white relative">
      {showCamera && (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center gap-4 p-4">
          <div className="w-full max-w-2xl rounded-xl overflow-hidden border border-neutral-700 bg-neutral-900 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
              <span className="font-semibold text-white flex items-center gap-2">
                <Camera size={18} className="text-blue-400" />
                Camera Capture
              </span>
              <button
                onClick={closeCamera}
                className="p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {cameraError ? (
              <div className="p-8 text-center text-red-400 text-sm">
                {cameraError}
              </div>
            ) : (
              <div className="relative bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full max-h-80 object-contain"
                />
              </div>
            )}

            <div className="flex justify-center gap-3 p-4 border-t border-neutral-800">
              <button
                onClick={capturePhoto}
                disabled={!cameraStream}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium px-8 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Camera size={18} />
                Capture Photo
              </button>
              <button
                onClick={closeCamera}
                className="bg-neutral-700 hover:bg-neutral-600 text-white px-6 py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
          <canvas ref={photoCaptureCanvasRef} className="hidden" />
        </div>
      )}

      <div className="flex items-center gap-1 px-2 py-2 border-b border-neutral-800 bg-neutral-950 flex-wrap">
        <div className="flex items-center gap-0.5 bg-neutral-900 rounded-lg p-1">
          {toolBtn("pen", <Pen size={16} />, "Pen", "bg-neutral-700")}
          {toolBtn("eraser", <Eraser size={16} />, "Eraser", "bg-neutral-700")}
          {toolBtn(
            "highlighter",
            <Highlighter size={16} className="text-yellow-400" />,
            "Animation Highlighter",
            "bg-yellow-500/20 border border-yellow-500/40",
          )}
          {toolBtn(
            "rectangle",
            <Square size={16} />,
            "Rectangle",
            "bg-neutral-700",
          )}
          {toolBtn("circle", <Circle size={16} />, "Circle", "bg-neutral-700")}
          {toolBtn("text", <Type size={16} />, "Text box", "bg-neutral-700")}
        </div>

        <div className="h-6 w-px bg-neutral-700 mx-1" />

        <div className="relative flex items-center gap-1">
          <div className="flex gap-1 items-center flex-wrap max-w-40">
            {QUICK_COLORS.map((c) => (
              <button
                key={c}
                title={c}
                onClick={() => {
                  setColor(c);
                }}
                className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
                  color === c ? "border-white scale-125" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="relative" title="Custom color wheel">
            <label className="cursor-pointer">
              <div
                className="w-7 h-7 rounded-full border-2 border-dashed border-neutral-500 hover:border-white transition-colors flex items-center justify-center text-[10px] font-bold"
                style={{
                  background:
                    "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
                }}
                title="Open color wheel"
              />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </label>
          </div>
        </div>

        <div className="h-6 w-px bg-neutral-700 mx-1" />

        <div className="flex items-center gap-2">
          <ZoomOut size={12} className="text-neutral-400" />
          <input
            type="range"
            min="2"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-20 accent-blue-500"
            title="Brush Size"
          />
          <ZoomIn size={12} className="text-neutral-400" />
        </div>

        <div className="h-6 w-px bg-neutral-700 mx-1" />

        <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1.5 min-w-[220px]">
          <Type size={14} className="text-neutral-400" />
          <input
            type="text"
            value={textBoxContent}
            onChange={(e) => setTextBoxContent(e.target.value)}
            placeholder="Text for text box"
            className="bg-transparent text-sm text-white outline-none w-full"
          />
        </div>

        <div className="h-6 w-px bg-neutral-700 mx-1 grow" />

        <div className="flex items-center gap-0.5">
          <button
            onClick={undo}
            className="p-2 text-neutral-400 hover:text-white rounded"
            title="Undo"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={clearCanvas}
            className="p-2 text-neutral-400 hover:text-red-400 rounded"
            title="Clear Canvas"
          >
            <Trash2 size={16} />
          </button>
          <label
            className="p-2 text-neutral-400 hover:text-white cursor-pointer rounded"
            title="Upload Image"
          >
            <Upload size={16} />
            <input
              type="file"
              accept="image/png, image/jpeg"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
          <button
            onClick={openCamera}
            className="p-2 text-neutral-400 hover:text-blue-400 rounded"
            title="Open Camera to capture sketch"
          >
            <Camera size={16} />
          </button>
        </div>
      </div>

      {tool === "highlighter" && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-1.5 text-xs text-yellow-400 flex items-center gap-2">
          <Highlighter size={13} />
          <span>
            <strong>Animation Highlighter active:</strong> Draw over components
            you want animated.
          </span>
        </div>
      )}

      <div className="grow relative overflow-hidden bg-black flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="block w-full h-full cursor-crosshair touch-none"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            startDrawing(e);
          }}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={stopDrawing}
        />
        <canvas
          ref={previewCanvasRef}
          width={800}
          height={600}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {tool === "highlighter" && (
          <div className="absolute bottom-2 right-2 bg-yellow-500/20 border border-yellow-500/40 rounded px-2 py-1 text-xs text-yellow-400 pointer-events-none">
            🎨 Highlighting for animation
          </div>
        )}
      </div>

      <div className="p-3 border-t border-neutral-800 bg-neutral-950 flex flex-col gap-3">
        <SamplePresets onLoadPreset={loadPreset} />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g., Make it dark mode and add a search bar..."
            className="grow bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
            disabled={isGenerating}
          />
          <button
            onClick={submitGenerate}
            disabled={isGenerating}
            className="bg-linear-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-medium px-6 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-lg"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
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
