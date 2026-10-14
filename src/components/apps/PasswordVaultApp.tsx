import { useState, useEffect } from 'react';
import { sound } from '../../utils/audio.ts';
import { 
  DEFAULT_CREDENTIALS, 
  getStoredCredentials, 
  saveStoredCredentials, 
  StoredCredential 
} from '../../utils/storage.ts';
import { 
  Lock, 
  Unlock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink, 
  Download, 
  Upload, 
  RefreshCw, 
  Server, 
  Mail, 
  Video, 
  Code, 
  Database, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface PasswordVaultAppProps {
  isEmbedded?: boolean;
}

export function PasswordVaultApp({ isEmbedded = false }: PasswordVaultAppProps) {
  const [credentials, setCredentials] = useState<StoredCredential[]>(getStoredCredentials);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'cctv' | 'email' | 'servers' | 'dev' | 'cloud' | 'other'>('all');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<{ id: string; field: 'user' | 'pass' | 'pin' } | null>(null);

  // Vault Lock State
  const [isLocked, setIsLocked] = useState(false);
  const [masterPin, setMasterPin] = useState(() => localStorage.getItem('devcore_vault_master_pin') || '');
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<StoredCredential['category']>('cctv');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPin, setFormPin] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Password Generator State
  const [genLength, setGenLength] = useState(16);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeUpper, setIncludeUpper] = useState(true);

  // Calculate Password Strength
  const evaluateStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'فارغة', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 14) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 20, label: 'ضعيفة جداً', color: 'bg-red-500' };
    if (score === 2) return { score: 40, label: 'ضعيفة', color: 'bg-amber-500' };
    if (score === 3) return { score: 65, label: 'متوسطة', color: 'bg-yellow-500' };
    if (score === 4) return { score: 85, label: 'قوية', color: 'bg-emerald-500' };
    return { score: 100, label: 'فائقة الأمان 100%', color: 'bg-cyan-400' };
  };

  const generatePassword = () => {
    sound.playExecute();
    let chars = 'abcdefghijklmnopqrstuvwxyz';
    if (includeUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    let result = '';
    const array = new Uint32Array(genLength);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < genLength; i++) {
      result += chars[array[i] % chars.length];
    }
    setFormPassword(result);
  };

  const handleOpenAdd = () => {
    sound.playClick(600);
    setEditingId(null);
    setFormTitle('');
    setFormCategory('cctv');
    setFormUsername('');
    setFormPassword('');
    setFormPin('');
    setFormWebsite('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cred: StoredCredential) => {
    sound.playClick(600);
    setEditingId(cred.id);
    setFormTitle(cred.title);
    setFormCategory(cred.category);
    setFormUsername(cred.usernameOrEmail);
    setFormPassword(cred.password);
    setFormPin(cred.verificationPin || '');
    setFormWebsite(cred.websiteUrl || '');
    setFormNotes(cred.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formUsername.trim()) return;

    sound.playSuccess();
    const finalPassword = formPassword || 'Pass@' + Math.random().toString(36).substring(2, 8);

    if (editingId) {
      const updated = credentials.map((c) =>
        c.id === editingId
          ? {
              ...c,
              title: formTitle,
              category: formCategory,
              usernameOrEmail: formUsername,
              password: finalPassword,
              verificationPin: formPin,
              websiteUrl: formWebsite,
              notes: formNotes,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : c
      );
      setCredentials(updated);
      saveStoredCredentials(updated);
    } else {
      const newCred: StoredCredential = {
        id: `cred-${Date.now()}`,
        title: formTitle,
        category: formCategory,
        usernameOrEmail: formUsername,
        password: finalPassword,
        verificationPin: formPin,
        websiteUrl: formWebsite,
        notes: formNotes,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      const updated = [newCred, ...credentials];
      setCredentials(updated);
      saveStoredCredentials(updated);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    sound.playClick(400);
    const updated = credentials.filter((c) => c.id !== id);
    setCredentials(updated);
    saveStoredCredentials(updated);
  };

  const handleCopy = (text: string, id: string, field: 'user' | 'pass' | 'pin') => {
    sound.playClick(700);
    navigator.clipboard.writeText(text);
    setCopiedField({ id, field });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const togglePasswordVisibility = (id: string) => {
    sound.playClick(650);
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExportBackup = () => {
    sound.playSuccess();
    const jsonStr = JSON.stringify(credentials, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DevCore_Passwords_Vault_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          sound.playSuccess();
          setCredentials(parsed);
          saveStoredCredentials(parsed);
        }
      } catch {
        sound.playWarning();
      }
    };
    reader.readAsText(file);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === masterPin) {
      sound.playSuccess();
      setIsLocked(false);
      setEnteredPin('');
      setPinError(false);
    } else {
      sound.playWarning();
      setPinError(true);
    }
  };

  const filteredCredentials = credentials.filter((c) => {
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      c.title.toLowerCase().includes(query) ||
      c.usernameOrEmail.toLowerCase().includes(query) ||
      (c.notes && c.notes.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const getCategoryBadge = (cat: StoredCredential['category']) => {
    switch (cat) {
      case 'cctv':
        return { label: 'كاميرات المراقبة', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30', icon: Video };
      case 'email':
        return { label: 'بريد إلكتروني', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30', icon: Mail };
      case 'servers':
        return { label: 'خوادم و SSH', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: Server };
      case 'dev':
        return { label: 'برمجة و GitHub', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', icon: Code };
      default:
        return { label: 'حساب عام', color: 'bg-slate-700/40 text-slate-300 border-slate-600', icon: KeyRound };
    }
  };

  // If Vault is Locked
  if (isLocked) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-950 p-6 select-none font-sans" dir="rtl">
        <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-sky-500 p-[2px] flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-4">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Lock className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">خزنة كلمات المرور مقفلة</h2>
          <p className="text-xs text-slate-400 font-mono mb-4">
            أدخل رمز المرور السري (Master PIN) لفك قفل الحسابات وكلمات السر
          </p>
          <form onSubmit={handleUnlock} className="w-full space-y-3">
            <input
              type="password"
              value={enteredPin}
              onChange={(e) => {
                setEnteredPin(e.target.value);
                setPinError(false);
              }}
              placeholder="رمز PIN الحماية..."
              className="w-full text-center tracking-widest text-lg bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none"
              autoFocus
            />
            {pinError && (
              <p className="text-xs text-rose-400 font-mono">رمز PIN غير صحيح. يرجى المحاولة ثانية.</p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>فك القفل والدخول</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full w-full flex flex-col bg-slate-950 text-slate-100 ${isEmbedded ? '' : 'p-3 sm:p-5'} overflow-hidden select-none font-sans`} dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-emerald-500 p-[1.5px] flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                خزنة الإيميلات وكلمات السر (Credentials & Passwords Vault)
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                AES-256 Encrypted
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              حفظ وتشفير حسابات Hik-Connect و ICSee و Yoosee والبريد والسيرفرات والمفاتيح
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة حساب جديد</span>
          </button>

          <button
            onClick={handleExportBackup}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition-all"
            title="تصدير نسخة احتياطية JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          <label className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition-all cursor-pointer" title="استيراد نسخة احتياطية">
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          <button
            onClick={() => {
              sound.playClick(500);
              if (!masterPin) {
                const pin = prompt('حدد رمز PIN جديد لقفل الخزنة (مثال: 1234):');
                if (pin) {
                  setMasterPin(pin);
                  localStorage.setItem('devcore_vault_master_pin', pin);
                  setIsLocked(true);
                }
              } else {
                setIsLocked(true);
              }
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 text-xs transition-all"
            title="قفل الخزنة برمز PIN"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Categories Filter */}
      <div className="py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث باسم المنظومة، الإيميل، أو الملاحظات..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500 transition-all"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all shrink-0 ${
              categoryFilter === 'all' ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            الكل ({credentials.length})
          </button>
          <button
            onClick={() => setCategoryFilter('cctv')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all shrink-0 flex items-center gap-1 ${
              categoryFilter === 'cctv' ? 'bg-rose-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3 h-3" />
            <span>كاميرات ({credentials.filter((c) => c.category === 'cctv').length})</span>
          </button>
          <button
            onClick={() => setCategoryFilter('email')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all shrink-0 flex items-center gap-1 ${
              categoryFilter === 'email' ? 'bg-sky-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3 h-3" />
            <span>إيميلات ({credentials.filter((c) => c.category === 'email').length})</span>
          </button>
          <button
            onClick={() => setCategoryFilter('servers')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all shrink-0 flex items-center gap-1 ${
              categoryFilter === 'servers' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Server className="w-3 h-3" />
            <span>سيرفرات ({credentials.filter((c) => c.category === 'servers').length})</span>
          </button>
          <button
            onClick={() => setCategoryFilter('dev')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all shrink-0 flex items-center gap-1 ${
              categoryFilter === 'dev' ? 'bg-violet-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3 h-3" />
            <span>مطورين ({credentials.filter((c) => c.category === 'dev').length})</span>
          </button>
        </div>
      </div>

      {/* Credentials Cards Grid */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
        {filteredCredentials.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-3xl">
            <KeyRound className="w-12 h-12 text-slate-600 mb-3" />
            <h3 className="text-sm font-bold text-slate-300">لا توجد حسابات مطابقة للبحث</h3>
            <p className="text-xs text-slate-500 font-mono mt-1">انقر على "إضافة حساب جديد" لحفظ بيانات الدخول وكلمة المرور.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredCredentials.map((cred) => {
              const badge = getCategoryBadge(cred.category);
              const BadgeIcon = badge.icon;
              const isPasswordVisible = visiblePasswords[cred.id];
              const strength = evaluateStrength(cred.password);

              return (
                <div
                  key={cred.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3 shadow-lg group relative"
                >
                  {/* Top Bar: Title + Category + Edit/Delete */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono border flex items-center gap-1 ${badge.color}`}>
                          <BadgeIcon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{cred.updatedAt}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1.5 font-sans">
                        {cred.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(cred)}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="تعديل الحساب"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cred.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="حذف الحساب"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Username / Email Row */}
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-850 flex items-center justify-between text-xs font-mono">
                    <div className="min-w-0 pr-1">
                      <span className="text-[10px] text-slate-500 block">اسم المستخدم / البريد:</span>
                      <span className="text-slate-200 truncate block select-all font-semibold">
                        {cred.usernameOrEmail}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(cred.usernameOrEmail, cred.id, 'user')}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors shrink-0"
                      title="نسخ اسم المستخدم"
                    >
                      {copiedField?.id === cred.id && copiedField?.field === 'user' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Password Row with Show/Hide & Copy */}
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-850 flex items-center justify-between text-xs font-mono">
                    <div className="min-w-0 pr-1 flex-1">
                      <span className="text-[10px] text-slate-500 block">كلمة المرور:</span>
                      <span className="text-cyan-300 tracking-wider truncate block font-bold">
                        {isPasswordVisible ? cred.password : '••••••••••••••••'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => togglePasswordVisibility(cred.id)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                        title={isPasswordVisible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      >
                        {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleCopy(cred.password, cred.id, 'pass')}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
                        title="نسخ كلمة المرور"
                      >
                        {copiedField?.id === cred.id && copiedField?.field === 'pass' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Optional Verification Code / 3C PIN / Cloud ID */}
                  {cred.verificationPin && (
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-850 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-amber-500 block">رمز التحقق / PIN / Cloud ID:</span>
                        <span className="text-amber-300 font-bold">{cred.verificationPin}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(cred.verificationPin!, cred.id, 'pin')}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition-colors"
                      >
                        {copiedField?.id === cred.id && copiedField?.field === 'pin' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Password Strength bar */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color}`} style={{ width: `${strength.score}%` }} />
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">{strength.label}</span>
                  </div>

                  {/* Notes & Website Link Footer */}
                  {(cred.notes || cred.websiteUrl) && (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                      <p className="text-slate-400 truncate max-w-[200px]" title={cred.notes}>
                        {cred.notes || 'لا توجد ملاحظات'}
                      </p>
                      {cred.websiteUrl && (
                        <a
                          href={cred.websiteUrl.startsWith('http') ? cred.websiteUrl : `https://${cred.websiteUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1 shrink-0"
                        >
                          <span>الدخول</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none" dir="rtl">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  {editingId ? 'تعديل بيانات الحساب' : 'إضافة حساب جديد إلى الخزنة'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCredential} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  اسم الحساب أو المنصة:
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: حساب كاميرات Hik-Connect NVR أو خادم السيرفرات"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    تصنيف الحساب:
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  >
                    <option value="cctv">📹 كاميرات المراقبة (Hik/ICSee/Yoosee)</option>
                    <option value="email">📧 بريد إلكتروني (Email)</option>
                    <option value="servers">🖥️ خوادم وسيرفرات (Servers / SSH)</option>
                    <option value="dev">💻 برمجة و GitHub</option>
                    <option value="cloud">☁️ سحابة واستضافة (Cloud / AWS)</option>
                    <option value="other">🔒 أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    رابط الموقع أو البوابة (اختياري):
                  </label>
                  <input
                    type="text"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  اسم المستخدم أو البريد الإلكتروني:
                </label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="admin أو user@domain.com"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              {/* Password Field with Generator Button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    كلمة المرور:
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>توليد كلمة سر قوية تلقائياً</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="كلمة المرور المشفرة..."
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              {/* PIN / Verification Code */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  رمز فك التشفير / PIN / Cloud ID (اختياري للكاميرات):
                </label>
                <input
                  type="text"
                  value={formPin}
                  onChange={(e) => setFormPin(e.target.value)}
                  placeholder="رمز التحقق من الكاميرا (مثل: ABCDEF أو 3C ID)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  ملاحظات أمنية:
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="تفاصيل المنفذ، صلاحيات الحساب، أو أرقام الطوابق..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30"
                >
                  {editingId ? 'حفظ التعديلات' : 'إضافة الحساب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
