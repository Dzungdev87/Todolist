'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types/task';
import { TodoList } from '@/types/list';
import TaskCard from '@/components/TaskCard';
import { getRecentMonths } from '@/lib/date';
import { Search, ChevronDown, X } from 'lucide-react';

export default function CompletedPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<TodoList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const months = getRecentMonths(24);
  const currentMonth = months[0].value;

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedList, setSelectedList] = useState('');
  const [keyword, setKeyword] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [tasksRes, listsRes] = await Promise.all([
        fetch(`/api/tasks?status=completed&completed_month=${selectedMonth}`),
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
  }, [selectedMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = tasks
    .filter((t) => !selectedList || t.list_id === selectedList)
    .filter(
      (t) =>
        !keyword ||
        t.title.toLowerCase().includes(keyword.toLowerCase()) ||
        t.description?.toLowerCase().includes(keyword.toLowerCase())
    );

  async function handleRestore(id: string) {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore' }),
      });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch { fetchData(); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bạn có chắc muốn xóa công việc này?')) return;
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch { fetchData(); }
  }

  const getList = (id: string) => lists.find((l) => l.id === id);
  const selectedMonthLabel = months.find((m) => m.value === selectedMonth)?.label || selectedMonth;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 bg-[var(--color-surface)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Đã hoàn thành</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
              {filtered.length} việc trong tháng {selectedMonthLabel}
            </p>
          </div>

          {/* Month selector */}
          <div className="relative">
            <select
              id="select-month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none bg-[var(--color-surface-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm font-medium px-3 py-2 pr-7 rounded-xl cursor-pointer focus:outline-none focus:border-[var(--color-brand-500)]"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            id="search-completed"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm kiếm..."
            className="input-field pl-10 pr-10"
          />
          {keyword && (
            <button
              onClick={() => setKeyword('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* List filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            id="completed-all-lists"
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
              id={`completed-list-${l.id}`}
              onClick={() => setSelectedList(selectedList === l.id ? '' : l.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                selectedList === l.id ? 'border-current scale-105' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
              }`}
              style={selectedList === l.id ? { color: l.color, backgroundColor: `${l.color}20` } : undefined}
            >
              {l.icon} {l.name}
              {selectedList !== l.id && (
                <span className="text-xs">
                  {tasks.filter((t) => t.list_id === l.id).length || ''}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      {!loading && !error && tasks.length > 0 && (
        <div className="mx-4 mb-3 p-3 bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-muted)]">Tổng hoàn thành tháng {selectedMonthLabel}</span>
            <span className="text-lg font-bold text-[var(--color-success)]">{tasks.length}</span>
          </div>
          {/* List breakdown */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {lists.map((l) => {
              const count = tasks.filter((t) => t.list_id === l.id).length;
              if (!count) return null;
              return (
                <span key={l.id} className="text-xs flex items-center gap-1" style={{ color: l.color }}>
                  {l.icon} {l.name}: <strong>{count}</strong>
                </span>
              );
            })}
          </div>
        </div>
      )}

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
            <p className="text-[var(--color-danger)] font-medium">⚠️ {error}</p>
            <button onClick={fetchData} className="btn-ghost text-sm mt-3">Thử lại</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="text-6xl mb-2">{keyword || selectedList ? '🔍' : '📋'}</div>
            <p className="font-semibold text-[var(--color-text-primary)]">
              {keyword || selectedList ? 'Không tìm thấy' : `Chưa có việc hoàn thành tháng ${selectedMonthLabel}`}
            </p>
            <p className="text-sm text-[var(--color-text-muted)] max-w-[220px]">
              {keyword || selectedList ? 'Thử thay đổi bộ lọc' : 'Hãy hoàn thành những việc đang làm!'}
            </p>
          </div>
        )}

        {!loading && !error && filtered.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            list={getList(task.list_id)}
            onRestore={handleRestore}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
