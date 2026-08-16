'use client';

import React, { useState } from 'react';
import { SparklesIcon, PlusCircleIcon, LockIcon, ArrowLeftIcon } from './Icons';
import { Button } from './Button';


interface UploadedMediaItem {
  id: string;
  file: File;
  previewUrl?: string;
  name: string;
  size: number;
}

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: (newStory: any) => void;
}

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  isOpen,
  onClose,
  onStoryCreated,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedFormat, setSelectedFormat] = useState<{ id: string; name: string; emoji: string; acceptType: string; uploadLabel: string }>({
    id: 'lyrique',
    name: 'Lyrique (Texte)',
    emoji: '📝',
    acceptType: '.pdf',
    uploadLabel: 'fichiers manuscrit (.pdf)',
  });

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Conte & Légende');
  const [excerpt, setExcerpt] = useState('');
  
  // Dedicated Multi-File state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedMediaItem[]>([]);
  
  // Dedicated Cover Banner & Round Animation buttons state (Default to NULL & Fixe 'none')
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [rawCoverImage, setRawCoverImage] = useState<string | null>(null);
  const [coverEffect, setCoverEffect] = useState<'none' | 'zoom' | 'glow' | 'shimmer' | 'float' | 'rotate' | 'bounce' | 'pulse' | 'vortex' | 'wave'>('none');

  // Professional Cover Image Cropper & Orientation State
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [cropZoom, setCropZoom] = useState<number>(1);
  const [cropRotation, setCropRotation] = useState<number>(0);
  const [cropOffsetX, setCropOffsetX] = useState<number>(0);
  const [cropOffsetY, setCropOffsetY] = useState<number>(0);
  const [isDraggingCrop, setIsDraggingCrop] = useState<boolean>(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [touchDistance, setTouchDistance] = useState<number | null>(null);

  const [accessType, setAccessType] = useState<'free' | 'paid'>('free');
  const [priceFCFA, setPriceFCFA] = useState<number>(500);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetCropper = () => {
    setCropZoom(1);
    setCropRotation(0);
    setCropOffsetX(0);
    setCropOffsetY(0);
  };

  const handleCropWheel = (e: React.WheelEvent) => {
    const zoomFactor = e.deltaY < 0 ? 0.1 : -0.1;
    setCropZoom((prev) => Math.max(0.4, Math.min(4.5, parseFloat((prev + zoomFactor).toFixed(2)))));
  };

  const handleCropMouseDown = (e: React.MouseEvent) => {
    setIsDraggingCrop(true);
    setDragStartPos({ x: e.clientX - cropOffsetX * 2.5, y: e.clientY - cropOffsetY * 2.5 });
  };

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCrop) return;
    const deltaX = (e.clientX - dragStartPos.x) / 2.5;
    const deltaY = (e.clientY - dragStartPos.y) / 2.5;
    setCropOffsetX(Math.max(-100, Math.min(100, deltaX)));
    setCropOffsetY(Math.max(-100, Math.min(100, deltaY)));
  };

  const handleCropMouseUp = () => {
    setIsDraggingCrop(false);
  };

  const handleCropTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDraggingCrop(true);
      setDragStartPos({
        x: e.touches[0].clientX - cropOffsetX * 2.5,
        y: e.touches[0].clientY - cropOffsetY * 2.5,
      });
      setTouchDistance(null);
    } else if (e.touches.length === 2) {
      setIsDraggingCrop(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchDistance(dist);
    }
  };

  const handleCropTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDraggingCrop) {
      const deltaX = (e.touches[0].clientX - dragStartPos.x) / 2.5;
      const deltaY = (e.touches[0].clientY - dragStartPos.y) / 2.5;
      setCropOffsetX(Math.max(-100, Math.min(100, deltaX)));
      setCropOffsetY(Math.max(-100, Math.min(100, deltaY)));
    } else if (e.touches.length === 2 && touchDistance !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = currentDist / touchDistance;
      setCropZoom((prev) => Math.max(0.4, Math.min(4.5, parseFloat((prev * factor).toFixed(2)))));
      setTouchDistance(currentDist);
    }
  };

  const handleCropTouchEnd = () => {
    setIsDraggingCrop(false);
    setTouchDistance(null);
  };

  const handleApplyCrop = () => {
    const sourceUrl = rawCoverImage || coverImage;
    if (!sourceUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = sourceUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Exact cover banner frame (1200 x 520)
      const targetWidth = 1200;
      const targetHeight = 520;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.fillStyle = '#0B0818';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Base ratio matching object-contain preview in aspect-[1200/520] frame
      const baseRatio = Math.min(targetWidth / img.width, targetHeight / img.height);
      const renderW = img.width * baseRatio * cropZoom;
      const renderH = img.height * baseRatio * cropZoom;

      const drawX = (targetWidth - renderW) / 2 + (cropOffsetX * targetWidth) / 100;
      const drawY = (targetHeight - renderH) / 2 + (cropOffsetY * targetHeight) / 100;

      ctx.save();
      ctx.translate(drawX + renderW / 2, drawY + renderH / 2);
      ctx.rotate((cropRotation * Math.PI) / 180);
      ctx.drawImage(
        img,
        -renderW / 2,
        -renderH / 2,
        renderW,
        renderH
      );
      ctx.restore();

      try {
        const croppedUrl = canvas.toDataURL('image/jpeg', 0.95);
        setCoverImage(croppedUrl);
      } catch (err) {
        console.error("Canvas export error:", err);
      }
      setShowCropper(false);
    };
  };

  if (!isOpen) return null;

  const formats = [
    { 
      id: 'lyrique', 
      name: 'Lyrique', 
      emoji: '📝', 
      desc: 'Manuscrit & Livre PDF',
      image: '/category_lyrique.png',
      acceptType: '.pdf',
      uploadLabel: 'fichiers PDF (.pdf)',
      accentColor: 'from-amber-500 via-rose-500 to-purple-600',
    },
    { 
      id: 'image', 
      name: 'Image & BD', 
      emoji: '💬', 
      desc: 'Planches BD & Visuels multiples',
      image: '/category_image.png',
      acceptType: 'image/*,.pdf,.cbz',
      uploadLabel: 'planches / images BD (.png, .jpg, .webp)',
      accentColor: 'from-purple-500 via-indigo-600 to-cyan-500',
    },
    { 
      id: 'video', 
      name: 'Vidéo & Animé', 
      emoji: '🎬', 
      desc: 'Court-métrage & Épisodes MP4',
      image: '/category_video.png',
      acceptType: 'video/*,.mp4,.mov,.webm',
      uploadLabel: 'fichiers Vidéo (.mp4, .mov)',
      accentColor: 'from-cyan-500 via-blue-600 to-indigo-600',
    },
    { 
      id: 'audio', 
      name: 'Audio & Podcast', 
      emoji: '🎧', 
      desc: 'Pistes vocales & Slam MP3',
      image: '/category_audio.png',
      acceptType: 'audio/*,.mp3,.wav,.m4a',
      uploadLabel: 'fichiers Audio (.mp3, .wav)',
      accentColor: 'from-pink-500 via-rose-600 to-amber-500',
    },
  ];

  // Expanded Rich Animation Gallery (Fixe at index 0 by default)
  const animationEffects = [
    { id: 'none', icon: '🚫', name: 'Fixe', bg: 'from-gray-600 to-gray-800' },
    { id: 'rotate', icon: '🔄', name: 'Rotation 360°', bg: 'from-purple-500 via-indigo-600 to-pink-500' },
    { id: 'bounce', icon: '🦘', name: 'Rebond', bg: 'from-emerald-400 via-teal-500 to-green-600' },
    { id: 'pulse', icon: '💓', name: 'Battement', bg: 'from-rose-500 via-pink-600 to-red-500' },
    { id: 'vortex', icon: '🌀', name: 'Vortex Swirl', bg: 'from-cyan-400 via-blue-500 to-indigo-600' },
    { id: 'wave', icon: '🌊', name: 'Vague', bg: 'from-sky-400 via-teal-500 to-emerald-500' },
    { id: 'zoom', icon: '🔍', name: 'Kinetic', bg: 'from-amber-500 to-rose-600' },
    { id: 'glow', icon: '✨', name: 'Néon Strobe', bg: 'from-indigo-500 to-purple-600' },
    { id: 'shimmer', icon: '💫', name: 'Éclat Or', bg: 'from-amber-400 to-orange-500' },
    { id: 'float', icon: '🎈', name: 'Tilt 3D', bg: 'from-emerald-500 to-teal-600' },
  ];

  const handleSelectFormat = (fmt: any) => {
    setSelectedFormat(fmt);
    setStep(2);
  };

  const handleMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newItems: UploadedMediaItem[] = Array.from(e.target.files).map((f, idx) => ({
        id: `file-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        file: f,
        previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
        name: f.name,
        size: f.size,
      }));
      setUploadedFiles((prev) => [...prev, ...newItems]);
    }
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReplaceFile = (id: string, newFile: File) => {
    setUploadedFiles((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            file: newFile,
            previewUrl: newFile.type.startsWith('image/') ? URL.createObjectURL(newFile) : undefined,
            name: newFile.name,
            size: newFile.size,
          };
        }
        return item;
      })
    );
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setRawCoverImage(url);
      setCoverImage(url);
      resetCropper();
      setShowCropper(true);
    }
  };

  const handleOpenCropper = () => {
    resetCropper();
    setShowCropper(true);
  };

  const handleGoToFiles = () => {
    if (!coverImage) {
      alert("📷 Veuillez d'abord sélectionner une photo de couverture !");
      return;
    }
    setStep(3);
  };

  const handleGoToDetails = () => {
    if (uploadedFiles.length < 10) {
      alert(`⚠️ Vous devez ajouter au moins 10 photos ou planches (actuellement ${uploadedFiles.length}/10) !`);
      return;
    }
    setStep(4);
  };

  const handleGoToPricing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("⚠️ Le titre de l'œuvre est obligatoire !");
      return;
    }
    if (!excerpt.trim()) {
      alert("⚠️ Le résumé / synopsis est obligatoire !");
      return;
    }
    setStep(5);
  };

  const handleFinalSubmit = async () => {
    if (!title.trim()) {
      alert("⚠️ Le titre de l'œuvre est obligatoire !");
      return;
    }
    if (uploadedFiles.length === 0) {
      alert("⚠️ Contenu manquant : vous devez avoir au moins un fichier téléversé.");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalCoverUrl = coverImage;

      // 1. Upload Cover Image to backend if it's a blob/file
      if (coverImage && coverImage.startsWith('blob:')) {
        const coverInput = document.querySelector('input[accept="image/*"]') as HTMLInputElement;
        if (coverInput && coverInput.files && coverInput.files[0]) {
          const coverData = new FormData();
          coverData.append('file', coverInput.files[0]);
          const uploadRes = await fetch('/api/upload', { method: 'POST', body: coverData });
          const uploadJson = await uploadRes.json();
          if (uploadJson.success) {
            finalCoverUrl = uploadJson.url;
          }
        }
      }

      const fallbackCover = (finalCoverUrl && !finalCoverUrl.startsWith('blob:')) ? finalCoverUrl : (
        selectedFormat.id === 'lyrique' ? '/category_lyrique.png' :
        selectedFormat.id === 'image' ? '/category_image.png' :
        selectedFormat.id === 'video' ? '/category_video.png' : '/category_audio.png'
      );

      // 2. Upload Content Files to backend
      let pdfUrl: string | undefined = undefined;
      let mediaUrl: string | undefined = undefined;

      for (const item of uploadedFiles) {
        if (item.file) {
          const fileData = new FormData();
          fileData.append('file', item.file);
          const fRes = await fetch('/api/upload', { method: 'POST', body: fileData });
          const fJson = await fRes.json();
          if (fJson.success) {
            if (item.name.endsWith('.pdf')) {
              pdfUrl = fJson.url;
            } else {
              mediaUrl = fJson.url;
            }
          }
        }
      }

      const isPremium = accessType === 'paid';

      // 3. Save Story to Backend Database via API POST /api/stories
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          excerpt,
          fullContent: excerpt,
          category,
          format: selectedFormat.id,
          isPremium,
          priceFCFA: isPremium ? Number(priceFCFA) : 0,
          coverImage: fallbackCover,
          coverEffect: coverEffect !== 'none' ? coverEffect : undefined,
          pdfUrl,
          mediaUrl,
        }),
      });

      const json = await res.json();

      if (json.success && json.story) {
        onStoryCreated(json.story);
        setStep(1);
        setTitle('');
        setExcerpt('');
        setUploadedFiles([]);
        setCoverImage(null);
        setAccessType('free');
        onClose();
        alert(`🎉 Votre œuvre "${title}" a été enregistrée en Base de Données et publiée avec succès !`);
      } else {
        alert(`⚠️ Erreur : ${json.error || 'Impossible d\'enregistrer l\'histoire'}`);
      }
    } catch (error) {
      console.error('Error submitting story to backend:', error);
      alert('⚠️ Une erreur réseau est survenue lors de l\'enregistrement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-6 bg-[#080514]/98 backdrop-blur-2xl animate-fadeIn overflow-hidden">
      {/* Top Header Floating in Dark Screen */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between pt-1 pb-3 shrink-0">
        <button 
          type="button"
          onClick={() => {
            if (step > 1) {
              setStep((prev) => (prev - 1) as any);
            } else {
              onClose();
            }
          }}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all border border-white/20 shadow-lg text-base cursor-pointer"
          title={step > 1 ? "Étape précédente" : "Fermer"}
        >
          ←
        </button>

        <div className="text-center">
          <h3 className="font-black text-base sm:text-lg text-white tracking-tight leading-tight">
            {step === 1 && "Choisir le format d'œuvre"}
            {step === 2 && "Couverture & Animation"}
            {step === 3 && "Importation des Fichiers"}
            {step === 4 && "Titre & Synopsis"}
            {step === 5 && "Accès & Tarification"}
          </h3>
          <p className="text-[11px] text-indigo-300 font-bold">
            Étape {step}/5
          </p>
        </div>

        <button 
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-gray-300 hover:text-white flex items-center justify-center text-xs cursor-pointer border border-white/15"
          title="Fermer"
        >
          ✕
        </button>
      </div>

      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between text-white py-2 min-h-0 overflow-hidden">
        
        {/* STEP 1: Format Selection 2x2 Artwork Grid (Matching Discover tab design) */}
        {step === 1 && (
          <div className="space-y-4 overflow-y-auto pr-0.5 my-auto">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-300 font-medium">
                Sélectionnez le format de votre création :
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
              {formats.map((fmt) => (
                <div
                  key={fmt.id}
                  onClick={() => handleSelectFormat(fmt)}
                  className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-[#141026] border border-white/10 hover:border-rose-400/80 shadow-2xl cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] hover:shadow-[0_0_25px_rgba(244,63,94,0.3)] flex flex-col justify-end"
                >
                  {/* Background Artwork Image */}
                  <img
                    src={fmt.image}
                    alt={fmt.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />

                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0819] via-[#0B0819]/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                  {/* Title & Emoji written directly on bottom of artwork */}
                  <div className="relative z-10 p-3 sm:p-4 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base sm:text-lg">{fmt.emoji}</span>
                      <h4 className="font-black text-sm sm:text-base text-white tracking-tight leading-tight group-hover:text-rose-200 transition-colors drop-shadow-md">
                        {fmt.name}
                      </h4>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-gray-300 font-medium line-clamp-1 leading-snug">
                      {fmt.desc}
                    </p>
                  </div>

                  {/* Top Accent Line Glow on Hover */}
                  <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${fmt.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: DEDICATED STEP FOR COVER PHOTO & ROUND ANIMATION BUTTONS (AIRY FULL-SCREEN) */}
        {step === 2 && (
          <div className="flex-1 flex flex-col justify-between w-full space-y-6 pt-4 pb-2 animate-fadeIn">
            
            {/* COVER IMAGE BANNER - TALLER, RICH & SPACIOUS (NOT SQUISHED) */}
            {coverImage ? (
              <div className="relative w-full h-56 sm:h-64 rounded-3xl overflow-hidden bg-black/60 border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.85)] group shrink-0">
                <img
                  src={coverImage}
                  alt="Aperçu couverture"
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    coverEffect !== 'none' ? `anim-${coverEffect}` : ''
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                
                {/* Floating Pure Icon Action Buttons on Cover Image: Recadrer & Changer */}
                <div className="absolute bottom-3.5 right-3.5 flex items-center gap-2.5 z-10">
                  <button
                    type="button"
                    onClick={handleOpenCropper}
                    title="Recadrer la photo"
                    className="w-10 h-10 rounded-full bg-black/75 hover:bg-black/95 backdrop-blur-md text-white border border-white/25 text-base flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  >
                    ✂️
                  </button>
                  <label
                    title="Changer la photo"
                    className="w-10 h-10 rounded-full bg-black/75 hover:bg-black/95 backdrop-blur-md text-white border border-white/25 text-base flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  >
                    📷
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                  </label>
                </div>
              </div>
            ) : (
              <label className="relative w-full h-56 sm:h-64 rounded-3xl border-2 border-dashed border-rose-500/60 hover:border-rose-400 bg-[#140F2B]/80 hover:bg-[#1A1435] flex flex-col items-center justify-center gap-3 cursor-pointer transition-all shadow-2xl group shrink-0">
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white text-3xl shadow-xl shadow-rose-500/30 group-hover:scale-110 transition-transform">
                  📷
                </div>
                <div className="text-center px-4">
                  <p className="text-sm font-extrabold text-white group-hover:text-rose-300 transition-colors">
                    Sélectionner une photo de couverture *
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Format conseillé : PNG, JPG ou WEBP
                  </p>
                </div>
              </label>
            )}

            {/* LOWER SECTION: ROUND ANIMATION BUTTONS + NEXT BUTTON (PUSHED DOWN TOWARDS BOTTOM) */}
            <div className="w-full space-y-4 pt-2">
              {coverImage && (
                <div className="w-full space-y-2 animate-fadeIn">
                  <p className="text-xs font-extrabold text-gray-300 px-1">
                    Style d'animation :
                  </p>

                  {/* Single Horizontal Scrollable Row */}
                  <div className="flex items-center gap-3.5 py-1 px-1 overflow-x-auto whitespace-nowrap scrollbar-none w-full">
                    {animationEffects.map((eff) => (
                      <div key={eff.id} className="flex flex-col items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setCoverEffect(eff.id as any)}
                          className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl transition-all duration-300 cursor-pointer shadow-lg overflow-hidden ${
                            coverEffect === eff.id
                              ? `bg-gradient-to-tr ${eff.bg} scale-110 ring-4 ring-rose-400/60 shadow-rose-500/40 text-white`
                              : 'bg-white/10 hover:bg-white/20 border border-white/15 text-gray-300 hover:scale-105'
                          }`}
                          title={eff.name}
                        >
                          <span className={`inline-block ${eff.id !== 'none' ? `anim-${eff.id}` : ''}`}>
                            {eff.icon}
                          </span>
                        </button>
                        <span className={`text-[10px] font-bold ${coverEffect === eff.id ? 'text-rose-300' : 'text-gray-400'}`}>
                          {eff.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Action Button */}
              <div className="w-full pt-1">
                <button
                  type="button"
                  onClick={handleGoToFiles}
                  disabled={!coverImage}
                  className={`w-full py-3.5 px-6 rounded-full font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${
                    coverImage
                      ? 'bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-white shadow-rose-500/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                  }`}
                >
                  <span>Suivant : Téléverser les fichiers</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DEDICATED STEP FOR MULTI-FILE / MULTI-PAGE UPLOADS */}
        {step === 3 && (
          <div className="flex-1 flex flex-col justify-between w-full space-y-3 pt-2 pb-1 animate-fadeIn min-h-0 overflow-hidden">
            
            {/* INITIAL EMPTY STATE: LARGE DASHED DROPZONE */}
            {uploadedFiles.length === 0 ? (
              <div className="w-full flex-1 flex flex-col items-center justify-center my-auto">
                <label className="relative w-full py-10 px-4 rounded-3xl border-2 border-dashed border-rose-500/50 hover:border-rose-400 bg-[#140F2B]/80 hover:bg-[#1A1435] flex flex-col items-center justify-center gap-3.5 cursor-pointer transition-all shadow-2xl group shrink-0">
                  <input
                    type="file"
                    multiple
                    accept={selectedFormat.acceptType}
                    onChange={handleMultipleFilesChange}
                    className="hidden"
                  />
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white text-3xl shadow-xl shadow-rose-500/35 group-hover:scale-110 transition-transform">
                    ➕
                  </div>
                  <div className="text-center px-4">
                    <p className="text-base font-black text-white group-hover:text-rose-300 transition-colors">
                      Importer vos {selectedFormat.uploadLabel}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-semibold">
                      Sélectionnez vos fichiers <span className="text-rose-400 font-extrabold">(minimum 10 photos)</span>
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              /* STATE AFTER FILES ARE ADDED: COMPACT TOP ADD BUTTON & EXPANDED PREVIEW GRID */
              <div className="w-full flex-1 flex flex-col space-y-3 min-h-0 overflow-hidden">
                {/* Compact Header Bar with Add Icon Button on top right */}
                <div className="flex items-center justify-between px-1 shrink-0">
                  <div>
                    <p className="text-xs font-black text-white flex items-center gap-1.5">
                      Fichiers ajoutés
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-extrabold border border-rose-500/30">
                        {uploadedFiles.length}
                      </span>
                    </p>
                    <p className="text-[10px] text-gray-400 font-semibold">
                      (Minimum 10 photos conseillé)
                    </p>
                  </div>

                  {/* Sleek Compact Add Button */}
                  <label className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:opacity-90 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-rose-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                    <span className="text-sm">➕</span>
                    <span>Ajouter</span>
                    <input
                      type="file"
                      multiple
                      accept={selectedFormat.acceptType}
                      onChange={handleMultipleFilesChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Grid of Uploaded Files filling the vertical space and scrolling inside */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto flex-1 min-h-0 p-1 scrollbar-none">
                  {uploadedFiles.map((item, idx) => (
                    <div
                      key={item.id}
                      className="relative bg-white/5 border border-white/15 rounded-2xl p-2 flex flex-col justify-between space-y-1.5 group shadow-lg hover:border-rose-500/60 transition-all"
                    >
                      {/* Top Bar with Number Badge #1, #2, #3 & Pure Icon Action Buttons */}
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-black text-[11px] flex items-center justify-center shadow-md">
                          #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          {/* Replace File Button */}
                          <label className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-indigo-300 text-[10px] font-bold flex items-center justify-center cursor-pointer transition-all" title="Remplacer">
                            ✏️
                            <input
                              type="file"
                              accept={selectedFormat.acceptType}
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleReplaceFile(item.id, e.target.files[0]);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                          {/* Delete File Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(item.id)}
                            className="w-6 h-6 rounded-full bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer"
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Image Thumbnail Preview or File Icon */}
                      <div className="w-full h-24 rounded-xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center">
                        {item.previewUrl ? (
                          <img
                            src={item.previewUrl}
                            alt={`Planche ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-indigo-400">
                            <span className="text-xl">📄</span>
                            <span className="text-[9px] font-extrabold uppercase mt-1">
                              {item.name.split('.').pop()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* File Size Footer */}
                      <div className="text-right">
                        <p className="text-[9px] text-gray-400 font-bold">
                          {(item.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Action Button ALWAYS Fixed at Bottom */}
            <div className="w-full pt-2 shrink-0">
              <button
                type="button"
                onClick={handleGoToDetails}
                disabled={uploadedFiles.length < 10}
                className={`w-full py-3.5 px-6 rounded-full font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${
                  uploadedFiles.length >= 10
                    ? 'bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-white shadow-rose-500/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                    : 'bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-700 opacity-60'
                }`}
              >
                <span>
                  {uploadedFiles.length >= 10
                    ? 'Suivant : Titre & Synopsis'
                    : `Ajoutez encore ${10 - uploadedFiles.length} photo${10 - uploadedFiles.length > 1 ? 's' : ''} (10 min.)`}
                </span>
                <span>→</span>
              </button>
            </div>

          </div>
        )}

        {/* STEP 4: Title, Genre & Synopsis */}
        {step === 4 && (
          <form onSubmit={handleGoToPricing} className="flex-1 flex flex-col justify-between w-full space-y-6 pt-4 pb-2 animate-fadeIn">
            <div className="w-full space-y-4 my-auto">
              {/* Title Input */}
              <div>
                <label className="block text-xs font-extrabold text-gray-200 mb-1.5 px-1">
                  Titre de l'œuvre *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Les Reines du Dahomey"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/10 text-white px-4 py-3.5 rounded-2xl border border-white/15 focus:border-rose-400 focus:outline-none text-sm font-semibold transition-all"
                />
              </div>

              {/* Category / Genre Dropdown */}
              <div>
                <label className="block text-xs font-extrabold text-gray-200 mb-1.5 px-1">
                  Genre / Thématique *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#16112C] text-white px-4 py-3.5 rounded-2xl border border-white/15 focus:border-rose-400 focus:outline-none text-sm font-semibold transition-all"
                >
                  <option value="Conte & Légende">Conte & Légende</option>
                  <option value="Roman & Fiction">Roman & Fiction</option>
                  <option value="Histoire & Culture">Histoire & Culture</option>
                  <option value="Poésie & Slam">Poésie & Slam</option>
                  <option value="Bande Dessinée & Manga">Bande Dessinée & Manga</option>
                </select>
              </div>

              {/* Excerpt / Synopsis */}
              <div>
                <label className="block text-xs font-extrabold text-gray-200 mb-1.5 px-1">
                  Synopsis / Résumé *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Présentez brièvement votre histoire..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full bg-white/10 text-white p-4 rounded-2xl border border-white/15 focus:border-rose-400 focus:outline-none text-sm leading-relaxed transition-all resize-none"
                />
              </div>
            </div>

            {/* Bottom Action Button */}
            <div className="w-full pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-white font-black text-sm shadow-xl shadow-rose-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Suivant : Accès & Tarification</span>
                <span>→</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 5: Dedicated Pricing & Monetization Step */}
        {step === 5 && (
          <div className="flex-1 flex flex-col justify-between w-full space-y-6 pt-4 pb-2 animate-fadeIn">
            <div className="w-full space-y-4 my-auto">
              <p className="text-xs font-extrabold text-gray-300 px-1">
                Choix du mode d'accès :
              </p>

              {/* 2 Choice Cards: Free vs Paid */}
              <div className="grid grid-cols-2 gap-3.5">
                {/* Option 1: Gratuit */}
                <div
                  onClick={() => setAccessType('free')}
                  className={`p-4 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    accessType === 'free'
                      ? 'bg-emerald-950/40 border-emerald-400/80 ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-950/50'
                      : 'bg-white/5 border-white/15 hover:bg-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">🟢</span>
                    {accessType === 'free' && <span className="text-[10px] text-emerald-400 font-extrabold">✓ Actif</span>}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-white">Gratuit</h5>
                    <p className="text-[10px] text-gray-400 mt-0.5">Accès libre à tous</p>
                  </div>
                </div>

                {/* Option 2: Payant */}
                <div
                  onClick={() => setAccessType('paid')}
                  className={`p-4 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    accessType === 'paid'
                      ? 'bg-rose-950/40 border-rose-400/80 ring-2 ring-rose-400/40 shadow-lg shadow-rose-950/50'
                      : 'bg-white/5 border-white/15 hover:bg-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">🔒</span>
                    {accessType === 'paid' && <span className="text-[10px] text-rose-400 font-extrabold">✓ Actif</span>}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-white">Payant</h5>
                    <p className="text-[10px] text-gray-400 mt-0.5">Accès sur achat</p>
                  </div>
                </div>
              </div>

              {/* Pricing Input Box if Paid */}
              {accessType === 'paid' && (
                <div className="p-4 rounded-3xl bg-white/5 border border-rose-500/40 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-gray-200">
                      Prix de vente (F CFA) *
                    </label>
                    <span className="text-[10px] font-extrabold text-emerald-400">
                      Gain : {Math.round(priceFCFA * 0.85)} F CFA / vente
                    </span>
                  </div>

                  {/* Preset Price Chips */}
                  <div className="flex items-center gap-2">
                    {[200, 500, 1000, 2000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setPriceFCFA(preset)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                          priceFCFA === preset
                            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {preset} F
                      </button>
                    ))}
                  </div>

                  {/* Custom Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="number"
                      min={100}
                      step={100}
                      value={priceFCFA}
                      onChange={(e) => setPriceFCFA(Number(e.target.value))}
                      className="w-full bg-black/40 text-amber-300 font-black px-4 py-2.5 rounded-2xl border border-white/15 focus:border-amber-400 focus:outline-none text-sm"
                    />
                    <span className="text-xs font-extrabold text-gray-300 shrink-0">F CFA</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Button: Final Publish */}
            <div className="w-full pt-2">
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-white font-black text-sm shadow-xl shadow-rose-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <SparklesIcon size={18} />
                <span>Publier l'œuvre</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* FULL-SCREEN BORDERLESS INSTAGRAM/IOS-STYLE CROPPER (NO CARDS) */}
      {showCropper && coverImage && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-between p-4 sm:p-6 bg-black/95 backdrop-blur-2xl animate-fadeIn">
          
          {/* Top Bar: Floating Header with Close Button */}
          <div className="flex items-center justify-between w-full max-w-md mx-auto pt-2">
            <span className="font-extrabold text-base text-white flex items-center gap-2 drop-shadow-md">
              ✂️ Recadrer la photo
            </span>
            <button 
              type="button"
              onClick={() => setShowCropper(false)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center text-sm cursor-pointer border border-white/15 backdrop-blur-md shadow-lg"
              title="Fermer"
            >
              ✕
            </button>
          </div>

          {/* Center: Photo Preview Area (No Card Container Around It) */}
          <div className="flex-1 flex items-center justify-center my-auto w-full max-w-md mx-auto">
            <div 
              onWheel={handleCropWheel}
              onMouseDown={handleCropMouseDown}
              onMouseMove={handleCropMouseMove}
              onMouseUp={handleCropMouseUp}
              onMouseLeave={handleCropMouseUp}
              onTouchStart={handleCropTouchStart}
              onTouchMove={handleCropTouchMove}
              onTouchEnd={handleCropTouchEnd}
              className={`relative w-full aspect-video sm:aspect-banner max-h-[60vh] rounded-2xl overflow-hidden bg-black/60 flex items-center justify-center border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.8)] select-none touch-none ${
                isDraggingCrop ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              <div 
                className="w-full h-full flex items-center justify-center transition-transform duration-75"
                style={{
                  transform: `translate(${cropOffsetX}%, ${cropOffsetY}%) scale(${cropZoom}) rotate(${cropRotation}deg)`,
                }}
              >
                <img
                  src={rawCoverImage || coverImage || ''}
                  alt="Aperçu recadrage"
                  draggable={false}
                  className="max-w-full max-h-full object-contain pointer-events-none select-none"
                />
              </div>

              {/* Grid Lines (Rule of Thirds) */}
              <div className="absolute inset-0 pointer-events-none border border-white/20 grid grid-cols-3 grid-rows-3 opacity-30">
                <div className="border-r border-b border-white/30" />
                <div className="border-r border-b border-white/30" />
                <div className="border-b border-white/30" />
                <div className="border-r border-b border-white/30" />
                <div className="border-r border-b border-white/30" />
                <div className="border-b border-white/30" />
                <div className="border-r border-white/30" />
                <div className="border-r border-white/30" />
                <div />
              </div>
            </div>
          </div>

          {/* Bottom Bar: Floating Pure Icon Toolbar (Borderless, floating directly on screen) */}
          <div className="w-full max-w-md mx-auto flex items-center justify-between pb-4 pt-2 px-2 gap-3">
            {/* Rotate 90° Pure Icon */}
            <button
              type="button"
              onClick={() => setCropRotation((prev) => (prev + 90) % 360)}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center text-base border border-white/20 backdrop-blur-md transition-all cursor-pointer shadow-xl shrink-0"
              title="Pivoter de 90°"
            >
              🔄
            </button>

            {/* Reset Pure Icon */}
            <button
              type="button"
              onClick={resetCropper}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-gray-300 flex items-center justify-center text-base border border-white/20 backdrop-blur-md transition-all cursor-pointer shadow-xl shrink-0"
              title="Réinitialiser"
            >
              ↺
            </button>

            {/* Discrete Zoom Slider (Up to 4.5x / 450%) */}
            <div className="flex-1 flex items-center gap-2 px-1">
              <span className="text-sm font-bold text-gray-400 shrink-0">🔍</span>
              <input
                type="range"
                min="0.4"
                max="4.5"
                step="0.05"
                value={cropZoom}
                onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                className="w-full accent-rose-500 h-1.5 bg-white/25 rounded-lg cursor-pointer"
              />
            </div>

            {/* Valider Pure Icon Button */}
            <button
              type="button"
              onClick={handleApplyCrop}
              className="w-11 h-11 rounded-full bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:scale-105 active:scale-95 text-white flex items-center justify-center text-lg font-black shadow-[0_0_25px_rgba(244,63,94,0.5)] transition-all cursor-pointer border border-white/30 shrink-0"
              title="Valider"
            >
              ✓
            </button>
          </div>

        </div>
      )}
    </div>
  );
};


