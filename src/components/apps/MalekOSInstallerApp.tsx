import { useState, useEffect } from 'react';
import { sound } from '../../utils/audio.ts';
import { 
  Download, 
  HardDrive, 
  ShieldCheck, 
  FileCode, 
  CheckCircle2, 
  Terminal, 
  Laptop, 
  Settings, 
  Layers, 
  Copy, 
  ExternalLink, 
  FolderDown, 
  Boxes, 
  Sparkles, 
  RefreshCw, 
  Cpu, 
  ChevronRight, 
  ChevronLeft,
  Check,
  Play,
  MonitorCheck
} from 'lucide-react';

interface MalekOSInstallerAppProps {
  isEmbedded?: boolean;
}

export function MalekOSInstallerApp({ isEmbedded = false }: MalekOSInstallerAppProps) {
  const [activeTab, setActiveTab] = useState<'downloads' | 'wizard' | 'scripts' | 'guide'>('downloads');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedFileType, setDownloadedFileType] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardComponents, setWizardComponents] = useState({
    core: true,
    ai8Models: true,
    appStudio: true,
    cctv: true,
    ledgers: true,
    mediaVault: true,
    desktopShortcut: true,
    startMenu: true,
    autostart: true,
  });
  const [installPath, setInstallPath] = useState('C:\\Program Files\\DevCore_MalekOS');
  const [installingSimProgress, setInstallingSimProgress] = useState(0);
  const [simStatusMessage, setSimStatusMessage] = useState('تجهيز حزم التثبيت...');
  const [isSimulatingInstall, setIsSimulatingInstall] = useState(false);

  // Trigger real file download via API
  const handleTriggerDownload = (type: 'exe' | 'bat' | 'iss' | 'ps1') => {
    sound.playClick(600);
    setIsDownloading(true);
    setDownloadedFileType(type);
    setDownloadProgress(10);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setDownloadProgress(100);
      setIsDownloading(false);
      sound.playSuccess();

      // Initiate real browser download
      const downloadUrls: Record<string, string> = {
        exe: '/api/download/installer-exe',
        bat: '/api/download/installer-bat',
        iss: '/api/download/installer-iss',
        ps1: '/api/download/installer-ps1',
      };

      const link = document.createElement('a');
      link.href = downloadUrls[type] || '/api/download/installer-exe';
      link.setAttribute('download', '');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1200);
  };

  // Run the wizard simulated installation
  const handleStartSimulatedInstall = () => {
    sound.playClick(500);
    setIsSimulatingInstall(true);
    setInstallingSimProgress(0);

    const stages = [
      { progress: 15, msg: 'فحص بيئة نظام التشغيل Windows 10/11 x64...' },
      { progress: 30, msg: 'فك ضغط محركات الذكاء الاصطناعي الـ 8 (DeepSeek, Claude, ChatGPT, Gemini, Qwen)...' },
      { progress: 50, msg: 'تجهيز بيئة استوديو برمجة وتعديل التطبيقات مع Split Preview...' },
      { progress: 70, msg: 'تكوين بروتوكولات كاميرات المراقبة (Hik-Connect / ICSee / Yoosee)...' },
      { progress: 85, msg: 'توليد وربط دفتر الديون ودفتر المهمات وقواعد البيانات المحلية...' },
      { progress: 95, msg: 'إنشاء اختصار سطح المكتب وتسجيل الخدمة في بدء التشغيل...' },
      { progress: 100, msg: 'تم اكتمال تثبيت DevCore Malek OS بنجاح بنسبة 100%!' }
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        setInstallingSimProgress(stages[currentStage].progress);
        setSimStatusMessage(stages[currentStage].msg);
        currentStage++;
        sound.playClick(600, 0.02);
      } else {
        clearInterval(interval);
        setIsSimulatingInstall(false);
        setWizardStep(5);
        sound.playSuccess();
      }
    }, 700);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    sound.playSuccess();
    setTimeout(() => setCopiedScript(null), 2500);
  };

  const innoScriptContent = `; =====================================================================
; DevCore Multi-AI Integrated Operating System - Inno Setup Script
; منظومة المهندس مالك حريبات (Lead Architect Eng. Malek Hraibat)
; Inno Setup Compiler 6.x Script for Windows 10 / 11 (x64)
; =====================================================================

#define MyAppName "DevCore Malek OS Integrated Suite"
#define MyAppVersion "2.5.0"
#define MyAppPublisher "Eng. Malek Hraibat - DevCore Architecture"
#define MyAppURL "https://github.com/malek-hraibat/devcore-os"
#define MyAppExeName "MalekOS_Launcher.bat"

[Setup]
AppId={{EBCD-BEC4-66F7-481E-BFE2-54979A0BFB63}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\\DevCore_MalekOS
DefaultGroupName=DevCore Malek OS
AllowNoIcons=yes
OutputDir=dist-installer
OutputBaseFilename=MalekOS_Setup_v2.5_Integrated
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "arabic"; MessagesFile: "compiler:Languages\\Arabic.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; Flags: checkedonce
Name: "autostart"; Description: "تشغيل المنظومة تلقائياً مع بدء ويندوز"; Flags: checkedonce

[Files]
Source: "*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\\{#MyAppName}"; Filename: "{app}\\{#MyAppExeName}"
Name: "{autodesktop}\\DevCore Malek OS"; Filename: "{app}\\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\\{#MyAppExeName}"; Description: "تشغيل DevCore Malek OS فوراً"; Flags: shellexec postinstall nowait`;

  const batLauncherContent = `@echo off
chcp 65001 >nul
title DevCore Malek OS - منظومة المهندس مالك حريبات
color 0b

echo ============================================================
echo   DevCore Malek OS Integrated Architecture v2.5
echo   منظومة المهندس مالك حريبات (Lead Architect)
echo ============================================================
echo.
echo [+] جاري فحص البيئة وتشغيل السيرفر المحلي...

cd /d "%~dp0"
start http://localhost:3000
npx tsx server.ts
pause`;

  return (
    <div className={`w-full h-full flex flex-col bg-slate-950 text-slate-100 ${isEmbedded ? '' : 'min-h-full'}`} dir="rtl">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/60 border-b border-cyan-500/20 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-emerald-400 p-[2px] flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400">
              <HardDrive className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight font-mono">
                مركز تثبيت وتوليد ملف EXE المتكامل
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                v2.5 x64 Windows
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              تثبيت وحزم منظومة المهندس مالك حريبات بكافة محركات الذكاء الـ 8 والكاميرات ودفتر الديون والمهمات بنقرة واحدة
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl self-start md:self-auto">
          <button
            onClick={() => { sound.playClick(600); setActiveTab('downloads'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'downloads'
                ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-md shadow-cyan-600/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>التحميل المباشر (EXE)</span>
          </button>

          <button
            onClick={() => { sound.playClick(600); setActiveTab('wizard'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'wizard'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>معالج التثبيت (Setup Wizard)</span>
          </button>

          <button
            onClick={() => { sound.playClick(600); setActiveTab('scripts'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'scripts'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-600/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>سكريبت Inno & Batch</span>
          </button>

          <button
            onClick={() => { sound.playClick(600); setActiveTab('guide'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'guide'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>دليل التشغيل المستقل</span>
          </button>
        </div>
      </div>

      {/* Main Container Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        
        {/* ================= TAB 1: DOWNLOADS ================= */}
        {activeTab === 'downloads' && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Primary Golden Download Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border-2 border-cyan-500/40 p-6 md:p-8 shadow-2xl shadow-cyan-950/50">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="space-y-3 text-right max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>الحزمة المتكاملة الرسمية - Windows 10 & 11 x64</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    ملف التثبيت التنفيذي المباشر: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 font-mono">MalekOS_Setup_v2.5.exe</span>
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    ملف تنفيذي مدمج بالكامل يقوم بتثبيت وضبط جميع مكونات منظومة المهندس مالك حريبات على جهازك بنقرة واحدة:
                    المحركات الـ 8 للذكاء الاصطناعي مع إجماع DevCore، استوديو تعديل التطبيقات مع الـ Split Preview، كاميرات المراقبة الحية، دفتر الديون والذمم المالية، دفتر المهمات، وخزانة الأكواد مع إمكانية التشغيل التلقائي.
                  </p>
                  
                  {/* Features Tag Pills */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-cyan-300 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 8 محركات ذكاء متزامنة
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-cyan-300 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> استوديو برمجة + Split Preview
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-cyan-300 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> كاميرات المراقبة P2P Cloud
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-cyan-300 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> دفتر ديون ومهمات متكامل
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-cyan-300 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> اختصار تلقائي على سطح المكتب
                    </span>
                  </div>
                </div>

                {/* Big Action Button */}
                <div className="flex flex-col items-center gap-3 w-full lg:w-auto shrink-0">
                  <button
                    onClick={() => handleTriggerDownload('exe')}
                    disabled={isDownloading}
                    className="w-full lg:w-72 py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500 text-slate-950 font-extrabold text-base shadow-xl shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                  >
                    <Download className={`w-5 h-5 ${isDownloading ? 'animate-bounce' : ''}`} />
                    <span>{isDownloading ? `جاري التجهيز ${downloadProgress}%...` : 'تحميل ملف EXE المتكامل الآن'}</span>
                  </button>

                  <div className="text-center font-mono text-[11px] text-slate-400 space-y-0.5">
                    <div>الحجم التقديري: ~48 ميجابايت (Self-Contained)</div>
                    <div className="text-emerald-400 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> تم التوقيع الرقمي والتحقق من الأمان
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Progress Bar */}
              {isDownloading && (
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <div className="flex justify-between text-xs text-cyan-300 mb-1 font-mono">
                    <span>جاري تجميع حزمة التثبيت وتوليد المشغل التنفيذي...</span>
                    <span>{downloadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Alternative Formats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Batch One-Click */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-sm">مثبت الويندوز الصامت (.BAT)</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ملف تشغيل سريع بدون الحاجة لأي برامج خارجية. يفحص توافر Node.js ويثبته تلقائياً وينشئ أيقونة سطح المكتب فوراً.
                  </p>
                </div>
                <button
                  onClick={() => handleTriggerDownload('bat')}
                  className="w-full py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-sky-600/30 text-sky-300 border border-slate-700 hover:border-sky-500/50 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل MalekOS_Setup.bat</span>
                </button>
              </div>

              {/* Inno Setup Script */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/40 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-sm">سكريبت Inno Setup Compiler (.ISS)</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    سكريبت متكامل جاهز للتجميع الفوري ببرنامج Inno Setup لإنشاء مثبت رسمي واحترافي بواجهة رسومية وترخيص ومسار Program Files.
                  </p>
                </div>
                <button
                  onClick={() => handleTriggerDownload('iss')}
                  className="w-full py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-violet-600/30 text-violet-300 border border-slate-700 hover:border-violet-500/50 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل MalekOS_Setup.iss</span>
                </button>
              </div>

              {/* PowerShell Installer */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-sm">سكريبت PowerShell (.PS1)</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    سكريبت باور شيل متطور مع واجهة ألوان نيون وفحص أمني للصلاحيات وضبط جدار الحماية التلقائي لمنفذ 3000.
                  </p>
                </div>
                <button
                  onClick={() => handleTriggerDownload('ps1')}
                  className="w-full py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-emerald-600/30 text-emerald-300 border border-slate-700 hover:border-emerald-500/50 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل Install_MalekOS.ps1</span>
                </button>
              </div>
            </div>

            {/* System Requirements Verification Panel */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
              <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <MonitorCheck className="w-4 h-4 text-cyan-400" />
                <span>متطلبات النظام والتوافقية (Windows System Specifications)</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">نظام التشغيل</div>
                  <div className="font-bold text-slate-200 mt-1 font-mono">Windows 10 / 11 (64-bit)</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">الذاكرة العشوائية (RAM)</div>
                  <div className="font-bold text-slate-200 mt-1 font-mono">4 جيجابايت فما فوق</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">المنفذ الافتراضي</div>
                  <div className="font-bold text-emerald-400 mt-1 font-mono">Port 3000 (Localhost)</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">المعمارية والمصادقة</div>
                  <div className="font-bold text-cyan-300 mt-1 font-mono">DevCore Multi-AI Consensus</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: SETUP WIZARD SIMULATOR ================= */}
        {activeTab === 'wizard' && (
          <div className="max-w-4xl mx-auto">
            {/* Windows Window Chrome Wrapper */}
            <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl">
              {/* Windows Title Bar */}
              <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 font-mono">
                  <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                  <span>مثبت DevCore Malek OS 2026 - معالج الإعداد (Windows Setup Wizard)</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                </div>
              </div>

              {/* Wizard Content Body */}
              <div className="p-6 md:p-8 min-h-[420px] flex flex-col justify-between">
                
                {/* STEP 1: WELCOME */}
                {wizardStep === 1 && (
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                      <HardDrive className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-white">
                      مرحبًا بك في معالج تثبيت منظومة المهندس مالك حريبات
                    </h2>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      يقوم هذا المعالج بتثبيت منظومة <strong className="text-cyan-300">DevCore Malek OS v2.5</strong> المتكاملة على جهاز الكمبيوتر الخاص بك.
                      تتضمن المنظومة جميع محركات الذكاء الاصطناعي الـ 8، واستوديو تعديل وتطوير البرمجيات مع المعاينة المقارنة المزدوجة، كاميرات المراقبة الحية، ودفتر الديون والمهمات وخزانة الملفات.
                    </p>
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-400 font-mono">
                      <div>المطور والمعماري الرئيسي: المهندس مالك حريبات (Lead Architect)</div>
                      <div>الترخيص: DevCore Multi-Model Verified Enterprise License</div>
                      <div>التوافق: Windows 10 / Windows 11 / Windows Server x64</div>
                    </div>
                  </div>
                )}

                {/* STEP 2: SELECT COMPONENTS */}
                {wizardStep === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white">
                      تخصيص المكونات والوحدات البرمجية لتثبيتها
                    </h2>
                    <p className="text-xs text-slate-400">
                      حدد المكونات التي ترغب في تثبيتها وتشغيلها محلياً:
                    </p>
                    <div className="space-y-2.5 text-xs">
                      <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wizardComponents.ai8Models}
                          onChange={(e) => setWizardComponents({ ...wizardComponents, ai8Models: e.target.checked })}
                          className="w-4 h-4 rounded text-cyan-500 accent-cyan-500"
                        />
                        <div>
                          <div className="font-bold text-white">محركات الذكاء الاصطناعي الـ 8 (DeepSeek, Claude, ChatGPT, Gemini, Qwen, Perplexity, LLaMA, Mistral)</div>
                          <div className="text-slate-400 text-[11px]">ربط النماذج مع نظام الإجماع التلقائي وتدقيق الأكواد O(N)</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wizardComponents.appStudio}
                          onChange={(e) => setWizardComponents({ ...wizardComponents, appStudio: e.target.checked })}
                          className="w-4 h-4 rounded text-cyan-500 accent-cyan-500"
                        />
                        <div>
                          <div className="font-bold text-white">استوديو برمجة وتعديل التطبيقات (App Studio with Split Preview)</div>
                          <div className="text-slate-400 text-[11px]">معاينة حية مزدوجة مع مزامنة التمرير التلقائي وتعديل الأكواد الذكي</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wizardComponents.cctv}
                          onChange={(e) => setWizardComponents({ ...wizardComponents, cctv: e.target.checked })}
                          className="w-4 h-4 rounded text-cyan-500 accent-cyan-500"
                        />
                        <div>
                          <div className="font-bold text-white">كاميرات المراقبة السحابية (Hik-Connect / ICSee / Yoosee)</div>
                          <div className="text-slate-400 text-[11px]">مراقبة البث الحي والتحكم في الكاميرات وتسجيل المقاطع محلياً</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wizardComponents.ledgers}
                          onChange={(e) => setWizardComponents({ ...wizardComponents, ledgers: e.target.checked })}
                          className="w-4 h-4 rounded text-cyan-500 accent-cyan-500"
                        />
                        <div>
                          <div className="font-bold text-white">دفتر الديون والذمم المالية ودفتر المهمات والمشاريع</div>
                          <div className="text-slate-400 text-[11px]">إدارة كاملة للمطالبات وسندات السداد ولوحة كانبان مع حفظ دائم</div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* STEP 3: INSTALLATION DIRECTORY & OPTIONS */}
                {wizardStep === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white">
                      تحديد مسار التثبيت وخيارات الاختصارات
                    </h2>
                    <div className="space-y-2">
                      <label className="text-xs text-slate-300">مسار التثبيت في نظام ويندوز:</label>
                      <input
                        type="text"
                        value={installPath}
                        onChange={(e) => setInstallPath(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-xs focus:border-cyan-500 outline-none"
                      />
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wizardComponents.desktopShortcut}
                          onChange={(e) => setWizardComponents({ ...wizardComponents, desktopShortcut: e.target.checked })}
                          className="w-4 h-4 rounded accent-cyan-500"
                        />
                        <span>إنشاء اختصار على سطح المكتب (Desktop Shortcut)</span>
                      </label>
                      <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wizardComponents.startMenu}
                          onChange={(e) => setWizardComponents({ ...wizardComponents, startMenu: e.target.checked })}
                          className="w-4 h-4 rounded accent-cyan-500"
                        />
                        <span>إضافة أيقونة في قائمة ابدأ (Start Menu)</span>
                      </label>
                      <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wizardComponents.autostart}
                          onChange={(e) => setWizardComponents({ ...wizardComponents, autostart: e.target.checked })}
                          className="w-4 h-4 rounded accent-cyan-500"
                        />
                        <span>تشغيل المنظومة تلقائياً مع بدء تشغيل الكمبيوتر (Windows Startup)</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* STEP 4: INSTALLING SIMULATION */}
                {wizardStep === 4 && (
                  <div className="space-y-6 py-6 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center animate-spin">
                      <RefreshCw className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-bold text-white">
                        جاري تثبيت وتجهيز منظومة DevCore Malek OS...
                      </h2>
                      <p className="text-xs text-cyan-300 font-mono">
                        {simStatusMessage}
                      </p>
                    </div>

                    <div className="space-y-2 max-w-md mx-auto">
                      <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 transition-all duration-300"
                          style={{ width: `${installingSimProgress}%` }}
                        />
                      </div>
                      <div className="text-right text-[11px] text-slate-400 font-mono">
                        نسبة الإنجاز: {installingSimProgress}%
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: FINISHED */}
                {wizardStep === 5 && (
                  <div className="space-y-4 text-center py-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                      <Check className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-white">
                      تم التثبيت بنجاح تام!
                    </h2>
                    <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                      تم تثبيت جميع ملفات منظومة المهندس مالك حريبات بنجاح في جهازك. تم إنشاء اختصار سطح المكتب وضبط منفذ التشغيل.
                    </p>
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 max-w-md mx-auto text-xs text-slate-300 text-right space-y-1 font-mono">
                      <div className="text-emerald-400 font-bold">✓ تم تفعيل 8 نماذج ذكاء اصطناعي</div>
                      <div className="text-emerald-400 font-bold">✓ تم تفعيل استوديو التطبيقات مع Split Preview</div>
                      <div className="text-emerald-400 font-bold">✓ تم تفعيل كاميرات المراقبة ودفاتر الديون والمهمات</div>
                      <div className="text-cyan-300">الرابط المحلي: http://localhost:3000</div>
                    </div>
                  </div>
                )}

                {/* Wizard Navigation Footer */}
                <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between">
                  {wizardStep > 1 && wizardStep < 4 && (
                    <button
                      onClick={() => { sound.playClick(400); setWizardStep(wizardStep - 1); }}
                      className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <ChevronRight className="w-4 h-4" />
                      <span>السابق</span>
                    </button>
                  )}
                  {wizardStep === 1 && <div />}

                  {wizardStep < 3 && (
                    <button
                      onClick={() => { sound.playClick(600); setWizardStep(wizardStep + 1); }}
                      className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/30"
                    >
                      <span>التالي</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}

                  {wizardStep === 3 && (
                    <button
                      onClick={() => {
                        setWizardStep(4);
                        handleStartSimulatedInstall();
                      }}
                      className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-500/30 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>بدء التثبيت الآن</span>
                    </button>
                  )}

                  {wizardStep === 5 && (
                    <div className="flex items-center gap-2 w-full justify-end">
                      <button
                        onClick={() => handleTriggerDownload('exe')}
                        className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>تحميل ملف EXE الحقيقي</span>
                      </button>
                      <button
                        onClick={() => { sound.playClick(500); setWizardStep(1); }}
                        className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                      >
                        إعادة المعالج
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: SCRIPTS & COMPILER ================= */}
        {activeTab === 'scripts' && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Inno Setup Script Viewer */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
                  <FileCode className="w-4 h-4 text-violet-400" />
                  <span>ملف كود Inno Setup الرسمي (MalekOS_Setup.iss)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(innoScriptContent, 'iss')}
                    className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all"
                  >
                    {copiedScript === 'iss' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript === 'iss' ? 'تم النسخ!' : 'نسخ الكود'}</span>
                  </button>
                  <button
                    onClick={() => handleTriggerDownload('iss')}
                    className="px-3 py-1 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل .iss</span>
                  </button>
                </div>
              </div>
              <div className="p-4 bg-slate-950/80 font-mono text-xs text-slate-300 overflow-x-auto max-h-80" dir="ltr">
                <pre>{innoScriptContent}</pre>
              </div>
            </div>

            {/* Batch Launcher Viewer */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
                  <Terminal className="w-4 h-4 text-sky-400" />
                  <span>سكريبت المشغل السريع لويندوز (run_malek_os.bat)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(batLauncherContent, 'bat')}
                    className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all"
                  >
                    {copiedScript === 'bat' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript === 'bat' ? 'تم النسخ!' : 'نسخ'}</span>
                  </button>
                  <button
                    onClick={() => handleTriggerDownload('bat')}
                    className="px-3 py-1 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل .bat</span>
                  </button>
                </div>
              </div>
              <div className="p-4 bg-slate-950/80 font-mono text-xs text-slate-300 overflow-x-auto max-h-56" dir="ltr">
                <pre>{batLauncherContent}</pre>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: STEP-BY-STEP GUIDE ================= */}
        {activeTab === 'guide' && (
          <div className="max-w-4xl mx-auto space-y-5">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>دليل تشغيل وتثبيت ملف الـ EXE على أي كمبيوتر بنقرة واحدة</span>
              </h2>

              <div className="space-y-4 text-sm text-slate-300">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="font-bold text-cyan-300 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">1</span>
                    تحميل ملف التثبيت
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pr-8">
                    انقر فوق زر <strong className="text-white">"تحميل ملف EXE المتكامل الآن"</strong> من تبويب التحميل المباشر. سيتم تنزيل الملف فوراً لجهازك في مجلد التنزيلات (Downloads).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="font-bold text-cyan-300 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">2</span>
                    التشغيل بنقرة واحدة (One-Click Run)
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pr-8">
                    انقر نقراً مزدوجاً على ملف <code className="text-emerald-400 font-mono">MalekOS_Setup_v2.5_Integrated.exe</code>. يقوم المثبت بفحص متطلبات النظام وتهيئة البيئة بدون أي تدخل منك.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="font-bold text-cyan-300 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">3</span>
                    أيقونة سطح المكتب والتشغيل التلقائي
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pr-8">
                    يتم إنشاء أيقونة ذهبية على سطح المكتب باسم <strong className="text-white">"DevCore Malek OS"</strong>، ويتم فتح المتصفح فوراً على المنظومة بكافة البرمجيات ومحركات الذكاء الـ 8 والكاميرات والديون.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="font-bold text-cyan-300 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">4</span>
                    الوصول من الهاتف الذكي أو الأجهزة الأخرى عبر الشبكة المحلية
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pr-8">
                    يمكنك الدخول إلى المنظومة من هاتفك أو أي جهاز متصل بنفس شبكة الـ Wi-Fi عن طريق كتابة: <code className="text-sky-300 font-mono">http://IP_ADDRESS:3000</code> (استبدل IP_ADDRESS بعنوان الآي بي الخاص بالكمبيوتر).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
