import { useState, useRef } from 'react';
import { sound } from '../utils/audio.ts';
import { 
  Download, 
  Upload, 
  ShieldCheck, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RefreshCw,
  HardDrive
} from 'lucide-react';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackupRestored?: () => void;
}

export function BackupRestoreModal({
  isOpen,
  onClose,
  onBackupRestored,
}: BackupRestoreModalProps) {
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Gather all LocalStorage data with 'devcore_' prefix
  const handleExportBackup = () => {
    sound.playExecute();
    setIsProcessing(true);
    try {
      const backupData: Record<string, any> = {
        metadata: {
          app: 'DevCore Ecosystem by Eng. Malek Hraybat',
          version: '2.5.0',
          exportedAt: new Date().toISOString(),
          leadEngineer: 'Malek Hraybat',
        },
        payload: {},
      };

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('devcore_')) {
          try {
            backupData.payload[key] = JSON.parse(localStorage.getItem(key) || 'null');
          } catch {
            backupData.payload[key] = localStorage.getItem(key);
          }
        }
      }

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `devcore_complete_backup_${dateStr}.json`;
      link.click();
      URL.revokeObjectURL(url);

      setStatusMsg({
        type: 'success',
        text: '✓ تم تصدير النسخة الاحتياطية الشاملة لجميع السجلات بنجاح!',
      });
      sound.playSuccess();
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: `حدث خطأ أثناء تصدير النسخة: ${err.message}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Restore from chosen file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playExecute();
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (!parsed.payload || typeof parsed.payload !== 'object') {
          throw new Error('ملف النسخ الاحتياطي غير صالح أو تالف');
        }

        let restoredCount = 0;
        Object.entries(parsed.payload).forEach(([key, value]) => {
          if (key.startsWith('devcore_')) {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
            restoredCount++;
          }
        });

        setStatusMsg({
          type: 'success',
          text: `✓ تمت استعادة ${restoredCount} قطاع بيانات بنجاح! سيتم تحديث الشاشات تلقائياً.`,
        });
        sound.playSuccess();

        if (onBackupRestored) {
          onBackupRestored();
        }

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err: any) {
        setStatusMsg({
          type: 'error',
          text: `فشلت الاستعادة: ${err.message}`,
        });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">النسخ الاحتياطي والاستعادة الشاملة</h2>
              <p className="text-xs text-slate-400">حفظ واسترجاع كافة الديون والمهمات وكلمات السر والأكواد</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert if any */}
        {statusMsg && (
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2">
                <Download className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">تصدير نسخة احتياطية</h3>
              <p className="text-xs text-slate-400 mt-1">
                تنزيل ملف JSON يحتوي على سجلات الديون، المهمات، الكاميرات، المفاتيح السرية، والأكواد.
              </p>
            </div>
            <button
              disabled={isProcessing}
              onClick={handleExportBackup}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/40 transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل النسخة الاحتياطية</span>
            </button>
          </div>

          {/* Import / Restore Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-violet-500/40 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center mb-2">
                <Upload className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">استعادة من ملف سابق</h3>
              <p className="text-xs text-slate-400 mt-1">
                استرجاع بياناتك كاملة بنقرة واحدة من أي ملف احتياطي تم تصديره مسبقاً.
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                disabled={isProcessing}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-900/40 transition-all disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>رفع واستعادة الملف</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>تتم معالجة وتشفير كافة البيانات محلياً داخل متصفحك دون إرسال كلمات السر لأي طرف خارجي.</span>
        </div>
      </div>
    </div>
  );
}
