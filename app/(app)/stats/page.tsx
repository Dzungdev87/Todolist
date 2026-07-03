'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types/task';
import { TodoList } from '@/types/list';
import { getRecentMonths, formatDate } from '@/lib/date';
import { ChevronDown, TrendingUp, Award, Target } from 'lucide-react';

interface DayCount { day: string; count: number }

export default function StatsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<TodoList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const months = getRecentMonths(24);
  const [selectedMonth, setSelectedMonth] = useState(months[0].value);
  const selectedMonthLabel = months.find((m) => m.value === selectedMonth)?.label || selectedMonth;

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

  // Group by list
  const byList = lists
    .map((l) => ({
      list: l,
      count: tasks.filter((t) => t.list_id === l.id).length,
    }))
    .filter((g) => g.count > 0)
    .sort((a, b) => b.count - a.count);

  const maxListCount = byList[0]?.count || 1;

  // Group by day
  const dayMap: Record<string, number> = {};
  tasks.forEach((t) => {
    if (!t.completed_at) return;
    const d = t.completed_at.split('T')[0];
    dayMap[d] = (dayMap[d] || 0) + 1;
  });
  const byDay: DayCount[] = Object.entries(dayMap)
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => a.day.localeCompare(b.day));
  const maxDayCount = Math.max(...byDay.map((d) => d.count), 1);

  // Priority breakdown
  const byPriority = {
    high: tasks.filter((t) => t.priority === 'high').length,
    medium: tasks.filter((t) => t.priority === 'medium').length,
    low: tasks.filter((t) => t.priority === 'low').length,
  };

  const bestDay = [...byDay].sort((a, b) => b.count - a.count)[0];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 bg-[var(--color-surface)]">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold gradient-text">Thống kê</h1>
          <div className="relative">
            <select
              id="stats-select-month"
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
        <p className="text-sm text-[var(--color-text-muted)]">Tháng {selectedMonthLabel}</p>
      </div>

      <div className="px-4 pb-6 space-y-4">
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

        {!loading && !error && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="card p-3 text-center">
                <div className="text-2xl font-bold text-[var(--color-success)]">{tasks.length}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Hoàn thành</div>
              </div>
              <div className="card p-3 text-center">
                <div className="text-2xl font-bold text-[var(--color-brand-400)]">{byList.length}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Danh sách</div>
              </div>
              <div className="card p-3 text-center">
                <div className="text-2xl font-bold text-[var(--color-warning)]">{bestDay?.count || 0}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Cao nhất/ngày</div>
              </div>
            </div>

            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="text-5xl">📊</div>
                <p className="font-semibold text-[var(--color-text-primary)]">Chưa có dữ liệu</p>
                <p className="text-sm text-[var(--color-text-muted)]">Hoàn thành công việc để xem thống kê</p>
              </div>
            ) : (
              <>
                {/* Best day */}
                {bestDay && (
                  <div className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-warning)]/20 flex items-center justify-center flex-shrink-0">
                      <Award size={20} className="text-[var(--color-warning)]" />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--color-text-muted)]">Ngày năng suất nhất</p>
                      <p className="font-semibold text-[var(--color-text-primary)]">
                        {formatDate(bestDay.day)} — {bestDay.count} việc hoàn thành
                      </p>
                    </div>
                  </div>
                )}

                {/* By list */}
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target size={17} className="text-[var(--color-brand-400)]" />
                    <h2 className="font-semibold text-[var(--color-text-primary)]">Theo danh sách</h2>
                  </div>
                  <div className="space-y-3">
                    {byList.map(({ list, count }) => (
                      <div key={list.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm flex items-center gap-1.5" style={{ color: list.color }}>
                            {list.icon} {list.name}
                          </span>
                          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                            {count}
                          </span>
                        </div>
                        <div className="h-2 bg-[var(--color-surface-3)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${(count / maxListCount) * 100}%`,
                              backgroundColor: list.color || '#6366f1',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By priority */}
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={17} className="text-[var(--color-brand-400)]" />
                    <h2 className="font-semibold text-[var(--color-text-primary)]">Theo độ ưu tiên</h2>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: 'Cao', count: byPriority.high, color: '#ef4444' },
                      { label: 'Trung bình', count: byPriority.medium, color: '#f59e0b' },
                      { label: 'Thấp', count: byPriority.low, color: '#22c55e' },
                    ].map((p) => (
                      <div
                        key={p.label}
                        className="p-3 rounded-xl"
                        style={{ backgroundColor: `${p.color}15` }}
                      >
                        <div className="text-xl font-bold" style={{ color: p.color }}>{p.count}</div>
                        <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{p.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By day (mini chart) */}
                {byDay.length > 0 && (
                  <div className="card p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp size={17} className="text-[var(--color-brand-400)]" />
                      <h2 className="font-semibold text-[var(--color-text-primary)]">Theo ngày</h2>
                    </div>
                    <div className="flex items-end gap-1.5 h-24 overflow-x-auto pb-2">
                      {byDay.map(({ day, count }) => (
                        <div key={day} className="flex flex-col items-center gap-1 flex-shrink-0" style={{ minWidth: 28 }}>
                          <span className="text-[9px] text-[var(--color-text-muted)] font-medium">{count}</span>
                          <div
                            className="w-5 rounded-t-md transition-all duration-500"
                            style={{
                              height: `${Math.max((count / maxDayCount) * 64, 4)}px`,
                              background: 'linear-gradient(to top, #6366f1, #8b5cf6)',
                            }}
                          />
                          <span className="text-[9px] text-[var(--color-text-muted)]">
                            {day.split('-')[2]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
