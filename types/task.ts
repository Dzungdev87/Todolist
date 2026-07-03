export type TaskStatus = 'doing' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  list_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  note?: string;
  deleted: boolean;
};

export type CreateTaskInput = {
  list_id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  due_date?: string;
  note?: string;
};

export type UpdateTaskInput = Partial<{
  list_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
  completed_at: string;
  note: string;
  deleted: boolean;
}>;
