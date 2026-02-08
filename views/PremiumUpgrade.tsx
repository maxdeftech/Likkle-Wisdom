
import React, { useState } from 'react';

interface PremiumUpgradeProps {
  onClose: () => void;
  onPurchaseSuccess: () => void;
}

type PaymentStage = 'selection' | 'card_entry' | 'paypal_processing' | 'processing' | 'success' | 'donation_flow';

const PremiumUpgrade: React.FC<PremiumUpgradeProps> = ({ onClose, onPurchaseSuccess }) => {
  const [stage, setStage] = useState<PaymentStage>('selection');
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [error, setError] = useState<string | null>(null);

  const handleStartPurchase = (method: string) => {
    setError(null);
    if (method === 'PayPal') {
      setStage('paypal_processing');
      setTimeout(() => setStage('success'), 3000);
    } else if (method === 'Card') {
      setStage('card_entry');
    } else if (method === 'Donate') {
      setStage('donation_flow');
    } else {
      setStage('processing');
      setTimeout(() => setStage('success'), 2000);
    }
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStage('processing');
    setTimeout(() => setStage('success'), 2500);
  };

  const handleSafeClose = () => {
    if (stage === 'selection' || stage === 'donation_flow' || stage === 'card_entry' || stage === 'paypal_processing' || stage === 'processing') {
      onClose();
    } else {
      setStage('selection'); // Success stage can only move forward to claim or back to start
    }
  };

  if (stage === 'success') {
    return (
      <div className="fixed inset-0 z-[150] bg-[#0a1a0f] flex flex-col items-center justify-center p-8 text-center animate-fade-in overflow-hidden">
        <div className="absolute inset-0 jamaica-gradient opacity-20 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="size-48 rounded-full glass-gold flex items-center justify-center mb-8 shadow-2xl mx-auto border-4 border-jamaican-gold/50 animate-pulse-glow">
            <span className="material-symbols-outlined text-8xl text-jamaican-gold" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>
          <h1 className="text-5xl font-extrabold mb-4 text-white">Yuh Official!</h1>
          <p className="text-xl font-semibold text-primary mb-2 uppercase tracking-widest">Access Granted</p>
          <p className="text-white/70 italic text-lg mb-12">"Di full wisdom is yours now. Tan up strong!"</p>
          <button 
            onClick={onPurchaseSuccess} 
            className="w-full bg-primary text-background-dark font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:scale-105 active:scale-95 uppercase tracking-widest"
          >
            Enter Cabinet <span className="material-symbols-outlined font-black">arrow_forward</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[140] bg-background-dark flex flex-col font-display overflow-y-auto no-scrollbar pb-12">
      <div className="absolute inset-0 cosmic-bg opacity-30 pointer-events-none"></div>
      <div className="sticky top-0 z-[150] bg-primary py-2 text-center shadow-lg border-b border-white/20">
        <p className="text-background-dark font-black text-[9px] uppercase tracking-[0.5em] animate-pulse">Support us by donating ✨ Support us by donating ✨ Support us by donating</p>
      </div>
      <header className="relative z-10 flex items-center p-6 justify-between">
        <button onClick={handleSafeClose} className="size-11 flex items-center justify-center rounded-full glass text-white/50"><span className="material-symbols-outlined">chevron_left</span></button>
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{stage === 'selection' ? 'Upgrade' : 'Secure Checkout'}</h2>
        <div className="size-11"></div>
      </header>
      <div className="relative z-10 flex-1 px-6 py-4 flex flex-col gap-6">
        {stage === 'selection' ? (
          <>
            <div className="glass rounded-[3rem] p-8 flex flex-col items-center text-center shadow-2xl bg-gradient-to-br from-primary/10 via-transparent to-jamaican-gold/10">
              <h1 className="text-3xl font-black mb-3 text-white">Wisdom Without Limits</h1>
              <p className="text-white/60 text-sm mb-8 font-medium">Access all wisdom, AI generation, and full offline mode.</p>
              <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl shadow-inner flex flex-col items-center">
                <span className="text-jamaican-gold font-black text-2xl">$5.00 USD</span>
                <span className="text-white/30 text-[9px] uppercase font-black tracking-widest">One-time payment</span>
              </div>
            </div>
            <button onClick={() => handleStartPurchase('PayPal')} className="w-full h-16 rounded-2xl bg-[#FFC439] flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"><span className="text-[#003087] font-black text-lg italic italic">Pay<span className="text-[#009CDE]">Pal</span></span></button>
            <button onClick={() => handleStartPurchase('Card')} className="w-full h-16 rounded-2xl glass border-white/10 flex items-center justify-center gap-3 hover:bg-white/5 active:scale-95 transition-all"><span className="material-symbols-outlined text-white/70">credit_card</span><span className="text-white font-black text-sm uppercase tracking-widest">Credit or Debit Card</span></button>
            <div className="pt-8 border-t border-white/5 mt-4">
              <button onClick={() => handleStartPurchase('Donate')} className="w-full h-20 rounded-3xl glass border-primary/30 bg-primary/5 flex flex-col items-center justify-center shadow-lg"><span className="text-primary font-black text-sm uppercase tracking-widest">Donate to Developer</span></button>
            </div>
          </>
        ) : stage === 'donation_flow' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-8 animate-fade-in">
            <h3 className="text-3xl font-black text-white">Big Up Yuhself!</h3>
            <p className="text-white/60 text-sm max-w-[280px]">Your support keeps di wisdom flowin'. Any donation grants yuh Full Premium access.</p>
            <button onClick={() => setStage('success')} className="w-full h-16 rounded-2xl bg-primary text-background-dark font-black text-lg shadow-xl active:scale-95">Claim My Premium</button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
            <div className="size-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-8"></div>
            <h2 className="text-2xl font-black text-white">Verifying...</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumUpgrade;
