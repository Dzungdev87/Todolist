'use client';

import { useState, useEffect } from 'react';
import { TodoList, CreateListInput, UpdateListInput, LIST_COLORS, LIST_ICONS } from '@/types/list';
import { X } from 'lucide-react';

interface ListFormProps {
  list?: TodoList;
  onSave: (data: CreateListInput | UpdateListInput) => Promise<void>;
  onClose: () => void;
}

export default function ListForm({ list, onSave, onClose }: ListFormProps) {
  const [name, setName] = useState(list?.name || '');
  const [description, setDescription] = useState(list?.description || '');
  const [color, setColor] = useState(list?.color || LIST_COLORS[0]);
  const [icon, setIcon] = useState(list?.icon || LIST_ICONS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Tên danh sách không được để trống'); return; }

    setSaving(true);
    setError('');
    try {
      await onSave({ name: name.trim(), description: description.trim(), color, icon });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi lưu');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="relative w-full sm:max-w-md bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-up max-h-[90dvh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-[var(--color-border)] rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold gradient-text">
            {list ? 'Sửa danh sách' : 'Tạo danh sách mới'}
          </h2>
          <button
            onClick={onClose}
            id="close-list-form"
            aria-label="Đóng"
            className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          {/* Preview */}
          <div className="flex items-center gap-3 p-3 bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border)]">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: `${color}25` }}
            >
              {icon}
            </div>
            <div>
              <p className="font-medium" style={{ color }}>{name || 'Tên danh sách'}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{description || 'Mô tả'}</p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Tên danh sách *
            </label>
            <input
              id="list-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Công việc, Cá nhân..."
              className="input-field"
              autoFocus
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Mô tả
            </label>
            <input
              id="list-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn..."
              className="input-field"
              maxLength={200}
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {LIST_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  id={`icon-${ic}`}
                  onClick={() => setIcon(ic)}
                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                    icon === ic
                      ? 'ring-2 ring-[var(--color-brand-500)] scale-110 bg-[var(--color-brand-500)]/15'
                      : 'bg-[var(--color-surface-card)] hover:scale-105'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Màu
            </label>
            <div className="flex flex-wrap gap-2.5">
              {LIST_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  id={`color-${c}`}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-[var(--color-brand-400)] scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Màu ${c}`}
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/10 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} id="cancel-list-form" className="btn-ghost flex-1">
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              id="save-list-form"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : list ? 'Cập nhật' : 'Tạo danh sách'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
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
