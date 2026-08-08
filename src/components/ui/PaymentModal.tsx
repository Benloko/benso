'use client';

import React, { useState } from 'react';
import { LockIcon, SmartphoneIcon, VerifiedIcon } from './Icons';
import { Button } from './Button';
import { StoryItem } from './StoryCard';

interface PaymentModalProps {
  story: StoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (storyId: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  story,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<'mtn' | 'moov' | 'wave'>('mtn');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  if (!isOpen || !story) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 8) {
      alert("Veuillez entrer un numéro de téléphone Mobile Money valide.");
      return;
    }

    setStatus('processing');

    // Simulate server webhook confirmation via FedaPay (2.5 seconds)
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onPaymentSuccess(story.id);
        setStatus('idle');
        setPhoneNumber('');
        onClose();
      }, 1500);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#151226] border border-indigo-500/30 w-full max-w-md rounded-3xl p-6 shadow-2xl relative overflow-hidden text-white">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl" />
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-indigo-950/80 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 flex items-center justify-center text-white">
              <LockIcon size={18} />
            </div>
            <h3 className="font-bold text-lg">Paiement Sécurisé</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            ✕
          </button>
        </div>

        {status === 'success' ? (
          <div className="py-8 text-center flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-3xl animate-bounce">
              ✓
            </div>
            <h4 className="text-xl font-bold text-emerald-400">Paiement confirmé !</h4>
            <p className="text-sm text-gray-300">
              L'œuvre <span className="font-semibold text-white">"{story.title}"</span> a été débloquée dans votre bibliothèque.
            </p>
          </div>
        ) : status === 'processing' ? (
          <div className="py-8 text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
            <div>
              <h4 className="font-bold text-base text-rose-300">Validation du transfert Mobile Money...</h4>
              <p className="text-xs text-gray-400 mt-1">
                Veuillez valider le prompt de confirmation envoyé sur votre téléphone ({phoneNumber}).
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePay} className="flex flex-col gap-4">
            {/* Story summary card */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1A162F] border border-indigo-900/40">
              <img
                src={story.coverImage}
                alt={story.title}
                className="w-14 h-14 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{story.title}</h4>
                <p className="text-xs text-indigo-300">Par {story.author.name}</p>
                <p className="text-xs font-bold text-rose-400 mt-0.5">
                  {story.priceFCFA} F CFA
                </p>
              </div>
            </div>

            {/* Network Selector */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">
                Sélectionnez le réseau Mobile Money
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedNetwork('mtn')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer font-bold text-xs ${
                    selectedNetwork === 'mtn'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-900/20'
                      : 'bg-[#1A162F] border-indigo-950 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  🟡 MTN MoMo
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNetwork('moov')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer font-bold text-xs ${
                    selectedNetwork === 'moov'
                      ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-md shadow-blue-900/20'
                      : 'bg-[#1A162F] border-indigo-950 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  🔵 Moov Money
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNetwork('wave')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer font-bold text-xs ${
                    selectedNetwork === 'wave'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-900/20'
                      : 'bg-[#1A162F] border-indigo-950 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  🌊 Wave
                </button>
              </div>
            </div>

            {/* Phone input */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Numéro de téléphone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3.5 flex items-center text-gray-400">
                  <SmartphoneIcon size={18} />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="+229 97 00 00 00"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-[#181433] text-white pl-10 pr-4 py-3 rounded-2xl border border-indigo-900/60 focus:border-rose-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-950/40 border border-indigo-900/40 text-[11px] text-indigo-300">
              <VerifiedIcon size={16} />
              <span>Transaction sécurisée via FedaPay. Accès instantané à la bibliothèque.</span>
            </div>

            {/* Submit CTA */}
            <Button
              type="submit"
              variant="coral"
              size="lg"
              fullWidth
              className="mt-2"
            >
              Payer {story.priceFCFA} F CFA
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
