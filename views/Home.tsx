
import React, { useState } from 'react';
import { Quote, User, Tab, BibleAffirmation } from '../types';
import { CATEGORIES } from '../constants';

interface HomeProps {
  user: User;
  dailyItems: { quote: Quote; wisdom: Quote; verse: BibleAffirmation };
  onFavorite: (id: string, type: 'quote' | 'iconic' | 'bible') => void;
  onOpenAI: () => void;
  onTabChange: (tab: Tab) => void;
  // Added onCategoryClick to allow setting category when navigating to discover
  onCategoryClick: (id: string) => void;
}

const Home: React.FC<HomeProps> = ({ user, dailyItems, onFavorite, onOpenAI, onTabChange, onCategoryClick }) => {
  const [activeDaily, setActiveDaily] = useState<'quote' | 'wisdom' | 'verse'>('quote');
  const [reveal, setReveal] = useState(false);

  const firstName = user?.username?.split(' ')[0] || 'Seeker';
  const currentItem = activeDaily === 'quote' ? dailyItems.quote : activeDaily === 'wisdom' ? dailyItems.wisdom : dailyItems.verse;

  if (!currentItem) return (
    <div className="flex items-center justify-center h-full opacity-20">
      <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
    </div>
  );

  return (
    <div className="p-6 sm:p-10 pb-24 animate-fade-in">
      <header className="flex items-center justify-between mb-8 pt-6">
        <div className="flex flex-col">
          <span className="text-sm font-medium opacity-70 text-slate-900 dark:text-white/70">Wha Gwan,</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{firstName}</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onTabChange('discover')} className="size-11 sm:size-14 rounded-full glass flex items-center justify-center text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-xl sm:text-2xl">search</span>
          </button>
          <button 
            onClick={() => onTabChange('me')}
            className="size-11 sm:size-14 rounded-full border-2 border-primary overflow-hidden active:scale-90 transition-transform"
          >
            <img 
              className="w-full h-full object-cover" 
              src={user.avatarUrl || `https://picsum.photos/seed/${user.id}/200`} 
              alt="Profile" 
            />
          </button>
        </div>
      </header>

      <section className="mb-10">
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'quote', label: 'Quote', icon: 'wb_sunny' },
            { id: 'wisdom', label: 'Wisdom', icon: 'auto_stories' },
            { id: 'verse', label: 'Verse', icon: 'menu_book' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveDaily(tab.id as any); setReveal(false); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[10px] sm:text-[12px] font-black uppercase tracking-widest transition-all ${activeDaily === tab.id ? 'bg-primary text-background-dark shadow-lg scale-105' : 'glass text-slate-900/40 dark:text-white/40'}`}
            >
              <span className="material-symbols-outlined text-sm sm:text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="glass rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 flex flex-col items-center text-center gap-6 shadow-2xl relative overflow-hidden border-white/5 bg-gradient-to-br from-primary/5 to-transparent min-h-[420px] sm:min-h-[500px] justify-center">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <span className="material-symbols-outlined text-[120px] sm:text-[180px]" style={{ fontVariationSettings: "'FILL' 1" }}>
               {activeDaily === 'quote' ? 'wb_sunny' : activeDaily === 'wisdom' ? 'auto_stories' : 'menu_book'}
             </span>
          </div>

          <span className="material-symbols-outlined text-primary text-5xl sm:text-7xl opacity-40">
            format_quote
          </span>

          <div className="space-y-4 max-w-lg">
            <h2 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight text-slate-900 dark:text-white px-2">
              "{currentItem.patois}"
            </h2>
            {activeDaily === 'verse' && (
              <p className="text-primary text-[10px] sm:text-[12px] font-black uppercase tracking-[0.3em]">
                {(dailyItems.verse as any).reference}
              </p>
            )}
          </div>
          
          <div className="w-full max-w-md space-y-4 mt-4 sm:mt-8">
            {!reveal ? (
              <button 
                onClick={() => setReveal(true)}
                className="w-full bg-primary text-background-dark font-black py-5 sm:py-7 rounded-2xl sm:rounded-3xl flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs sm:text-sm"
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">translate</span>
                <span>Reveal Meaning</span>
              </button>
            ) : (
              <div className="space-y-6 animate-fade-in w-full">
                <div className="glass border-white/10 p-6 sm:p-8 rounded-2xl sm:rounded-3xl">
                  <p className="text-slate-900/70 dark:text-white/70 italic text-lg sm:text-2xl leading-snug">
                    "{activeDaily === 'verse' ? (dailyItems.verse as any).kjv : (currentItem as Quote).english}"
                  </p>
                </div>
                <div className="flex gap-3">
                   <button className="flex-1 glass py-4 sm:py-6 rounded-2xl sm:rounded-3xl text-[10px] sm:text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-1 hover:bg-white/10 transition-colors text-slate-900 dark:text-white">
                      <span className="material-symbols-outlined text-lg sm:text-2xl">volume_up</span> Listen
                   </button>
                   <button 
                    onClick={() => onFavorite(currentItem.id, activeDaily === 'verse' ? 'bible' : 'quote')}
                    className={`flex-1 py-4 sm:py-6 rounded-2xl sm:rounded-3xl text-[10px] sm:text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-all ${'isFavorite' in currentItem && currentItem.isFavorite ? 'bg-primary text-background-dark' : 'glass text-slate-900 dark:text-white'}`}
                   >
                      <span className={`material-symbols-outlined text-lg sm:text-2xl ${'isFavorite' in currentItem && currentItem.isFavorite ? 'fill-1 animate-pop' : ''}`}>favorite</span> 
                      {'isFavorite' in currentItem && currentItem.isFavorite ? 'Saved' : 'Save'}
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Island Vibes</h2>
          <button onClick={() => onTabChange('discover')} className="text-sm sm:text-base font-semibold text-primary">Explore Categories</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.slice(0, 3).map(cat => (
            <div 
              key={cat.id} 
              // Fix: Replaced setActiveTab and setActiveCategory with onTabChange and onCategoryClick from props
              onClick={() => { onTabChange('discover'); onCategoryClick(cat.id); }}
              className="glass p-6 sm:p-8 rounded-[2rem] flex items-center gap-4 group active:scale-95 transition-all border-white/5 cursor-pointer hover:border-primary/20"
            >
              <div className={`size-14 sm:size-16 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20`}>
                <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
              </div>
              <div className="flex flex-col">
                <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">{cat.name}</h3>
                <p className="text-[10px] text-slate-900/40 dark:text-white/40 uppercase tracking-widest font-bold">{cat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section 
        onClick={onOpenAI}
        className="glass rounded-[2rem] sm:rounded-[3rem] overflow-hidden relative group cursor-pointer mb-10 border-white/5 shadow-2xl h-56 sm:h-72"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
        <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" src="https://images.unsplash.com/photo-1541410965313-d53b3c16ef17?q=80&w=800&auto=format&fit=crop" alt="Island" />
        <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 z-20 w-full flex justify-between pr-12 sm:pr-20 items-end">
          <div className="space-y-1 sm:space-y-3">
            <p className="text-[10px] sm:text-[12px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-1">
               AI Magic <span className="material-symbols-outlined text-[14px] sm:text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </p>
            <h3 className="text-2xl sm:text-4xl font-black text-white leading-none">Craft Yuh Own Wisdom</h3>
          </div>
          <div className="size-12 sm:size-16 glass rounded-2xl flex items-center justify-center text-primary border-primary/30">
             <span className="material-symbols-outlined text-xl sm:text-3xl">{user.isPremium ? 'verified' : 'lock'}</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
