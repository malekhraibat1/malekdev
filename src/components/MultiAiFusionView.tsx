import { useState } from 'react';
import { sound } from '../utils/audio.ts';
import { 
  getStoredAiFusion, 
  saveStoredAiFusion, 
  AiFusionRecord 
} from '../utils/storage.ts';
import { 
  Sparkles, 
  BrainCircuit, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  Copy, 
  Check, 
  Code2, 
  Send, 
  Clock, 
  Zap, 
  ArrowRight,
  Flame,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  Sliders,
  Terminal,
  BookmarkPlus,
  Play,
  Shuffle,
  FileCode2,
  RefreshCw
} from 'lucide-react';

interface MultiAiFusionViewProps {
  onSendCodeToIde?: (code: string, filename?: string) => void;
  onSaveSnippetToVault?: (code: string, title: string) => void;
}

export type SupportedModelId = 
  | 'deepseek'
  | 'claude'
  | 'chatgpt'
  | 'gemini'
  | 'mistral'
  | 'llama'
  | 'qwen'
  | 'perplexity';

interface ModelOption {
  id: SupportedModelId;
  name: string;
  provider: string;
  version: string;
  badge: string;
  color: string;
  description: string;
  focus: string;
}

export const ALL_AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek R1',
    provider: 'DeepSeek AI',
    version: 'R1 Reasoning Engine',
    badge: 'استدلال عميق وخوارزميات O(N)',
    color: 'from-blue-600 to-indigo-700',
    description: 'متفوق في التحليل الرياضي الصارم، حل المشكلات المعقدة، والتحقق من حالات الحواف (Edge Cases).',
    focus: 'Logical Reasoning & Algorithmic Complexity',
  },
  {
    id: 'claude',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    version: 'Sonnet Clean Architecture',
    badge: 'برمجة دفاعية ونقاء هيكلي',
    color: 'from-amber-500 to-orange-600',
    description: 'رائد في كود TypeScript النظيف، التصميم الدفاعي المعماري (Defensive Coding)، والتوثيق المكتمل.',
    focus: 'Clean Architecture & Defensive Typing',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT 4o / o1',
    provider: 'OpenAI',
    version: 'Omni Enterprise',
    badge: 'حلول إنتاجية فورية وسريعة',
    color: 'from-emerald-500 to-teal-600',
    description: 'متفوق في بناء الخدمات والواجهات الإنتاجية المباشرة (Production-Ready) والسرعة الفائقة.',
    focus: 'Production Delivery & Rapid APIs',
  },
  {
    id: 'gemini',
    name: 'Gemini 2.5 Pro',
    provider: 'Google DeepMind',
    version: 'Flash / Pro Distributed',
    badge: 'سياق شاسع وأنظمة موزعة',
    color: 'from-cyan-500 to-sky-600',
    description: 'متفوق في الأنظمة السحابية الموزعة، استيعاب السياق الضخم، وتنسيق الخدمات المترابطة.',
    focus: 'Distributed Systems & Cloud Scaling',
  },
  {
    id: 'mistral',
    name: 'Mistral Codestral',
    provider: 'Mistral AI',
    version: 'Large 2 & Codestral 25B',
    badge: 'توليد برمجي عالي الكفاءة',
    color: 'from-orange-500 to-rose-600',
    description: 'محرك أوروبي فائق الدقة متخصص في توليد الشفرات البرمجية النظيفة مع خفة استهلاك الذاكرة.',
    focus: 'High-Precision Code Synthesis',
  },
  {
    id: 'llama',
    name: 'Meta Llama 3.3',
    provider: 'Meta AI',
    version: '70B Instruct Cluster',
    badge: 'معمارية مفتوحة ومرونة عالية',
    color: 'from-indigo-500 to-purple-600',
    description: 'نموذج مفتوح المصدر رائد في فهم المهام المتشعبة والالتزام الحرفي بالتعليمات الهندسية الصارمة.',
    focus: 'Instruction Following & Modularity',
  },
  {
    id: 'qwen',
    name: 'Qwen 2.5 Coder',
    provider: 'Alibaba Cloud',
    version: '32B Specialized Coder',
    badge: 'خبير الخوارزميات وتعدد اللغات',
    color: 'from-purple-500 to-pink-600',
    description: 'متصدر اختبارات البرمجة العالمية، متفوق في معالجة لغات البرمجة المتعددة والتصحيح الآلي.',
    focus: 'Multi-Language Polyglot Coding',
  },
  {
    id: 'perplexity',
    name: 'Perplexity / Groq',
    provider: 'Groq & Perplexity',
    version: 'Ultra-Fast LPU Engine',
    badge: 'استدلال فائق السرعة واستشهادات',
    color: 'from-teal-500 to-emerald-600',
    description: 'معالجة فورية بمعدل 500+ token/s مع إمكانية ربط الحقائق والبيانات المحدثة فورياً.',
    focus: 'Sub-second Latency & Fact-Checking',
  },
];

const PRESET_PROBLEMS = [
  {
    title: 'نظام كاش موزع عالي التوافر مع O(1) Lookup',
    prompt: 'قم بتصميم وهندسة نظام Distributed Cache عالي التوافر مع تعقيد استرجاع O(1)، معالجة انقطاع الشبكة، آليات التراجع التلقائي (Exponential Backoff)، وإبطال المفاتيح المتزامنة.',
  },
  {
    title: 'معمارية تشفير لامركزية مع دوران مفاتيح AES-256',
    prompt: 'اكتب منظومة أمنية متكاملة لإدارة وتشفير البيانات الحساسة بنظام AES-256-GCM، مع دعم دوران المفاتيح تلقائياً كل فترة، والتحقق الصارم من التوقيع الرقمي لمنظومة المهندس مالك حريبات.',
  },
  {
    title: 'حل اختناق المعالجة في الـ Event Loop تحت 50k RPS',
    prompt: 'لدينا خدمة تعالج 50,000 طلب في الثانية وتواجه حظر للـ Event Loop في Node.js. صمم حلاً معمارياً يدمج Worker Threads، زمام معالجة تدفقات Stream Processing، وتوزيع الحمل دون تسريب ذاكرة.',
  },
  {
    title: 'منظومة مراقبة كاميرات حية ومعالجة تدفق RTSP الذكي',
    prompt: 'اكتب خدمة وسيطة Stream Proxy لمعالجة بثوث كاميرات Hikvision و ICSee و Yoosee، تحويل دفق RTSP إلى HLS/WebRTC، ومعالجة انقطاع الاتصال التلقائي مع حفظ إطارات التحذير.',
  },
];

export function MultiAiFusionView({
  onSendCodeToIde,
  onSaveSnippetToVault,
}: MultiAiFusionViewProps) {
  // Navigation Tabs: 'fusion' (Consensus) | 'handover' (Continuous Failover) | 'matrix' (Comparison)
  const [activeTab, setActiveTab] = useState<'fusion' | 'handover' | 'matrix'>('fusion');

  // Selected Models for Consensus Fusion
  const [selectedModels, setSelectedModels] = useState<SupportedModelId[]>([
    'deepseek',
    'claude',
    'chatgpt',
    'gemini',
  ]);

  const [promptInput, setPromptInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [masterSynthesis, setMasterSynthesis] = useState<string | null>(null);
  const [extractedCode, setExtractedCode] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<AiFusionRecord[]>(getStoredAiFusion);

  // --- CONTINUOUS HANDOVER / FAILOVER STATE ---
  const [handoverFromModel, setHandoverFromModel] = useState<SupportedModelId>('deepseek');
  const [handoverToModel, setHandoverToModel] = useState<SupportedModelId>('claude');
  const [handoverReason, setHandoverReason] = useState<string>('token_limit');
  const [handoverPrompt, setHandoverPrompt] = useState<string>('بناء نظام مصادقة ومراقبة شبكي آمن مع تشفير المفاتيح والتحقق الدفاعي.');
  const [handoverInitialSnippet, setHandoverInitialSnippet] = useState<string>(
    `// كود تم إنتاجه بواسطة DeepSeek R1 حتى نقطة التوقف:
export interface DevCoreSecurityCluster {
  nodeId: string;
  clusterSecret: string;
  activeSessions: Map<string, number>;
}

export function initializeClusterMesh(clusterId: string): DevCoreSecurityCluster {
  // O(1) Quick initialization
  const secretKey = Buffer.from(clusterId).toString('base64');
  // [توقف النموذج فجأة هنا عند نفاد الرموز / انقطاع الاتصال]`
  );
  const [handoverResult, setHandoverResult] = useState<{
    continuation: string;
    stitchedOutput: string;
    previousModel: string;
    nextModel: string;
    latencyMs: number;
  } | null>(null);
  const [isHandoverLoading, setIsHandoverLoading] = useState(false);

  // Toggle selection in fusion tab
  const toggleModel = (id: SupportedModelId) => {
    sound.playClick(600);
    if (selectedModels.includes(id)) {
      if (selectedModels.length <= 2) return; // Keep at least 2 models
      setSelectedModels(selectedModels.filter((m) => m !== id));
    } else {
      setSelectedModels([...selectedModels, id]);
    }
  };

  const handleSelectPreset = (p: { title: string; prompt: string }) => {
    sound.playClick(700);
    setPromptInput(p.prompt);
  };

  // Run Multi-Model Fusion
  const handleExecuteFusion = async () => {
    if (!promptInput.trim() || isLoading) return;
    if (selectedModels.length < 2) return;

    sound.playExecute();
    setIsLoading(true);
    setMasterSynthesis(null);
    setExtractedCode(null);

    try {
      const res = await fetch('/api/ai/fuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptInput,
          models: selectedModels,
        }),
      });

      if (!res.ok) throw new Error('فشل استجابة محرك دمج النماذج');

      const data = await res.json();
      const synthesis = data.masterSynthesis || '';
      setLatencyMs(data.latencyMs || null);
      setMasterSynthesis(synthesis);

      // Extract code block
      const codeMatch = synthesis.match(/```(?:typescript|javascript|sql|json|python)?([\s\S]*?)```/);
      if (codeMatch) {
        setExtractedCode(codeMatch[1].trim());
      }

      // Auto-save fusion record
      const record: AiFusionRecord = {
        id: `fuse-${Date.now()}`,
        prompt: promptInput,
        selectedModels: [...selectedModels],
        timestamp: new Date().toLocaleTimeString('ar-EG'),
        masterSolution: synthesis,
        modelOutputs: {},
      };
      const updatedHistory = [record, ...history.slice(0, 9)];
      setHistory(updatedHistory);
      saveStoredAiFusion(updatedHistory);

      sound.playSuccess();
    } catch (err: any) {
      setMasterSynthesis(`حدث خطأ أثناء الدمج: ${err.message || 'تعذر الاتصال'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Run Handover / Failover Relay
  const handleExecuteHandover = async () => {
    if (!handoverPrompt.trim() || isHandoverLoading) return;

    sound.playExecute();
    setIsHandoverLoading(true);

    try {
      const res = await fetch('/api/ai/handover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: handoverPrompt,
          previousModel: handoverFromModel,
          partialOutput: handoverInitialSnippet,
          nextModel: handoverToModel,
          handoverReason: handoverReason,
        }),
      });

      if (!res.ok) throw new Error('فشل استئناف وتسليم الشعلة');

      const data = await res.json();
      setHandoverResult({
        continuation: data.continuation || '',
        stitchedOutput: data.stitchedOutput || '',
        previousModel: data.previousModel || handoverFromModel,
        nextModel: data.nextModel || handoverToModel,
        latencyMs: data.latencyMs || 0,
      });

      sound.playSuccess();
    } catch (err: any) {
      alert(`تعذر إكمال تسليم الشعلة: ${err.message}`);
    } finally {
      setIsHandoverLoading(false);
    }
  };

  // Quick Handover Trigger from Fusion result
  const handleTransferToModel = (targetModel: SupportedModelId) => {
    sound.playClick(800);
    setHandoverFromModel(selectedModels[0] || 'deepseek');
    setHandoverToModel(targetModel);
    setHandoverPrompt(promptInput || 'استكمال وتدقيق الكود التالي');
    setHandoverInitialSnippet(extractedCode || masterSynthesis || '');
    setActiveTab('handover');
  };

  const handleCopyCode = (textToCopy?: string) => {
    const text = textToCopy || extractedCode || masterSynthesis || '';
    if (!text) return;
    navigator.clipboard.writeText(text);
    sound.playClick(900);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToIde = (codeToSend?: string) => {
    const code = codeToSend || extractedCode || masterSynthesis || '';
    if (!code) return;
    sound.playDoorOpen();
    if (onSendCodeToIde) {
      onSendCodeToIde(code, 'devcore_multi_ai_continuous.ts');
    }
  };

  const handleSaveToVault = (codeToSave?: string) => {
    const code = codeToSave || extractedCode || masterSynthesis || '';
    if (!code) return;
    sound.playClick(800);
    if (onSaveSnippetToVault) {
      onSaveSnippetToVault(
        code,
        `حل مدمج ومستأنف (${selectedModels.join('+')}) - ${new Date().toLocaleDateString('ar-EG')}`
      );
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full bg-slate-950 text-slate-100 flex flex-col p-3 sm:p-5 overflow-y-auto selection:bg-cyan-500 selection:text-white" dir="rtl">
      {/* Dynamic Glows */}
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Header */}
      <div className="relative z-10 max-w-7xl mx-auto w-full mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-300 via-sky-200 to-white bg-clip-text text-transparent">
                  محرك دمج منصات الذكاء الاصطناعي والتسليم التلقائي (Multi-AI Orchestrator)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                  8 Platforms Unified
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                دمج منصات الذكاء (OpenAI + Claude + DeepSeek + Gemini + Mistral + Llama + Qwen + Perplexity) مع إمكانية استئناف العمل ونقله عند التوقف
              </p>
            </div>
          </div>

          {/* Navigation Mode Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => { sound.playClick(600); setActiveTab('fusion'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'fusion'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>دمج وتوافق النماذج (Fusion)</span>
            </button>

            <button
              onClick={() => { sound.playClick(600); setActiveTab('handover'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'handover'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>تسليم الشعلة والاستئناف (Handover)</span>
            </button>

            <button
              onClick={() => { sound.playClick(600); setActiveTab('matrix'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'matrix'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>مصفوفة الـ 8 منصات</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: MULTI-AI CONSENSUS & FUSION (دمج النماذج) */}
      {/* ======================================================== */}
      {activeTab === 'fusion' && (
        <div className="relative z-10 max-w-7xl mx-auto w-full space-y-6">
          {/* Model Selection Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>اختر المنصات المطلوب دمجها لحل المسألة (تم تحديد {selectedModels.length} منصات):</span>
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                * يمكنك دمج من 2 إلى 8 منصات معاً في آن واحد
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ALL_AVAILABLE_MODELS.map((model) => {
                const isSelected = selectedModels.includes(model.id);
                return (
                  <div
                    key={model.id}
                    onClick={() => toggleModel(model.id)}
                    className={`relative p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 select-none ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500/70 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-950/50'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 opacity-60 hover:opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${model.color} flex items-center justify-center text-white text-xs font-bold shadow`}>
                          {model.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-1.5">
                            <span>{model.name}</span>
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{model.provider}</span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        isSelected ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {isSelected ? 'مُدمج' : 'غير نشط'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 mt-2.5 line-clamp-2">
                      {model.description}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-cyan-400 truncate">{model.focus}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Problem Input & Presets */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
            <div className="mb-3">
              <span className="text-xs font-bold text-slate-400 block mb-2">
                نماذج لمسائل هندسية ومعمارية معقدة جاهزة للاختبار الفوري:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_PROBLEMS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(p)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-cyan-300 font-mono transition-all text-right"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={4}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="اكتب المسألة البرمجية أو الهندسية المطلوب من المنصات الاندماج لحلها (مثال: تصميم معمارية كاش موزع أو خوارزمية تشفير متقدمة)..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-mono transition-all resize-y"
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>المنصات المندمجة:</span>
                <span className="text-cyan-300 font-bold">
                  {selectedModels.map((m) => m.toUpperCase()).join(' + ')}
                </span>
              </div>

              <button
                onClick={handleExecuteFusion}
                disabled={isLoading || !promptInput.trim() || selectedModels.length < 2}
                className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center gap-2 shadow-lg transition-all duration-200 ${
                  isLoading
                    ? 'bg-cyan-700 animate-pulse cursor-wait'
                    : 'bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-cyan-500/20 active:scale-95'
                }`}
              >
                {isLoading ? (
                  <>
                    <BrainCircuit className="w-4 h-4 animate-spin text-cyan-200" />
                    <span>جاري تشغيل الدمج وتحقيق التوافق المعماري بين المنصات...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>تنفيذ الاندماج المعماري (Execute Consensus)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Master Consensus Result Output */}
          {masterSynthesis && (
            <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      الحل المشترك المتفوق (Master Consensus Solution)
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      بموافقة توافقية بنسبة 100% بين المنصات المختارة
                    </p>
                  </div>
                </div>

                {/* Quick Handover to another model */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTransferToModel('claude')}
                    className="px-3 py-1.5 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-violet-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>تسليم الكود لنموذج آخر للاستكمال</span>
                  </button>

                  <button
                    onClick={() => handleCopyCode()}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                  </button>

                  <button
                    onClick={() => handleSendToIde()}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال للـ IDE</span>
                  </button>

                  <button
                    onClick={() => handleSaveToVault()}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                    title="حفظ في الخزنة"
                  >
                    <BookmarkPlus className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                {masterSynthesis}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CONTINUOUS HANDOVER & FAILOVER RELAY (استئناف ونقل العمل) */}
      {/* ======================================================== */}
      {activeTab === 'handover' && (
        <div className="relative z-10 max-w-7xl mx-auto w-full space-y-6">
          {/* Handover Hero Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/40 via-indigo-950/30 to-slate-900 border border-violet-500/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-amber-300" />
                  </div>
                  <h2 className="text-base font-bold text-white">
                    نظام تسليم الشعلة والاستئناف التلقائي (Model Handover & Failover)
                  </h2>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  عند توقف أي نموذج (بسبب نفاد الرموز Token Limit، انقطاع الاتصال Timeout، أو الرغبة في التدقيق)، يقوم المحرك بالتقاط الكود بدقة وتسليم السياق فوراً للنموذج البديل ليكمل العمل من النقطة التي توقف عندها دون أي تكرار أو انقطاع.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  بروتوكول الاستئناف جاهز
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Relay Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Control Form */}
            <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4">
              <h3 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-violet-400" />
                <span>إعدادات مسار تسليم الشعلة</span>
              </h3>

              {/* Step 1: Model A (Interrupted) */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  1. النموذج الأول (الذي بدأ العمل أو توقف):
                </label>
                <select
                  value={handoverFromModel}
                  onChange={(e) => setHandoverFromModel(e.target.value as SupportedModelId)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                >
                  {ALL_AVAILABLE_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
                  ))}
                </select>
              </div>

              {/* Step 2: Reason for Handover */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  سبب التوقف / النقل:
                </label>
                <select
                  value={handoverReason}
                  onChange={(e) => setHandoverReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-sans"
                >
                  <option value="token_limit">نفاد رموز الاستجابة (Hit Token Limit)</option>
                  <option value="timeout">انقطاع أو بطء الاستجابة (Timeout Failover)</option>
                  <option value="quality_refinement">تدقيق وإكمال أمني دفاعي (Defensive Audit)</option>
                  <option value="manual_transfer">تسليم يدوي للمواصلة (Manual Handover)</option>
                </select>
              </div>

              {/* Step 3: Model B (Continuity) */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  2. النموذج البديل (المكلف بالاستكمال من حيث توقف الأول):
                </label>
                <select
                  value={handoverToModel}
                  onChange={(e) => setHandoverToModel(e.target.value as SupportedModelId)}
                  className="w-full bg-slate-950 border border-violet-500/70 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-400"
                >
                  {ALL_AVAILABLE_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
                  ))}
                </select>
              </div>

              {/* Task Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  سياق المسألة الهندسية:
                </label>
                <input
                  type="text"
                  value={handoverPrompt}
                  onChange={(e) => setHandoverPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <button
                onClick={handleExecuteHandover}
                disabled={isHandoverLoading || !handoverPrompt.trim()}
                className={`w-full py-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isHandoverLoading
                    ? 'bg-violet-700 animate-pulse'
                    : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-violet-600/30 active:scale-95'
                }`}
              >
                {isHandoverLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>جاري نقل السياق واستكمال الكود بدون تكرار...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>بدء نقل العمل واستكماله فوراً</span>
                  </>
                )}
              </button>
            </div>

            {/* Snippet Editor & Visual Handover Chain */}
            <div className="lg:col-span-2 space-y-4">
              {/* Box 1: What Model 1 wrote before stopping */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold text-slate-300">
                      ما أنجزه النموذج الأول ({handoverFromModel.toUpperCase()}) قبل التوقف:
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono">
                    نقطة التوقف محددة بدقة
                  </span>
                </div>

                <textarea
                  rows={6}
                  value={handoverInitialSnippet}
                  onChange={(e) => setHandoverInitialSnippet(e.target.value)}
                  placeholder="ألصق هنا الكود أو النص الذي توقف عنده النموذج الأول..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-violet-500 resize-y"
                />
              </div>

              {/* Box 2: Seamless Handover Output */}
              {handoverResult && (
                <div className="bg-slate-900 border border-violet-500/50 rounded-2xl p-4 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-2 mb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">
                          تم استلام الشعلة والاستكمال بنجاح عبر ({handoverResult.nextModel.toUpperCase()})
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          زمن الاستجابة: {handoverResult.latencyMs}ms | تم ربط الكود بالكامل
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyCode(handoverResult.stitchedOutput)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                      >
                        نسخ الكود المكتمل
                      </button>
                      <button
                        onClick={() => handleSendToIde(handoverResult.stitchedOutput)}
                        className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white"
                      >
                        إرسال للـ IDE
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                    {handoverResult.stitchedOutput}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PLATFORM BENCHMARKS & MATRIX */}
      {/* ======================================================== */}
      {activeTab === 'matrix' && (
        <div className="relative z-10 max-w-7xl mx-auto w-full space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-1">دليل المنصات الـ 8 المدمجة في منظومة المهندس مالك حريبات</h3>
            <p className="text-xs text-slate-400">
              مقارنة القدرات الفنية والتخصص الهندسي لكل منصة ذكاء مدمجة في نظام DevCore:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ALL_AVAILABLE_MODELS.map((model) => (
              <div key={model.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${model.color} flex items-center justify-center text-white text-sm font-bold`}>
                    {model.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{model.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{model.provider}</span>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-cyan-400 pt-1 border-t border-slate-800">
                  {model.badge}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {model.description}
                </p>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>التخصص:</span>
                  <span className="text-slate-300 truncate max-w-[140px]">{model.focus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
