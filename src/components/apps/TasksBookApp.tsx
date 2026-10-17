import { useState, useMemo } from 'react';
import { sound } from '../../utils/audio.ts';
import { 
  DEFAULT_TASKS, 
  getStoredTasks, 
  saveStoredTasks, 
  TaskEntry, 
  TaskSubitem,
  TaskPriority,
  TaskStatus,
  TaskCategory
} from '../../utils/storage.ts';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Tag, 
  User, 
  Download, 
  Kanban, 
  ListFilter, 
  Zap, 
  Flame, 
  Check, 
  X, 
  ArrowRight, 
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

interface TasksBookAppProps {
  isEmbedded?: boolean;
}

export function TasksBookApp({ isEmbedded = false }: TasksBookAppProps) {
  const [tasks, setTasks] = useState<TaskEntry[]>(getStoredTasks);
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'agenda'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<TaskEntry | null>(null);

  // New Task Form State
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: TaskCategory;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string;
    estimatedHours: string;
    assignedTo: string;
    tags: string;
    subtasksInput: string;
  }>({
    title: '',
    description: '',
    category: 'هندسة وبرمجة',
    priority: 'high',
    status: 'todo',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    estimatedHours: '2',
    assignedTo: 'المهندس مالك حريبات',
    tags: 'برمجة, DevCore',
    subtasksInput: 'تجهيز بيئة العمل\nكتابة الشيفرة البرمجية\nإجراء الفحص التجريبي',
  });

  // Calculate Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const urgent = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'done').length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return { total, done, inProgress, urgent, completionRate };
  }, [tasks]);

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = (t.description || '').toLowerCase().includes(q);
        const matchesTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTags) return false;
      }

      return true;
    });
  }, [tasks, selectedCategory, selectedPriority, searchQuery]);

  // Handle Save New Task
  const handleSaveNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    sound.playExecute();

    const subtasksList: TaskSubitem[] = formData.subtasksInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s, idx) => ({
        id: `sub-${Date.now()}-${idx}`,
        title: s,
        completed: false,
      }));

    const tagsList = formData.tags
      .split(/[,،]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const newTask: TaskEntry = {
      id: `task-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate,
      createdAt: new Date().toISOString().split('T')[0],
      estimatedHours: parseFloat(formData.estimatedHours) || 1,
      assignedTo: formData.assignedTo || 'المهندس مالك حريبات',
      tags: tagsList,
      subtasks: subtasksList,
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveStoredTasks(updated);
    setIsAddModalOpen(false);

    // Reset
    setFormData({
      title: '',
      description: '',
      category: 'هندسة وبرمجة',
      priority: 'high',
      status: 'todo',
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      estimatedHours: '2',
      assignedTo: 'المهندس مالك حريبات',
      tags: 'برمجة, DevCore',
      subtasksInput: 'تجهيز بيئة العمل\nكتابة الشيفرة البرمجية\nإجراء الفحص التجريبي',
    });
  };

  // Toggle Subtask
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    sound.playClick(800);
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const newSubs = t.subtasks.map((sub) =>
          sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
        );
        const allDone = newSubs.length > 0 && newSubs.every((s) => s.completed);
        return {
          ...t,
          subtasks: newSubs,
          status: (allDone ? 'done' : t.status === 'done' ? 'in_progress' : t.status) as TaskStatus,
          completedAt: allDone ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return t;
    });

    setTasks(updated);
    saveStoredTasks(updated);
  };

  // Move task to status
  const handleMoveStatus = (taskId: string, newStatus: TaskStatus) => {
    sound.playClick(650);
    if (newStatus === 'done') {
      sound.playSuccess();
    }
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'done' ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return t;
    });
    setTasks(updated);
    saveStoredTasks(updated);
  };

  // Delete task
  const handleDeleteTask = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المهمة نهائياً؟')) {
      sound.playClick(400);
      const updated = tasks.filter((t) => t.id !== id);
      setTasks(updated);
      saveStoredTasks(updated);
    }
  };

  // Export tasks JSON
  const handleExportJson = () => {
    sound.playClick(750);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `DevCore_Tasks_Notebook_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
  };

  // Priority helper
  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'urgent':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/50 flex items-center gap-1">
            <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
            عاجل جداً
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
            أولوية مرتفعة
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/30">
            متوسطة
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
            منخفضة
          </span>
        );
    }
  };

  return (
    <div className={`relative w-full ${isEmbedded ? 'h-full' : 'min-h-[calc(100vh-4rem)]'} bg-slate-950 text-slate-100 flex flex-col p-3 sm:p-5 overflow-y-auto selection:bg-amber-500 selection:text-white`} dir="rtl">
      {/* Glow */}
      <div className="absolute top-12 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Header */}
      <div className="relative z-10 max-w-7xl mx-auto w-full mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-500 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-300 via-orange-200 to-white bg-clip-text text-transparent">
                  دفتر المهمات والمشاريع الهندسية (Tasks & Projects)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 border border-amber-500/40 text-amber-300">
                  DevCore Operations
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                متابعة مهام الكاميرات والبرمجة والمشاريع، قوائم تدقيق فرعية، لوحة كانبان، ومؤشرات الإنجاز
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick(600);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-600/25 transition-all transform hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مهمة جديدة</span>
            </button>

            <button
              onClick={handleExportJson}
              title="تصدير المهام JSON"
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">نسخة احتياطية</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5">
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs text-slate-400">إجمالي المهام المسجلة</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">{stats.total}</span>
              <span className="text-xs text-slate-500 font-mono">مهمة</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30">
            <span className="text-xs text-amber-300">مهام قيد التنفيذ الآن</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-400 font-mono">{stats.inProgress}</span>
              <span className="text-xs text-amber-500/70 font-mono">جارية</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-rose-500/30">
            <span className="text-xs text-rose-300">مهام عاجلة جداً</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-400 font-mono">{stats.urgent}</span>
              <span className="text-xs text-rose-500/70 font-mono">تتطلب إنجازاً فورياً</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-teal-500/30">
            <span className="text-xs text-teal-300">نسبة الإنجاز الكلية</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-teal-400 font-mono">{stats.completionRate}%</span>
              <span className="text-xs text-teal-500/70 font-mono">({stats.done} مكتملة)</span>
            </div>
          </div>
        </div>

        {/* View Switcher & Filters */}
        <div className="mt-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1">
            <button
              onClick={() => { sound.playClick(600); setViewMode('kanban'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'kanban'
                  ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>لوحة كانبان (Kanban)</span>
            </button>

            <button
              onClick={() => { sound.playClick(600); setViewMode('list'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>القائمة المفصلة</span>
            </button>

            <button
              onClick={() => { sound.playClick(600); setViewMode('agenda'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'agenda'
                  ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>أجندة اليوم العاجلة</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في المهمات والوسوم..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all font-mono"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="all">كل الأقسام</option>
              <option value="هندسة وبرمجة">هندسة وبرمجة</option>
              <option value="كاميرات وشبكات">كاميرات وشبكات</option>
              <option value="متابعات مالية وديون">متابعات مالية وديون</option>
              <option value="صيانة ميدانية">صيانة ميدانية</option>
              <option value="مواعيد واجتماعات">مواعيد واجتماعات</option>
            </select>
          </div>
        </div>

        {/* VIEW 1: KANBAN BOARD */}
        {viewMode === 'kanban' && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Column 1: To Do */}
            <KanbanColumn
              title="قيد الانتظار (To Do)"
              status="todo"
              color="border-slate-700"
              badgeColor="bg-slate-800 text-slate-300"
              tasks={filteredTasks.filter((t) => t.status === 'todo')}
              onToggleSubtask={handleToggleSubtask}
              onMoveStatus={handleMoveStatus}
              onDelete={handleDeleteTask}
              getPriorityBadge={getPriorityBadge}
            />

            {/* Column 2: In Progress */}
            <KanbanColumn
              title="قيد التنفيذ (In Progress)"
              status="in_progress"
              color="border-amber-500/40"
              badgeColor="bg-amber-950 text-amber-300 border border-amber-600/40"
              tasks={filteredTasks.filter((t) => t.status === 'in_progress')}
              onToggleSubtask={handleToggleSubtask}
              onMoveStatus={handleMoveStatus}
              onDelete={handleDeleteTask}
              getPriorityBadge={getPriorityBadge}
            />

            {/* Column 3: Review */}
            <KanbanColumn
              title="في المراجعة والتدقيق"
              status="review"
              color="border-cyan-500/40"
              badgeColor="bg-cyan-950 text-cyan-300 border border-cyan-600/40"
              tasks={filteredTasks.filter((t) => t.status === 'review')}
              onToggleSubtask={handleToggleSubtask}
              onMoveStatus={handleMoveStatus}
              onDelete={handleDeleteTask}
              getPriorityBadge={getPriorityBadge}
            />

            {/* Column 4: Done */}
            <KanbanColumn
              title="مكتملة (Completed)"
              status="done"
              color="border-teal-500/40"
              badgeColor="bg-teal-950 text-teal-300 border border-teal-600/40"
              tasks={filteredTasks.filter((t) => t.status === 'done')}
              onToggleSubtask={handleToggleSubtask}
              onMoveStatus={handleMoveStatus}
              onDelete={handleDeleteTask}
              getPriorityBadge={getPriorityBadge}
            />
          </div>
        )}

        {/* VIEW 2: DETAILED LIST */}
        {viewMode === 'list' && (
          <div className="mt-5 space-y-3">
            {filteredTasks.length === 0 ? (
              <p className="text-center text-slate-500 p-8">لا توجد مهمات توافق المعايير.</p>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl bg-slate-900/90 border transition-all ${
                    task.status === 'done' ? 'border-teal-500/30 opacity-75' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleMoveStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          task.status === 'done'
                            ? 'bg-teal-500 border-teal-400 text-white'
                            : 'border-slate-600 hover:border-amber-400 text-transparent'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className={`text-sm font-bold ${task.status === 'done' ? 'line-through text-slate-400' : 'text-white'}`}>
                            {task.title}
                          </h3>
                          {getPriorityBadge(task.priority)}
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                            {task.category}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>الموعد: {task.dueDate}</span>
                          </span>
                          {task.assignedTo && (
                            <span className="flex items-center gap-1 font-sans">
                              <User className="w-3 h-3 text-slate-500" />
                              <span>{task.assignedTo}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={task.status}
                        onChange={(e) => handleMoveStatus(task.id, e.target.value as TaskStatus)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 font-sans"
                      >
                        <option value="todo">قيد الانتظار</option>
                        <option value="in_progress">قيد التنفيذ</option>
                        <option value="review">في المراجعة</option>
                        <option value="done">مكتملة</option>
                      </select>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subtasks */}
                  {task.subtasks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
                      <span className="text-[11px] text-slate-500 font-sans block mb-1">قائمة المهام الفرعية:</span>
                      {task.subtasks.map((sub) => (
                        <div
                          key={sub.id}
                          onClick={() => handleToggleSubtask(task.id, sub.id)}
                          className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            sub.completed ? 'bg-amber-500 border-amber-400 text-slate-950' : 'border-slate-600'
                          }`}>
                            {sub.completed && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className={sub.completed ? 'line-through text-slate-500' : ''}>{sub.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* VIEW 3: TODAY'S AGENDA */}
        {viewMode === 'agenda' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-slate-900 border border-amber-500/30 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-amber-300">أجندة المهام ذات الأولوية اليوم</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">مهام عاجلة تتطلب التنفيذ والمتابعة في منظومة المهندس مالك حريبات</p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {filteredTasks.filter((t) => t.status !== 'done').length} مهام متبقية
              </span>
            </div>

            <div className="space-y-3">
              {filteredTasks.filter((t) => t.status !== 'done').map((t) => (
                <div key={t.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleMoveStatus(t.id, 'done')}
                      className="w-6 h-6 rounded-lg border border-slate-600 hover:border-teal-400 flex items-center justify-center text-transparent hover:text-teal-400"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <div>
                      <h4 className="text-sm font-bold text-white">{t.title}</h4>
                      <p className="text-xs text-slate-400 font-mono">الاستحقاق: {t.dueDate} | {t.category}</p>
                    </div>
                  </div>
                  {getPriorityBadge(t.priority)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- ADD NEW TASK MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 max-h-[90vh] overflow-y-auto shadow-2xl" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">إضافة مهمة جديدة</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  عنوان المهمة *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فحص كاميرات NVR أو مراجعة سداد دفعة..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  الوصف والتفاصيل
                </label>
                <textarea
                  rows={2}
                  placeholder="وصف تفصيلي للخطوات المطلوبة..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    القسم / التصنيف
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as TaskCategory })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="هندسة وبرمجة">هندسة وبرمجة</option>
                    <option value="كاميرات وشبكات">كاميرات وشبكات</option>
                    <option value="متابعات مالية وديون">متابعات مالية وديون</option>
                    <option value="صيانة ميدانية">صيانة ميدانية</option>
                    <option value="مواعيد واجتماعات">مواعيد واجتماعات</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    درجة الأولوية
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="urgent">عاجل جداً (حاسم)</option>
                    <option value="high">مرتفعة</option>
                    <option value="medium">متوسطة</option>
                    <option value="low">منخفضة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    تاريخ الاستحقاق
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    المسؤول عن التنفيذ
                  </label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  المهام الفرعية (كل سطر مهمة فرعية)
                </label>
                <textarea
                  rows={3}
                  value={formData.subtasksInput}
                  onChange={(e) => setFormData({ ...formData, subtasksInput: e.target.value })}
                  placeholder="خطوة 1&#10;خطوة 2&#10;خطوة 3"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
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
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/30 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ المهمة في الدفتر</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent: Kanban Column
function KanbanColumn({
  title,
  status,
  color,
  badgeColor,
  tasks,
  onToggleSubtask,
  onMoveStatus,
  onDelete,
  getPriorityBadge,
}: {
  title: string;
  status: TaskStatus;
  color: string;
  badgeColor: string;
  tasks: TaskEntry[];
  onToggleSubtask: (taskId: string, subId: string) => void;
  onMoveStatus: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (id: string) => void;
  getPriorityBadge: (p: TaskPriority) => React.ReactNode;
}) {
  return (
    <div className={`flex flex-col rounded-2xl bg-slate-900/50 border ${color} p-3 min-h-[500px]`}>
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800/80">
        <h3 className="text-xs font-bold text-white">{title}</h3>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${badgeColor}`}>
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all shadow-sm group"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                {task.title}
              </h4>
              <button
                onClick={() => onDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all"
                title="حذف المهمة"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {task.description && (
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{task.description}</p>
            )}

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {getPriorityBadge(task.priority)}
              <span className="text-[10px] text-slate-500 font-mono">{task.dueDate}</span>
            </div>

            {/* Subtasks Progress */}
            {task.subtasks.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-slate-800/60">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 font-mono">
                  <span>المهام الفرعية</span>
                  <span>{task.subtasks.filter((s) => s.completed).length} / {task.subtasks.length}</span>
                </div>
                <div className="space-y-1">
                  {task.subtasks.slice(0, 3).map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => onToggleSubtask(task.id, sub.id)}
                      className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer hover:text-white"
                    >
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                        sub.completed ? 'bg-amber-500 border-amber-400 text-slate-950' : 'border-slate-700'
                      }`}>
                        {sub.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className={`truncate ${sub.completed ? 'line-through text-slate-600' : ''}`}>{sub.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Move Buttons */}
            <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
              {status !== 'todo' && (
                <button
                  onClick={() => onMoveStatus(task.id, status === 'done' ? 'review' : status === 'review' ? 'in_progress' : 'todo')}
                  className="hover:text-amber-300 flex items-center gap-0.5"
                >
                  <ArrowRight className="w-3 h-3" />
                  <span>السابق</span>
                </button>
              )}
              <div className="flex-1" />
              {status !== 'done' && (
                <button
                  onClick={() => onMoveStatus(task.id, status === 'todo' ? 'in_progress' : status === 'in_progress' ? 'review' : 'done')}
                  className="hover:text-teal-300 flex items-center gap-0.5 font-bold"
                >
                  <span>التالي</span>
                  <ArrowLeft className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
