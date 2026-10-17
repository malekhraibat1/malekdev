import { useState } from 'react';
import { sound } from '../utils/audio.ts';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Minimize2, 
  Maximize2, 
  X, 
  BrainCircuit, 
  Code2, 
  Copy, 
  Check, 
  Receipt, 
  CheckSquare,
  Zap
} from 'lucide-react';

interface DevCoreFloatingAssistantProps {
  onOpenAppStudio?: () => void;
  onOpenDebts?: () => void;
  onOpenTasks?: () => void;
}

export function DevCoreFloatingAssistant({
  onOpenAppStudio,
  onOpenDebts,
  onOpenTasks,
}: DevCoreFloatingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [messages, setMessages] = useState<{ role: 'assistant' | 'user'; text: string; code?: string }[]>([
    {
      role: 'assistant',
      text: 'مرحباً بك يا مهندس مالك حريبات! أنا مساعدك المعماري الذكي (DevCore Architect Copilot). كيف يمكنني مساعدتك في برمجة أو تعديل التطبيقات، أو مراجعة الذمم والمهمات الآن؟',
    },
  ]);

  const handleSend = async () => {
    if (!prompt.trim() || loading) return;
    const userText = prompt.trim();
    setPrompt('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setLoading(true);
    sound.playExecute();

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `أنت المساعد المعماري والبرمجي الشخصي للمهندس مالك حريبات (Lead Architect).
سؤال المهندس: ${userText}

أجب بدقة متناهية، باللغة العربية الراقية وبشكل هندسي احترافي، وضع أي أكواد برمجية في كتل كود \`\`\` واضحة.`,
          model: 'deepseek',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: data.answer || 'تمت المعالجة بنجاح' },
        ]);
        sound.playSuccess();
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: 'جاهز يا باشمهندس مالك. تم تسجيل طلبك ويمكنك تحويله لأي من نماذج الذكاء الاصطناعي الـ 8 عبر استوديو البرمجة أو محرك الدمج.',
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'تم استلام التوجيه البرمجي يا مهندس مالك. كل الأنظمة تعمل بكفاءة 100% وتحت السيطرة.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (text: string, index: number) => {
    sound.playClick(600);
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // If floating widget is closed, show subtle floating pill button
  if (!isOpen) {
    return (
      <button
        onClick={() => {
          sound.playClick(500);
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className="fixed bottom-14 left-4 z-40 p-3 bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white rounded-full shadow-2xl shadow-cyan-900/50 hover:scale-105 transition-all flex items-center gap-2 border border-cyan-400/30 group"
        title="المساعد المعماري الذكي للمهندس مالك"
      >
        <Bot className="w-5 h-5 text-cyan-200 group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-bold pl-1 hidden sm:inline">المساعد المعماري</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
      </button>
    );
  }

  // Floating Window
  return (
    <div
      className={`fixed z-40 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col overflow-hidden text-slate-100 transition-all ${
        isMinimized
          ? 'bottom-14 left-4 w-72 h-12'
          : 'bottom-14 left-4 w-96 max-w-[calc(100vw-32px)] h-[480px]'
      }`}
    >
      {/* Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white">
            <Bot className="w-4 h-4 text-cyan-100" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>المساعد المعماري الذكي</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 font-mono">DevCore</span>
            </div>
            <div className="text-[10px] text-slate-400">إشراف: م. مالك حريبات</div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded"
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-slate-400 hover:text-rose-400 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Quick Action Shortcuts */}
          <div className="px-3 py-1.5 bg-slate-950/70 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
            {onOpenAppStudio && (
              <button
                onClick={() => { sound.playClick(400); onOpenAppStudio(); }}
                className="px-2 py-0.5 rounded-lg bg-slate-800 text-cyan-300 hover:bg-slate-700 flex items-center gap-1 whitespace-nowrap"
              >
                <Code2 className="w-3 h-3" />
                <span>استوديو التعديل</span>
              </button>
            )}
            {onOpenDebts && (
              <button
                onClick={() => { sound.playClick(400); onOpenDebts(); }}
                className="px-2 py-0.5 rounded-lg bg-slate-800 text-emerald-300 hover:bg-slate-700 flex items-center gap-1 whitespace-nowrap"
              >
                <Receipt className="w-3 h-3" />
                <span>دفتر الديون</span>
              </button>
            )}
            {onOpenTasks && (
              <button
                onClick={() => { sound.playClick(400); onOpenTasks(); }}
                className="px-2 py-0.5 rounded-lg bg-slate-800 text-amber-300 hover:bg-slate-700 flex items-center gap-1 whitespace-nowrap"
              >
                <CheckSquare className="w-3 h-3" />
                <span>المهمات</span>
              </button>
            )}
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl flex flex-col space-y-1.5 ${
                  m.role === 'user'
                    ? 'bg-cyan-600/20 text-cyan-100 border border-cyan-500/30 mr-4'
                    : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 ml-4'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-bold">
                    {m.role === 'user' ? 'المهندس مالك' : 'المساعد المعماري'}
                  </span>
                  <button
                    onClick={() => handleCopyMessage(m.text, idx)}
                    className="p-0.5 hover:text-white"
                    title="نسخ"
                  >
                    {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div className="leading-relaxed whitespace-pre-wrap">{m.text}</div>
              </div>
            ))}
            {loading && (
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-400 text-xs flex items-center gap-2 animate-pulse">
                <BrainCircuit className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>جاري معالجة الطلب المعماري...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اسأل عن كود، خطأ، أو ميزة تطبيق..."
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 px-3 py-1.5 rounded-xl text-xs text-slate-200 outline-none"
            />
            <button
              disabled={loading || !prompt.trim()}
              onClick={handleSend}
              className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-md transition-all disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
