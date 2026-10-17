import { useState, useMemo } from 'react';
import { sound } from '../../utils/audio.ts';
import { 
  DEFAULT_DEBTS, 
  getStoredDebts, 
  saveStoredDebts, 
  DebtEntry, 
  DebtPayment,
  DebtType,
  DebtCategory,
  DebtCurrency,
  DebtStatus
} from '../../utils/storage.ts';
import { 
  Receipt, 
  Plus, 
  Search, 
  Trash2, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  FileText, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Printer, 
  MessageCircle, 
  Download, 
  Coins, 
  Calendar,
  X,
  Check
} from 'lucide-react';

interface DebtBookAppProps {
  isEmbedded?: boolean;
}

export function DebtBookApp({ isEmbedded = false }: DebtBookAppProps) {
  const [debts, setDebts] = useState<DebtEntry[]>(getStoredDebts);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'to_us' | 'from_us' | 'overdue' | 'paid'>('all');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [activeDebt, setActiveDebt] = useState<DebtEntry | null>(null);

  // New Debt Form State
  const [formData, setFormData] = useState<{
    personName: string;
    phone: string;
    type: DebtType;
    category: DebtCategory;
    totalAmount: string;
    currency: DebtCurrency;
    startDate: string;
    dueDate: string;
    status: DebtStatus;
    notes: string;
    invoiceRef: string;
  }>({
    personName: '',
    phone: '',
    type: 'debt_to_us',
    category: 'كاميرات ومراقبة',
    totalAmount: '',
    currency: 'ILS',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    status: 'active',
    notes: '',
    invoiceRef: '',
  });

  // Payment Form State
  const [paymentData, setPaymentData] = useState<{
    amount: string;
    method: 'نقداً' | 'تحويل بنكي' | 'شيك' | 'بطاقة دفع';
    date: string;
    receiptNumber: string;
    note: string;
  }>({
    amount: '',
    method: 'نقداً',
    date: new Date().toISOString().split('T')[0],
    receiptNumber: '',
    note: '',
  });

  // Financial summary calculations
  const stats = useMemo(() => {
    let toUsTotal = 0;
    let toUsPaid = 0;
    let fromUsTotal = 0;
    let fromUsPaid = 0;
    let overdueCount = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    debts.forEach((d) => {
      const paidSum = d.payments.reduce((acc, p) => acc + p.amount, 0);
      const remaining = Math.max(0, d.totalAmount - paidSum);

      if (d.type === 'debt_to_us') {
        toUsTotal += d.totalAmount;
        toUsPaid += paidSum;
      } else {
        fromUsTotal += d.totalAmount;
        fromUsPaid += paidSum;
      }

      if (remaining > 0 && d.dueDate < todayStr) {
        overdueCount++;
      }
    });

    const toUsRemaining = Math.max(0, toUsTotal - toUsPaid);
    const fromUsRemaining = Math.max(0, fromUsTotal - fromUsPaid);
    const netBalance = toUsRemaining - fromUsRemaining;

    return {
      toUsTotal,
      toUsPaid,
      toUsRemaining,
      fromUsTotal,
      fromUsPaid,
      fromUsRemaining,
      netBalance,
      overdueCount,
      totalCount: debts.length,
    };
  }, [debts]);

  // Filtered debts
  const filteredDebts = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return debts.filter((d) => {
      const paidSum = d.payments.reduce((acc, p) => acc + p.amount, 0);
      const remaining = d.totalAmount - paidSum;

      // Tab filter
      if (activeTab === 'to_us' && d.type !== 'debt_to_us') return false;
      if (activeTab === 'from_us' && d.type !== 'debt_from_us') return false;
      if (activeTab === 'overdue' && (remaining <= 0 || d.dueDate >= todayStr)) return false;
      if (activeTab === 'paid' && remaining > 0) return false;

      // Currency filter
      if (selectedCurrency !== 'all' && d.currency !== selectedCurrency) return false;

      // Category filter
      if (selectedCategory !== 'all' && d.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = d.personName.toLowerCase().includes(q);
        const matchesPhone = d.phone.toLowerCase().includes(q);
        const matchesInvoice = (d.invoiceRef || '').toLowerCase().includes(q);
        const matchesNotes = (d.notes || '').toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesInvoice && !matchesNotes) return false;
      }

      return true;
    });
  }, [debts, activeTab, selectedCurrency, selectedCategory, searchQuery]);

  // Create new debt
  const handleSaveNewDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.personName || !formData.totalAmount) return;

    sound.playExecute();
    const newEntry: DebtEntry = {
      id: `debt-${Date.now()}`,
      personName: formData.personName,
      phone: formData.phone,
      type: formData.type,
      category: formData.category,
      totalAmount: parseFloat(formData.totalAmount) || 0,
      currency: formData.currency,
      startDate: formData.startDate,
      dueDate: formData.dueDate,
      status: formData.status,
      notes: formData.notes,
      invoiceRef: formData.invoiceRef || `INV-${Date.now().toString().slice(-4)}`,
      payments: [],
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    const updated = [newEntry, ...debts];
    setDebts(updated);
    saveStoredDebts(updated);
    setIsAddModalOpen(false);

    // Reset form
    setFormData({
      personName: '',
      phone: '',
      type: 'debt_to_us',
      category: 'كاميرات ومراقبة',
      totalAmount: '',
      currency: 'ILS',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'active',
      notes: '',
      invoiceRef: '',
    });
  };

  // Add payment to debt
  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDebt || !paymentData.amount) return;

    sound.playSuccess();
    const amountNum = parseFloat(paymentData.amount) || 0;
    const newPayment: DebtPayment = {
      id: `pay-${Date.now()}`,
      date: paymentData.date,
      amount: amountNum,
      method: paymentData.method,
      receiptNumber: paymentData.receiptNumber || `REC-${Date.now().toString().slice(-4)}`,
      note: paymentData.note,
    };

    const updated = debts.map((d) => {
      if (d.id === activeDebt.id) {
        const newPayments = [...d.payments, newPayment];
        const totalPaid = newPayments.reduce((acc, p) => acc + p.amount, 0);
        let newStatus: DebtStatus = d.status;
        if (totalPaid >= d.totalAmount) {
          newStatus = 'paid';
        } else if (totalPaid > 0) {
          newStatus = 'partially_paid';
        }
        return {
          ...d,
          payments: newPayments,
          status: newStatus,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      }
      return d;
    });

    setDebts(updated);
    saveStoredDebts(updated);
    setIsPayModalOpen(false);
    setActiveDebt(null);
    setPaymentData({
      amount: '',
      method: 'نقداً',
      date: new Date().toISOString().split('T')[0],
      receiptNumber: '',
      note: '',
    });
  };

  // Delete debt
  const handleDeleteDebt = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السجل المالي نهائياً؟')) {
      sound.playClick(400);
      const updated = debts.filter((d) => d.id !== id);
      setDebts(updated);
      saveStoredDebts(updated);
    }
  };

  // WhatsApp Alert Message
  const handleSendWhatsApp = (debt: DebtEntry) => {
    const paidSum = debt.payments.reduce((acc, p) => acc + p.amount, 0);
    const remaining = debt.totalAmount - paidSum;
    const msg = encodeURIComponent(
      `السلام عليكم ورحمة الله،\nالأخ الكريم ${debt.personName} المحترم،\nنود تذكيركم بمستحقات مالية متعلقة بـ (${debt.category} - فاتورة #${debt.invoiceRef || debt.id}):\n- إجمالي المبلغ: ${debt.totalAmount} ${debt.currency}\n- المسدد: ${paidSum} ${debt.currency}\n- المبلغ المتبقي: ${remaining} ${debt.currency}\n- تاريخ الاستحقاق: ${debt.dueDate}\n\nشاكرين لكم حسن تعاونكم.\nالمكتب الهندسي - المهندس مالك حريبات`
    );

    const cleanPhone = debt.phone.replace(/[^0-9]/g, '');
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(url, '_blank');
  };

  // Export JSON Backup
  const handleExportJson = () => {
    sound.playClick(800);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(debts, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `DevCore_Debts_Ledger_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
  };

  // Currency Symbol Helper
  const getCurrencySymbol = (c: DebtCurrency) => {
    switch (c) {
      case 'ILS': return '₪';
      case 'USD': return '$';
      case 'JOD': return 'د.أ';
      case 'SAR': return 'ر.س';
      case 'EUR': return '€';
      default: return c;
    }
  };

  return (
    <div className={`relative w-full ${isEmbedded ? 'h-full' : 'min-h-[calc(100vh-4rem)]'} bg-slate-950 text-slate-100 flex flex-col p-3 sm:p-5 overflow-y-auto selection:bg-emerald-500 selection:text-white`} dir="rtl">
      {/* Background glow */}
      <div className="absolute top-12 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Title */}
      <div className="relative z-10 max-w-7xl mx-auto w-full mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Receipt className="w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-300 via-teal-200 to-white bg-clip-text text-transparent">
                  دفتر الديون والذمم المالية (Ledger Book)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                  DevCore Accounting
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                إدارة ديون الزبائن والموردين، تسجيل دفعات السداد، حساب الأرصدة التلقائي، وكشوفات الحساب المعتمدة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick(600);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition-all transform hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة ذمة / دين جديد</span>
            </button>

            <button
              onClick={handleExportJson}
              title="تصدير نسخة احتياطية JSON"
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">نسخة احتياطية</span>
            </button>
          </div>
        </div>

        {/* 4 Financial Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
          {/* Card 1: Receivables (ديون لنا) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-300">ديون لنا (مستحقات على الزبائن)</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {stats.toUsRemaining.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-400 font-mono">₪ متبقي للتحصيل</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
              <span>إجمالي العقود: {stats.toUsTotal.toLocaleString()} ₪</span>
              <span className="text-emerald-400 font-mono font-bold">المحصل: {stats.toUsPaid.toLocaleString()} ₪</span>
            </div>
          </div>

          {/* Card 2: Payables (ديون علينا) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-300">ديون علينا (مستحقات للموردين)</span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {stats.fromUsRemaining.toLocaleString()}
              </span>
              <span className="text-xs text-rose-400 font-mono">₪ متبقي للسداد</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
              <span>إجمالي الفواتير: {stats.fromUsTotal.toLocaleString()} ₪</span>
              <span className="text-rose-400 font-mono font-bold">المسدد: {stats.fromUsPaid.toLocaleString()} ₪</span>
            </div>
          </div>

          {/* Card 3: Net Balance (صافي الذمة) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-300">صافي الميزان المالي (Net Position)</span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-2xl font-black font-mono ${stats.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stats.netBalance >= 0 ? `+${stats.netBalance.toLocaleString()}` : stats.netBalance.toLocaleString()}
              </span>
              <span className="text-xs text-cyan-400 font-mono">₪ فارق الذمم</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
              <span>الفائض المالي التشغيلي</span>
              <span className="text-cyan-400 font-mono font-bold">{stats.totalCount} عمليات نشطة</span>
            </div>
          </div>

          {/* Card 4: Overdue Alert (المتعثرة والمتأخرة) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-300">الذمم المتأخرة عن موعدها</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-400 font-mono">
                {stats.overdueCount}
              </span>
              <span className="text-xs text-amber-300 font-mono">ذمة تتطلب متابعة عاجلة</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
              <span>تنبيهات الاستحقاق</span>
              <span className="text-amber-400 font-mono">تنبيه واتساب مفعل</span>
            </div>
          </div>
        </div>

        {/* Search, Filter Bar and Tabs */}
        <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => { sound.playClick(600); setActiveTab('all'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              الكل ({debts.length})
            </button>

            <button
              onClick={() => { sound.playClick(600); setActiveTab('to_us'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'to_us'
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>ديون لنا (زبائن)</span>
            </button>

            <button
              onClick={() => { sound.playClick(600); setActiveTab('from_us'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'from_us'
                  ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
              <span>ديون علينا (موردون)</span>
            </button>

            <button
              onClick={() => { sound.playClick(600); setActiveTab('overdue'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'overdue'
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>متأخرة ({stats.overdueCount})</span>
            </button>

            <button
              onClick={() => { sound.playClick(600); setActiveTab('paid'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'paid'
                  ? 'bg-teal-500/30 text-teal-300 border border-teal-500/50 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              <span>مسددة بالكامل</span>
            </button>
          </div>

          {/* Search Input & Dropdowns */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم أو الهاتف أو الفاتورة..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all font-mono"
              />
            </div>

            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="all">كل العملات</option>
              <option value="ILS">₪ شيكل</option>
              <option value="USD">$ دولار</option>
              <option value="JOD">د.أ دينار</option>
              <option value="SAR">ر.س ريال</option>
              <option value="EUR">€ يورو</option>
            </select>
          </div>
        </div>

        {/* Debts Table / Cards List */}
        <div className="mt-4 space-y-3">
          {filteredDebts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
              <Receipt className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-slate-300 mb-1">لا توجد سجلات ديون مطابقة</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                لم يتم العثور على أي ذمة مالية توافق معايير البحث أو التصفية المختارة.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all"
              >
                إضافة أول دين أو مطالبة
              </button>
            </div>
          ) : (
            filteredDebts.map((debt) => {
              const paidSum = debt.payments.reduce((acc, p) => acc + p.amount, 0);
              const remaining = Math.max(0, debt.totalAmount - paidSum);
              const progressPct = debt.totalAmount > 0 ? Math.min(100, Math.round((paidSum / debt.totalAmount) * 100)) : 0;
              const isOverdue = remaining > 0 && debt.dueDate < new Date().toISOString().split('T')[0];

              return (
                <div
                  key={debt.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 ${
                    isOverdue
                      ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500/70'
                      : debt.type === 'debt_to_us'
                      ? 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/40'
                      : 'bg-slate-900/80 border-slate-800 hover:border-rose-500/40'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Person / Company Details */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        debt.type === 'debt_to_us'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}>
                        {debt.type === 'debt_to_us' ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-white truncate">
                            {debt.personName}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            debt.type === 'debt_to_us'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                              : 'bg-rose-950 text-rose-300 border border-rose-600/40'
                          }`}>
                            {debt.type === 'debt_to_us' ? 'دين لنا (زبون)' : 'دين علينا (مورد)'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                            {debt.category}
                          </span>
                          {isOverdue && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-950 text-amber-300 border border-amber-600/50 flex items-center gap-1 font-bold">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              متأخرة عن موعدها
                            </span>
                          )}
                          {remaining === 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-950 text-teal-300 border border-teal-600/50 flex items-center gap-1 font-bold">
                              <CheckCircle2 className="w-3 h-3 text-teal-400" />
                              تم السداد كاملاً
                            </span>
                          )}
                        </div>

                        {/* Sub metadata */}
                        <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                          {debt.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-500" />
                              <span dir="ltr">{debt.phone}</span>
                            </span>
                          )}
                          {debt.invoiceRef && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3 text-slate-500" />
                              <span>فاتورة: {debt.invoiceRef}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>الاستحقاق: {debt.dueDate}</span>
                          </span>
                        </div>

                        {debt.notes && (
                          <p className="mt-1 text-xs text-slate-400 line-clamp-1 italic">
                            &quot;{debt.notes}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Financial Figures & Progress */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
                      <div className="w-44">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-400">سدد: {paidSum.toLocaleString()} {getCurrencySymbol(debt.currency)}</span>
                          <span className="font-bold text-white font-mono">{progressPct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              progressPct === 100
                                ? 'bg-teal-400'
                                : debt.type === 'debt_to_us'
                                ? 'bg-emerald-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-mono">
                          <span>الإجمالي: {debt.totalAmount.toLocaleString()}</span>
                          <span className={remaining > 0 ? 'text-amber-400 font-bold' : 'text-teal-400'}>
                            باقي: {remaining.toLocaleString()} {getCurrencySymbol(debt.currency)}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {remaining > 0 && (
                          <button
                            onClick={() => {
                              sound.playClick(700);
                              setActiveDebt(debt);
                              setPaymentData({
                                amount: remaining.toString(),
                                method: 'نقداً',
                                date: new Date().toISOString().split('T')[0],
                                receiptNumber: '',
                                note: `دفعة سداد لذمة ${debt.personName}`,
                              });
                              setIsPayModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>سداد دفعة</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            sound.playClick(600);
                            setActiveDebt(debt);
                            setIsStatementModalOpen(true);
                          }}
                          title="عرض وطباعة كشف الحساب"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                        >
                          <Printer className="w-4 h-4 text-cyan-400" />
                        </button>

                        <button
                          onClick={() => handleSendWhatsApp(debt)}
                          title="إرسال تذكير عبر واتساب"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950 text-slate-300 hover:text-emerald-400 transition-all"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-400" />
                        </button>

                        <button
                          onClick={() => handleDeleteDebt(debt.id)}
                          title="حذف هذا السجل"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Payment history accordions */}
                  {debt.payments.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                      <span className="text-[11px] text-slate-500 font-sans">سجل الدفعات ({debt.payments.length}):</span>
                      {debt.payments.map((p) => (
                        <span key={p.id} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>{p.amount.toLocaleString()} {getCurrencySymbol(debt.currency)} ({p.method})</span>
                          <span className="text-slate-500">[{p.date}]</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* --- MODAL 1: ADD NEW DEBT --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 max-h-[90vh] overflow-y-auto shadow-2xl" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">إضافة ذمة مالية أو دين جديد</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewDebt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  الاسم الكامل (الزبون / المورد / الجهة) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شركة النور للمقاولات - م. أحمد"
                  value={formData.personName}
                  onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    نوع الذمة *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as DebtType })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                  >
                    <option value="debt_to_us">دين لنا (مستحقات على عميل)</option>
                    <option value="debt_from_us">دين علينا (مستحقات لمورد/فني)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    تصنيف العملية
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as DebtCategory })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                  >
                    <option value="كاميرات ومراقبة">كاميرات ومراقبة (Hik/ICSee)</option>
                    <option value="صيانة وشبكات">صيانة وشبكات</option>
                    <option value="توريدات ومشتريات">توريدات ومشتريات</option>
                    <option value="استشارات برمجية">استشارات برمجية</option>
                    <option value="عام وشخصي">عام وشخصي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    المبلغ الإجمالي *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    العملة *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as DebtCurrency })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="ILS">₪ شيكل إسرائيلي (ILS)</option>
                    <option value="USD">$ دولار أمريكي (USD)</option>
                    <option value="JOD">د.أ دينار أردني (JOD)</option>
                    <option value="SAR">ر.س ريال سعودي (SAR)</option>
                    <option value="EUR">€ يورو (EUR)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    رقم الهاتف / الواتساب
                  </label>
                  <input
                    type="text"
                    placeholder="+970 599 000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    رقم الفاتورة / العقد
                  </label>
                  <input
                    type="text"
                    placeholder="INV-2026-001"
                    value={formData.invoiceRef}
                    onChange={(e) => setFormData({ ...formData, invoiceRef: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    تاريخ البدء
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    تاريخ الاستحقاق النهائي
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ملاحظات وتفاصيل الأعمال
                </label>
                <textarea
                  rows={2}
                  placeholder="تفاصيل التوريد أو التركيب أو الشروط المتفق عليها..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ وتسجيل في الدفتر</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD PAYMENT / INSTALLMENT --- */}
      {isPayModalOpen && activeDebt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <div>
                  <h2 className="text-base font-bold text-white">تسجيل دفعة سداد جديدة</h2>
                  <p className="text-xs text-slate-400 font-mono">{activeDebt.personName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPayment} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono flex items-center justify-between">
                <span className="text-slate-400">المبلغ المتبقي:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {(activeDebt.totalAmount - activeDebt.payments.reduce((a, b) => a + b.amount, 0)).toLocaleString()} {getCurrencySymbol(activeDebt.currency)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  مبلغ الدفعة المسددة *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    طريقة الدفع
                  </label>
                  <select
                    value={paymentData.method}
                    onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                  >
                    <option value="نقداً">نقداً (Cash)</option>
                    <option value="تحويل بنكي">تحويل بنكي</option>
                    <option value="شيك">شيك مصرفي</option>
                    <option value="بطاقة دفع">بطاقة دفع</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    تاريخ السداد
                  </label>
                  <input
                    type="date"
                    value={paymentData.date}
                    onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  رقم الإيصال / الشيك / الحوالة
                </label>
                <input
                  type="text"
                  placeholder="مثال: REC-9921 أو شيك رقم 44102"
                  value={paymentData.receiptNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, receiptNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ملاحظات السداد
                </label>
                <input
                  type="text"
                  placeholder="تم استلام المبلغ نقداً في المكتب..."
                  value={paymentData.note}
                  onChange={(e) => setPaymentData({ ...paymentData, note: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>تأكيد السداد وتحديث الرصيد</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: OFFICIAL STATEMENT / PRINT PREVIEW --- */}
      {isStatementModalOpen && activeDebt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl" dir="rtl">
            {/* Header of official statement */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold font-mono text-sm">
                  &lt;/&gt;
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">المكتب الهندسي للأنظمة الذكية</h2>
                  <p className="text-xs text-slate-600 font-semibold">بإشراف: المهندس مالك حريبات | DevCore Architecture</p>
                </div>
              </div>
              <div className="text-left font-mono text-xs text-slate-500">
                <p>تاريخ الكشف: {new Date().toLocaleDateString('ar-EG')}</p>
                <p>رقم المستند: STMT-{activeDebt.id.slice(-6).toUpperCase()}</p>
              </div>
            </div>

            <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-2">كشف حساب ذمة مالية معتمد</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-500">الاسم / الجهة:</span> <strong className="text-slate-900">{activeDebt.personName}</strong></div>
                <div><span className="text-slate-500">رقم الهاتف:</span> <strong className="text-slate-900" dir="ltr">{activeDebt.phone || 'غير مسجل'}</strong></div>
                <div><span className="text-slate-500">نوع الذمة:</span> <strong>{activeDebt.type === 'debt_to_us' ? 'مستحقات لنا على العميل' : 'مستحقات للمورد علينا'}</strong></div>
                <div><span className="text-slate-500">رقم الفاتورة:</span> <strong>{activeDebt.invoiceRef || '-'}</strong></div>
                <div><span className="text-slate-500">تاريخ البدء:</span> <strong>{activeDebt.startDate}</strong></div>
                <div><span className="text-slate-500">تاريخ الاستحقاق:</span> <strong>{activeDebt.dueDate}</strong></div>
              </div>
            </div>

            {/* Financial breakdown table */}
            <table className="w-full text-xs text-right border-collapse mb-4">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                  <th className="p-2.5">البيان / الوصف</th>
                  <th className="p-2.5">المبلغ الأصلي</th>
                  <th className="p-2.5">إجمالي المسدد</th>
                  <th className="p-2.5">الرصيد المتبقي</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 font-mono">
                  <td className="p-2.5 font-sans font-semibold">{activeDebt.notes || activeDebt.category}</td>
                  <td className="p-2.5">{activeDebt.totalAmount.toLocaleString()} {getCurrencySymbol(activeDebt.currency)}</td>
                  <td className="p-2.5 text-emerald-600 font-bold">
                    {activeDebt.payments.reduce((a, b) => a + b.amount, 0).toLocaleString()} {getCurrencySymbol(activeDebt.currency)}
                  </td>
                  <td className="p-2.5 text-rose-600 font-bold text-sm">
                    {(activeDebt.totalAmount - activeDebt.payments.reduce((a, b) => a + b.amount, 0)).toLocaleString()} {getCurrencySymbol(activeDebt.currency)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Payments detail log */}
            <h4 className="text-xs font-bold text-slate-800 mb-2">سجل الدفعات والسدادات:</h4>
            {activeDebt.payments.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">لم يتم تسجيل أي دفعات سداد حتى تاريخه.</p>
            ) : (
              <table className="w-full text-xs text-right border-collapse mb-4 font-mono">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[11px]">
                    <th className="p-2">التاريخ</th>
                    <th className="p-2">المبلغ</th>
                    <th className="p-2">طريقة الدفع</th>
                    <th className="p-2">رقم الإيصال</th>
                    <th className="p-2">ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {activeDebt.payments.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100">
                      <td className="p-2">{p.date}</td>
                      <td className="p-2 font-bold text-emerald-600">{p.amount.toLocaleString()} {getCurrencySymbol(activeDebt.currency)}</td>
                      <td className="p-2 font-sans">{p.method}</td>
                      <td className="p-2">{p.receiptNumber || '-'}</td>
                      <td className="p-2 font-sans text-slate-500">{p.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Signature box */}
            <div className="mt-8 pt-4 border-t-2 border-slate-200 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-800">توقيع المستلم / العميل:</p>
                <div className="h-10 border-b border-dashed border-slate-300 w-44 mt-1" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800">اعتماد المهندس مالك حريبات:</p>
                <div className="mt-1 font-mono text-[11px] text-emerald-700 font-bold">
                  ✓ Verified Digital DevCore Signature
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setIsStatementModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>طباعة الكشف الرسمي</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
