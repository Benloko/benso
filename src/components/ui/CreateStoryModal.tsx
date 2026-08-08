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
  const [coverEffect, setCoverEffect] = useState<'none' | 'zoom' | 'glow' | 'shimmer' | 'float' | 'rotate' | 'bounce' | 'pulse' | 'vortex' | 'wave'>('none');

  const [accessType, setAccessType] = useState<'free' | 'paid'>('free');
  const [priceFCFA, setPriceFCFA] = useState<number>(500);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const formats = [
    { 
      id: 'lyrique', 
      name: 'Lyrique', 
      emoji: '📝', 
      desc: 'Manuscrit & Livre PDF',
      acceptType: '.pdf',
      uploadLabel: 'fichiers PDF (.pdf)',
      bgGradient: 'from-[#2A1E35] via-[#1E172F] to-[#141024] hover:from-amber-600/30 hover:to-rose-600/30 border-amber-500/30' 
    },
    { 
      id: 'image', 
      name: 'Image & BD', 
      emoji: '💬', 
      desc: 'Planches BD & Visuels multiples',
      acceptType: 'image/*,.pdf,.cbz',
      uploadLabel: 'planches / images BD (.png, .jpg, .webp)',
      bgGradient: 'from-[#1F1B38] via-[#16122C] to-[#120E24] hover:from-purple-600/30 hover:to-indigo-600/30 border-purple-500/30' 
    },
    { 
      id: 'video', 
      name: 'Vidéo & Animé', 
      emoji: '🎬', 
      desc: 'Court-métrage & Épisodes MP4',
      acceptType: 'video/*,.mp4,.mov,.webm',
      uploadLabel: 'fichiers Vidéo (.mp4, .mov)',
      bgGradient: 'from-[#152336] via-[#111A2B] to-[#0E1524] hover:from-cyan-600/30 hover:to-blue-600/30 border-cyan-500/30' 
    },
    { 
      id: 'audio', 
      name: 'Audio & Podcast', 
      emoji: '🎧', 
      desc: 'Pistes vocales & Slam MP3',
      acceptType: 'audio/*,.mp3,.wav,.m4a',
      uploadLabel: 'fichiers Audio (.mp3, .wav)',
      bgGradient: 'from-[#29172B] via-[#1D1224] to-[#130B18] hover:from-pink-600/30 hover:to-rose-600/30 border-pink-500/30' 
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
      setCoverImage(url);
    }
  };

  const handleGoToFiles = () => {
    if (!coverImage) {
      alert("📷 Veuillez d'abord sélectionner une photo de couverture !");
      return;
    }
    setStep(3);
  };

  const handleGoToDetails = () => {
    if (uploadedFiles.length === 0) {
      alert("📁 Veuillez ajouter au moins un fichier ou une image pour votre création !");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#110D21] border border-indigo-500/35 w-full max-w-lg rounded-3xl p-4 sm:p-6 shadow-[0_0_50px_rgba(99,102,241,0.25)] relative overflow-hidden text-white max-h-[94vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-indigo-950/80 mb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            {step > 1 && (
              <button 
                onClick={() => setStep((prev) => (prev - 1) as any)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                title="Étape précédente"
              >
                <ArrowLeftIcon size={18} />
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <PlusCircleIcon size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                {step === 1 && "Choisir le format d'œuvre"}
                {step === 2 && "Couverture & Animation"}
                {step === 3 && "Importation des Fichiers & Photos"}
                {step === 4 && "Titre & Synopsis"}
                {step === 5 && "Accès & Tarification"}
              </h3>
              <p className="text-[11px] text-indigo-300 font-medium">
                Étape {step}/5 • {
                  step === 1 ? "Format Média" : 
                  step === 2 ? "Photo & Style Visuel" : 
                  step === 3 ? "Importation Multi-Contenu" :
                  step === 4 ? "Identité & Thématique" : "Gratuit ou Payant"
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => { setStep(1); onClose(); }}
            className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* STEP 1: Format Selection 2x2 Grid */}
        {step === 1 && (
          <div className="space-y-4 overflow-y-auto pr-0.5">
            <p className="text-xs text-gray-300">
              Sélectionnez le type de média de votre création :
            </p>

            <div className="grid grid-cols-2 gap-3">
              {formats.map((fmt) => (
                <div
                  key={fmt.id}
                  onClick={() => handleSelectFormat(fmt)}
                  className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-b ${fmt.bgGradient} border cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-all shadow-xl flex flex-col justify-between min-h-[130px] group`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner">
                    {fmt.emoji}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-snug group-hover:text-indigo-200 transition-colors">
                      {fmt.name}
                    </h4>
                    <p className="text-[11px] text-gray-300/80 leading-tight mt-1">
                      {fmt.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: DEDICATED STEP FOR COVER PHOTO & ROUND ANIMATION BUTTONS */}
        {step === 2 && (
          <div className="space-y-4 overflow-y-auto pr-0.5 flex flex-col items-center">
            {/* Top Info Banner */}
            <div className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-[#181330] border border-indigo-900/50 text-xs">
              <span className="flex items-center gap-2 font-bold text-indigo-200">
                <span className="text-lg">{selectedFormat.emoji}</span> Format : {selectedFormat.name}
              </span>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 font-bold text-[11px] transition-all flex items-center gap-1 shadow-sm"
              >
                ✏️ Modifier
              </button>
            </div>

            {/* COVER IMAGE BOX OR SELECTION CAMERA DROPZONE */}
            {coverImage ? (
              <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden bg-black/40 border-2 border-rose-500/50 shadow-2xl shadow-rose-950/50 group">
                <img
                  src={coverImage}
                  alt="Aperçu couverture"
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    coverEffect !== 'none' ? `anim-${coverEffect}` : ''
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                
                {/* Badge Overlay */}
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-extrabold text-rose-300 border border-white/10">
                  {coverEffect === 'none' ? '📷 Couverture Fixe' : '⚡ Animation en direct'}
                </div>

                {/* Upload Cover Button on Top Right */}
                <label className="absolute bottom-3 right-3 px-3.5 py-2 rounded-xl bg-black/80 hover:bg-black/95 backdrop-blur-md text-white border border-white/20 text-xs font-extrabold flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer">
                  📷 Changer la photo
                  <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="relative w-full h-44 sm:h-52 rounded-2xl border-2 border-dashed border-rose-500/60 hover:border-rose-400 bg-[#16112C]/80 hover:bg-[#1A1435] flex flex-col items-center justify-center gap-3 cursor-pointer transition-all shadow-xl group">
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform">
                  📷
                </div>
                <div className="text-center px-4">
                  <p className="text-sm font-extrabold text-white group-hover:text-rose-300 transition-colors">
                    Cliquez ici pour sélectionner votre photo de couverture *
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Format recommandé : PNG, JPG ou WEBP (Haute résolution)
                  </p>
                </div>
              </label>
            )}

            {/* ROUND ANIMATION BUTTONS ON A SINGLE HORIZONTAL SCROLLABLE LINE */}
            {coverImage && (
              <div className="w-full space-y-2 text-center animate-fadeIn">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-extrabold text-indigo-200">
                    Choisissez le style d'animation :
                  </p>
                  <span className="text-[10px] text-rose-300 font-bold animate-pulse">
                    👉 Glissez pour plus d'effets
                  </span>
                </div>

                {/* Single Horizontal Scrollable Row with Live Animated Button Previews */}
                <div className="flex items-center gap-3 sm:gap-4 py-2.5 px-2 overflow-x-auto whitespace-nowrap scrollbar-none w-full border border-indigo-900/40 rounded-2xl bg-[#140F2A]/60 shadow-inner">
                  {animationEffects.map((eff) => (
                    <div key={eff.id} className="flex flex-col items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setCoverEffect(eff.id as any)}
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl transition-all duration-300 cursor-pointer shadow-lg overflow-hidden ${
                          coverEffect === eff.id
                            ? `bg-gradient-to-tr ${eff.bg} scale-110 ring-4 ring-rose-400/60 shadow-rose-500/40 text-white`
                            : 'bg-[#181335] hover:bg-[#221B4A] border border-indigo-900/60 text-gray-300 hover:scale-105'
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

            {/* Continue to Step 3 */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleGoToFiles}
                disabled={!coverImage}
                className={`px-8 py-3 rounded-full font-extrabold text-xs sm:text-sm shadow-xl transition-all flex items-center gap-2 ${
                  coverImage
                    ? 'bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-white shadow-[0_4px_25px_rgba(244,63,94,0.45)] hover:scale-105 active:scale-95 cursor-pointer'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                }`}
              >
                Suivant : Téléverser les fichiers →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DEDICATED STEP FOR MULTI-FILE / MULTI-PAGE UPLOADS WITH NUMBERED CARDS & ACTIONS */}
        {step === 3 && (
          <div className="space-y-4 overflow-y-auto pr-0.5 flex flex-col">
            <div className="flex items-center justify-between pb-1 border-b border-indigo-950/60">
              <h4 className="text-sm font-extrabold text-white">Ajouter les contenus de votre création</h4>
            </div>

            {/* Premium, High-Impact Clickable Multi-File Upload Button */}
            <label className="relative w-full border border-indigo-500/40 hover:border-rose-400 bg-gradient-to-r from-[#1E173D] via-[#261B4E] to-[#1E173D] hover:from-[#281D56] hover:to-[#281D56] rounded-2xl py-3 px-4 cursor-pointer transition-all duration-300 flex items-center justify-center gap-3 group shadow-xl shadow-indigo-950/80 active:scale-[0.98]">
              <input
                type="file"
                multiple
                accept={selectedFormat.acceptType}
                onChange={handleMultipleFilesChange}
                className="hidden"
              />
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-500 flex items-center justify-center text-white text-base font-black shadow-lg shadow-rose-500/35 group-hover:scale-110 transition-transform">
                ➕
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs sm:text-sm font-extrabold text-white group-hover:text-rose-300 transition-colors">
                  {uploadedFiles.length > 0 ? "Ajouter d'autres fichiers ou photos +" : `Cliquez ici pour choisir vos ${selectedFormat.uploadLabel}`}
                </span>
                <span className="text-[10px] text-indigo-300/80 font-semibold">
                  Sélectionnez un ou plusieurs fichiers en même temps
                </span>
              </div>
            </label>


            {/* Numbered Cards Preview Grid for Uploaded Files */}
            {uploadedFiles.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[11px] font-extrabold text-indigo-300">
                  Fichiers & Planches sélectionné(e)s ({uploadedFiles.length}) :
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1 bg-[#130E26] rounded-2xl border border-indigo-950">
                  {uploadedFiles.map((item, idx) => (
                    <div
                      key={item.id}
                      className="relative bg-[#1A1435] border border-indigo-900/60 rounded-2xl p-2 flex flex-col justify-between space-y-1.5 group shadow-md hover:border-indigo-500/70 transition-all"
                    >
                      {/* Top Bar with Number Badge #1, #2, #3 */}
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-black text-[11px] flex items-center justify-center shadow-md">
                          #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          {/* Replace File Button */}
                          <label className="p-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 text-[10px] font-bold cursor-pointer transition-colors" title="Remplacer le fichier">
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
                            className="p-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 text-[10px] font-bold transition-colors"
                            title="Supprimer ce fichier"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Image Thumbnail Preview or File Icon */}
                      <div className="w-full h-24 rounded-xl overflow-hidden bg-black/40 border border-white/5 flex items-center justify-center">
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

                      {/* File Size Footer (No File Name Title!) */}
                      <div className="text-right">
                        <p className="text-[9px] text-gray-400 font-bold">
                          {(item.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center rounded-2xl bg-[#140F2A]/60 border border-indigo-900/40 text-gray-400 text-xs font-medium">
                Aucun fichier sélectionné pour l'instant. Cliquez ci-dessus pour importer.
              </div>
            )}


            {/* Continue to Step 4 */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleGoToDetails}
                disabled={uploadedFiles.length === 0}
                className={`px-8 py-3 rounded-full font-extrabold text-xs sm:text-sm shadow-xl transition-all flex items-center gap-2 ${
                  uploadedFiles.length > 0
                    ? 'bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-white shadow-[0_4px_25px_rgba(244,63,94,0.45)] hover:scale-105 active:scale-95 cursor-pointer'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                }`}
              >
                Suivant : Titre & Synopsis →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Title, Genre & Synopsis */}
        {step === 4 && (
          <form onSubmit={handleGoToPricing} className="space-y-4 overflow-y-auto pr-1">
            {/* Title Input */}
            <div>
              <label className="block text-xs font-bold text-gray-200 mb-1">
                Titre de l'œuvre *
              </label>
              <input
                type="text"
                required
                placeholder="ex: Les Reines du Dahomey"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#16122B] text-white px-3.5 py-2.5 rounded-xl border border-indigo-900/60 focus:border-indigo-500 focus:outline-none text-xs sm:text-sm font-medium"
              />
            </div>

            {/* Category / Genre Dropdown */}
            <div>
              <label className="block text-xs font-bold text-gray-200 mb-1">
                Genre littéraire / Thématique *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#16122B] text-white px-3.5 py-2 rounded-xl border border-indigo-900/60 focus:border-indigo-500 focus:outline-none text-xs sm:text-sm"
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
              <label className="block text-xs font-bold text-gray-200 mb-1">
                Résumé / Synopsis d'accroche *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Présentez brièvement votre création..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full bg-[#16122B] text-white p-2.5 rounded-xl border border-indigo-900/60 focus:border-indigo-500 focus:outline-none text-xs sm:text-sm leading-relaxed"
              />
            </div>

            {/* Go to Step 5 */}
            <div className="flex justify-center pt-2">
              <Button
                type="submit"
                variant="coral"
                size="md"
                className="px-6 py-2.5 rounded-full text-xs font-extrabold shadow-lg shadow-rose-500/25"
              >
                Suivant : Accès & Tarification →
              </Button>
            </div>
          </form>
        )}

        {/* STEP 5: Dedicated Pricing & Monetization Step */}
        {step === 5 && (
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="text-center space-y-1">
              <h4 className="text-base font-extrabold text-white">Comment souhaitez-vous diffuser cette œuvre ?</h4>
              <p className="text-xs text-gray-300">
                Choisissez entre accès libre ou vente monétisée pour vos lecteurs
              </p>
            </div>

            {/* 2 Choice Cards: Free vs Paid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: Gratuit */}
              <div
                onClick={() => setAccessType('free')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                  accessType === 'free'
                    ? 'bg-emerald-950/40 border-emerald-400/80 ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-950/50'
                    : 'bg-[#15112B] border-indigo-900/50 hover:border-indigo-600/50 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🟢</span>
                  {accessType === 'free' && <span className="text-[10px] text-emerald-400 font-bold">✓ Sélectionné</span>}
                </div>
                <div>
                  <h5 className="font-extrabold text-xs sm:text-sm text-white">Œuvre Gratuite</h5>
                  <p className="text-[10px] text-gray-300 mt-0.5">Accès libre pour toute la communauté</p>
                </div>
              </div>

              {/* Option 2: Payant */}
              <div
                onClick={() => setAccessType('paid')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                  accessType === 'paid'
                    ? 'bg-rose-950/40 border-rose-400/80 ring-2 ring-rose-400/40 shadow-lg shadow-rose-950/50'
                    : 'bg-[#15112B] border-indigo-900/50 hover:border-indigo-600/50 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🔒</span>
                  {accessType === 'paid' && <span className="text-[10px] text-rose-400 font-bold">✓ Sélectionné</span>}
                </div>
                <div>
                  <h5 className="font-extrabold text-xs sm:text-sm text-white">Œuvre Payante</h5>
                  <p className="text-[10px] text-gray-300 mt-0.5">Vente directe créditée sur votre compte</p>
                </div>
              </div>
            </div>

            {/* Pricing Input Box if Paid */}
            {accessType === 'paid' && (
              <div className="p-3.5 rounded-2xl bg-[#17122F] border border-rose-500/30 space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-200">
                    Prix de vente (en F CFA) *
                  </label>
                  <span className="text-[10px] font-extrabold text-emerald-400">
                    Votre gain : {Math.round(priceFCFA * 0.85)} F CFA / vente
                  </span>
                </div>

                {/* Preset Price Chips */}
                <div className="flex items-center gap-2">
                  {[200, 500, 1000, 2000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPriceFCFA(preset)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        priceFCFA === preset
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                          : 'bg-[#1D173A] text-gray-300 hover:bg-[#251F4A]'
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
                    className="w-full bg-[#110C24] text-amber-300 font-black px-4 py-2 rounded-xl border border-indigo-900/80 focus:border-amber-400 focus:outline-none text-sm"
                  />
                  <span className="text-xs font-bold text-gray-200 shrink-0">F CFA</span>
                </div>
              </div>
            )}

            {/* Compact, Styled Centered Final Publish Button */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-white font-extrabold text-xs sm:text-sm shadow-[0_4px_25px_rgba(244,63,94,0.45)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <SparklesIcon size={18} />
                Publier l'œuvre
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};


