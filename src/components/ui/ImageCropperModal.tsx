'use client';

import React, { useState, useRef } from 'react';

interface ImageCropperModalProps {
  imageSrc: string;
  cropShape?: 'circle' | 'rect';
  title?: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onClose: () => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  imageSrc,
  cropShape = 'circle',
  title = 'Recadrer la photo',
  onCropComplete,
  onClose,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Mouse / Touch Dragging Handlers
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Generate Cropped Data URL via HTML5 Canvas
  const handleCropSave = () => {
    if (!imageRef.current) return;
    const img = imageRef.current;

    const canvas = document.createElement('canvas');
    const outputWidth = cropShape === 'circle' ? 600 : 1200;
    const outputHeight = cropShape === 'circle' ? 600 : 675;
    
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0A0718';
    ctx.fillRect(0, 0, outputWidth, outputHeight);

    ctx.save();
    ctx.translate(outputWidth / 2, outputHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawW = outputWidth;
    let drawH = outputWidth / imgAspect;

    if (drawH < outputHeight) {
      drawH = outputHeight;
      drawW = outputHeight * imgAspect;
    }

    const factor = outputWidth / 300;
    const offsetX = offset.x * factor;
    const offsetY = offset.y * factor;

    ctx.drawImage(
      img,
      -drawW / 2 + offsetX,
      -drawH / 2 + offsetY,
      drawW,
      drawH
    );

    ctx.restore();

    const croppedUrl = canvas.toDataURL('image/jpeg', 0.92);
    onCropComplete(croppedUrl);
  };

  return (
    <div className="fixed inset-0 z-[200000] bg-[#0A0718]/95 backdrop-blur-2xl flex flex-col justify-between select-none animate-fadeIn text-white">
      
      {/* Top Header Controls Bar */}
      <div className="p-4 flex items-center justify-between z-30 bg-gradient-to-b from-black/90 to-transparent">
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer border border-white/15"
          title="Annuler"
        >
          ✕
        </button>

        <div className="px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-extrabold tracking-wider text-indigo-200 shadow-sm flex items-center gap-1.5">
          <span>✂️</span>
          <span>{title}</span>
        </div>

        <button
          type="button"
          onClick={handleCropSave}
          className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white flex items-center justify-center text-base font-bold transition-all cursor-pointer shadow-lg border border-emerald-300"
          title="Valider le recadrage"
        >
          ✓
        </button>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        className="relative flex-1 w-full flex items-center justify-center overflow-hidden cursor-move touch-none"
      >
        {/* Image transform container */}
        <div
          className="relative transition-transform duration-75 ease-out flex items-center justify-center pointer-events-none"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale}) rotate(${rotation}deg)`,
          }}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Source à recadrer"
            className="max-w-[80vw] max-h-[60vh] object-contain select-none pointer-events-none"
            crossOrigin="anonymous"
          />
        </div>

        {/* Circular / Rectangular Framing Mask Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {cropShape === 'circle' ? (
            <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full border-2 border-white/80 shadow-[0_0_0_9999px_rgba(10,7,24,0.85)] relative">
              <div className="absolute inset-0 rounded-full border border-dashed border-rose-400/60 animate-pulse" />
            </div>
          ) : (
            <div className="w-[85vw] max-w-lg h-52 sm:h-64 rounded-2xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(10,7,24,0.85)] relative">
              <div className="absolute inset-0 rounded-2xl border border-dashed border-rose-400/60 animate-pulse" />
            </div>
          )}
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-bold text-gray-200 pointer-events-none border border-white/10 flex items-center gap-1.5 shadow-lg">
          <span>🖐️</span>
          <span>Glissez pour déplacer & recadrer</span>
        </div>
      </div>

      {/* Bottom Adjustment Controls Bar */}
      <div className="p-4 pb-6 flex flex-col items-center gap-4 z-30 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
        
        {/* Controls: Zoom slider & Rotation icons */}
        <div className="w-full max-w-xs flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 shadow-xl">
          <span className="text-xs">🔍</span>
          <input
            type="range"
            min="0.8"
            max="3"
            step="0.05"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="flex-1 accent-rose-500 cursor-pointer h-1.5 bg-white/20 rounded-lg"
          />
          <button
            type="button"
            onClick={() => setRotation((prev) => (prev - 90) % 360)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-xs text-white cursor-pointer"
            title="Pivoter à gauche"
          >
            ↺
          </button>
          <button
            type="button"
            onClick={() => setRotation((prev) => (prev + 90) % 360)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-xs text-white cursor-pointer"
            title="Pivoter à droite"
          >
            ↻
          </button>
          <button
            type="button"
            onClick={() => {
              setScale(1);
              setRotation(0);
              setOffset({ x: 0, y: 0 });
            }}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-[10px] font-extrabold text-indigo-300 cursor-pointer"
            title="Réinitialiser"
          >
            R
          </button>
        </div>

        {/* Action Icon Buttons */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center text-base font-bold transition-all border border-white/20 cursor-pointer shadow-lg"
            title="Annuler"
          >
            ✕
          </button>
          
          <button
            type="button"
            onClick={handleCropSave}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white flex items-center justify-center text-xl font-bold transition-all shadow-2xl border border-emerald-300 cursor-pointer"
            title="Valider et appliquer la photo"
          >
            ✓
          </button>
        </div>

      </div>

    </div>
  );
};
