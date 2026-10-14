/**
 * Persistent Storage Engine with Auto-Save
 * DevCore Systems - Eng. Malek Hraibat
 */

import { ComplexFloor, DepartmentConfig } from '../components/Building3DView.tsx';

export interface StoredAuthState {
  isLoggedIn: boolean;
  username: string;
  role: string;
  loginTime: string;
  sessionToken: string;
}

export interface CctvCameraConfig {
  id: string;
  name: string;
  nameEn: string;
  brand: 'hik-connect' | 'icsee' | 'yoosee';
  location: string;
  resolution: string;
  fps: number;
  bitrate: string;
  ptzSupported: boolean;
  nightVision: 'normal' | 'infrared' | 'color' | 'thermal';
  status: 'online' | 'recording' | 'motion' | 'offline';
  floorNum: number;
  ipAddress: string;
  port: number;
  isFavorite?: boolean;
  streamUrl?: string;
  cloudId?: string;
  channel?: number;
  verificationCode?: string;
  lastActive?: string;
}

export interface CctvAccountSession {
  brand: 'hik-connect' | 'icsee' | 'yoosee';
  isConnected: boolean;
  username: string;
  emailOrPhone?: string;
  loginTime: string;
  token?: string;
  serverRegion?: string;
  deviceCount: number;
}

export interface DesignerElement {
  id: string;
  type: 'heading' | 'paragraph' | 'button' | 'card' | 'input' | 'badge' | 'metric' | 'table' | 'camera_feed' | 'ai_chat';
  title: string;
  content: string;
  style: {
    theme: 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose' | 'slate';
    variant: 'neon' | 'glass' | 'solid' | 'outline';
    size: 'sm' | 'md' | 'lg' | 'xl';
    width: 'full' | 'half' | 'third';
  };
}

export interface DesignerProject {
  id: string;
  title: string;
  description: string;
  targetFramework: 'React + Tailwind' | 'HTML/CSS' | 'Next.js App';
  elements: DesignerElement[];
  updatedAt: string;
}

export interface AiFusionRecord {
  id: string;
  prompt: string;
  selectedModels: ('chatgpt' | 'deepseek' | 'claude' | 'gemini')[];
  timestamp: string;
  masterSolution: string;
  modelOutputs: Record<string, string>;
}

const KEYS = {
  AUTH: 'devcore_auth_session_v1',
  FLOORS: 'devcore_complex_floors_v2',
  CAMERAS: 'devcore_cctv_cameras_v2',
  ACCOUNTS: 'devcore_cctv_accounts_v1',
  DESIGNER: 'devcore_designer_projects_v1',
  AI_FUSION: 'devcore_ai_fusion_history_v1',
  SETTINGS: 'devcore_system_settings_v1',
  FILES: 'devcore_vault_files_v1',
  LINKS: 'devcore_vault_links_v1',
  IMAGES: 'devcore_vault_images_v1',
  CREDENTIALS: 'devcore_credentials_vault_v1',
  YOUTUBE: 'devcore_youtube_history_v1',
};

// --- AUTH STORAGE ---
export function getStoredAuth(): StoredAuthState {
  try {
    const raw = localStorage.getItem(KEYS.AUTH);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.isLoggedIn === 'boolean') {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return {
    isLoggedIn: false,
    username: '',
    role: 'Guest Architect',
    loginTime: '',
    sessionToken: '',
  };
}

export function saveStoredAuth(auth: StoredAuthState): void {
  try {
    localStorage.setItem(KEYS.AUTH, JSON.stringify(auth));
  } catch (e) {
    console.error('Failed to auto-save auth session:', e);
  }
}

export function clearStoredAuth(): void {
  try {
    localStorage.removeItem(KEYS.AUTH);
  } catch (e) {
    console.error('Failed to clear auth session:', e);
  }
}

// --- COMPLEX FLOORS & DEPARTMENTS AUTO-SAVE ---
export function getStoredFloors(): ComplexFloor[] | null {
  try {
    const raw = localStorage.getItem(KEYS.FLOORS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return null;
}

export function saveStoredFloors(floors: ComplexFloor[]): void {
  try {
    localStorage.setItem(KEYS.FLOORS, JSON.stringify(floors));
  } catch (e) {
    console.error('Failed to auto-save complex floors:', e);
  }
}

// --- CCTV CAMERAS AUTO-SAVE ---
export const DEFAULT_CCTV_CAMERAS: CctvCameraConfig[] = [
  {
    id: 'cam-hik-01',
    name: 'كاميرا هيك-كونكت: غرفة السيرفرات المركزية',
    nameEn: 'Hik-Connect Main Server Room',
    brand: 'hik-connect',
    location: 'الطابق 8 - جناح السيرفرات المركزية',
    resolution: '3840x2160 (4K Ultra HD)',
    fps: 30,
    bitrate: '4096 Kbps (H.265+)',
    ptzSupported: true,
    nightVision: 'infrared',
    status: 'recording',
    floorNum: 8,
    ipAddress: '192.168.10.101',
    port: 8000,
    cloudId: 'HIK-9928192-EU',
    verificationCode: 'ABCDEF',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 'cam-icsee-02',
    name: 'كاميرا آي سي سي: بهو المجمع والمدخل الهندسي',
    nameEn: 'ICSee Campus Grand Atrium',
    brand: 'icsee',
    location: 'الطابق الأرضي 1 - مدخل المجمع الإلكتروني',
    resolution: '1920x1080 (1080P Full HD)',
    fps: 25,
    bitrate: '2048 Kbps (H.265)',
    ptzSupported: true,
    nightVision: 'color',
    status: 'online',
    floorNum: 1,
    ipAddress: '192.168.10.102',
    port: 34567,
    cloudId: 'd739284719284729',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  },
  {
    id: 'cam-yoosee-03',
    name: 'كاميرا يوسي: مهبط الطائرات ورادار السطح',
    nameEn: 'Yoosee Rooftop Helipad & Radar',
    brand: 'yoosee',
    location: 'السطح (Rooftop Helipad) - أعلى البرج',
    resolution: '2560x1440 (2K QHD)',
    fps: 30,
    bitrate: '3072 Kbps (Dual Stream)',
    ptzSupported: true,
    nightVision: 'infrared',
    status: 'online',
    floorNum: 10,
    ipAddress: '192.168.10.103',
    port: 554,
    cloudId: '3C-8849201',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
  {
    id: 'cam-hik-04',
    name: 'كاميرا هيك-كونكت: قبو التشفير والمفاتيح HSM',
    nameEn: 'Hik-Connect HSM Cryptography Vault',
    brand: 'hik-connect',
    location: 'الطابق 7 - جناح التشفير والأمن السيبراني',
    resolution: '3840x2160 (4K DarkFighter)',
    fps: 30,
    bitrate: '4500 Kbps (H.265+ Secure)',
    ptzSupported: true,
    nightVision: 'infrared',
    status: 'recording',
    floorNum: 7,
    ipAddress: '192.168.10.104',
    port: 8000,
    cloudId: 'HIK-4481902-EU',
    verificationCode: 'SECURE1',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
  },
  {
    id: 'cam-icsee-05',
    name: 'كاميرا آي سي سي: مختبر الذكاء الاصطناعي العصبي',
    nameEn: 'ICSee AI Neural R&D Lab',
    brand: 'icsee',
    location: 'الطابق 9 - مختبرات ChatGPT & DeepSeek',
    resolution: '2304x1296 (3MP HD)',
    fps: 30,
    bitrate: '2560 Kbps',
    ptzSupported: true,
    nightVision: 'color',
    status: 'motion',
    floorNum: 9,
    ipAddress: '192.168.10.105',
    port: 34567,
    cloudId: 'a849201948291039',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  },
  {
    id: 'cam-yoosee-06',
    name: 'كاميرا يوسي: ممر شبكات الفايبر والبيانات',
    nameEn: 'Yoosee Fiber Backbone & Power Grid',
    brand: 'yoosee',
    location: 'الطابق 2 - محطة الطاقة والشبكات السلكية',
    resolution: '1920x1080 (1080P)',
    fps: 25,
    bitrate: '1536 Kbps',
    ptzSupported: false,
    nightVision: 'infrared',
    status: 'online',
    floorNum: 2,
    ipAddress: '192.168.10.106',
    port: 554,
    cloudId: '3C-9102938',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  },
];

export function getStoredCameras(): CctvCameraConfig[] {
  try {
    const raw = localStorage.getItem(KEYS.CAMERAS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure each camera has a valid streamUrl for live viewing
        const fallbackStreams = [
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        ];
        return parsed.map((cam, idx) => ({
          ...cam,
          streamUrl: cam.streamUrl || fallbackStreams[idx % fallbackStreams.length],
        }));
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_CCTV_CAMERAS;
}

export function saveStoredCameras(cameras: CctvCameraConfig[]): void {
  try {
    localStorage.setItem(KEYS.CAMERAS, JSON.stringify(cameras));
  } catch (e) {
    console.error('Failed to auto-save CCTV cameras:', e);
  }
}

// --- CCTV CLOUD ACCOUNTS AUTO-SAVE ---
export function getStoredCctvAccounts(): Record<'hik-connect' | 'icsee' | 'yoosee', CctvAccountSession> {
  const defaultAccounts: Record<'hik-connect' | 'icsee' | 'yoosee', CctvAccountSession> = {
    'hik-connect': {
      brand: 'hik-connect',
      isConnected: true,
      username: 'Malek_Hik_Lead',
      emailOrPhone: 'eng.malek@devcore.tech',
      loginTime: new Date().toLocaleDateString('ar-EG'),
      token: 'HIK-AUTH-7738-VERIFIED',
      serverRegion: 'Middle East & Gulf (Cloud EU/ME)',
      deviceCount: 2,
    },
    'icsee': {
      brand: 'icsee',
      isConnected: true,
      username: 'Malek_XM_Cloud',
      emailOrPhone: 'malek.cctv@icsee.net',
      loginTime: new Date().toLocaleDateString('ar-EG'),
      token: 'XM-P2P-9921-CONNECTED',
      serverRegion: 'Global XM P2P Cluster',
      deviceCount: 2,
    },
    'yoosee': {
      brand: 'yoosee',
      isConnected: true,
      username: 'Malek_3C_Yoosee',
      emailOrPhone: 'user3c_9824128@yoosee.com',
      loginTime: new Date().toLocaleDateString('ar-EG'),
      token: 'YOOSE-3C-6612-ACTIVE',
      serverRegion: 'CloudLinks Smart P2P',
      deviceCount: 2,
    },
  };

  try {
    const raw = localStorage.getItem(KEYS.ACCOUNTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...defaultAccounts, ...parsed };
      }
    }
  } catch {
    // fallback
  }
  return defaultAccounts;
}

export function saveStoredCctvAccounts(accounts: Record<'hik-connect' | 'icsee' | 'yoosee', CctvAccountSession>): void {
  try {
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to auto-save CCTV accounts:', e);
  }
}

// --- DESIGNER PROJECTS AUTO-SAVE ---
export function getStoredDesignerProjects(): DesignerProject[] {
  try {
    const raw = localStorage.getItem(KEYS.DESIGNER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return [
    {
      id: 'proj-1',
      title: 'بوابة النظم السحابية - DevCore Portal',
      description: 'لوحة تحكم تفاعلية مع إحصائيات السيرفرات وشاشات الكاميرات الحية',
      targetFramework: 'React + Tailwind',
      updatedAt: new Date().toISOString(),
      elements: [
        {
          id: 'el-1',
          type: 'heading',
          title: 'عنوان المنظومة الرئيسية',
          content: 'DevCore Systems Dashboard - المهندس مالك حريبات',
          style: { theme: 'cyan', variant: 'neon', size: 'xl', width: 'full' },
        },
        {
          id: 'el-2',
          type: 'metric',
          title: 'أداء السيرفرات الحية',
          content: 'RPS: 4,820 | CPU: 18% | Latency: 1.2ms',
          style: { theme: 'emerald', variant: 'glass', size: 'md', width: 'third' },
        },
        {
          id: 'el-3',
          type: 'card',
          title: 'مراقبة الكاميرات الذكية',
          content: 'بث حي متصل بكاميرات Hik-Connect و ICSee و Yoosee بنظام H.265+',
          style: { theme: 'cyan', variant: 'glass', size: 'md', width: 'third' },
        },
        {
          id: 'el-4',
          type: 'button',
          title: 'زر إطلاق النبضة التفاعلية',
          content: 'تنفيذ الإجراء السحابي الفوري',
          style: { theme: 'cyan', variant: 'neon', size: 'md', width: 'third' },
        },
      ],
    },
  ];
}

export function saveStoredDesignerProjects(projects: DesignerProject[]): void {
  try {
    localStorage.setItem(KEYS.DESIGNER, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to auto-save designer projects:', e);
  }
}

// --- AI FUSION AUTO-SAVE ---
export function getStoredAiFusion(): AiFusionRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.AI_FUSION);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveStoredAiFusion(records: AiFusionRecord[]): void {
  try {
    localStorage.setItem(KEYS.AI_FUSION, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to auto-save AI fusion:', e);
  }
}

// --- FILES & DOCUMENTS STORAGE ---
export interface StoredVaultFile {
  id: string;
  name: string;
  size: string;
  sizeBytes: number;
  type: string;
  dataUrl?: string;
  uploadedAt: string;
  category: 'docs' | 'configs' | 'scripts' | 'archives';
  description?: string;
}

export const DEFAULT_VAULT_FILES: StoredVaultFile[] = [
  {
    id: 'file-1',
    name: 'DevCore_Architecture_Specification_v5.pdf',
    size: '1.4 MB',
    sizeBytes: 1468006,
    type: 'application/pdf',
    uploadedAt: '2026-10-14',
    category: 'docs',
    description: 'المواصفات المعمارية الكاملة لمنظومة المهندس مالك حريبات وتقسيمات الطوابق والشبكات.',
  },
  {
    id: 'file-2',
    name: 'hikvision_isup_cloud_gateway_config.json',
    size: '14.2 KB',
    sizeBytes: 14540,
    type: 'application/json',
    uploadedAt: '2026-10-14',
    category: 'configs',
    description: 'ملف إعدادات البوابة السحابية المباشرة لبروتوكول ISUP 5.0 والتشفير.',
  },
  {
    id: 'file-3',
    name: 'security_audit_cctv_certificates.pem',
    size: '4.8 KB',
    sizeBytes: 4915,
    type: 'text/plain',
    uploadedAt: '2026-10-13',
    category: 'scripts',
    description: 'شهادات المفاتيح العامة وتشفير أنفاق P2P لكاميرات ICSee و Yoosee.',
  },
];

export function getStoredVaultFiles(): StoredVaultFile[] {
  try {
    const raw = localStorage.getItem(KEYS.FILES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_VAULT_FILES;
}

export function saveStoredVaultFiles(files: StoredVaultFile[]): void {
  try {
    localStorage.setItem(KEYS.FILES, JSON.stringify(files));
  } catch (e) {
    console.error('Failed to save vault files:', e);
  }
}

// --- LINKS & BOOKMARKS STORAGE ---
export interface StoredVaultLink {
  id: string;
  title: string;
  url: string;
  description: string;
  category: 'cctv' | 'dev' | 'tools' | 'docs' | 'ai';
  tags: string[];
  addedAt: string;
}

export const DEFAULT_VAULT_LINKS: StoredVaultLink[] = [
  {
    id: 'link-1',
    title: 'بوابة Hik-Connect السحابية الرسمية (EZVIZ Open)',
    url: 'https://www.hik-connect.com',
    description: 'لوحة التحكم السحابية لإدارة كاميرات NVR/DVR ومفاتيح التحقق.',
    category: 'cctv',
    tags: ['Hikvision', 'Cloud', 'NVR', 'CCTV'],
    addedAt: '2026-10-14',
  },
  {
    id: 'link-2',
    title: 'منصة XMeye و ICSee Cloud P2P',
    url: 'https://www.xmeye.net',
    description: 'سيرفر الاتصال السحابي P2P لكاميرات Xiongmai و ICSee.',
    category: 'cctv',
    tags: ['ICSee', 'XMeye', 'P2P', 'Cameras'],
    addedAt: '2026-10-14',
  },
  {
    id: 'link-3',
    title: 'مستودع المهندس مالك حريبات على GitHub',
    url: 'https://github.com/malekhraibat1/programmer',
    description: 'المستودع الرئيسي لمنظومة DevCore والأكواد المصدرية.',
    category: 'dev',
    tags: ['GitHub', 'Source Code', 'Malek', 'DevCore'],
    addedAt: '2026-10-14',
  },
  {
    id: 'link-4',
    title: 'بوابة CloudLinks الذكية لتطبيق Yoosee',
    url: 'https://www.cloudlinks.cn',
    description: 'إدارة حسابات 3C ID للكاميرات البانورامية والـ Wi-Fi الذكية.',
    category: 'cctv',
    tags: ['Yoosee', '3C ID', 'CloudLinks', 'P2P'],
    addedAt: '2026-10-13',
  },
  {
    id: 'link-5',
    title: 'منصة Google AI Studio للذكاء الاصطناعي',
    url: 'https://ai.google.dev',
    description: 'الواجهة الهندسية لنماذج Gemini 2.5 و 3.8 Flash.',
    category: 'ai',
    tags: ['Google', 'Gemini', 'LLM', 'AI'],
    addedAt: '2026-10-13',
  },
];

export function getStoredVaultLinks(): StoredVaultLink[] {
  try {
    const raw = localStorage.getItem(KEYS.LINKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_VAULT_LINKS;
}

export function saveStoredVaultLinks(links: StoredVaultLink[]): void {
  try {
    localStorage.setItem(KEYS.LINKS, JSON.stringify(links));
  } catch (e) {
    console.error('Failed to save vault links:', e);
  }
}

// --- IMAGES & MEDIA STORAGE ---
export interface StoredVaultImage {
  id: string;
  title: string;
  url: string;
  category: 'cctv' | 'architecture' | 'schematics' | 'personal';
  size?: string;
  tags: string[];
  addedAt: string;
}

export const DEFAULT_VAULT_IMAGES: StoredVaultImage[] = [
  {
    id: 'img-1',
    title: 'مخطط التوزيع الهندسي للألياف والشبكات (Fiber Backbone Schematic)',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    category: 'schematics',
    size: '420 KB',
    tags: ['Network', 'Fiber', 'Data Center', 'Racks'],
    addedAt: '2026-10-14',
  },
  {
    id: 'img-2',
    title: 'غرفة المراقبة والسيرفرات المركزية NVR 4K Surveillance',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    category: 'cctv',
    size: '680 KB',
    tags: ['CCTV', 'Hikvision', 'Server Room', 'Control Room'],
    addedAt: '2026-10-14',
  },
  {
    id: 'img-3',
    title: 'برج المجمع الهندسي والدوائر الذكية (DevCore Campus Cyber)',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    category: 'architecture',
    size: '850 KB',
    tags: ['Cyberpunk', 'Matrix', 'Architecture', 'Malek'],
    addedAt: '2026-10-13',
  },
];

export function getStoredVaultImages(): StoredVaultImage[] {
  try {
    const raw = localStorage.getItem(KEYS.IMAGES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_VAULT_IMAGES;
}

export function saveStoredVaultImages(images: StoredVaultImage[]): void {
  try {
    localStorage.setItem(KEYS.IMAGES, JSON.stringify(images));
  } catch (e) {
    console.error('Failed to save vault images:', e);
  }
}

// --- SECURE PASSWORDS & CREDENTIALS STORAGE ---
export interface StoredCredential {
  id: string;
  title: string;
  category: 'cctv' | 'servers' | 'email' | 'dev' | 'cloud' | 'other';
  usernameOrEmail: string;
  password: string;
  verificationPin?: string;
  websiteUrl?: string;
  notes?: string;
  updatedAt: string;
}

export const DEFAULT_CREDENTIALS: StoredCredential[] = [
  {
    id: 'cred-1',
    title: 'حساب خادم كاميرات Hik-Connect NVR',
    category: 'cctv',
    usernameOrEmail: 'admin@devcore.tech',
    password: 'HikPassword@2026',
    verificationPin: 'ABCDEF',
    websiteUrl: 'https://www.hik-connect.com',
    notes: 'حساب المشرف الرئيسي للـ NVR المركزي مع رمز فك التشفير لكافة القنوات.',
    updatedAt: '2026-10-14',
  },
  {
    id: 'cred-2',
    title: 'حساب سحابة ICSee (XMeye Cloud)',
    category: 'cctv',
    usernameOrEmail: 'malek.cctv@icsee.net',
    password: 'XmCloudPass#2026',
    verificationPin: 'd739284719284729',
    websiteUrl: 'https://www.xmeye.net',
    notes: 'معرف الـ GID السحابي لتشغيل الكاميرات المزدوجة بالذكاء الاصطناعي.',
    updatedAt: '2026-10-14',
  },
  {
    id: 'cred-3',
    title: 'حساب Yoosee 3C ID للكاميرات الذكية',
    category: 'cctv',
    usernameOrEmail: 'user3c_9824128@yoosee.com',
    password: 'YooseePass#2026',
    verificationPin: '8849201',
    websiteUrl: 'https://cloudlinks.cn',
    notes: 'حساب كاميرات السطح والمهبط البانورامية 360 درجة.',
    updatedAt: '2026-10-14',
  },
  {
    id: 'cred-4',
    title: 'البريد الرسمي للمهندس مالك حريبات',
    category: 'email',
    usernameOrEmail: 'narhar.MH@gmail.com',
    password: 'ProtectedDeveloperKey!2026',
    websiteUrl: 'https://mail.google.com',
    notes: 'البريد المعتمد للمراسلات الهندسية وتطوير منظومة DevCore.',
    updatedAt: '2026-10-14',
  },
  {
    id: 'cred-5',
    title: 'خادم السيرفرات الجذرية Linux Root SSH',
    category: 'servers',
    usernameOrEmail: 'root@192.168.10.100',
    password: 'SuperRootKey#99281!Secure',
    websiteUrl: 'ssh://192.168.10.100:22',
    notes: 'سيرفر البيانات المركزي NVR ومصفوفة Docker في الطابق الثامن.',
    updatedAt: '2026-10-13',
  },
  {
    id: 'cred-6',
    title: 'مستودع GitHub للمطورين (malekhraibat1)',
    category: 'dev',
    usernameOrEmail: 'malekhraibat1',
    password: 'ghp_developerPersonalAccessToken2026SecureKey',
    websiteUrl: 'https://github.com/malekhraibat1/programmer',
    notes: 'مفتاح الـ Personal Access Token لنشر التحديثات البرمجية.',
    updatedAt: '2026-10-13',
  },
];

export function getStoredCredentials(): StoredCredential[] {
  try {
    const raw = localStorage.getItem(KEYS.CREDENTIALS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_CREDENTIALS;
}

export function saveStoredCredentials(credentials: StoredCredential[]): void {
  try {
    localStorage.setItem(KEYS.CREDENTIALS, JSON.stringify(credentials));
  } catch (e) {
    console.error('Failed to save credentials:', e);
  }
}

// --- YOUTUBE STREAMS & MEDIA STORAGE ---
export interface YouTubePreset {
  id: string;
  title: string;
  url: string;
  videoId: string;
  category: 'cctv_live' | 'hikvision_tutorials' | 'coding_lofi' | 'tech_ai';
  description: string;
}

export const DEFAULT_YOUTUBE_PRESETS: YouTubePreset[] = [
  {
    id: 'yt-1',
    title: 'بث كاميرات مراقبة حية للمدن والطرق (Live Earth Cam)',
    url: 'https://www.youtube.com/watch?v=1-iS7LArMPA',
    videoId: '1-iS7LArMPA',
    category: 'cctv_live',
    description: 'بث فيديو حي فائق الدقة 4K لكاميرات المراقبة الحية في الشوارع والمباني.',
  },
  {
    id: 'yt-2',
    title: 'شرح ضبط وتوصيل كاميرات Hikvision و Hik-Connect السحابية',
    url: 'https://www.youtube.com/watch?v=D-h6WoC6iG8',
    videoId: 'D-h6WoC6iG8',
    category: 'hikvision_tutorials',
    description: 'دليل ربط وتفعيل أجهزة NVR/DVR وتطبيق Hik-Connect على الهاتف والكمبيوتر.',
  },
  {
    id: 'yt-3',
    title: 'موسيقى برمجة وتركيز في الفضاء الإلكتروني (Cyberpunk Lofi Synthwave)',
    url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
    videoId: '4xDzrJKXOOY',
    category: 'coding_lofi',
    description: 'بث إذاعي مستمر لموسيقى السايبربانك والتركيز للمبرمجين ومهندسي النظم.',
  },
  {
    id: 'yt-4',
    title: 'شرح ربط كاميرات ICSee الذكية بالشبكة المنزلية والسحابية',
    url: 'https://www.youtube.com/watch?v=VlU5uX9aEFE',
    videoId: 'VlU5uX9aEFE',
    category: 'hikvision_tutorials',
    description: 'شرح تفصيلي لتطبيق ICSee وربط الكاميرات المزدوجة بخاصية P2P.',
  },
  {
    id: 'yt-5',
    title: 'شرح ضبط كاميرات Yoosee اللاسلكية بنظام 3C ID',
    url: 'https://www.youtube.com/watch?v=Jm_X9Z6Vj_g',
    videoId: 'Jm_X9Z6Vj_g',
    category: 'hikvision_tutorials',
    description: 'خطوات إعداد كاميرات Yoosee Pan/Tilt وحفظ التسجيلات السحابية.',
  },
  {
    id: 'yt-6',
    title: 'محاضرة معمارية الأنظمة الموزعة والبرمجيات الحديثة (Software Architecture)',
    url: 'https://www.youtube.com/watch?v=v=k84p6x20s88',
    videoId: 'k84p6x20s88',
    category: 'tech_ai',
    description: 'أفضل الممارسات في بناء الأنظمة المعمارية السحابية وقواعد البيانات الضخمة.',
  },
];

export function getStoredYouTubeHistory(): string[] {
  try {
    const raw = localStorage.getItem(KEYS.YOUTUBE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return ['1-iS7LArMPA', 'D-h6WoC6iG8', '4xDzrJKXOOY'];
}

export function saveStoredYouTubeHistory(history: string[]): void {
  try {
    localStorage.setItem(KEYS.YOUTUBE, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save YouTube history:', e);
  }
}

