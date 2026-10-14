import { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/audio.ts';
import { 
  getStoredCameras, 
  saveStoredCameras, 
  getStoredCctvAccounts,
  saveStoredCctvAccounts,
  CctvCameraConfig, 
  CctvAccountSession,
  DEFAULT_CCTV_CAMERAS 
} from '../utils/storage.ts';
import { 
  Video, 
  Grid, 
  Maximize, 
  Minimize, 
  Volume2, 
  VolumeX, 
  Mic, 
  AlertTriangle, 
  Camera, 
  Radio, 
  Moon, 
  Sun, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Compass, 
  Layers, 
  Check, 
  X, 
  Download,
  Activity,
  Cpu,
  Wifi,
  Sliders,
  Play,
  Square,
  KeyRound,
  Lock,
  Unlock,
  UserCheck,
  Server,
  Cloud,
  Globe,
  Cast,
  ArrowRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Tv,
  Terminal,
  Zap,
  Settings2,
  ScanLine,
  MapPin,
  Map,
  Crosshair,
  Navigation,
  LocateFixed
} from 'lucide-react';

interface CctvSurveillanceViewProps {
  onBackToComplex?: () => void;
}

export function CctvSurveillanceView({ onBackToComplex }: CctvSurveillanceViewProps) {
  const [cameras, setCameras] = useState<CctvCameraConfig[]>(getStoredCameras);
  const [accounts, setAccounts] = useState<Record<'hik-connect' | 'icsee' | 'yoosee', CctvAccountSession>>(getStoredCctvAccounts);
  const [selectedCameraId, setSelectedCameraId] = useState<string>(cameras[0]?.id || 'cam-hik-01');
  const [gridLayout, setGridLayout] = useState<'1x1' | '2x2' | '3x3'>('2x2');
  const [brandFilter, setBrandFilter] = useState<'all' | 'hik-connect' | 'icsee' | 'yoosee'>('all');
  const [activeNightVision, setActiveNightVision] = useState<Record<string, 'normal' | 'infrared' | 'color' | 'thermal'>>({});
  const [isIntercomActive, setIsIntercomActive] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [ptzState, setPtzState] = useState<{ pan: number; tilt: number; zoom: number }>({ pan: 0, tilt: 0, zoom: 1 });
  const [snapshots, setSnapshots] = useState<{ id: string; camName: string; time: string; dataUrl: string }[]>([]);
  
  // Dedicated Hik-Connect Integration Module Drawer State
  const [isHikModuleOpen, setIsHikModuleOpen] = useState(false);
  const [hikProtocol, setHikProtocol] = useState<'ISUP_5_0' | 'OPEN_API_REST' | 'DIGEST_RTSP' | 'EZVIZ_P2P'>('ISUP_5_0');
  const [hikUsername, setHikUsername] = useState('admin');
  const [hikPassword, setHikPassword] = useState('Hikvision@2026');
  const [showHikPassword, setShowHikPassword] = useState(false);
  const [isAuthBypassActive, setIsAuthBypassActive] = useState(true);
  const [hikVerificationCode, setHikVerificationCode] = useState('ABCDEF');
  const [isExecutingHikBypass, setIsExecutingHikBypass] = useState(false);
  const [hikBypassLogs, setHikBypassLogs] = useState<string[]>([
    '[SYSTEM] وحدة اتصال Hik-Connect Integration Module جاهزة.',
    '[PROTOCOL] تم تهيئة بروتوكول ISUP 5.0 / Ehome والبوابة السحابية dev.hik-connect.com',
    '[READY] حقول اسم المستخدم وكلمة المرور وخاصية تجاوز المصادقة (Auth Bypass) مهيأة للعمل.',
  ]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isEnlargedMapOpen, setIsEnlargedMapOpen] = useState(false);
  const [activeAccountTab, setActiveAccountTab] = useState<'hik-connect' | 'icsee' | 'yoosee' | 'stream'>('hik-connect');

  // Preview Mode: 'simulation' | 'video' | 'thermal'
  const [previewRenderMode, setPreviewRenderMode] = useState<'simulation' | 'video' | 'thermal'>('simulation');

  // Account login form states
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
    verificationCode: '',
    cloudId: '',
    region: 'Europe / Middle East Cluster',
  });
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });

  // Direct Stream form
  const [streamForm, setStreamForm] = useState({
    name: 'بث كاميرا IP حية مباشر',
    brand: 'hik-connect' as 'hik-connect' | 'icsee' | 'yoosee',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    location: 'قاعة المراقبة العامة',
    floorNum: 8,
  });

  // New Camera state
  const [newCam, setNewCam] = useState({
    name: '',
    brand: 'hik-connect' as 'hik-connect' | 'icsee' | 'yoosee',
    location: '',
    floorNum: 1,
    ipAddress: '192.168.1.150',
    port: 8000,
    resolution: '3840x2160 (4K)',
    fps: 30,
    bitrate: '4096 Kbps',
    cloudId: '',
    verificationCode: '',
    streamUrl: '',
  });

  // Ticking time for OSD
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const ms = now.getMilliseconds().toString().padStart(3, '0');
      setCurrentTimeStr(
        `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
        `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${ms}`
      );
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Filtered list
  const filteredCameras = cameras.filter((c) => {
    if (brandFilter === 'all') return true;
    return c.brand === brandFilter;
  });

  const activeCamera = cameras.find((c) => c.id === selectedCameraId) || cameras[0];

  // Auto-save cameras
  const updateAndSaveCameras = (updated: CctvCameraConfig[]) => {
    setCameras(updated);
    saveStoredCameras(updated);
  };

  // Auto-save accounts
  const updateAndSaveAccounts = (updated: Record<'hik-connect' | 'icsee' | 'yoosee', CctvAccountSession>) => {
    setAccounts(updated);
    saveStoredCctvAccounts(updated);
  };

  // Handle Hik-Connect Integration & Auth Bypass Execution
  const handleExecuteHikConnectBypass = async () => {
    if (!hikUsername.trim()) return;

    sound.playPacketPulse();
    setIsExecutingHikBypass(true);

    try {
      const res = await fetch('/api/cctv/hikconnect-bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: hikUsername,
          password: hikPassword,
          bypassMode: isAuthBypassActive,
          protocol: hikProtocol,
          verificationCode: hikVerificationCode,
        }),
      });

      const data = await res.json();

      if (data.logs) {
        setHikBypassLogs(data.logs);
      }

      if (data.success) {
        sound.playSuccess();

        // Update account session
        const updatedAccounts = {
          ...accounts,
          'hik-connect': {
            brand: 'hik-connect' as const,
            isConnected: true,
            username: `${hikUsername} ${isAuthBypassActive ? '(Bypassed)' : ''}`,
            emailOrPhone: hikUsername,
            loginTime: new Date().toLocaleTimeString('ar-EG'),
            token: data.sessionToken,
            serverRegion: 'Hik-Connect Cloud Gateway (ISUP 5.0)',
            deviceCount: (data.devices || []).length,
          },
        };
        updateAndSaveAccounts(updatedAccounts);

        // Merge imported cameras
        if (data.devices && data.devices.length > 0) {
          const existingIds = new Set(cameras.map((c) => c.id));
          const newDevices = data.devices.filter((d: CctvCameraConfig) => !existingIds.has(d.id));
          const mergedList = [...newDevices, ...cameras];
          updateAndSaveCameras(mergedList);
          if (newDevices.length > 0) {
            setSelectedCameraId(newDevices[0].id);
          }
        }

        // Set brand filter to hik-connect so user immediately sees them
        setBrandFilter('hik-connect');
      }
    } catch (err: any) {
      sound.playWarning();
      setHikBypassLogs((prev) => [
        ...prev,
        `[ERROR] فشل تنفيذ بروتوكول الاتصال: ${err.message || 'خطأ في الشبكة'}`
      ]);
    } finally {
      setIsExecutingHikBypass(false);
    }
  };

  // Handle Quick Fill for Brand Login
  const handleQuickFillAccount = (brand: 'hik-connect' | 'icsee' | 'yoosee') => {
    sound.playClick(650);
    if (brand === 'hik-connect') {
      setLoginForm({
        username: 'malek.hraibat@hikvision-cloud.com',
        password: 'HikPassword@2026',
        verificationCode: 'HIKSECURE99',
        cloudId: 'HIK-9928192-EU',
        region: 'Middle East & Europe Cluster',
      });
    } else if (brand === 'icsee') {
      setLoginForm({
        username: 'malek_icsee_engineer',
        password: 'XmCloudPass#2026',
        verificationCode: '',
        cloudId: 'd739284719284729',
        region: 'XM Global P2P Server',
      });
    } else {
      setLoginForm({
        username: 'user3c_9824128@yoosee.com',
        password: 'YooseePass#2026',
        verificationCode: '8849201',
        cloudId: '3C-8849201',
        region: 'CloudLinks Smart Cluster',
      });
    }
    setLoginFeedback({ status: 'idle', message: '' });
  };

  // Perform Cloud Login & Camera Sync
  const handlePerformLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      setLoginFeedback({ status: 'error', message: 'يرجى إدخال اسم المستخدم / البريد وكلمة المرور' });
      return;
    }

    setIsSubmittingLogin(true);
    setLoginFeedback({ status: 'loading', message: `جاري الاتصال بخوادم ${activeAccountTab.toUpperCase()} السحابية والتحقق من نفق P2P...` });
    sound.playPacketPulse();

    try {
      const response = await fetch('/api/cctv/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: activeAccountTab,
          username: loginForm.username,
          password: loginForm.password,
          verificationCode: loginForm.verificationCode,
          cloudId: loginForm.cloudId,
          region: loginForm.region,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل الاتصال بالخادم السحابي.');
      }

      // Update account session
      const updatedAccounts = {
        ...accounts,
        [activeAccountTab]: {
          brand: activeAccountTab,
          isConnected: true,
          username: loginForm.username,
          emailOrPhone: loginForm.username,
          loginTime: new Date().toLocaleDateString('ar-EG'),
          token: data.token,
          serverRegion: data.serverRegion,
          deviceCount: (data.devices || []).length,
        },
      };
      updateAndSaveAccounts(updatedAccounts);

      // Merge imported devices with cameras list (avoid duplicate IDs)
      if (data.devices && data.devices.length > 0) {
        const existingIds = new Set(cameras.map((c) => c.id));
        const newDevices = data.devices.filter((d: CctvCameraConfig) => !existingIds.has(d.id));
        const mergedList = [...newDevices, ...cameras];
        updateAndSaveCameras(mergedList);
        if (newDevices.length > 0) {
          setSelectedCameraId(newDevices[0].id);
        }
      }

      sound.playSuccess();
      setLoginFeedback({
        status: 'success',
        message: data.message || `تم تسجيل الدخول بنجاح إلى حساب ${activeAccountTab.toUpperCase()} ومزامنة الكاميرات!`,
      });

      setTimeout(() => {
        setIsAccountModalOpen(false);
        setLoginFeedback({ status: 'idle', message: '' });
      }, 1500);
    } catch (err: any) {
      sound.playWarning();
      setLoginFeedback({
        status: 'error',
        message: err.message || 'حدث خطأ أثناء محاولة تسجيل الدخول. يرجى التحقق من الاتصال بالشبكة.',
      });
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  // Add Direct Stream Camera
  const handleAddDirectStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamForm.streamUrl.trim() || !streamForm.name.trim()) return;

    sound.playClick(750);
    const created: CctvCameraConfig = {
      id: `cam-stream-${Date.now().toString(36)}`,
      name: streamForm.name,
      nameEn: `Live Stream: ${streamForm.name}`,
      brand: streamForm.brand,
      location: streamForm.location,
      resolution: '1920x1080 (Live HD Stream)',
      fps: 30,
      bitrate: '3500 Kbps',
      ptzSupported: true,
      nightVision: 'color',
      status: 'recording',
      floorNum: streamForm.floorNum,
      ipAddress: 'Stream URL / WebRTC',
      port: 554,
      streamUrl: streamForm.streamUrl,
    };

    const nextList = [created, ...cameras];
    updateAndSaveCameras(nextList);
    setSelectedCameraId(created.id);
    setIsAccountModalOpen(false);
    sound.playSuccess();
  };

  const handleAddCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCam.name.trim()) return;

    sound.playClick(750);
    const created: CctvCameraConfig = {
      id: `cam-${newCam.brand}-${Date.now().toString(36)}`,
      name: newCam.name,
      nameEn: `${newCam.brand.toUpperCase()} Camera - ${newCam.location}`,
      brand: newCam.brand,
      location: newCam.location || 'قاعة داخلية بالمجمع',
      resolution: newCam.resolution,
      fps: newCam.fps,
      bitrate: newCam.bitrate,
      ptzSupported: true,
      nightVision: 'infrared',
      status: 'online',
      floorNum: Number(newCam.floorNum),
      ipAddress: newCam.ipAddress,
      port: Number(newCam.port),
      cloudId: newCam.cloudId || undefined,
      verificationCode: newCam.verificationCode || undefined,
      streamUrl: newCam.streamUrl || undefined,
    };

    const nextList = [created, ...cameras];
    updateAndSaveCameras(nextList);
    setSelectedCameraId(created.id);
    setIsAddModalOpen(false);
    setNewCam({
      name: '',
      brand: 'hik-connect',
      location: '',
      floorNum: 1,
      ipAddress: '192.168.1.150',
      port: 8000,
      resolution: '3840x2160 (4K)',
      fps: 30,
      bitrate: '4096 Kbps',
      cloudId: '',
      verificationCode: '',
      streamUrl: '',
    });
  };

  const handleDeleteCamera = (id: string) => {
    if (cameras.length <= 1) return;
    sound.playClick(400);
    const updated = cameras.filter((c) => c.id !== id);
    updateAndSaveCameras(updated);
    if (selectedCameraId === id) {
      setSelectedCameraId(updated[0]?.id || '');
    }
  };

  const handleToggleNightVision = (camId: string, mode: 'normal' | 'infrared' | 'color' | 'thermal') => {
    sound.playClick(700);
    setActiveNightVision((prev) => ({ ...prev, [camId]: mode }));
  };

  const handleTriggerIntercom = () => {
    sound.playIntercom();
    setIsIntercomActive(!isIntercomActive);
  };

  const handleTriggerSiren = () => {
    sound.playSiren();
    setIsSirenActive(!isSirenActive);
  };

  // Capture simulated snapshot
  const handleTakeSnapshot = (cam: CctvCameraConfig) => {
    sound.playCameraClick();
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 640, 360);
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`[${cam.brand.toUpperCase()}] ${cam.name}`, 20, 40);
      ctx.fillStyle = '#10b981';
      ctx.font = '14px monospace';
      ctx.fillText(`TIME: ${currentTimeStr}`, 20, 70);
      ctx.fillText(`LOC: ${cam.location}`, 20, 95);
      ctx.fillText(`DEVCORE HIK-CONNECT SURVEILLANCE`, 20, 120);

      // grid lines
      ctx.strokeStyle = '#06b6d433';
      for (let x = 0; x < 640; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 360);
        ctx.stroke();
      }
      for (let y = 0; y < 360; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(640, y);
        ctx.stroke();
      }

      const dataUrl = canvas.toDataURL('image/png');
      setSnapshots((prev) => [
        {
          id: Date.now().toString(),
          camName: cam.name,
          time: new Date().toLocaleTimeString('ar-EG'),
          dataUrl,
        },
        ...prev.slice(0, 8),
      ]);
    }
  };

  const handlePtzMove = (dir: 'up' | 'down' | 'left' | 'right' | 'in' | 'out' | 'reset') => {
    sound.playClick(600);
    setPtzState((prev) => {
      switch (dir) {
        case 'up': return { ...prev, tilt: Math.min(prev.tilt + 10, 40) };
        case 'down': return { ...prev, tilt: Math.max(prev.tilt - 10, -40) };
        case 'left': return { ...prev, pan: prev.pan - 15 };
        case 'right': return { ...prev, pan: prev.pan + 15 };
        case 'in': return { ...prev, zoom: Math.min(prev.zoom + 0.3, 3) };
        case 'out': return { ...prev, zoom: Math.max(prev.zoom - 0.3, 1) };
        case 'reset': return { pan: 0, tilt: 0, zoom: 1 };
      }
    });
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden selection:bg-cyan-500 selection:text-white" dir="rtl">
      {/* Top Banner / Command Center Header */}
      <div className="bg-slate-900/95 border-b border-slate-800 px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-500 p-0.5 shadow-md shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Video className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-cyan-300 via-sky-200 to-white bg-clip-text text-transparent">
                مركز المراقبة والمعاينة الحية للكاميرات (CCTV Command Center)
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/80 border border-red-500/40 text-red-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                LIVE REC
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              معاينة فورية حية، تحكم PTZ، ووحدة اتصال متقدمة لبروتوكولات Hik-Connect مع تجاوز المصادقة
            </p>
          </div>
        </div>

        {/* Action Controls: Hik-Connect Module Button + Cloud Accounts + Grid + Add */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dedicated Hik-Connect Integration Module Trigger Button */}
          <button
            onClick={() => {
              sound.playClick(750);
              setIsHikModuleOpen(!isHikModuleOpen);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 border ${
              isHikModuleOpen 
                ? 'bg-rose-600 text-white border-rose-400 shadow-rose-500/30 ring-2 ring-rose-500/40' 
                : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border-rose-500/40 shadow-rose-950/50'
            }`}
            title="فتح وحدة اتصال وتكامل بروتوكولات Hik-Connect مع تجاوز المصادقة"
          >
            <Zap className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
            <span>وحدة اتصال Hik-Connect (تجاوز المصادقة)</span>
            {isAuthBypassActive && (
              <span className="px-1.5 py-0.2 rounded bg-rose-500/30 text-[9px] font-mono text-white">
                BYPASS ON
              </span>
            )}
          </button>

          {/* Cloud Accounts Login Button */}
          <button
            onClick={() => { sound.playClick(700); setIsAccountModalOpen(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/30 active:scale-95 border border-cyan-400/40"
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-200" />
            <span className="hidden sm:inline">تسجيل دخول الحسابات</span>
            <span className="sm:hidden">الحسابات</span>
          </button>

          {/* Grid Layout Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => { sound.playClick(600); setGridLayout('1x1'); }}
              className={`px-2 py-1 rounded-lg ${gridLayout === '1x1' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
              title="شاشة فردية مكبرة 1x1"
            >
              1×1
            </button>
            <button
              onClick={() => { sound.playClick(600); setGridLayout('2x2'); }}
              className={`px-2 py-1 rounded-lg ${gridLayout === '2x2' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
              title="تقسيم رباعي 2x2"
            >
              2×2
            </button>
            <button
              onClick={() => { sound.playClick(600); setGridLayout('3x3'); }}
              className={`px-2 py-1 rounded-lg ${gridLayout === '3x3' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
              title="تقسيم 9 شاشات 3x3"
            >
              3×3
            </button>
          </div>

          {/* Add Camera Button */}
          <button
            onClick={() => { sound.playClick(700); setIsAddModalOpen(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">إضافة كاميرا</span>
          </button>
        </div>
      </div>

      {/* Brand Filter Badges & Quick View Switcher Ribbon */}
      <div className="bg-slate-900/70 border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => { sound.playClick(600); setBrandFilter('all'); }}
            className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
              brandFilter === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            جميع الكاميرات ({cameras.length})
          </button>
          <button
            onClick={() => { sound.playClick(600); setBrandFilter('hik-connect'); }}
            className={`px-2.5 py-1 text-xs rounded-lg transition-all flex items-center gap-1.5 ${
              brandFilter === 'hik-connect' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Hik-Connect ({cameras.filter((c) => c.brand === 'hik-connect').length})
          </button>
          <button
            onClick={() => { sound.playClick(600); setBrandFilter('icsee'); }}
            className={`px-2.5 py-1 text-xs rounded-lg transition-all flex items-center gap-1.5 ${
              brandFilter === 'icsee' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            ICSee ({cameras.filter((c) => c.brand === 'icsee').length})
          </button>
          <button
            onClick={() => { sound.playClick(600); setBrandFilter('yoosee'); }}
            className={`px-2.5 py-1 text-xs rounded-lg transition-all flex items-center gap-1.5 ${
              brandFilter === 'yoosee' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Yoosee ({cameras.filter((c) => c.brand === 'yoosee').length})
          </button>
        </div>

        {/* Live Camera Preview Mode Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline">وضع المعاينة:</span>
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
            <button
              onClick={() => { sound.playClick(600); setPreviewRenderMode('simulation'); }}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                previewRenderMode === 'simulation' ? 'bg-cyan-500/25 text-cyan-300 font-bold' : 'text-slate-400'
              }`}
            >
              معاينة حية AI
            </button>
            <button
              onClick={() => { sound.playClick(600); setPreviewRenderMode('video'); }}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                previewRenderMode === 'video' ? 'bg-cyan-500/25 text-cyan-300 font-bold' : 'text-slate-400'
              }`}
            >
              تدفق فيديو Stream
            </button>
            <button
              onClick={() => { sound.playClick(600); setPreviewRenderMode('thermal'); }}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                previewRenderMode === 'thermal' ? 'bg-cyan-500/25 text-cyan-300 font-bold' : 'text-slate-400'
              }`}
            >
              كشف حراري
            </button>
          </div>
        </div>
      </div>

      {/* DEDICATED HIK-CONNECT INTEGRATION MODULE DRAWER / ACCORDION */}
      {isHikModuleOpen && (
        <div className="bg-slate-900 border-b border-rose-500/40 p-4 shadow-xl shadow-rose-950/30 transition-all animate-fadeIn">
          <div className="max-w-6xl mx-auto space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>وحدة اتصال وتكامل بروتوكولات Hik-Connect (Integration Module)</span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-mono">
                      v5.0 Enterprise
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400 font-mono">
                    معالجة بروتوكولات ISUP 5.0 و Hik-Connect Open API وحقول الدخول وتجاوز المصادقة لربط الكاميرات فورياً
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsHikModuleOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Protocol Selector + Credentials & Auth Bypass Fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
              {/* Protocol Choice */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  بروتوكول الاتصال (Protocol):
                </label>
                <select
                  value={hikProtocol}
                  onChange={(e) => setHikProtocol(e.target.value as any)}
                  className="w-full bg-slate-950 border border-rose-500/30 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-400 font-mono"
                >
                  <option value="ISUP_5_0">ISUP 5.0 (EHome Direct Gateway)</option>
                  <option value="OPEN_API_REST">Hik-Connect Cloud Open API (v3)</option>
                  <option value="DIGEST_RTSP">Hikvision Digest Auth (RTSP 554)</option>
                  <option value="EZVIZ_P2P">EZVIZ Encrypted Cloud Tunnel</option>
                </select>
              </div>

              {/* Username Input Field */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  اسم المستخدم (Username):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={hikUsername}
                    onChange={(e) => setHikUsername(e.target.value)}
                    placeholder="admin أو user@domain.com"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-rose-400 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                  <div className="absolute left-2 top-1.5 flex gap-1">
                    <button
                      type="button"
                      onClick={() => setHikUsername('admin')}
                      className="text-[9px] px-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                      title="استخدام admin الافتراضي"
                    >
                      admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setHikUsername('eng.malek')}
                      className="text-[9px] px-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                      title="استخدام المهندس مالك"
                    >
                      malek
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Input Field with Toggle */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  كلمة المرور (Password):
                </label>
                <div className="relative">
                  <input
                    type={showHikPassword ? 'text' : 'password'}
                    value={hikPassword}
                    onChange={(e) => setHikPassword(e.target.value)}
                    placeholder="كلمة المرور للمصادقة"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-rose-400 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowHikPassword(!showHikPassword)}
                    className="absolute left-2 top-2 text-slate-400 hover:text-slate-200"
                  >
                    {showHikPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Verification Code */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  رمز فك التشفير (Verification Code):
                </label>
                <input
                  type="text"
                  value={hikVerificationCode}
                  onChange={(e) => setHikVerificationCode(e.target.value)}
                  placeholder="رمز الكاميرا (6 خانات)"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-rose-400 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Bottom Row: Auth Bypass Toggle + Execute Button + Log Terminal */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
              {/* Bypass Mode Toggle Switch */}
              <div className="flex items-center gap-3 bg-slate-950/80 p-2 rounded-xl border border-slate-800 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick(650);
                    setIsAuthBypassActive(!isAuthBypassActive);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isAuthBypassActive 
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' 
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isAuthBypassActive ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>وضع تجاوز المصادقة (Auth Bypass Mode): {isAuthBypassActive ? 'مفعّل ✓' : 'معطّل'}</span>
                </button>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  {isAuthBypassActive 
                    ? 'يتم منح ترخيص فوري وتخطي تدقيق الشهادات 401 للوصول المباشر.' 
                    : 'يتم استخدام التحقق الكلاسيكي من كلمة المرور.'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleExecuteHikConnectBypass}
                  disabled={isExecutingHikBypass}
                  className="flex-1 md:flex-initial px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isExecutingHikBypass ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري الاتصال وتجاوز المصادقة...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>تجاوز المصادقة والاتصال الفوري (Authenticate & Connect)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Protocol Log Terminal Bar */}
            <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800 text-[10px] font-mono text-slate-300 max-h-24 overflow-y-auto space-y-1">
              <div className="text-slate-500 flex items-center justify-between pb-1 border-b border-slate-800/80">
                <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <Terminal className="w-3 h-3" />
                  سجل بروتوكول وحدة الاتصال Hik-Connect Handshake Console:
                </span>
                <span className="text-emerald-400">الحالة: متصل بنجاح 200 OK</span>
              </div>
              {hikBypassLogs.map((log, idx) => (
                <div key={idx} className={log.includes('[ERROR]') ? 'text-red-400' : log.includes('[BYPASS]') ? 'text-rose-300' : 'text-slate-300'}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Layout: Surveillance Feeds + Control Station */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left/Center Feeds Display */}
        <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
          {/* Grid Layout Container */}
          <div className={`grid gap-3 ${
            gridLayout === '1x1' 
              ? 'grid-cols-1' 
              : gridLayout === '2x2' 
              ? 'grid-cols-1 md:grid-cols-2' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}>
            {(gridLayout === '1x1' ? [activeCamera] : filteredCameras.slice(0, gridLayout === '2x2' ? 4 : 9)).map((cam) => {
              const nightMode = activeNightVision[cam.id] || cam.nightVision;
              const isSelected = cam.id === selectedCameraId;

              return (
                <div
                  key={cam.id}
                  onClick={() => {
                    sound.playClick(500);
                    setSelectedCameraId(cam.id);
                  }}
                  className={`group relative rounded-2xl overflow-hidden border transition-all duration-200 bg-slate-900 cursor-pointer shadow-lg ${
                    isSelected
                      ? 'border-cyan-400 ring-2 ring-cyan-500/30 shadow-cyan-950/60'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Camera Video Feed with Guaranteed Preview Display */}
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                    <div 
                      className={`absolute inset-0 transition-transform duration-300 ${
                        nightMode === 'infrared' 
                          ? 'grayscale contrast-125 brightness-90' 
                          : nightMode === 'thermal' 
                          ? 'invert hue-rotate-180 contrast-200' 
                          : nightMode === 'color' 
                          ? 'brightness-110 saturate-150' 
                          : ''
                      }`}
                      style={{
                        transform: isSelected 
                          ? `scale(${ptzState.zoom}) translate(${ptzState.pan * 0.2}px, ${ptzState.tilt * 0.2}px)` 
                          : 'none'
                      }}
                    >
                      {/* Guaranteed Live Surveillance Renderer */}
                      <CameraLivePreviewRenderer
                        cam={cam}
                        nightMode={nightMode}
                        previewMode={previewRenderMode}
                        currentTimeStr={currentTimeStr}
                        isSelected={isSelected}
                      />
                    </div>

                    {/* Scan Lines Overlay */}
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-20"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 1px, transparent 1px, transparent 2px)',
                        backgroundSize: '100% 2px',
                      }}
                    />

                    {/* AI Motion & Humanoid Bounding Box */}
                    {cam.status === 'motion' && (
                      <div className="absolute top-1/4 right-1/4 w-36 h-28 border-2 border-amber-400/90 rounded bg-amber-400/10 pointer-events-none flex flex-col justify-between p-1.5 animate-pulse shadow-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-amber-300 font-bold bg-amber-950/90 px-1.5 py-0.5 rounded">
                            [HUMANOID TARGET #402]
                          </span>
                          <span className="text-[8px] font-mono text-amber-200">
                            98.4%
                          </span>
                        </div>
                        <div className="text-[8px] font-mono text-amber-200 flex justify-between">
                          <span>X: 342 Y: 198</span>
                          <span>HIK-ACUSENSE</span>
                        </div>
                      </div>
                    )}

                    {/* OSD Header Overlay */}
                    <div className="absolute top-2 inset-x-2 flex items-center justify-between text-[11px] font-mono pointer-events-none drop-shadow">
                      <div className="flex items-center gap-1.5 bg-black/80 px-2 py-0.5 rounded-md border border-white/10 text-white">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        <span className="font-bold">REC</span>
                        <span className="text-slate-400">|</span>
                        <span>{cam.resolution.split(' ')[0]}</span>
                        <span className="text-slate-400">|</span>
                        <span>{cam.fps} FPS</span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-black/80 px-2 py-0.5 rounded-md border border-white/10 text-cyan-300 font-bold">
                        <span>{cam.brand.toUpperCase()}</span>
                        {cam.cloudId && (
                          <span className="text-[9px] text-slate-400 font-mono hidden sm:inline">
                            [{cam.cloudId}]
                          </span>
                        )}
                      </div>
                    </div>

                    {/* OSD Footer Overlay (Time + Camera Location) */}
                    <div className="absolute bottom-2 inset-x-2 flex items-end justify-between text-[10px] sm:text-[11px] font-mono pointer-events-none drop-shadow">
                      <div className="bg-black/85 px-2 py-1 rounded-md border border-white/10">
                        <div className="text-white font-bold">{cam.name}</div>
                        <div className="text-cyan-300 text-[10px]">{cam.location}</div>
                      </div>

                      <div className="bg-black/85 px-2 py-1 rounded-md border border-white/10 text-emerald-400 font-bold text-left">
                        <div>{currentTimeStr}</div>
                        <div className="text-[9px] text-slate-400 font-mono">
                          {cam.bitrate} • IP: {cam.ipAddress}
                        </div>
                      </div>
                    </div>

                    {/* Camera Action Hover Bar */}
                    <div className="absolute inset-x-0 bottom-12 p-2 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTakeSnapshot(cam);
                        }}
                        className="p-1.5 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-white text-xs flex items-center gap-1 shadow"
                        title="التقاط صورة Snapshot"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>لقطة</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleNightVision(
                            cam.id,
                            nightMode === 'infrared' ? 'color' : nightMode === 'color' ? 'normal' : 'infrared'
                          );
                        }}
                        className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-cyan-300 text-xs flex items-center gap-1 shadow"
                        title="تبديل وضع الرؤية الليلية"
                      >
                        <Moon className="w-3.5 h-3.5" />
                        <span>{nightMode === 'infrared' ? 'أشعة IR' : nightMode === 'color' ? 'ألوان ليلية' : 'نهاري'}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCameraId(cam.id);
                          setGridLayout('1x1');
                        }}
                        className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-white text-xs flex items-center gap-1 shadow"
                        title="تكبير الشاشة 1x1"
                      >
                        <Maximize className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Bottom Info Bar */}
                  <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        cam.status === 'recording' ? 'bg-emerald-400' : cam.status === 'motion' ? 'bg-amber-400 animate-ping' : 'bg-cyan-400'
                      }`} />
                      <span className="font-medium text-slate-200 truncate max-w-[140px] sm:max-w-[200px]">
                        {cam.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        طابق {cam.floorNum}
                      </span>
                      {cameras.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCamera(cam.id);
                          }}
                          className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                          title="حذف الكاميرا"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Snapshots Gallery Bar */}
          {snapshots.length > 0 && (
            <div className="mt-2 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  معرض اللقطات المحفوظة (Snapshots Gallery)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">حفظ تلقائي في الذاكرة</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {snapshots.map((s) => (
                  <div key={s.id} className="relative group shrink-0 w-32 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                    <img src={s.dataUrl} alt={s.camName} className="w-full h-18 object-cover" />
                    <div className="p-1 text-[9px] font-mono text-slate-300 truncate bg-slate-900/90">
                      {s.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Station: PTZ Joystick & Diagnostics Panel */}
        <div className="w-full lg:w-84 bg-slate-900/95 border-t lg:border-t-0 lg:border-r border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
          {/* Active Camera Header */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
              الكاميرا المحددة حالياً (Active Feed)
            </span>
            <div className="text-sm font-bold text-white truncate">{activeCamera?.name}</div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">{activeCamera?.location}</div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <span className="text-slate-500 block">البروتوكول:</span>
                <span className="font-bold text-cyan-300">{activeCamera?.brand.toUpperCase()} P2P</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <span className="text-slate-500 block">عنوان IP / Cloud:</span>
                <span className="font-bold text-emerald-400 truncate block">
                  {activeCamera?.cloudId ? activeCamera.cloudId : `${activeCamera?.ipAddress}:${activeCamera?.port}`}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Tactical Campus Mini-Map */}
          <TacticalCctvMiniMap
            cameras={cameras}
            selectedCameraId={selectedCameraId}
            onSelectCamera={(id) => {
              sound.playClick(750);
              setSelectedCameraId(id);
            }}
            ptzPan={ptzState.pan}
            onOpenEnlargedMap={() => {
              sound.playClick(700);
              setIsEnlargedMapOpen(true);
            }}
            onSwitchTo1x1={() => {
              sound.playClick(600);
              setGridLayout('1x1');
            }}
          />

          {/* PTZ Joystick Control Station */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                تحكم التوجيه والتقريب PTZ
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Z: {ptzState.zoom.toFixed(1)}x
              </span>
            </div>

            {/* Directional Pad */}
            <div className="relative w-36 h-36 mx-auto rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center p-2 shadow-inner">
              {/* Up */}
              <button
                onClick={() => handlePtzMove('up')}
                className="absolute top-1 p-2 rounded-full hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 active:scale-90 transition-all"
                title="إمالة لأعلى Tilt Up"
              >
                ▲
              </button>
              {/* Down */}
              <button
                onClick={() => handlePtzMove('down')}
                className="absolute bottom-1 p-2 rounded-full hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 active:scale-90 transition-all"
                title="إمالة لأسفل Tilt Down"
              >
                ▼
              </button>
              {/* Left */}
              <button
                onClick={() => handlePtzMove('left')}
                className="absolute right-1 p-2 rounded-full hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 active:scale-90 transition-all"
                title="تحريك لليمين Pan Right"
              >
                ►
              </button>
              {/* Right */}
              <button
                onClick={() => handlePtzMove('right')}
                className="absolute left-1 p-2 rounded-full hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 active:scale-90 transition-all"
                title="تحريك لليسار Pan Left"
              >
                ◄
              </button>

              {/* Center Reset */}
              <button
                onClick={() => handlePtzMove('reset')}
                className="w-10 h-10 rounded-full bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/40 text-[10px] font-bold text-cyan-300 flex items-center justify-center transition-all active:scale-95"
                title="إعادة ضبط التمركز"
              >
                RESET
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                onClick={() => handlePtzMove('in')}
                className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 active:scale-95 transition-all text-center"
              >
                تقريب + Zoom In
              </button>
              <button
                onClick={() => handlePtzMove('out')}
                className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 active:scale-95 transition-all text-center"
              >
                تبعيد - Zoom Out
              </button>
            </div>
          </div>

          {/* Interactive Tools: Intercom & Siren */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-300 block mb-1">
              وظائف الاستجابة والتواصل الذكي
            </span>

            {/* Two-Way Intercom */}
            <button
              onClick={handleTriggerIntercom}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                isIntercomActive
                  ? 'bg-emerald-600 border-emerald-400 text-white animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-emerald-300'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{isIntercomActive ? 'الميكروفون مفتوح (جاري التحدث...)' : 'تحدث عبر إنتركم الكاميرا (Intercom)'}</span>
            </button>

            {/* Siren Alarm */}
            <button
              onClick={handleTriggerSiren}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                isSirenActive
                  ? 'bg-red-600 border-red-400 text-white animate-bounce'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-red-400'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{isSirenActive ? 'صفارة الإنذار نشطة (إيقاف)' : 'إطلاق صفارة إنذار أمنية (Siren Alert)'}</span>
            </button>
          </div>

          {/* Quick Hik-Connect Integration Shortcut */}
          <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-[11px] text-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                حالة بروتوكول Hik-Connect
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${isAuthBypassActive ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'}`}>
                {isAuthBypassActive ? 'BYPASS ACTIVE' : 'STANDARD'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              المستخدم: <strong className="text-white">{hikUsername}</strong> | البروتوكول: <strong className="text-rose-300">{hikProtocol}</strong>
            </p>
            <button
              onClick={() => {
                sound.playClick(650);
                setIsHikModuleOpen(true);
              }}
              className="w-full py-1.5 rounded-xl bg-rose-900/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-200 text-xs font-bold transition-all text-center"
            >
              إدارة وحدة الاتصال وتجاوز المصادقة
            </button>
          </div>
        </div>
      </div>

      {/* CLOUD ACCOUNTS LOGIN & SYNC MODAL */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl relative my-8" dir="rtl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-600 to-indigo-600 p-0.5">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>بوابة تسجيل الدخول لمنظومات الكاميرات السحابية</span>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    ربط حسابات Hik-Connect و ICSee و Yoosee واستدعاء الكاميرات تلقائياً
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick(400);
                  setIsAccountModalOpen(false);
                  setLoginFeedback({ status: 'idle', message: '' });
                }}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Service Tabs */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Tab 1: Hik-Connect */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick(600);
                  setActiveAccountTab('hik-connect');
                  setLoginFeedback({ status: 'idle', message: '' });
                }}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col gap-1.5 ${
                  activeAccountTab === 'hik-connect'
                    ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/40 text-rose-200'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Hik-Connect</span>
                  <span className={`w-2 h-2 rounded-full ${accounts['hik-connect'].isConnected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Hikvision Cloud / EZVIZ</span>
              </button>

              {/* Tab 2: ICSee */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick(600);
                  setActiveAccountTab('icsee');
                  setLoginFeedback({ status: 'idle', message: '' });
                }}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col gap-1.5 ${
                  activeAccountTab === 'icsee'
                    ? 'bg-sky-950/40 border-sky-500/60 shadow-lg shadow-sky-950/40 text-sky-200'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">ICSee (XM)</span>
                  <span className={`w-2 h-2 rounded-full ${accounts['icsee'].isConnected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Xiongmai P2P Cloud</span>
              </button>

              {/* Tab 3: Yoosee */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick(600);
                  setActiveAccountTab('yoosee');
                  setLoginFeedback({ status: 'idle', message: '' });
                }}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col gap-1.5 ${
                  activeAccountTab === 'yoosee'
                    ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/40 text-amber-200'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Yoosee (3C)</span>
                  <span className={`w-2 h-2 rounded-full ${accounts['yoosee'].isConnected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">CloudLinks Goke P2P</span>
              </button>

              {/* Tab 4: Direct Stream */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick(600);
                  setActiveAccountTab('stream');
                  setLoginFeedback({ status: 'idle', message: '' });
                }}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col gap-1.5 ${
                  activeAccountTab === 'stream'
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/40 text-cyan-200'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">بث مباشر RTSP/HLS</span>
                  <Tv className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">رابط تدفق مباشر Live URL</span>
              </button>
            </div>

            {/* Login Tab Content */}
            {activeAccountTab !== 'stream' ? (
              <form onSubmit={handlePerformLogin} className="mt-5 space-y-4">
                {/* Account Status Info Box */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${accounts[activeAccountTab].isConnected ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                    <span className="text-xs font-bold text-white">
                      حالة الحساب: {accounts[activeAccountTab].isConnected ? `متصل (${accounts[activeAccountTab].username})` : 'غير متصل حالياً'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickFillAccount(activeAccountTab)}
                    className="px-2.5 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono hover:bg-cyan-900/60 transition-all flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>تعبئة سريعة تجريبية (Quick Fill)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      {activeAccountTab === 'hik-connect' 
                        ? 'اسم مستخدم / بريد Hik-Connect:' 
                        : activeAccountTab === 'icsee'
                        ? 'حساب ICSee (هاتف أو بريد):'
                        : 'معرف Yoosee (3C ID أو بريد):'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={
                        activeAccountTab === 'hik-connect' 
                          ? 'user@domain.com أو +966500000000' 
                          : activeAccountTab === 'icsee'
                          ? 'icsee_account_id'
                          : '3C ID: 8849201'
                      }
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      كلمة المرور (Password):
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      {activeAccountTab === 'hik-connect' 
                        ? 'رمز التحقق الخاص بالكاميرا (Verification Code):' 
                        : activeAccountTab === 'icsee'
                        ? 'معرف السحابة Cloud ID / GID:'
                        : 'كلمة مرور البث RTSP Password:'}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        activeAccountTab === 'hik-connect' 
                          ? 'رمز مكون من 6 خانات (على ملصق الكاميرا)' 
                          : activeAccountTab === 'icsee'
                          ? '16 خانة مثلاً d739284719284729'
                          : 'كلمة مرور الجهاز في تطبيق Yoosee'
                      }
                      value={activeAccountTab === 'hik-connect' ? loginForm.verificationCode : loginForm.cloudId}
                      onChange={(e) => {
                        if (activeAccountTab === 'hik-connect') {
                          setLoginForm({ ...loginForm, verificationCode: e.target.value });
                        } else {
                          setLoginForm({ ...loginForm, cloudId: e.target.value });
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      سيرفر السحابة الإقليمي (Cloud Region):
                    </label>
                    <select
                      value={loginForm.region}
                      onChange={(e) => setLoginForm({ ...loginForm, region: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    >
                      <option value="Middle East & Europe Cluster">الشرق الأوسط وأوروبا (EU/ME)</option>
                      <option value="Global P2P Cluster">العالمي (Global Multi-Region)</option>
                      <option value="Asia Pacific & China Server">آسيا والمحيط الهادئ</option>
                      <option value="North America Cloud">أمريكا الشمالية</option>
                    </select>
                  </div>
                </div>

                {/* Feedback Message */}
                {loginFeedback.message && (
                  <div className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                    loginFeedback.status === 'success'
                      ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                      : loginFeedback.status === 'error'
                      ? 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
                      : 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300'
                  }`}>
                    {loginFeedback.status === 'loading' && <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />}
                    {loginFeedback.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {loginFeedback.status === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                    <span>{loginFeedback.message}</span>
                  </div>
                )}

                {/* Submit Actions */}
                <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>تشفير E2EE وحفظ بيانات الحساب تلقائياً في المتصفح</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAccountModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                    >
                      إغلاق
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingLogin}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/30 flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmittingLogin ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>جاري المزامنة...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>تسجيل الدخول ومزامنة الكاميرات فورياً</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* DIRECT STREAM (RTSP/HLS/MP4) TAB */
              <form onSubmit={handleAddDirectStream} className="mt-5 space-y-4">
                <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200">
                  <span className="font-bold block mb-1">إضافة رابط بث مباشر مخصص (Direct Stream Player):</span>
                  <span>يمكنك إدخال رابط بث فيديو مباشر (RTSP Bridge / HLS .m3u8 / MP4 Feed / WebRTC) لعرض الكاميرا الحقيقية مباشرة داخل المنظومة.</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      اسم تدفق الكاميرا:
                    </label>
                    <input
                      type="text"
                      required
                      value={streamForm.name}
                      onChange={(e) => setStreamForm({ ...streamForm, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      رابط البث المباشر (Stream URL - HLS / MP4 / RTSP):
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://.../stream.m3u8 أو https://.../camera_live.mp4"
                      value={streamForm.streamUrl}
                      onChange={(e) => setStreamForm({ ...streamForm, streamUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        النوع / البروتوكول:
                      </label>
                      <select
                        value={streamForm.brand}
                        onChange={(e) => setStreamForm({ ...streamForm, brand: e.target.value as any })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                      >
                        <option value="hik-connect">Hik-Connect RTSP</option>
                        <option value="icsee">ICSee XM Stream</option>
                        <option value="yoosee">Yoosee 3C Stream</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        الموقع:
                      </label>
                      <input
                        type="text"
                        value={streamForm.location}
                        onChange={(e) => setStreamForm({ ...streamForm, location: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAccountModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20"
                  >
                    إضافة وبدء البث المباشر فورياً
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Manual Add Camera Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl" dir="rtl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-cyan-400" />
                <span>إضافة كاميرا جديدة للمنظومة</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCamera} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  اسم الكاميرا:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: كاميرا ممر التشفير والسيرفرات"
                  value={newCam.name}
                  onChange={(e) => setNewCam({ ...newCam, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    البروتوكول / النظام:
                  </label>
                  <select
                    value={newCam.brand}
                    onChange={(e) => setNewCam({ ...newCam, brand: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="hik-connect">Hik-Connect</option>
                    <option value="icsee">ICSee</option>
                    <option value="yoosee">Yoosee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    الطابق بالمجمع:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newCam.floorNum}
                    onChange={(e) => setNewCam({ ...newCam, floorNum: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  الموقع والمكان:
                </label>
                <input
                  type="text"
                  placeholder="مثال: الطابق 7 - جناح إدارة التشفير"
                  value={newCam.location}
                  onChange={(e) => setNewCam({ ...newCam, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    عنوان IP أو Cloud ID:
                  </label>
                  <input
                    type="text"
                    value={newCam.ipAddress}
                    onChange={(e) => setNewCam({ ...newCam, ipAddress: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    المنفذ RTSP Port:
                  </label>
                  <input
                    type="number"
                    value={newCam.port}
                    onChange={(e) => setNewCam({ ...newCam, port: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  رابط بث فيديو مباشر (اختياري - HLS / MP4 Stream URL):
                </label>
                <input
                  type="url"
                  placeholder="https://.../stream.mp4"
                  value={newCam.streamUrl}
                  onChange={(e) => setNewCam({ ...newCam, streamUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20"
                >
                  حفظ وإضافة الكاميرا تلقائياً
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enlarged Tactical Campus Blueprint Modal */}
      {isEnlargedMapOpen && (
        <EnlargedTacticalMapModal
          cameras={cameras}
          selectedCameraId={selectedCameraId}
          onSelectCamera={(id) => {
            sound.playClick(750);
            setSelectedCameraId(id);
          }}
          onClose={() => {
            sound.playClick(400);
            setIsEnlargedMapOpen(false);
          }}
          ptzPan={ptzState.pan}
          onSwitchTo1x1={() => {
            sound.playClick(600);
            setGridLayout('1x1');
            setIsEnlargedMapOpen(false);
          }}
        />
      )}
    </div>
  );
}

// GUARANTEED LIVE CAMERA PREVIEW RENDERER COMPONENT
// Combines real video stream playback with rich simulated high-definition surveillance scene
function CameraLivePreviewRenderer({
  cam,
  nightMode,
  previewMode,
  currentTimeStr,
  isSelected,
}: {
  cam: CctvCameraConfig;
  nightMode: string;
  previewMode: 'simulation' | 'video' | 'thermal';
  currentTimeStr: string;
  isSelected: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // If user selected video mode and streamUrl exists and has no error
  const shouldTryVideo = (previewMode === 'video' || !!cam.streamUrl) && !videoError && !!cam.streamUrl;

  useEffect(() => {
    // Reset video state when camera or stream changes
    setVideoError(false);
    setVideoLoaded(false);
  }, [cam.streamUrl, cam.id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      // Base background color scheme based on brand and night vision
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      if (nightMode === 'infrared') {
        bgGrad.addColorStop(0, '#0a0a0a');
        bgGrad.addColorStop(1, '#1c1c1c');
      } else if (nightMode === 'thermal' || previewMode === 'thermal') {
        bgGrad.addColorStop(0, '#050515');
        bgGrad.addColorStop(0.5, '#1e0533');
        bgGrad.addColorStop(1, '#3b0d25');
      } else {
        // High-tech deep surveillance tone
        if (cam.brand === 'hik-connect') {
          bgGrad.addColorStop(0, '#050811');
          bgGrad.addColorStop(1, '#0e172a');
        } else if (cam.brand === 'icsee') {
          bgGrad.addColorStop(0, '#040b17');
          bgGrad.addColorStop(1, '#0a1d37');
        } else {
          bgGrad.addColorStop(0, '#0d0c08');
          bgGrad.addColorStop(1, '#1c1912');
        }
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Floor Perspective Grid
      ctx.strokeStyle = nightMode === 'infrared' ? 'rgba(255,255,255,0.12)' : 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 1;
      for (let i = -w * 0.5; i <= w * 1.5; i += 40) {
        ctx.beginPath();
        ctx.moveTo(w * 0.5 + (i - w * 0.5) * 0.2, h * 0.45);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let y = h * 0.5; y < h; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Render Architectural Elements (Server Racks, Data Corridors, Perimeter)
      const rackCount = 6;
      for (let r = 0; r < rackCount; r++) {
        const rx = 35 + r * 55;
        const ry = h * 0.32;
        const rw = 32;
        const rh = h * 0.52;

        ctx.fillStyle = nightMode === 'infrared' ? '#181818' : '#091124';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = nightMode === 'infrared' ? '#333' : '#1e293b';
        ctx.strokeRect(rx, ry, rw, rh);

        // Blinking Server Activity LEDs
        for (let led = 0; led < 7; led++) {
          const ledY = ry + 10 + led * 14;
          const isBlinking = (frame + r * 7 + led * 11) % 24 > 12;

          ctx.fillStyle = isBlinking
            ? (nightMode === 'infrared' ? '#ffffff' : (led % 2 === 0 ? '#10b981' : '#06b6d4'))
            : (nightMode === 'infrared' ? '#2c2c2c' : '#064e3b');
          ctx.beginPath();
          ctx.arc(rx + rw * 0.3, ledY, 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = (frame + r * 5) % 36 > 18
            ? (nightMode === 'infrared' ? '#ffffff' : '#38bdf8')
            : '#083344';
          ctx.beginPath();
          ctx.arc(rx + rw * 0.7, ledY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Animated Patrol / Person Silhouette in surveillance field
      const patrolX = (w * 0.2 + (frame * 0.9) % (w * 0.6));
      const patrolY = h * 0.65;
      
      // Target Bounding Box
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(patrolX - 16, patrolY - 38, 32, 48);

      // Target Corner Brackets
      const bracketLen = 6;
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(patrolX - 16, patrolY - 38 + bracketLen);
      ctx.lineTo(patrolX - 16, patrolY - 38);
      ctx.lineTo(patrolX - 16 + bracketLen, patrolY - 38);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(patrolX + 16 - bracketLen, patrolY - 38);
      ctx.lineTo(patrolX + 16, patrolY - 38);
      ctx.lineTo(patrolX + 16, patrolY - 38 + bracketLen);
      ctx.stroke();

      // Target Label
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(patrolX - 16, patrolY - 52, 54, 12);
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('TARGET #01', patrolX - 14, patrolY - 43);

      // Person wireframe
      ctx.fillStyle = nightMode === 'infrared' ? '#e5e5e5' : '#10b98188';
      ctx.beginPath();
      ctx.arc(patrolX, patrolY - 26, 5, 0, Math.PI * 2); // Head
      ctx.fill();
      ctx.fillRect(patrolX - 6, patrolY - 20, 12, 18); // Body

      // Surveillance Center Crosshair
      const cx = w * 0.5;
      const cy = h * 0.5;
      ctx.strokeStyle = nightMode === 'infrared' ? 'rgba(255,255,255,0.25)' : 'rgba(6, 182, 212, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy); ctx.lineTo(cx - 5, cy);
      ctx.moveTo(cx + 5, cy); ctx.lineTo(cx + 20, cy);
      ctx.moveTo(cx, cy - 20); ctx.lineTo(cx, cy - 5);
      ctx.moveTo(cx, cy + 5); ctx.lineTo(cx, cy + 20);
      ctx.stroke();

      // Optical circle
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.stroke();

      // Lens dust & particles
      ctx.fillStyle = nightMode === 'infrared' ? 'rgba(255,255,255,0.4)' : 'rgba(6,182,212,0.4)';
      for (let p = 0; p < 6; p++) {
        const px = (frame * 0.7 + p * 80) % w;
        const py = (frame * 0.3 + p * 50) % h;
        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [cam.id, cam.floorNum, cam.brand, nightMode, previewMode]);

  return (
    <div className="relative w-full h-full">
      {/* If Video Stream is available and requested, try video element */}
      {shouldTryVideo && (
        <video
          src={cam.streamUrl}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Guaranteed Canvas Simulation (Visible always if video is not loaded or as primary preview) */}
      <canvas 
        ref={canvasRef} 
        width={480} 
        height={270} 
        className="w-full h-full object-cover"
      />
    </div>
  );
}

// ---------------------------------------------------------
// TACTICAL MINI-MAP COMPONENT & COORDINATES ENGINE
// ---------------------------------------------------------

export interface CameraMapCoordinate {
  x: number;
  y: number;
  sector: string;
  defaultAngle: number;
}

export function getCameraCoordinates(cam: CctvCameraConfig, index: number): CameraMapCoordinate {
  const name = cam.name || '';
  const loc = cam.location || '';
  
  if (cam.floorNum === 8 || name.includes('سيرفر') || name.includes('Control') || loc.includes('8')) {
    return { x: 50, y: 38, sector: 'جناح السيرفرات NVR (قطاع 08)', defaultAngle: 180 };
  }
  if (cam.floorNum === 1 || name.includes('بوابة') || name.includes('مدخل') || name.includes('Gate') || loc.includes('1')) {
    return { x: 26, y: 78, sector: 'البوابة البيومترية والبهو (قطاع 01)', defaultAngle: 45 };
  }
  if (cam.floorNum === 7 || name.includes('تشفير') || name.includes('Vault') || loc.includes('7')) {
    return { x: 76, y: 40, sector: 'قبو التشفير HSM (قطاع 07)', defaultAngle: 225 };
  }
  if (cam.floorNum === 9 || name.includes('ذكاء') || name.includes('AI') || name.includes('عصبية') || loc.includes('9')) {
    return { x: 30, y: 32, sector: 'مختبرات الذكاء الاصطناعي (قطاع 09)', defaultAngle: 135 };
  }
  if (cam.floorNum === 10 || name.includes('سطح') || name.includes('رادار') || name.includes('Helipad') || loc.includes('10')) {
    return { x: 50, y: 16, sector: 'منصة الرادار ومهبط المروحية (قطاع 10)', defaultAngle: 270 };
  }
  if (cam.floorNum === 2 || name.includes('طاقة') || name.includes('شبك') || name.includes('Power') || loc.includes('2')) {
    return { x: 74, y: 74, sector: 'محطة الطاقة وشبكات الفايبر (قطاع 02)', defaultAngle: 315 };
  }
  if (name.includes('مواقف') || name.includes('خارج') || loc.includes('محيط')) {
    return { x: 16, y: 52, sector: 'المحيط الخارجي والمواقف الغربية', defaultAngle: 90 };
  }

  const positions = [
    { x: 38, y: 55, sector: 'الممر الشرقي (قطاع 04)', defaultAngle: 90 },
    { x: 62, y: 55, sector: 'الممر الغربي (قطاع 05)', defaultAngle: 270 },
    { x: 50, y: 62, sector: 'القاعة المركزية (قطاع 03)', defaultAngle: 0 },
    { x: 35, y: 70, sector: 'المصاعد الذكية (قطاع 01-B)', defaultAngle: 45 },
    { x: 65, y: 25, sector: 'مختبر الشبكات (قطاع 08-B)', defaultAngle: 210 },
  ];
  const p = positions[index % positions.length];
  return { ...p, sector: `طابق ${cam.floorNum} - ${cam.location || 'مرفق تقني'}` };
}

// Interactive Tactical Mini-Map on Sidebar
function TacticalCctvMiniMap({
  cameras,
  selectedCameraId,
  onSelectCamera,
  ptzPan,
  onOpenEnlargedMap,
  onSwitchTo1x1,
}: {
  cameras: CctvCameraConfig[];
  selectedCameraId: string;
  onSelectCamera: (id: string) => void;
  ptzPan: number;
  onOpenEnlargedMap: () => void;
  onSwitchTo1x1: () => void;
}) {
  const [selectedFloor, setSelectedFloor] = useState<'all' | number>('all');
  const [hoveredCamId, setHoveredCamId] = useState<string | null>(null);

  const displayedCameras = cameras.filter((c) => {
    if (selectedFloor === 'all') return true;
    return c.floorNum === selectedFloor;
  });

  const activeCam = cameras.find((c) => c.id === selectedCameraId) || cameras[0];
  const activeCoords = activeCam ? getCameraCoordinates(activeCam, 0) : null;

  return (
    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-2.5">
      {/* Mini-Map Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <Map className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-bold text-white">
            خريطة الموقع المصغرة (Mini-Map)
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </div>

        <button
          onClick={onOpenEnlargedMap}
          className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition-colors"
          title="تكبير الخريطة التكتيكية للشاشة الكاملة"
        >
          <Maximize className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floor Selector Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-mono scrollbar-none">
        <button
          onClick={() => setSelectedFloor('all')}
          className={`px-2 py-0.5 rounded-md transition-all whitespace-nowrap ${
            selectedFloor === 'all' 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' 
              : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          الكل ({cameras.length})
        </button>
        <button
          onClick={() => setSelectedFloor(1)}
          className={`px-1.5 py-0.5 rounded-md transition-all whitespace-nowrap ${
            selectedFloor === 1 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          ط 1 المدخل
        </button>
        <button
          onClick={() => setSelectedFloor(7)}
          className={`px-1.5 py-0.5 rounded-md transition-all whitespace-nowrap ${
            selectedFloor === 7 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          ط 7 التشفير
        </button>
        <button
          onClick={() => setSelectedFloor(8)}
          className={`px-1.5 py-0.5 rounded-md transition-all whitespace-nowrap ${
            selectedFloor === 8 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          ط 8 السيرفرات
        </button>
        <button
          onClick={() => setSelectedFloor(9)}
          className={`px-1.5 py-0.5 rounded-md transition-all whitespace-nowrap ${
            selectedFloor === 9 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          ط 9 الذكاء
        </button>
        <button
          onClick={() => setSelectedFloor(10)}
          className={`px-1.5 py-0.5 rounded-md transition-all whitespace-nowrap ${
            selectedFloor === 10 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          ط 10 السطح
        </button>
      </div>

      {/* Blueprint Visual Canvas with Live Camera Markers */}
      <div className="relative aspect-[16/11] w-full rounded-xl bg-slate-900/90 border border-cyan-500/25 overflow-hidden select-none shadow-inner">
        {/* Tactical Grid Background */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(6,182,212,0.18) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6,182,212,0.18) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Architectural Schematic Layout Drawing (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 275">
          {/* Outer Perimeter Wall */}
          <rect x="25" y="20" width="350" height="235" rx="14" fill="none" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" strokeDasharray="5 5" />
          
          {/* Main Campus Central Tower */}
          <rect x="120" y="65" width="160" height="145" rx="8" fill="rgba(15, 23, 42, 0.7)" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1.5" />
          
          {/* North Wing: Server Room NVR */}
          <rect x="150" y="30" width="100" height="45" rx="4" fill="rgba(244, 63, 94, 0.08)" stroke="rgba(244, 63, 94, 0.35)" strokeWidth="1.2" />
          <text x="200" y="52" fill="rgba(244, 63, 94, 0.7)" fontSize="9" textAnchor="middle" fontFamily="monospace">قطاع 08: السيرفرات NVR</text>
          
          {/* West Wing: AI Neural Labs */}
          <rect x="45" y="70" width="85" height="65" rx="4" fill="rgba(14, 165, 233, 0.08)" stroke="rgba(14, 165, 233, 0.35)" strokeWidth="1.2" />
          <text x="87" y="105" fill="rgba(14, 165, 233, 0.7)" fontSize="8.5" textAnchor="middle" fontFamily="monospace">قطاع 09: الذكاء الاصطناعي</text>

          {/* East Wing: HSM Cryptographic Vault */}
          <rect x="270" y="70" width="85" height="65" rx="4" fill="rgba(168, 85, 247, 0.08)" stroke="rgba(168, 85, 247, 0.35)" strokeWidth="1.2" />
          <text x="312" y="105" fill="rgba(168, 85, 247, 0.7)" fontSize="8.5" textAnchor="middle" fontFamily="monospace">قطاع 07: قبو التشفير</text>

          {/* South Gate: Biometric Entrance & Lobby */}
          <rect x="145" y="200" width="110" height="45" rx="4" fill="rgba(16, 185, 129, 0.08)" stroke="rgba(16, 185, 129, 0.35)" strokeWidth="1.2" />
          <text x="200" y="226" fill="rgba(16, 185, 129, 0.7)" fontSize="9" textAnchor="middle" fontFamily="monospace">قطاع 01: البوابة والمدخل</text>

          {/* Helipad Marking on Center */}
          <circle cx="200" cy="135" r="24" fill="none" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1" strokeDasharray="3 3" />
          <text x="200" y="140" fill="rgba(245, 158, 11, 0.5)" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="monospace">H</text>

          {/* Campus Crosshairs */}
          <line x1="200" y1="10" x2="200" y2="265" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="0.8" />
          <line x1="15" y1="135" x2="385" y2="135" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="0.8" />
        </svg>

        {/* Rotating Radar Sweep Beam Line */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="w-[140%] h-[140%] rounded-full border border-cyan-500/10 pointer-events-none radar-sweep-beam flex items-center justify-center">
            <div className="w-1/2 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/40 to-cyan-300 ml-auto" />
          </div>
        </div>

        {/* Interactive Camera Markers on Map */}
        {displayedCameras.map((cam, idx) => {
          const coords = getCameraCoordinates(cam, idx);
          const isSelected = cam.id === selectedCameraId;
          const isHovered = cam.id === hoveredCamId;

          const brandDotClass = 
            cam.brand === 'hik-connect' 
              ? 'bg-rose-500 border-rose-200 text-rose-200' 
              : cam.brand === 'icsee'
              ? 'bg-sky-400 border-sky-100 text-sky-200'
              : 'bg-amber-400 border-amber-100 text-amber-200';

          return (
            <div
              key={cam.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectCamera(cam.id);
              }}
              onMouseEnter={() => setHoveredCamId(cam.id)}
              onMouseLeave={() => setHoveredCamId(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
              style={{
                left: `${coords.x}%`,
                top: `${coords.y}%`,
              }}
            >
              {/* Field-of-View Direction Cone */}
              {isSelected && (
                <div
                  className="absolute pointer-events-none origin-center"
                  style={{
                    transform: `rotate(${coords.defaultAngle + ptzPan}deg)`,
                    width: '64px',
                    height: '64px',
                    top: '-26px',
                    left: '-26px',
                  }}
                >
                  <div 
                    className="w-full h-full opacity-45"
                    style={{
                      clipPath: 'polygon(50% 50%, 15% 0%, 85% 0%)',
                      background: cam.brand === 'hik-connect' 
                        ? 'linear-gradient(to top, rgba(244,63,94,0.7), rgba(244,63,94,0.05))' 
                        : 'linear-gradient(to top, rgba(6,182,212,0.7), rgba(6,182,212,0.05))',
                    }}
                  />
                </div>
              )}

              {/* Glowing Active Ring Beacon */}
              {isSelected && (
                <span className="absolute -inset-2 rounded-full border border-cyan-400 animate-ping pointer-events-none" />
              )}

              {/* Pin Icon / Dot */}
              <div
                className={`relative w-4 h-4 rounded-full border-2 flex items-center justify-center transition-transform shadow-md ${brandDotClass} ${
                  isSelected ? 'scale-125 ring-2 ring-cyan-400 shadow-cyan-400/80 z-20' : 'hover:scale-125 shadow-black/80'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
              </div>

              {/* Floating Tooltip Card */}
              <div className={`absolute bottom-6 right-1/2 translate-x-1/2 px-2.5 py-1.5 rounded-xl bg-slate-950/95 border border-cyan-500/50 text-[10px] whitespace-nowrap shadow-xl pointer-events-none z-30 transition-all ${
                isSelected || isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
              }`}>
                <div className="font-bold text-white flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${cam.brand === 'hik-connect' ? 'bg-rose-500' : cam.brand === 'icsee' ? 'bg-sky-400' : 'bg-amber-400'}`} />
                  <span>{cam.name}</span>
                </div>
                <div className="text-slate-400 font-mono text-[9px] mt-0.5">
                  طابق {cam.floorNum} • {cam.brand.toUpperCase()}
                </div>
                <div className="text-cyan-300 font-mono text-[8px] mt-0.5 font-bold">
                  انقر للانتقال والمعاينة الحية
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini-Map Footer: Active Target Readout & Quick Jump */}
      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[10px] font-mono">
        <div className="truncate max-w-[170px]">
          <div className="text-slate-400 flex items-center gap-1">
            <Crosshair className="w-3 h-3 text-cyan-400" />
            <span className="text-white font-bold truncate">{activeCam?.name}</span>
          </div>
          <div className="text-cyan-300 text-[9px] truncate">
            {activeCoords?.sector}
          </div>
        </div>

        <button
          onClick={onSwitchTo1x1}
          className="px-2 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 font-bold transition-all whitespace-nowrap"
          title="معاينة فردية مكبرة 1x1 للكاميرا المحددة"
        >
          معاينة مكبرة
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// ENLARGED TACTICAL CAMPUS BLUEPRINT MODAL
// ---------------------------------------------------------

function EnlargedTacticalMapModal({
  cameras,
  selectedCameraId,
  onSelectCamera,
  onClose,
  ptzPan,
  onSwitchTo1x1,
}: {
  cameras: CctvCameraConfig[];
  selectedCameraId: string;
  onSelectCamera: (id: string) => void;
  onClose: () => void;
  ptzPan: number;
  onSwitchTo1x1: () => void;
}) {
  const [selectedFloor, setSelectedFloor] = useState<'all' | number>('all');
  const activeCam = cameras.find((c) => c.id === selectedCameraId) || cameras[0];
  const activeCoords = activeCam ? getCameraCoordinates(activeCam, 0) : null;

  const displayedCameras = cameras.filter((c) => {
    if (selectedFloor === 'all') return true;
    return c.floorNum === selectedFloor;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5" dir="rtl">
      <div className="w-full max-w-5xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center">
              <Map className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>المخطط الهندسي التكتيكي وتوزيع الكاميرات (Campus Master Blueprint)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                استعراض مواقع الكاميرات جغرافياً بالمجمع الهندسي مع إمكانية النقر والانتقال المباشر للبث
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Floor Selection Bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
            <span className="text-slate-400 ml-2">تصفية الطابق:</span>
            <button
              onClick={() => setSelectedFloor('all')}
              className={`px-3 py-1 rounded-xl transition-all ${
                selectedFloor === 'all' 
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              كافة الطوابق والمحيط ({cameras.length})
            </button>
            <button
              onClick={() => setSelectedFloor(1)}
              className={`px-3 py-1 rounded-xl transition-all ${
                selectedFloor === 1 ? 'bg-cyan-600 text-white font-bold shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              طابق 1 (البوابة والبهو)
            </button>
            <button
              onClick={() => setSelectedFloor(7)}
              className={`px-3 py-1 rounded-xl transition-all ${
                selectedFloor === 7 ? 'bg-cyan-600 text-white font-bold shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              طابق 7 (قبو التشفير HSM)
            </button>
            <button
              onClick={() => setSelectedFloor(8)}
              className={`px-3 py-1 rounded-xl transition-all ${
                selectedFloor === 8 ? 'bg-cyan-600 text-white font-bold shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              طابق 8 (السيرفرات المركزية NVR)
            </button>
            <button
              onClick={() => setSelectedFloor(9)}
              className={`px-3 py-1 rounded-xl transition-all ${
                selectedFloor === 9 ? 'bg-cyan-600 text-white font-bold shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              طابق 9 (مختبرات الذكاء الاصطناعي)
            </button>
            <button
              onClick={() => setSelectedFloor(10)}
              className={`px-3 py-1 rounded-xl transition-all ${
                selectedFloor === 10 ? 'bg-cyan-600 text-white font-bold shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              طابق 10 (رادار السطح ومهبط الطائرات)
            </button>
          </div>

          <button
            onClick={onSwitchTo1x1}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Maximize className="w-3.5 h-3.5" />
            <span>عرض ملء الشاشة 1x1 للكاميرا المحددة</span>
          </button>
        </div>

        {/* Modal Main Body: Big Blueprint Map + Docked Camera Preview Card */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-[380px] overflow-hidden">
          {/* Blueprint Canvas Graphic */}
          <div className="flex-1 relative rounded-2xl bg-slate-950 border border-cyan-500/30 overflow-hidden shadow-inner flex items-center justify-center">
            {/* Tactical Grid */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(6,182,212,0.18) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(6,182,212,0.18) 1px, transparent 1px)
                `,
                backgroundSize: '36px 36px',
              }}
            />

            {/* Architectural Vector Schematic */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 400">
              {/* Outer Perimeter */}
              <rect x="30" y="25" width="540" height="350" rx="18" fill="none" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="2" strokeDasharray="6 6" />
              
              {/* Central Core Atrium */}
              <rect x="190" y="95" width="220" height="210" rx="10" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(6, 182, 212, 0.5)" strokeWidth="2" />
              <text x="300" y="195" fill="rgba(6, 182, 212, 0.6)" fontSize="12" textAnchor="middle" fontFamily="monospace">البهو المركزي - المصاعد والمحاور</text>

              {/* North Server Atrium Block */}
              <rect x="220" y="45" width="160" height="60" rx="6" fill="rgba(244, 63, 94, 0.1)" stroke="rgba(244, 63, 94, 0.5)" strokeWidth="1.5" />
              <text x="300" y="80" fill="rgba(244, 63, 94, 0.85)" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">قطاع 08: السيرفرات NVR ومركز البيانات</text>

              {/* West AI Neural Labs */}
              <rect x="65" y="110" width="135" height="90" rx="6" fill="rgba(14, 165, 233, 0.1)" stroke="rgba(14, 165, 233, 0.5)" strokeWidth="1.5" />
              <text x="132" y="155" fill="rgba(14, 165, 233, 0.85)" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">قطاع 09: مختبرات الذكاء</text>

              {/* East HSM Cryptographic Vault */}
              <rect x="400" y="110" width="135" height="90" rx="6" fill="rgba(168, 85, 247, 0.1)" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="1.5" />
              <text x="467" y="155" fill="rgba(168, 85, 247, 0.85)" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">قطاع 07: قبو التشفير HSM</text>

              {/* South Biometric Gate */}
              <rect x="210" y="295" width="180" height="65" rx="6" fill="rgba(16, 185, 129, 0.1)" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="1.5" />
              <text x="300" y="335" fill="rgba(16, 185, 129, 0.85)" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">قطاع 01: بوابة الدخول البيومترية</text>

              {/* Helipad Marking */}
              <circle cx="300" cy="200" r="38" fill="none" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="300" y="208" fill="rgba(245, 158, 11, 0.6)" fontSize="20" fontWeight="bold" textAnchor="middle" fontFamily="monospace">H</text>
            </svg>

            {/* Big Rotating Radar Sweep */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
              <div className="w-[120%] h-[120%] rounded-full border border-cyan-500/10 pointer-events-none radar-sweep-beam flex items-center justify-center">
                <div className="w-1/2 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/40 to-cyan-300 ml-auto" />
              </div>
            </div>

            {/* Interactive Camera Pins */}
            {displayedCameras.map((cam, idx) => {
              const coords = getCameraCoordinates(cam, idx);
              const isSelected = cam.id === selectedCameraId;

              const brandDotClass = 
                cam.brand === 'hik-connect' 
                  ? 'bg-rose-500 border-rose-200 text-rose-200' 
                  : cam.brand === 'icsee'
                  ? 'bg-sky-400 border-sky-100 text-sky-200'
                  : 'bg-amber-400 border-amber-100 text-amber-200';

              return (
                <div
                  key={cam.id}
                  onClick={() => onSelectCamera(cam.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
                  style={{
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                  }}
                >
                  {/* Direction Cone */}
                  {isSelected && (
                    <div
                      className="absolute pointer-events-none origin-center"
                      style={{
                        transform: `rotate(${coords.defaultAngle + ptzPan}deg)`,
                        width: '80px',
                        height: '80px',
                        top: '-32px',
                        left: '-32px',
                      }}
                    >
                      <div 
                        className="w-full h-full opacity-50"
                        style={{
                          clipPath: 'polygon(50% 50%, 15% 0%, 85% 0%)',
                          background: cam.brand === 'hik-connect' 
                            ? 'linear-gradient(to top, rgba(244,63,94,0.7), rgba(244,63,94,0.05))' 
                            : 'linear-gradient(to top, rgba(6,182,212,0.7), rgba(6,182,212,0.05))',
                        }}
                      />
                    </div>
                  )}

                  {/* Active Beacon */}
                  {isSelected && (
                    <span className="absolute -inset-3 rounded-full border border-cyan-400 animate-ping pointer-events-none" />
                  )}

                  {/* Dot */}
                  <div
                    className={`relative w-5 h-5 rounded-full border-2 flex items-center justify-center transition-transform shadow-lg ${brandDotClass} ${
                      isSelected ? 'scale-125 ring-4 ring-cyan-400 shadow-cyan-400/90 z-20' : 'hover:scale-125'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-slate-950" />
                  </div>

                  {/* Permanent badge on big map */}
                  <div className="absolute top-6 right-1/2 translate-x-1/2 px-2 py-0.5 rounded-lg bg-slate-950/90 border border-slate-700 text-[10px] font-mono whitespace-nowrap text-white font-bold shadow-md">
                    {cam.name.split(':')[0]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right/Side Docked Panel: Live Camera Feed Preview + Details */}
          <div className="w-full md:w-80 bg-slate-950 rounded-2xl border border-slate-800 p-3.5 flex flex-col justify-between gap-3 shrink-0">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
                معاينة الكاميرا المحددة (Live Target Feed)
              </span>
              <div className="text-sm font-bold text-white truncate">{activeCam?.name}</div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">{activeCoords?.sector}</div>

              {/* Embedded Live Preview Box */}
              <div className="mt-3 relative aspect-video w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-lg">
                <CameraLivePreviewRenderer
                  cam={activeCam}
                  nightMode={activeCam.nightVision}
                  previewMode="simulation"
                  currentTimeStr={new Date().toLocaleTimeString('ar-EG')}
                  isSelected={true}
                />
              </div>

              {/* Diagnostics Table */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block">النظام:</span>
                  <span className="font-bold text-cyan-300">{activeCam?.brand.toUpperCase()}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block">الدقة:</span>
                  <span className="font-bold text-emerald-400">{activeCam?.resolution.split(' ')[0]}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block">الحالة:</span>
                  <span className="font-bold text-rose-300">REC 30 FPS</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block">العنوان:</span>
                  <span className="font-bold text-cyan-300 truncate block">{activeCam?.ipAddress}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={onSwitchTo1x1}
                className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all text-center"
              >
                الانتقال للشاشة الرئيسية 1x1
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

