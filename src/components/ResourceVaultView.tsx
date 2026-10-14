import { useState, useEffect } from 'react';
import { sound } from '../utils/audio.ts';
import { 
  DEFAULT_VAULT_FILES, 
  getStoredVaultFiles, 
  saveStoredVaultFiles, 
  StoredVaultFile,
  DEFAULT_VAULT_LINKS, 
  getStoredVaultLinks, 
  saveStoredVaultLinks, 
  StoredVaultLink,
  DEFAULT_VAULT_IMAGES, 
  getStoredVaultImages, 
  saveStoredVaultImages, 
  StoredVaultImage 
} from '../utils/storage.ts';
import { CodeVaultApp } from './apps/CodeVaultApp.tsx';
import { 
  FolderGit2, 
  Code, 
  FileText, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Eye, 
  Tag, 
  Calendar, 
  Sparkles, 
  Maximize2,
  FileCheck,
  Video,
  Globe,
  HardDrive
} from 'lucide-react';

interface ResourceVaultViewProps {
  onSendToIde?: (code: string, filename: string) => void;
  onAskAiWithCode?: (code: string) => void;
}

export function ResourceVaultView({ onSendToIde, onAskAiWithCode }: ResourceVaultViewProps) {
  const [activeTab, setActiveTab] = useState<'code' | 'files' | 'links' | 'images'>('code');

  // Files State
  const [files, setFiles] = useState<StoredVaultFile[]>(getStoredVaultFiles);
  const [fileSearch, setFileSearch] = useState('');
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<StoredVaultFile | null>(null);
  const [isAddFileModalOpen, setIsAddFileModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileCategory, setNewFileCategory] = useState<StoredVaultFile['category']>('docs');
  const [newFileDescription, setNewFileDescription] = useState('');
  const [newFileDataUrl, setNewFileDataUrl] = useState<string>('');
  const [newFileSize, setNewFileSize] = useState<string>('0 KB');
  const [newFileSizeNum, setNewFileSizeNum] = useState<number>(0);
  const [newFileType, setNewFileType] = useState<string>('text/plain');

  // Links State
  const [links, setLinks] = useState<StoredVaultLink[]>(getStoredVaultLinks);
  const [linkSearch, setLinkSearch] = useState('');
  const [linkCategoryFilter, setLinkCategoryFilter] = useState<string>('all');
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkCategory, setNewLinkCategory] = useState<StoredVaultLink['category']>('cctv');
  const [newLinkDescription, setNewLinkDescription] = useState('');
  const [newLinkTags, setNewLinkTags] = useState('');
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  // Images State
  const [images, setImages] = useState<StoredVaultImage[]>(getStoredVaultImages);
  const [imageSearch, setImageSearch] = useState('');
  const [imageCategoryFilter, setImageCategoryFilter] = useState<string>('all');
  const [isAddImageModalOpen, setIsAddImageModalOpen] = useState(false);
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCategory, setNewImageCategory] = useState<StoredVaultImage['category']>('schematics');
  const [newImageTags, setNewImageTags] = useState('');
  const [previewLightboxImage, setPreviewLightboxImage] = useState<StoredVaultImage | null>(null);

  // --- FILE HANDLERS ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${(file.size / 1024).toFixed(1)} KB`;

    setNewFileName(file.name);
    setNewFileSize(sizeStr);
    setNewFileSizeNum(file.size);
    setNewFileType(file.type || 'application/octet-stream');

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewFileDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    sound.playSuccess();
    const created: StoredVaultFile = {
      id: `file-${Date.now()}`,
      name: newFileName,
      size: newFileSize || '12 KB',
      sizeBytes: newFileSizeNum || 12288,
      type: newFileType || 'text/plain',
      dataUrl: newFileDataUrl,
      uploadedAt: new Date().toISOString().split('T')[0],
      category: newFileCategory,
      description: newFileDescription || 'ملف تقني تم حفظه في مستودع DevCore.',
    };

    const nextFiles = [created, ...files];
    setFiles(nextFiles);
    saveStoredVaultFiles(nextFiles);
    setIsAddFileModalOpen(false);
  };

  const handleDeleteFile = (id: string) => {
    sound.playClick(400);
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    saveStoredVaultFiles(updated);
  };

  const handleDownloadFile = (file: StoredVaultFile) => {
    sound.playClick(600);
    if (file.dataUrl) {
      const a = document.createElement('a');
      a.href = file.dataUrl;
      a.download = file.name;
      a.click();
    } else {
      const blob = new Blob([file.description || file.name], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // --- LINK HANDLERS ---
  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;

    sound.playSuccess();
    const created: StoredVaultLink = {
      id: `link-${Date.now()}`,
      title: newLinkTitle,
      url: newLinkUrl.startsWith('http') ? newLinkUrl : `https://${newLinkUrl}`,
      description: newLinkDescription || 'رابط تقني مفيد لمنظومة العمل.',
      category: newLinkCategory,
      tags: newLinkTags.split(',').map((t) => t.trim()).filter(Boolean),
      addedAt: new Date().toISOString().split('T')[0],
    };

    const nextLinks = [created, ...links];
    setLinks(nextLinks);
    saveStoredVaultLinks(nextLinks);
    setIsAddLinkModalOpen(false);
  };

  const handleDeleteLink = (id: string) => {
    sound.playClick(400);
    const updated = links.filter((l) => l.id !== id);
    setLinks(updated);
    saveStoredVaultLinks(updated);
  };

  const handleCopyLink = (url: string, id: string) => {
    sound.playClick(700);
    navigator.clipboard.writeText(url);
    setCopiedLinkId(id);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  // --- IMAGE HANDLERS ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewImageTitle(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (event) => {
      setNewImageUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageTitle.trim() || !newImageUrl.trim()) return;

    sound.playSuccess();
    const created: StoredVaultImage = {
      id: `img-${Date.now()}`,
      title: newImageTitle,
      url: newImageUrl,
      category: newImageCategory,
      tags: newImageTags.split(',').map((t) => t.trim()).filter(Boolean),
      addedAt: new Date().toISOString().split('T')[0],
      size: 'High-Res',
    };

    const nextImages = [created, ...images];
    setImages(nextImages);
    saveStoredVaultImages(nextImages);
    setIsAddImageModalOpen(false);
  };

  const handleDeleteImage = (id: string) => {
    sound.playClick(400);
    const updated = images.filter((img) => img.id !== id);
    setImages(updated);
    saveStoredVaultImages(updated);
  };

  // Export All 4 Repos
  const handleExportAllResources = () => {
    sound.playSuccess();
    const fullBackup = {
      exportedAt: new Date().toISOString(),
      creator: 'المهندس مالك حريبات',
      files,
      links,
      images,
    };
    const jsonStr = JSON.stringify(fullBackup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DevCore_All_Resources_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-950 text-slate-100 p-3 sm:p-5 overflow-hidden select-none font-sans" dir="rtl">
      {/* Top Header & Vault Hub Brand */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-teal-400 p-[1.5px] flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center">
              <FolderGit2 className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                مستودع الموارد الشامل (Resource & Media Vault)
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                v5.0 Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              منصة مركزية لحفظ وإدارة الأكواد البرمجية، الملفات والمستندات، الروابط، ومعرض الصور والمخططات
            </p>
          </div>
        </div>

        {/* Action Controls & Global Backup */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAllResources}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 text-xs font-mono flex items-center gap-1.5 transition-all"
            title="تصدير نسخة احتياطية لكافة الموارد (ملفات، روابط، صور)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">نسخة احتياطية كاملة JSON</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Code, Files, Links, Images) */}
      <div className="py-3 flex items-center gap-2 border-b border-slate-800/60 overflow-x-auto shrink-0">
        <button
          onClick={() => {
            sound.playClick(600);
            setActiveTab('code');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'code'
              ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-lg shadow-cyan-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>الأكواد البرمجية (Code Snippets)</span>
        </button>

        <button
          onClick={() => {
            sound.playClick(600);
            setActiveTab('files');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'files'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>الملفات والمستندات ({files.length})</span>
        </button>

        <button
          onClick={() => {
            sound.playClick(600);
            setActiveTab('links');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'links'
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          <span>الروابط والإشارات المرجعية ({links.length})</span>
        </button>

        <button
          onClick={() => {
            sound.playClick(600);
            setActiveTab('images');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'images'
              ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-lg shadow-amber-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>الصور والمخططات ({images.length})</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 min-h-0 pt-3 overflow-hidden">
        {/* TAB 1: CODE VAULT (Integrated CodeVaultApp) */}
        {activeTab === 'code' && (
          <div className="h-full w-full">
            <CodeVaultApp 
              onSendToIde={onSendToIde} 
              onAskAiWithCode={onAskAiWithCode} 
            />
          </div>
        )}

        {/* TAB 2: FILES & DOCUMENTS */}
        {activeTab === 'files' && (
          <div className="h-full w-full flex flex-col overflow-hidden">
            {/* Files Top Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 shrink-0">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={fileSearch}
                  onChange={(e) => setFileSearch(e.target.value)}
                  placeholder="البحث في الملفات المحفوظة بالاسم أو الوصف..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <button
                onClick={() => {
                  sound.playClick(600);
                  setNewFileName('');
                  setNewFileDescription('');
                  setNewFileDataUrl('');
                  setIsAddFileModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>رفع / إضافة ملف جديد</span>
              </button>
            </div>

            {/* Files List Grid */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              {files.filter((f) => f.name.toLowerCase().includes(fileSearch.toLowerCase()) || (f.description && f.description.toLowerCase().includes(fileSearch.toLowerCase()))).map((file) => (
                <div
                  key={file.id}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate font-mono">
                          {file.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300">
                          {file.size}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 font-sans">
                        {file.description || 'ملف محفوظ في السحابة المحلية للمهندس مالك.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                      {file.uploadedAt}
                    </span>

                    <button
                      onClick={() => handleDownloadFile(file)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-mono flex items-center gap-1 transition-all"
                      title="تحميل الملف"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل</span>
                    </button>

                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="حذف الملف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: BOOKMARKS & LINKS */}
        {activeTab === 'links' && (
          <div className="h-full w-full flex flex-col overflow-hidden">
            {/* Links Top Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 shrink-0">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={linkSearch}
                  onChange={(e) => setLinkSearch(e.target.value)}
                  placeholder="البحث في الروابط بالاسم، الرابط، أو الكلمات المفتاحية..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>

              <button
                onClick={() => {
                  sound.playClick(600);
                  setNewLinkTitle('');
                  setNewLinkUrl('');
                  setNewLinkDescription('');
                  setNewLinkTags('');
                  setIsAddLinkModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة رابط جديد</span>
              </button>
            </div>

            {/* Links Grid */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {links
                  .filter((l) => l.title.toLowerCase().includes(linkSearch.toLowerCase()) || l.url.toLowerCase().includes(linkSearch.toLowerCase()) || l.description.toLowerCase().includes(linkSearch.toLowerCase()))
                  .map((link) => (
                    <div
                      key={link.id}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3 shadow group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30">
                            {link.category === 'cctv' ? '📹 كاميرات وسحابة' : link.category === 'dev' ? '💻 تطوير وبرمجة' : '🌐 رابط ويب'}
                          </span>
                          <button
                            onClick={() => handleDeleteLink(link.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="حذف الرابط"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h4 className="text-sm font-bold text-white mt-2 font-sans">
                          {link.title}
                        </h4>

                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-sans">
                          {link.description}
                        </p>
                      </div>

                      {/* URL row + Copy + Launch */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono text-cyan-400 truncate max-w-[180px]">
                          {link.url}
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleCopyLink(link.url, link.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
                            title="نسخ الرابط"
                          >
                            {copiedLinkId === link.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 border border-violet-500/40 text-xs font-mono flex items-center gap-1 transition-all"
                          >
                            <span>فتح</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: IMAGES & SCHEMATICS */}
        {activeTab === 'images' && (
          <div className="h-full w-full flex flex-col overflow-hidden">
            {/* Images Top Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 shrink-0">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={imageSearch}
                  onChange={(e) => setImageSearch(e.target.value)}
                  placeholder="البحث في الصور والمخططات..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              <button
                onClick={() => {
                  sound.playClick(600);
                  setNewImageTitle('');
                  setNewImageUrl('');
                  setNewImageTags('');
                  setIsAddImageModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>رفع / إضافة صورة أو مخطط</span>
              </button>
            </div>

            {/* Images Gallery Grid */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images
                  .filter((img) => img.title.toLowerCase().includes(imageSearch.toLowerCase()))
                  .map((img) => (
                    <div
                      key={img.id}
                      onClick={() => setPreviewLightboxImage(img)}
                      className="group relative rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 overflow-hidden shadow-lg cursor-pointer transition-all flex flex-col"
                    >
                      <div className="relative aspect-video w-full bg-black overflow-hidden">
                        <img
                          src={img.url}
                          alt={img.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                          <span className="text-xs font-mono text-amber-300 flex items-center gap-1">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>عرض بحجم كامل</span>
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage(img.id);
                            }}
                            className="p-1 rounded bg-black/60 text-slate-400 hover:text-rose-400"
                            title="حذف الصورة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-900 flex flex-col justify-between flex-1">
                        <h4 className="text-xs font-bold text-white truncate font-sans">
                          {img.title}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2">
                          <span className="text-amber-400">{img.size || 'HD'}</span>
                          <span>{img.addedAt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add File */}
      {isAddFileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-white">رفع / إضافة ملف إلى المستودع</h3>
            <form onSubmit={handleSaveFile} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  اختر ملفاً من جهازك (Drag & Drop أو تصفح):
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  اسم الملف:
                </label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="filename.pdf أو config.json"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  تصنيف الملف:
                </label>
                <select
                  value={newFileCategory}
                  onChange={(e) => setNewFileCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                >
                  <option value="docs">مستندات وتوثيق (Docs/PDF)</option>
                  <option value="configs">ملفات إعدادات و JSON (Configs)</option>
                  <option value="scripts">سكريبتات برمجية (Scripts)</option>
                  <option value="archives">أرشيف وحزم مضغوطة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  وصف الملف:
                </label>
                <textarea
                  value={newFileDescription}
                  onChange={(e) => setNewFileDescription(e.target.value)}
                  placeholder="وصف محتويات الملف واستخداماته..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddFileModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md"
                >
                  حفظ الملف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Link */}
      {isAddLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-white">إضافة رابط جديد إلى المستودع</h3>
            <form onSubmit={handleSaveLink} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  عنوان الرابط أو الخدمة:
                </label>
                <input
                  type="text"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  placeholder="مثال: بوابة Hik-Connect السحابية"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  عنوان URL:
                </label>
                <input
                  type="text"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  placeholder="https://..."
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  تصنيف الرابط:
                </label>
                <select
                  value={newLinkCategory}
                  onChange={(e) => setNewLinkCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                >
                  <option value="cctv">📹 كاميرات ومراقبة (CCTV)</option>
                  <option value="dev">💻 مستودعات وبرمجة (Dev)</option>
                  <option value="tools">🛠️ أدوات وخدمات (Tools)</option>
                  <option value="ai">🧠 ذكاء اصطناعي (AI)</option>
                  <option value="docs">📚 توثيق رسمي (Docs)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  وصف الرابط:
                </label>
                <textarea
                  value={newLinkDescription}
                  onChange={(e) => setNewLinkDescription(e.target.value)}
                  placeholder="وصف موجز لرابط الخدمة..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddLinkModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-xs shadow-md"
                >
                  حفظ الرابط
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Image */}
      {isAddImageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-white">إضافة صورة أو مخطط هندسي</h3>
            <form onSubmit={handleSaveImage} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  رفع صورة من جهازك (اختياري):
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  أو الصق رابط صورة مباشرة (URL):
                </label>
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://... أو base64"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  عنوان الصورة أو المخطط:
                </label>
                <input
                  type="text"
                  value={newImageTitle}
                  onChange={(e) => setNewImageTitle(e.target.value)}
                  placeholder="مثال: مخطط شبكات الدور الثامن NVR"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddImageModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 text-white font-bold text-xs shadow-md"
                >
                  حفظ الصورة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal: Image Full Preview */}
      {previewLightboxImage && (
        <div 
          onClick={() => setPreviewLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          dir="rtl"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-3xl p-4 shadow-2xl flex flex-col gap-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white truncate">{previewLightboxImage.title}</h3>
              <button
                onClick={() => setPreviewLightboxImage(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="relative overflow-hidden rounded-2xl max-h-[75vh] flex items-center justify-center bg-black">
              <img
                src={previewLightboxImage.url}
                alt={previewLightboxImage.title}
                className="max-h-[75vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
