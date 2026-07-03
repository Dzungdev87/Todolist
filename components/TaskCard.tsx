'use client';

import { useState } from 'react';
import { Task } from '@/types/task';
import { TodoList } from '@/types/list';
import { formatDate, isOverdue, isDueToday } from '@/lib/date';
import { Calendar, Flag, RotateCcw, Trash2, ChevronRight, Clock } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  list?: TodoList;
  onComplete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (task: Task) => void;
}

const PRIORITY_CONFIG = {
  low: { label: 'Thấp', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  medium: { label: 'TB', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  high: { label: 'Cao', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

export default function TaskCard({
  task,
  list,
  onComplete,
  onRestore,
  onDelete,
  onEdit,
}: TaskCardProps) {
  const [checking, setChecking] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const priority = PRIORITY_CONFIG[task.priority];
  const overdue = task.status === 'doing' && isOverdue(task.due_date || '');
  const dueToday = task.status === 'doing' && isDueToday(task.due_date || '');
  const completed = task.status === 'completed';

  async function handleCheck() {
    if (completed) return;
    setChecking(true);
    // Give checkbox animation time
    await new Promise((r) => setTimeout(r, 200));
    setLeaving(true);
    await new Promise((r) => setTimeout(r, 300));
    onComplete?.(task.id);
  }

  async function handleRestore() {
    setLeaving(true);
    await new Promise((r) => setTimeout(r, 300));
    onRestore?.(task.id);
  }

  return (
    <div
      className={`card p-4 transition-all duration-300 ${
        leaving ? 'opacity-0 translate-x-4 scale-95' : 'opacity-100'
      } ${completed ? 'opacity-80' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        {!completed && (
          <button
            onClick={handleCheck}
            disabled={checking}
            id={`checkbox-${task.id}`}
            aria-label={`Đánh dấu hoàn thành: ${task.title}`}
            className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
              checking
                ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-500)] scale-110'
                : 'border-[var(--color-border)] hover:border-[var(--color-brand-400)] hover:scale-105'
            }`}
          >
            {checking && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6l3 3 5-5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        )}

        {/* Completed icon */}
        {completed && (
          <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-success)]/20 border-2 border-[var(--color-success)] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6l3 3 5-5"
                stroke="#22c55e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={() => !completed && onEdit?.(task)}>
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`font-medium text-[0.9375rem] leading-snug ${
                completed
                  ? 'line-through text-[var(--color-text-muted)]'
                  : 'text-[var(--color-text-primary)] cursor-pointer hover:text-[var(--color-brand-300)]'
              }`}
            >
              {task.title}
            </h3>
            {!completed && onEdit && (
              <ChevronRight
                size={16}
                className="flex-shrink-0 text-[var(--color-text-muted)] mt-0.5 cursor-pointer"
                onClick={() => onEdit(task)}
              />
            )}
          </div>

          {task.description && (
            <p className="text-sm text-[var(--color-text-muted)] mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            {/* Priority badge */}
            <span
              className="badge text-[11px]"
              style={{ color: priority.color, backgroundColor: priority.bg }}
            >
              <Flag size={10} className="mr-1" />
              {priority.label}
            </span>

            {/* List badge */}
            {list && (
              <span
                className="badge text-[11px]"
                style={{
                  color: list.color || '#6366f1',
                  backgroundColor: `${list.color || '#6366f1'}1a`,
                }}
              >
                {list.icon} {list.name}
              </span>
            )}

            {/* Due date */}
            {task.due_date && !completed && (
              <span
                className={`flex items-center gap-1 text-[11px] font-medium ${
                  overdue
                    ? 'text-[var(--color-danger)]'
                    : dueToday
                    ? 'text-[var(--color-warning)]'
                    : 'text-[var(--color-text-muted)]'
                }`}
              >
                {overdue ? <Clock size={11} /> : <Calendar size={11} />}
                {overdue ? 'Quá hạn ' : dueToday ? 'Hôm nay ' : ''}
                {formatDate(task.due_date)}
              </span>
            )}

            {/* Completed at */}
            {completed && task.completed_at && (
              <span className="flex items-center gap-1 text-[11px] text-[var(--color-success)]">
                <CheckCircle size={11} />
                {formatDate(task.completed_at)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Completed actions */}
      {completed && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--color-border-subtle)]">
          <button
            onClick={handleRestore}
            id={`restore-${task.id}`}
            aria-label="Khôi phục task"
            className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-brand-400)] transition-colors"
          >
            <RotateCcw size={13} />
            Khôi phục
          </button>
          <button
            onClick={() => onDelete?.(task.id)}
            id={`delete-${task.id}`}
            aria-label="Xóa task"
            className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors ml-auto"
          >
            <Trash2 size={13} />
            Xóa
          </button>
        </div>
      )}
    </div>
  );
}

function CheckCircle({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="#22c55e" strokeWidth="1.5" />
      <path
        d="M5 8l2.5 2.5 4-4"
        stroke="#22c55e"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
