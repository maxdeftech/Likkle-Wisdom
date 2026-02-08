
import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../types';

interface BibleViewProps {
  user: User;
  onBookmark: (verse: any) => void;
  onUpgrade: () => void;
}

const BOOK_CHAPTERS: Record<string, number> = {
  "Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34,
  "Joshua": 24, "Judges": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24,
  "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36,
  "Ezra": 10, "Nehemiah": 13, "Esther": 10, "Job": 42, "Psalms": 150, "Proverbs": 31,
  "Ecclesiastes": 12, "Song of Solomon": 8, "Isaiah": 66, "Jeremiah": 52,
  "Lamentations": 5, "Ezekiel": 48, "Daniel": 12, "Hosea": 14, "Joel": 3,
  "Amos": 9, "Obadiah": 1, "Jonah": 4, "Micah": 7, "Nahum": 3, "Habakkuk": 3,
  "Zephaniah": 3, "Haggai": 2, "Zechariah": 14, "Malachi": 4,
  "Matthew": 28, "Mark": 16, "Luke": 24, "John": 21, "Acts": 28, "Romans": 16,
  "1 Corinthians": 16, "2 Corinthians": 13, "Galatians": 6, "Ephesians": 6,
  "Philippians": 4, "Colossians": 4, "1 Thessalonians": 5, "2 Thessalonians": 3,
  "1 Timothy": 6, "2 Timothy": 4, "Titus": 3, "Philemon": 1, "Hebrews": 13,
  "James": 5, "1 Peter": 5, "2 Peter": 3, "1 John": 5, "2 John": 1, "3 John": 1,
  "Jude": 1, "Revelation": 22
};

const BibleView: React.FC<BibleViewProps> = ({ user, onBookmark, onUpgrade }) => {
  const [book, setBook] = useState('Psalms');
  const [chapter, setChapter] = useState(23);
  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectorStage, setSelectorStage] = useState<'book' | 'chapter'>('book');
  const [downloading, setDownloading] = useState(false);

  const books = Object.keys(BOOK_CHAPTERS);
  const filteredBooks = useMemo(() => books.filter(b => b.toLowerCase().includes(searchQuery.toLowerCase())), [searchQuery, books]);
  const maxChapters = BOOK_CHAPTERS[book] || 50;

  const cleanGodName = (text: string) => {
    if (!text) return text;
    return text.replace(/Yahweh/g, 'God').replace(/YAHWEH/g, 'GOD');
  };

  const getCacheKey = (b: string, c: number) => `kjv_cache_${b.replace(/\s/g, '_')}_${c}`;
  const isBookDownloaded = (b: string) => localStorage.getItem(`kjv_book_offline_${b.replace(/\s/g, '_')}`) === 'true';

  const fetchBible = async () => {
    setLoading(true);
    setError(null);
    const cached = localStorage.getItem(getCacheKey(book, chapter));
    if (cached) {
      try {
        setVerses(JSON.parse(cached));
        setLoading(false);
        return;
      } catch { /* ignore cache error */ }
    }

    try {
      const formattedBook = book.replace(/\s/g, '+');
      const url = `https://bible-api.com/${formattedBook}+${chapter}?translation=kjv`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status === 404 ? `Chapter ${chapter} nuh exist.` : "Fetch error.");
      const data = await res.json();
      const fetchedVerses = (data.verses || []).map((v: any) => ({
        ...v,
        book_name: book,
        book_id: book.toLowerCase().replace(/\s/g, '_'),
        text: cleanGodName(v.text)
      }));
      setVerses(fetchedVerses);
      if (user.isPremium && fetchedVerses.length > 0) localStorage.setItem(getCacheKey(book, chapter), JSON.stringify(fetchedVerses));
    } catch (e: any) {
      setError(e.message === 'Failed to fetch' ? "Network issues. Check connection." : e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBible(); }, [book, chapter]);

  const handleDownloadBook = async () => {
    if (!user.isPremium) { onUpgrade(); return; }
    setDownloading(true);
    try {
      const chaptersToDownload = Math.min(BOOK_CHAPTERS[book] || 1, 10);
      for (let i = 1; i <= chaptersToDownload; i++) {
        const formattedBook = book.replace(/\s/g, '+');
        const res = await fetch(`https://bible-api.com/${formattedBook}+${i}?translation=kjv`);
        if (res.ok) {
          const data = await res.json();
          const clean = (data.verses || []).map((v: any) => ({ ...v, book_name: book, book_id: book.toLowerCase().replace(/\s/g, '_'), text: cleanGodName(v.text) }));
          localStorage.setItem(getCacheKey(book, i), JSON.stringify(clean));
        }
      }
      localStorage.setItem(`kjv_book_offline_${book.replace(/\s/g, '_')}`, 'true');
    } catch { /* ignore error */ } finally { setDownloading(false); }
  };

  return (
    <div className="p-6 pb-24 animate-fade-in font-display">
      <header className="pt-12 mb-8 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">The Living Word</span>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">KJV Bible</h1>
        </div>
        <div className="flex gap-2">
          {user.isPremium && (
            <button 
              onClick={handleDownloadBook}
              disabled={downloading || isBookDownloaded(book)}
              className={`size-14 rounded-2xl flex items-center justify-center shadow-xl transition-all ${isBookDownloaded(book) ? 'bg-primary/20 text-primary' : 'glass text-slate-900/40 dark:text-white/40'}`}
            >
              <span className={`material-symbols-outlined text-3xl font-black ${downloading ? 'animate-bounce' : ''}`}>
                {isBookDownloaded(book) ? 'download_done' : 'cloud_download'}
              </span>
            </button>
          )}
          <button onClick={() => { setShowSelector(true); setSelectorStage('book'); }} className="size-14 rounded-2xl bg-primary text-background-dark flex items-center justify-center shadow-xl">
            <span className="material-symbols-outlined text-3xl font-black">search</span>
          </button>
        </div>
      </header>

      {showSelector && (
        <div className="fixed inset-0 z-[110] bg-background-dark/95 backdrop-blur-xl animate-fade-in p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-white">{selectorStage === 'book' ? 'Select Book' : `Select Chapter - ${book}`}</h2>
            <button onClick={() => { setShowSelector(false); setSelectorStage('book'); }} className="size-12 rounded-full glass flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
          </div>
          {selectorStage === 'book' && (
            <div className="relative mb-6">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary/40">search</span>
              <input className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="Type book name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
            </div>
          )}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
            {selectorStage === 'book' ? (
              <div className="grid grid-cols-2 gap-3">
                {filteredBooks.map(b => (
                  <button key={b} onClick={() => { setBook(b); setSelectorStage('chapter'); setSearchQuery(''); }} className={`p-5 rounded-2xl font-black text-xs uppercase tracking-widest text-left transition-all ${book === b ? 'bg-primary text-background-dark' : 'glass text-white/40'}`}>
                    {b} {isBookDownloaded(b) && <span className="material-symbols-outlined text-xs">offline_pin</span>}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: maxChapters }).map((_, i) => (
                  <button key={i} onClick={() => { setChapter(i + 1); setShowSelector(false); setSelectorStage('book'); }} className={`aspect-square rounded-2xl flex items-center justify-center font-black text-lg ${chapter === i + 1 ? 'bg-primary text-background-dark' : 'glass text-white/40'}`}>{i + 1}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setChapter(Math.max(1, chapter - 1))} className="size-14 rounded-2xl glass flex items-center justify-center text-primary"><span className="material-symbols-outlined text-3xl">chevron_left</span></button>
        <div onClick={() => { setShowSelector(true); setSelectorStage('book'); }} className="flex-1 glass h-14 rounded-2xl flex flex-col items-center justify-center cursor-pointer">
          <span className="text-[9px] font-black uppercase text-primary/60">{book}</span>
          <span className="font-black text-xl leading-none text-slate-900 dark:text-white">Chapter {chapter}</span>
        </div>
        <button onClick={() => setChapter(Math.min(maxChapters, chapter + 1))} className="size-14 rounded-2xl glass flex items-center justify-center text-primary"><span className="material-symbols-outlined text-3xl">chevron_right</span></button>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="py-24 text-center"><span className="material-symbols-outlined text-5xl text-primary animate-spin">sync</span></div>
        ) : error ? (
          <div className="py-20 text-center glass rounded-[2.5rem] p-8 border-red-500/20 shadow-2xl">
            <p className="text-red-400 font-bold mb-8">{error}</p>
            <button onClick={fetchBible} className="w-full bg-red-500/10 text-red-400 py-4 rounded-2xl uppercase font-black text-xs tracking-[0.2em] border border-red-500/20">Try Again</button>
          </div>
        ) : (
          verses.map(v => (
            <div key={v.verse} className="glass p-8 rounded-[2rem] border-white/5 relative group hover:border-primary/30 transition-all shadow-xl animate-fade-in">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20"><span className="text-[11px] font-black text-primary">{v.verse}</span></div>
                  <span className="text-[10px] font-black text-slate-900/40 dark:text-white/40 uppercase tracking-widest">{book} {chapter}</span>
                </div>
                <button onClick={() => onBookmark(v)} className="size-10 rounded-xl glass text-slate-900/20 dark:text-white/20 group-hover:text-primary group-hover:bg-primary/10 transition-all flex items-center justify-center"><span className="material-symbols-outlined text-xl">bookmark</span></button>
              </div>
              <p className="text-slate-900 dark:text-white text-xl leading-relaxed font-medium">{v.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BibleView;
