import { useState, useEffect, useMemo, useRef } from 'react';
import { sound } from '../utils/audio.ts';
import { AppViewMode } from './TopBar.tsx';
import { AppId } from '../types/index.ts';
import { getStoredDebts, getStoredTasks, getStoredVaultFiles, getStoredCredentials } from '../utils/storage.ts';
import { 
  Search, 
  Terminal, 
  Boxes, 
  Video, 
  Tv, 
  FolderGit2, 
  KeyRound, 
  Receipt, 
  CheckSquare, 
  BrainCircuit, 
  Building2, 
  Sparkles, 
  Layers, 
  ArrowRight,
  ExternalLink,
  Command,
  X
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: AppViewMode) => void;
  onOpenApp?: (appId: AppId) => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'التطبيقات' | 'كاميرات المراقبة' | 'الديون والمالية' | 'المهمات والمشاريع' | 'الأمان وكلمات السر' | 'إجراءات سريعة';
  icon: any;
  action: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onOpenApp,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Load live items from storage
  const commands: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      // Quick Navigation Items
      {
        id: 'nav-installer',
        title: 'مركز تثبيت النظام وتوليد ملف EXE المتكامل (Windows Installer)',
        subtitle: 'تحميل مثبت ويندوز التنفيذي، سكريبت Inno Setup، وتثبيت كل شيء بنقرة واحدة',
        category: 'التطبيقات',
        icon: Boxes,
        action: () => { onNavigate('installer' as AppViewMode); onClose(); },
      },
      {
        id: 'nav-app-studio',
        title: 'استوديو برمجة وتعديل التطبيقات (App Studio)',
        subtitle: 'بيئة تطوير كاملة، معاينة حية، وتعديل التطبيقات بالذكاء الاصطناعي',
        category: 'التطبيقات',
        icon: Boxes,
        action: () => { onNavigate('app-studio' as AppViewMode); onClose(); },
      },
      {
        id: 'nav-debts',
        title: 'دفتر الديون والذمم المالية (Ledger)',
        subtitle: 'إدارة الذمم، سندات القبض، والدفعات والأقساط وتنبيهات الواتساب',
        category: 'الديون والمالية',
        icon: Receipt,
        action: () => { onNavigate('debts'); onClose(); },
      },
      {
        id: 'nav-tasks',
        title: 'دفتر المهمات والمشاريع (Tasks & Kanban)',
        subtitle: 'لوحة كانبان الهندسية، مصفوفة الأولويات، ومتابعة الإنجاز',
        category: 'المهمات والمشاريع',
        icon: CheckSquare,
        action: () => { onNavigate('tasks'); onClose(); },
      },
      {
        id: 'nav-cctv',
        title: 'كاميرات المراقبة الحية (CCTV Surveillance)',
        subtitle: 'مراقبة سحابية Hik-Connect, ICSee, Yoosee, Dahua والخريطة التفاعلية',
        category: 'كاميرات المراقبة',
        icon: Video,
        action: () => { onNavigate('cctv'); onClose(); },
      },
      {
        id: 'nav-ai-fusion',
        title: 'منظومة دمج الذكاء الاصطناعي (Multi-AI Fusion)',
        subtitle: '8 نماذج متكاملة مع ميزة إكمال العمل التلقائي عند توقف أي نموذج',
        category: 'التطبيقات',
        icon: BrainCircuit,
        action: () => { onNavigate('ai-fusion'); onClose(); },
      },
      {
        id: 'nav-vault',
        title: 'خزنة الأكواد والملفات والروابط والصور (Vault Hub)',
        subtitle: 'تخزين مشفر لجميع المشاريع والمقتطفات والروابط السريعة',
        category: 'التطبيقات',
        icon: FolderGit2,
        action: () => { onNavigate('vault-hub'); onClose(); },
      },
      {
        id: 'nav-passwords',
        title: 'خزنة الإيميلات وكلمات السر (Password Vault)',
        subtitle: 'تشفير AES-256 للمفاتيح السحابية وبيانات تسجيل الدخول',
        category: 'الأمان وكلمات السر',
        icon: KeyRound,
        action: () => { onNavigate('passwords'); onClose(); },
      },
      {
        id: 'nav-youtube',
        title: 'مشغل اليوتيوب وقنوات البث (YouTube Studio)',
        subtitle: 'تشغيل الفيديوهات والشروحات التقنية بدون انقطاع',
        category: 'التطبيقات',
        icon: Tv,
        action: () => { onNavigate('youtube'); onClose(); },
      },
      {
        id: 'nav-3d',
        title: 'المجمع التقني ثلاثي الأبعاد (3D Tech Campus)',
        subtitle: 'خريطة المنشآت الهندسية والمختبرات السحابية 3D',
        category: 'التطبيقات',
        icon: Building2,
        action: () => { onNavigate('building'); onClose(); },
      },
    ];

    // Dynamic debts from storage
    try {
      const debts = getStoredDebts();
      debts.slice(0, 5).forEach((d) => {
        const paid = (d.payments || []).reduce((acc, p) => acc + (p.amount || 0), 0);
        const rem = Math.max(0, d.totalAmount - paid);
        list.push({
          id: `debt-${d.id}`,
          title: `دين: ${d.personName} (${d.totalAmount.toLocaleString()} ${d.currency})`,
          subtitle: `الحالة: ${d.status} • المتبقي: ${rem.toLocaleString()} ${d.currency} • ${d.category}`,
          category: 'الديون والمالية',
          icon: Receipt,
          action: () => { onNavigate('debts'); onClose(); },
        });
      });
    } catch {}

    // Dynamic tasks from storage
    try {
      const tasks = getStoredTasks();
      tasks.slice(0, 5).forEach((t) => {
        list.push({
          id: `task-${t.id}`,
          title: `مهمة: ${t.title}`,
          subtitle: `الأولوية: ${t.priority} • الحالة: ${t.status} • ${t.category}`,
          category: 'المهمات والمشاريع',
          icon: CheckSquare,
          action: () => { onNavigate('tasks'); onClose(); },
        });
      });
    } catch {}

    return list;
  }, [onNavigate, onClose]);

  // Filter items
  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) => c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      sound.playClick(300);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
      sound.playClick(300);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        sound.playSuccess();
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-cyan-950/50 flex flex-col overflow-hidden text-slate-100 animate-in zoom-in-95 duration-150"
      >
        {/* Search Input Box */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/90">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="ابحث عن أي شيء في المنظومة: تطبيق، دين، مهمة، كاميرا، كود، كلمة سر..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
          />
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            <span>ESC للغلق</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              لا توجد نتائج مطابقة لبحثك "{query}"
            </div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sound.playSuccess();
                    item.action();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-right p-3 rounded-xl flex items-center justify-between gap-3 transition-all ${
                    isSelected
                      ? 'bg-cyan-600/20 text-cyan-200 border border-cyan-500/30'
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                        <span>{item.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-normal">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-cyan-400 translate-x-1' : 'text-slate-600'}`} />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>↑↓ للتنقل</span>
            <span>↵ للاختيار والفتح</span>
          </div>
          <div className="text-[10px] text-cyan-400 font-mono">
            DevCore Omnibar • Eng. Malek Hraybat
          </div>
        </div>
      </div>
    </div>
  );
}
