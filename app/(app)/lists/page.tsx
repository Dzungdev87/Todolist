'use client';

import { useState, useEffect, useCallback } from 'react';
import { TodoList, CreateListInput, UpdateListInput } from '@/types/list';
import { Task } from '@/types/task';
import ListForm from '@/components/ListForm';
import { Plus, Edit2, Archive, CheckCircle2, Clock } from 'lucide-react';

interface ListStats {
  listId: string;
  doing: number;
  completed: number;
}

export default function ListsPage() {
  const [lists, setLists] = useState<TodoList[]>([]);
  const [stats, setStats] = useState<ListStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingList, setEditingList] = useState<TodoList | undefined>();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [listsRes, tasksRes] = await Promise.all([
        fetch('/api/lists'),
        fetch('/api/tasks'),
      ]);
      if (!listsRes.ok || !tasksRes.ok) throw new Error('Lỗi tải dữ liệu');
      const [listsData, tasksData]: [TodoList[], Task[]] = await Promise.all([
        listsRes.json(),
        tasksRes.json(),
      ]);
      if ((listsData as any).error) throw new Error((listsData as any).error);
      setLists(listsData);

      const statsMap: Record<string, ListStats> = {};
      tasksData.forEach((t) => {
        if (!statsMap[t.list_id]) statsMap[t.list_id] = { listId: t.list_id, doing: 0, completed: 0 };
        if (t.status === 'doing') statsMap[t.list_id].doing++;
        else statsMap[t.list_id].completed++;
      });
      setStats(Object.values(statsMap));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSaveList(data: CreateListInput | UpdateListInput) {
    if (editingList) {
      await fetch(`/api/lists/${editingList.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }
    await fetchData();
  }

  async function handleArchive(id: string) {
    if (!confirm('Ẩn danh sách này? Các công việc sẽ không bị xóa.')) return;
    await fetch(`/api/lists/${id}`, { method: 'DELETE' });
    setLists((prev) => prev.filter((l) => l.id !== id));
  }

  const getStats = (id: string) => stats.find((s) => s.listId === id) || { doing: 0, completed: 0, listId: id };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 pt-12 pb-5 bg-[var(--color-surface)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Danh sách</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
              {lists.length} danh sách
            </p>
          </div>
          <button
            id="add-list-btn"
            onClick={() => { setEditingList(undefined); setShowForm(true); }}
            aria-label="Thêm danh sách mới"
            className="btn-primary flex items-center gap-1.5 text-sm px-4 py-2.5"
          >
            <Plus size={17} />
            Thêm
          </button>
        </div>
      </div>

      <div className="px-4 pb-6 space-y-3">
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

        {!loading && !error && lists.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="text-5xl mb-2">📋</div>
            <p className="font-semibold text-[var(--color-text-primary)]">Chưa có danh sách nào</p>
            <p className="text-sm text-[var(--color-text-muted)]">Tạo danh sách để phân loại công việc</p>
            <button
              onClick={() => { setEditingList(undefined); setShowForm(true); }}
              className="btn-primary mt-2"
            >
              Tạo danh sách đầu tiên
            </button>
          </div>
        )}

        {!loading && !error && lists.map((list) => {
          const s = getStats(list.id);
          const total = s.doing + s.completed;
          const progress = total > 0 ? (s.completed / total) * 100 : 0;

          return (
            <div key={list.id} className="card p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform hover:scale-105"
                  style={{ backgroundColor: `${list.color || '#6366f1'}20` }}
                >
                  {list.icon || '📋'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold truncate" style={{ color: list.color || '#6366f1' }}>
                      {list.name}
                    </h3>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        id={`edit-list-${list.id}`}
                        onClick={() => { setEditingList(list); setShowForm(true); }}
                        aria-label="Sửa danh sách"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-brand-400)] hover:bg-[var(--color-surface-3)] transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        id={`archive-list-${list.id}`}
                        onClick={() => handleArchive(list.id)}
                        aria-label="Ẩn danh sách"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-warning)] hover:bg-[var(--color-surface-3)] transition-all"
                      >
                        <Archive size={14} />
                      </button>
                    </div>
                  </div>

                  {list.description && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
                      {list.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                      <Clock size={11} />
                      {s.doing} đang làm
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[var(--color-success)]">
                      <CheckCircle2 size={11} />
                      {s.completed} xong
                    </span>
                  </div>

                  {/* Progress bar */}
                  {total > 0 && (
                    <div className="mt-2 h-1.5 bg-[var(--color-surface-3)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: list.color || '#6366f1',
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAB for mobile */}
      <button
        id="add-list-fab"
        onClick={() => { setEditingList(undefined); setShowForm(true); }}
        aria-label="Thêm danh sách"
        className="fixed bottom-20 right-5 w-14 h-14 gradient-brand rounded-full flex items-center justify-center shadow-lg shadow-[var(--color-brand-700)]/50 hover:scale-105 active:scale-95 transition-transform z-40 sm:hidden"
      >
        <Plus size={26} strokeWidth={2.5} className="text-white" />
      </button>

      {showForm && (
        <ListForm
          list={editingList}
          onSave={handleSaveList}
          onClose={() => { setShowForm(false); setEditingList(undefined); }}
        />
      )}
    </div>
  );
}
