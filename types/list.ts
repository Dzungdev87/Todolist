export type TodoList = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
};

export type CreateListInput = {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
};

export type UpdateListInput = Partial<{
  name: string;
  description: string;
  color: string;
  icon: string;
  archived: boolean;
}>;

export const LIST_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f97316', // orange
  '#22c55e', // green
  '#06b6d4', // cyan
  '#eab308', // yellow
  '#ef4444', // red
  '#14b8a6', // teal
  '#84cc16', // lime
];

export const LIST_ICONS = ['📋', '💼', '👤', '📚', '🏠', '🛒', '🎯', '🏋️', '✈️', '💡'];
