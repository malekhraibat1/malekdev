import { useState, useEffect } from 'react';
import { sound } from '../../utils/audio.ts';
import { 
  DEFAULT_YOUTUBE_PRESETS, 
  getStoredYouTubeHistory, 
  saveStoredYouTubeHistory,
  YouTubePreset 
} from '../../utils/storage.ts';
import { 
  Play, 
  Tv, 
  Radio, 
  Bookmark, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  Search, 
  Sparkles, 
  Code, 
  Video, 
  Headphones, 
  Cpu, 
  Plus, 
  FileText,
  Volume2,
  RefreshCw,
  Maximize2
} from 'lucide-react';

interface YouTubePlayerAppProps {
  isEmbedded?: boolean;
}

export function YouTubePlayerApp({ isEmbedded = false }: YouTubePlayerAppProps) {
  const [currentVideoId, setCurrentVideoId] = useState<string>('1-iS7LArMPA');
  const [currentTitle, setCurrentTitle] = useState<string>('بث كاميرات مراقبة حية للمدن والطرق (Live Earth Cam)');
  const [inputUrl, setInputUrl] = useState('');
  const [customFavorites, setCustomFavorites] = useState<YouTubePreset[]>(DEFAULT_YOUTUBE_PRESETS);
  const [historyIds, setHistoryIds] = useState<string[]>(getStoredYouTubeHistory);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'cctv_live' | 'hikvision_tutorials' | 'coding_lofi' | 'tech_ai'>('all');
  const [devNotes, setDevNotes] = useState<string>(() => {
    try {
      return localStorage.getItem('devcore_youtube_dev_notes') || '// ملاحظات المشاهدة والتدوين البرمجي أثناء تشغيل اليوتيوب\n- تجربة توصيل كاميرا Hik-Connect عبر بروتوكول ISUP 5.0\n- منفذ RTSP الافتراضي: 554\n- منفذ سيرفر السحابة: 8000';
    } catch {
      return '';
    }
  });
  const [isCopied, setIsCopied] = useState(false);
  const [isNotesSaved, setIsNotesSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'player' | 'presets' | 'notes'>('player');

  // Parse any YouTube link or ID
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const cleanUrl = url.trim();

    // Direct 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
      return cleanUrl;
    }

    // Standard youtube.com/watch?v=ID
    const standardMatch = cleanUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (standardMatch) return standardMatch[1];

    // youtu.be/ID
    const shortMatch = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];

    // youtube.com/embed/ID
    const embedMatch = cleanUrl.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];

    // youtube.com/shorts/ID
    const shortsMatch = cleanUrl.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) return shortsMatch[1];

    // youtube.com/live/ID
    const liveMatch = cleanUrl.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
    if (liveMatch) return liveMatch[1];

    return null;
  };

  const handlePlayUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputUrl.trim()) return;

    const id = extractYouTubeId(inputUrl);
    if (id) {
      sound.playExecute();
      setCurrentVideoId(id);
      setCurrentTitle(`مقطع يوتيوب: ${id}`);
      
      // Update history
      const nextHistory = [id, ...historyIds.filter((h) => h !== id)].slice(0, 20);
      setHistoryIds(nextHistory);
      saveStoredYouTubeHistory(nextHistory);
      setInputUrl('');
    } else {
      sound.playWarning();
    }
  };

  const handlePlayPreset = (preset: YouTubePreset) => {
    sound.playClick(650);
    setCurrentVideoId(preset.videoId);
    setCurrentTitle(preset.title);

    const nextHistory = [preset.videoId, ...historyIds.filter((h) => h !== preset.videoId)].slice(0, 20);
    setHistoryIds(nextHistory);
    saveStoredYouTubeHistory(nextHistory);
  };

  const handleSaveToFavorites = () => {
    sound.playSuccess();
    const newPreset: YouTubePreset = {
      id: `fav-${Date.now()}`,
      title: currentTitle || `مقطع مخصص [${currentVideoId}]`,
      url: `https://www.youtube.com/watch?v=${currentVideoId}`,
      videoId: currentVideoId,
      category: 'cctv_live',
      description: 'تمت إضافته إلى قائمة المفضلات المحفوظة لمنظومة DevCore.',
    };
    const updated = [newPreset, ...customFavorites.filter((f) => f.videoId !== currentVideoId)];
    setCustomFavorites(updated);
  };

  const handleDeleteFavorite = (id: string) => {
    sound.playClick(400);
    setCustomFavorites(customFavorites.filter((f) => f.id !== id));
  };

  const handleCopyVideoUrl = () => {
    sound.playClick(700);
    navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${currentVideoId}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveNotes = () => {
    try {
      localStorage.setItem('devcore_youtube_dev_notes', devNotes);
      setIsNotesSaved(true);
      sound.playSuccess();
      setTimeout(() => setIsNotesSaved(false), 2000);
    } catch {}
  };

  const filteredPresets = customFavorites.filter((p) => {
    if (categoryFilter === 'all') return true;
    return p.category === categoryFilter;
  });

  return (
    <div className={`h-full w-full flex flex-col bg-slate-950 text-slate-100 ${isEmbedded ? '' : 'p-3 sm:p-5'} overflow-hidden select-none font-sans`} dir="rtl">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 p-[1.5px] flex items-center justify-center shadow-lg shadow-red-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center">
              <Tv className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                مشغل اليوتيوب المباشر (YouTube Studio & Live Feeds)
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-mono border border-red-500/30">
                LIVE 4K / HD
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              تشغيل أي رابط يوتيوب، بثوث الكاميرات الحية، شروحات Hikvision، وموسيقى البرمجة
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
            <button
              onClick={() => {
                sound.playClick(600);
                setActiveTab('player');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'player'
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>المشغل</span>
            </button>
            <button
              onClick={() => {
                sound.playClick(600);
                setActiveTab('presets');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'presets'
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>البثوث والشروحات ({customFavorites.length})</span>
            </button>
            <button
              onClick={() => {
                sound.playClick(600);
                setActiveTab('notes');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'notes'
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>مفكرة المطور</span>
            </button>
          </div>
        </div>
      </div>

      {/* URL Input & Quick Controls Bar */}
      <form onSubmit={handlePlayUrl} className="pt-3 pb-3 flex flex-col sm:flex-row items-center gap-2 shrink-0">
        <div className="relative flex-1 w-full">
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="الصق رابط فيديو أو بث يوتيوب (https://www.youtube.com/watch?v=... أو معرف الفيديو)"
            className="w-full bg-slate-900 border border-slate-700/80 focus:border-red-500/80 rounded-xl pr-9 pl-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 font-mono focus:outline-none transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="submit"
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>تشغيل فوري</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToFavorites}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 text-xs font-mono flex items-center gap-1.5 transition-all"
            title="حفظ الفيديو في المفضلة"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">حفظ بالمفضلة</span>
          </button>

          <button
            type="button"
            onClick={handleCopyVideoUrl}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 text-xs font-mono flex items-center gap-1.5 transition-all"
            title="نسخ رابط الفيديو"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isCopied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
          </button>

          <a
            href={`https://www.youtube.com/watch?v=${currentVideoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition-all"
            title="فتح في يوتيوب بتبويب جديد"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </form>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden pt-1">
        {/* Left/Main Column: YouTube Player Embed + Status */}
        <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
          {/* Responsive Video Container */}
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shrink-0 group">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${currentVideoId}?autoplay=1&rel=0&modestbranding=1`}
              title="DevCore YouTube Player"
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />

            {/* Top Indicator overlay */}
            <div className="absolute top-2 inset-x-2 flex items-center justify-between text-[11px] font-mono pointer-events-none drop-shadow opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/80 px-2.5 py-1 rounded-md border border-white/10 text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="font-bold text-red-400">YOUTUBE ENGINE</span>
                <span className="text-slate-400">ID: {currentVideoId}</span>
              </div>
            </div>
          </div>

          {/* Under Player Info & Quick Channel Presets */}
          <div className="mt-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <h3 className="text-sm font-bold text-white truncate font-sans">
                  {currentTitle}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 shrink-0">
                1080p / 4K Ready
              </span>
            </div>

            {/* Quick Presets Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
              <span className="text-[10px] font-mono text-slate-400 shrink-0">شائع الآن:</span>
              {DEFAULT_YOUTUBE_PRESETS.slice(0, 4).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePlayPreset(preset)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all shrink-0 flex items-center gap-1.5 ${
                    currentVideoId === preset.videoId
                      ? 'bg-red-600/30 text-red-200 border border-red-500/50 font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                  }`}
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>{preset.title.split(' ')[0]} {preset.title.split(' ')[1]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Developer Quick Notes Panel (Bottom of player) */}
          <div className="mt-2 flex-1 min-h-[100px] p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                مفكرة تدوين الملاحظات البرمجية أثناء المشاهدة
              </span>
              <button
                onClick={handleSaveNotes}
                className="px-2.5 py-0.5 rounded-md bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono flex items-center gap-1"
              >
                {isNotesSaved ? <Check className="w-3 h-3 text-emerald-400" /> : <Bookmark className="w-3 h-3" />}
                <span>{isNotesSaved ? 'تم الحفظ!' : 'حفظ الملاحظات'}</span>
              </button>
            </div>
            <textarea
              value={devNotes}
              onChange={(e) => setDevNotes(e.target.value)}
              placeholder="اكتب ملاحظاتك، أوامر التيرمينال، أو إعدادات الكاميرات أثناء متابعة الشروحات..."
              className="flex-1 w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono resize-none focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Right Column: Presets Library & Categories */}
        <div className="lg:col-span-4 flex flex-col h-full overflow-hidden bg-slate-900/60 rounded-2xl border border-slate-800 p-3">
          {/* Categories Selector */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold text-white">قائمة البثوث والشروحات</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {filteredPresets.length} مقطع
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 py-2 shrink-0">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all ${
                categoryFilter === 'all'
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setCategoryFilter('cctv_live')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all ${
                categoryFilter === 'cctv_live'
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              📹 كاميرات حية
            </button>
            <button
              onClick={() => setCategoryFilter('hikvision_tutorials')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all ${
                categoryFilter === 'hikvision_tutorials'
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              🛠️ شروحات كاميرات
            </button>
            <button
              onClick={() => setCategoryFilter('coding_lofi')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all ${
                categoryFilter === 'coding_lofi'
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              🎧 تركيز وبرمجة
            </button>
            <button
              onClick={() => setCategoryFilter('tech_ai')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all ${
                categoryFilter === 'tech_ai'
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              🧠 ذكاء اصطناعي
            </button>
          </div>

          {/* Presets Scrollable List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredPresets.map((preset) => {
              const isActive = currentVideoId === preset.videoId;

              return (
                <div
                  key={preset.id}
                  onClick={() => handlePlayPreset(preset)}
                  className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isActive
                      ? 'bg-red-950/40 border-red-500/50 shadow-md shadow-red-950/50'
                      : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-red-400'
                      }`}>
                        <Play className="w-3 h-3 fill-current" />
                      </div>
                      <h4 className={`text-xs font-bold line-clamp-1 ${isActive ? 'text-red-200' : 'text-slate-200'}`}>
                        {preset.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFavorite(preset.id);
                        }}
                        className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                        title="حذف من القائمة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 font-mono">
                    {preset.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
                    <span className="text-cyan-400">
                      {preset.category === 'cctv_live' ? 'بث حي للمراقبة' :
                       preset.category === 'hikvision_tutorials' ? 'شرح تقني' :
                       preset.category === 'coding_lofi' ? 'Lofi Beats' : 'محاضرة تقنية'}
                    </span>
                    <span className="text-slate-500 font-mono">ID: {preset.videoId}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
