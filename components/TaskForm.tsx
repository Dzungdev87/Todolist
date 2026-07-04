'use client';

import { useState, useEffect } from 'react';
import { Task, TaskPriority, CreateTaskInput, UpdateTaskInput } from '@/types/task';
import { TodoList } from '@/types/list';
import { X, Flag, Calendar, AlignLeft, StickyNote, List } from 'lucide-react';

interface TaskFormProps {
  lists: TodoList[];
  task?: Task; // if provided, we are editing
  defaultListId?: string;
  onSave: (data: CreateTaskInput | UpdateTaskInput) => Promise<void>;
  onClose: () => void;
}

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Thấp', color: '#22c55e' },
  { value: 'medium', label: 'Trung bình', color: '#f59e0b' },
  { value: 'high', label: 'Cao', color: '#ef4444' },
];

export default function TaskForm({ lists, task, defaultListId, onSave, onClose }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [listId, setListId] = useState(task?.list_id || defaultListId || lists[0]?.id || '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(task?.due_date ? task.due_date.split('T')[0] : '');
  const [note, setNote] = useState(task?.note || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('Tên công việc không được để trống'); return; }
    if (!listId) { setError('Vui lòng chọn list'); return; }

    setSaving(true);
    setError('');
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        list_id: listId,
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : '',
        note: note.trim(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi lưu');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-lg bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-up max-h-[90dvh] overflow-y-auto">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-[var(--color-border)] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold gradient-text">
            {task ? 'Sửa công việc' : 'Thêm công việc'}
          </h2>
          <button
            onClick={onClose}
            id="close-task-form"
            aria-label="Đóng form"
            className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pt-5 pb-safe-form space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Tên công việc *
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên công việc..."
              className="input-field text-base"
              autoFocus
              maxLength={200}
            />
          </div>

          {/* List */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              <List size={14} className="inline mr-1" />
              Danh sách
            </label>
            <select
              id="task-list"
              value={listId}
              onChange={(e) => setListId(e.target.value)}
              className="input-field"
            >
              {lists.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.icon} {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              <Flag size={14} className="inline mr-1" />
              Độ ưu tiên
            </label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  id={`priority-${p.value}`}
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                    priority === p.value
                      ? 'border-current scale-105'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-current'
                  }`}
                  style={{
                    color: p.color,
                    backgroundColor: priority === p.value ? `${p.color}20` : undefined,
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              <Calendar size={14} className="inline mr-1" />
              Deadline
            </label>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              <AlignLeft size={14} className="inline mr-1" />
              Mô tả
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              <StickyNote size={14} className="inline mr-1" />
              Ghi chú
            </label>
            <textarea
              id="task-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú thêm..."
              rows={2}
              className="input-field resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/10 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              id="cancel-task-form"
              className="btn-ghost flex-1"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              id="save-task-form"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : task ? 'Cập nhật' : 'Thêm việc'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.25s ease-out;
        }
        @media (min-width: 640px) {
          @keyframes slide-up {
            from { transform: translateY(20px) scale(0.97); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
          }
        }
      `}</style>
    </div>
  );
}
