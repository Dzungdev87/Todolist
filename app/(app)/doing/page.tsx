'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task';
import { TodoList } from '@/types/list';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import { Search, Plus, SlidersHorizontal, X } from 'lucide-react';

export default function DoingPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<TodoList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [keyword, setKeyword] = useState('');
  const [selectedList, setSelectedList] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'deadline' | 'priority'>('deadline');

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [slogan, setSlogan] = useState('');

  useEffect(() => {
    const slogans = [
      "💰 Kiếm tiền để tự do lựa chọn cuộc sống, rèn luyện để khỏe mạnh tận hưởng tự do.",
      "💪 Sức khỏe là gốc rễ của thịnh vượng, chăm sóc thân thể là khoản đầu tư tốt nhất.",
      "📈 Làm việc hết mình, tích lũy thông minh — tương lai tự do tài chính đang chờ đón bạn.",
      "🏃‍♂️ Một ngày không rèn luyện sức khỏe là một ngày bạn lùi lại phía sau.",
      "🎯 Mục tiêu rõ ràng, hành động dứt khoát — thành công là chuỗi ngày tích lũy kỷ luật.",
      "🥗 Ăn lành mạnh, ngủ đủ giấc, làm việc hiệu quả — công thức bền vững của thành công.",
      "💎 Hãy nhớ: Tiền có thể kiếm lại, nhưng tuổi trẻ và sức khỏe thì không thể quay đầu.",
      "🔥 Hôm nay nỗ lực làm việc để ngày mai làm chủ tương lai của chính mình.",
      "🧘‍♂️ Thân khỏe mạnh, tâm an bình, trí sáng suốt — chìa khóa mở mọi cánh cửa cuộc đời.",
      "🚀 Đừng chờ đợi cơ hội thuận lợi, hãy tự kiến tạo cơ hội bằng hành động ngay hôm nay!",
      "💼 Kiếm tiền thông minh, tiêu dùng thông thái, đầu tư lâu dài — công thức làm chủ cuộc đời.",
      "🍎 Sức khỏe không phải là thứ để mua, mà là khoản tích lũy của lối sống lành mạnh."
    ];
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % slogans.length;
    setSlogan(slogans[index]);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [tasksRes, listsRes] = await Promise.all([
        fetch('/api/tasks?status=doing'),
        fetch('/api/lists'),
      ]);
      if (!tasksRes.ok || !listsRes.ok) throw new Error('Lỗi tải dữ liệu');
      const [tasksData, listsData] = await Promise.all([tasksRes.json(), listsRes.json()]);
      if (tasksData.error) throw new Error(tasksData.error);
      setTasks(tasksData);
      setLists(listsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filter + sort tasks
  const filtered = tasks
    .filter((t) => !selectedList || t.list_id === selectedList)
    .filter(
      (t) =>
        !keyword ||
        t.title.toLowerCase().includes(keyword.toLowerCase()) ||
        t.description?.toLowerCase().includes(keyword.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      }
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    });

  async function handleComplete(id: string) {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      fetchData();
    }
  }

  async function handleSaveTask(data: CreateTaskInput | UpdateTaskInput) {
    if (editingTask) {
      await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }
    await fetchData();
  }

  const getList = (id: string) => lists.find((l) => l.id === id);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 bg-[var(--color-surface)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Đang làm</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
              {filtered.length} việc cần làm
            </p>
          </div>
          <div className="flex gap-2">
            <button
              id="toggle-filters"
              onClick={() => setShowFilters(!showFilters)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
                showFilters || selectedList || sortBy !== 'deadline'
                  ? 'bg-[var(--color-brand-500)]/20 border-[var(--color-brand-500)] text-[var(--color-brand-400)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-brand-500)]'
              }`}
              aria-label="Bộ lọc"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Daily Motivation Slogan */}
        {slogan && (
          <div className="mb-4 p-3 bg-gradient-to-r from-[var(--color-brand-50)] to-[var(--color-surface-1)] rounded-2xl border border-[var(--color-brand-100)] flex items-start gap-2.5 shadow-[0_2px_8px_-3px_rgba(99,102,241,0.08)] animate-fade-in">
            <span className="text-base leading-none">✨</span>
            <p className="text-xs font-semibold text-[var(--color-brand-700)] leading-relaxed italic">
              {slogan}
            </p>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            id="search-tasks"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm kiếm công việc..."
            className="input-field pl-10 pr-10"
          />
          {keyword && (
            <button
              onClick={() => setKeyword('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 space-y-3">
            {/* List filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                id="filter-all-lists"
                onClick={() => setSelectedList('')}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  !selectedList
                    ? 'bg-[var(--color-brand-500)]/20 border-[var(--color-brand-500)] text-[var(--color-brand-400)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}
              >
                Tất cả
              </button>
              {lists.map((l) => (
                <button
                  key={l.id}
                  id={`filter-list-${l.id}`}
                  onClick={() => setSelectedList(selectedList === l.id ? '' : l.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    selectedList === l.id
                      ? 'border-current scale-105'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                  }`}
                  style={selectedList === l.id ? { color: l.color, backgroundColor: `${l.color}20` } : undefined}
                >
                  {l.icon} {l.name}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <span className="text-sm text-[var(--color-text-muted)] self-center">Sắp xếp:</span>
              {(['deadline', 'priority'] as const).map((s) => (
                <button
                  key={s}
                  id={`sort-${s}`}
                  onClick={() => setSortBy(s)}
                  className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                    sortBy === s
                      ? 'bg-[var(--color-brand-500)]/20 border-[var(--color-brand-500)] text-[var(--color-brand-400)] font-medium'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {s === 'deadline' ? 'Deadline' : 'Ưu tiên'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-[var(--color-brand-400)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[var(--color-text-muted)]">Đang tải...</p>
          </div>
        )}

        {error && !loading && (
          <div className="card p-5 text-center border-[var(--color-danger)]/30">
            <p className="text-[var(--color-danger)] font-medium mb-1">⚠️ {error}</p>
            <p className="text-sm text-[var(--color-text-muted)] mb-3">
              Kiểm tra kết nối Google Sheet và thử lại
            </p>
            <button onClick={fetchData} className="btn-ghost text-sm">Thử lại</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="text-6xl mb-2">
              {keyword || selectedList ? '🔍' : '🎉'}
            </div>
            <p className="font-semibold text-[var(--color-text-primary)]">
              {keyword || selectedList ? 'Không tìm thấy công việc' : 'Không có việc gì!'}
            </p>
            <p className="text-sm text-[var(--color-text-muted)] max-w-[220px]">
              {keyword || selectedList
                ? 'Thử thay đổi bộ lọc hoặc tìm kiếm khác'
                : 'Nhấn + để thêm công việc mới'}
            </p>
          </div>
        )}

        {!loading && !error && filtered.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            list={getList(task.list_id)}
            onComplete={handleComplete}
            onEdit={(t) => { setEditingTask(t); setShowForm(true); }}
          />
        ))}
      </div>

      {/* FAB */}
      <button
        id="add-task-fab"
        onClick={() => { setEditingTask(undefined); setShowForm(true); }}
        aria-label="Thêm công việc mới"
        className="fixed bottom-20 right-5 w-14 h-14 gradient-brand rounded-full flex items-center justify-center shadow-lg shadow-[var(--color-brand-700)]/50 hover:scale-105 active:scale-95 transition-transform z-40"
      >
        <Plus size={26} strokeWidth={2.5} className="text-white" />
      </button>

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          lists={lists}
          task={editingTask}
          defaultListId={selectedList || lists[0]?.id}
          onSave={handleSaveTask}
          onClose={() => { setShowForm(false); setEditingTask(undefined); }}
        />
      )}
    </div>
  );
}
