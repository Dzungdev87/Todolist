import { readSheet, appendRow, findRowIndex, updateRow, TASKS_SHEET } from './googleSheets';
import { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task';
import { nowISO, getYearMonth } from './date';
import { nanoid } from 'nanoid';

function rowToTask(row: string[]): Task {
  return {
    id: row[0] || '',
    list_id: row[1] || '',
    title: row[2] || '',
    description: row[3] || '',
    status: (row[4] as Task['status']) || 'doing',
    priority: (row[5] as Task['priority']) || 'medium',
    due_date: row[6] || '',
    created_at: row[7] || '',
    updated_at: row[8] || '',
    completed_at: row[9] || '',
    note: row[10] || '',
    deleted: row[11] === 'TRUE',
  };
}

function taskToRow(task: Task): (string | boolean)[] {
  return [
    task.id,
    task.list_id,
    task.title,
    task.description || '',
    task.status,
    task.priority,
    task.due_date || '',
    task.created_at,
    task.updated_at,
    task.completed_at || '',
    task.note || '',
    task.deleted,
  ];
}

export interface GetTasksFilter {
  status?: 'doing' | 'completed';
  list_id?: string;
  completed_month?: string; // YYYY-MM
  keyword?: string;
}

export async function getTasks(filter: GetTasksFilter = {}): Promise<Task[]> {
  const rows = await readSheet(TASKS_SHEET);
  let tasks = rows
    .filter((r) => r.length > 0 && r[0])
    .map(rowToTask)
    .filter((t) => !t.deleted);

  // Chỉ hiển thị/lấy công việc đã hoàn thành từ tháng 7 năm 2026 trở về sau
  tasks = tasks.filter((t) => {
    if (t.status === 'completed') {
      return t.completed_at && t.completed_at >= '2026-07-01';
    }
    return true;
  });

  if (filter.status) {
    tasks = tasks.filter((t) => t.status === filter.status);
  }
  if (filter.list_id) {
    tasks = tasks.filter((t) => t.list_id === filter.list_id);
  }
  if (filter.completed_month) {
    tasks = tasks.filter(
      (t) => t.completed_at && getYearMonth(t.completed_at) === filter.completed_month
    );
  }
  if (filter.keyword) {
    const kw = filter.keyword.toLowerCase();
    tasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(kw) ||
        t.description?.toLowerCase().includes(kw) ||
        t.note?.toLowerCase().includes(kw)
    );
  }

  // Sort: doing → by due_date asc (no date last), completed → by completed_at desc
  if (filter.status === 'doing' || (!filter.status && tasks.some((t) => t.status === 'doing'))) {
    tasks.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'doing' ? -1 : 1;
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    });
  } else if (filter.status === 'completed') {
    tasks.sort((a, b) => {
      if (!a.completed_at) return 1;
      if (!b.completed_at) return -1;
      return b.completed_at.localeCompare(a.completed_at);
    });
  }

  return tasks;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const now = nowISO();
  const task: Task = {
    id: nanoid(),
    list_id: input.list_id,
    title: input.title,
    description: input.description || '',
    status: 'doing',
    priority: input.priority || 'medium',
    due_date: input.due_date || '',
    created_at: now,
    updated_at: now,
    completed_at: '',
    note: input.note || '',
    deleted: false,
  };
  await appendRow(TASKS_SHEET, taskToRow(task));
  return task;
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const rows = await readSheet(TASKS_SHEET);
  const rowData = rows.find((r) => r[0] === id);
  if (!rowData) throw new Error(`Task "${id}" not found`);

  const existing = rowToTask(rowData);
  const updated: Task = {
    ...existing,
    ...input,
    updated_at: nowISO(),
  };
  const rowNum = await findRowIndex(TASKS_SHEET, id);
  await updateRow(TASKS_SHEET, rowNum, taskToRow(updated));
  return updated;
}

export async function completeTask(id: string): Promise<Task> {
  return updateTask(id, {
    status: 'completed',
    completed_at: nowISO(),
  });
}

export async function restoreTask(id: string): Promise<Task> {
  return updateTask(id, {
    status: 'doing',
    completed_at: '',
  });
}

export async function deleteTask(id: string): Promise<void> {
  await updateTask(id, { deleted: true });
}
