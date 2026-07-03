import { readSheet, appendRow, findRowIndex, updateRow, LISTS_SHEET } from './googleSheets';
import { TodoList, CreateListInput, UpdateListInput } from '@/types/list';
import { nowISO } from './date';
import { nanoid } from 'nanoid';

function rowToList(row: string[]): TodoList {
  return {
    id: row[0] || '',
    name: row[1] || '',
    description: row[2] || '',
    color: row[3] || '#6366f1',
    icon: row[4] || '📋',
    created_at: row[5] || '',
    updated_at: row[6] || '',
    archived: row[7] === 'TRUE',
  };
}

function listToRow(list: TodoList): (string | boolean)[] {
  return [
    list.id,
    list.name,
    list.description || '',
    list.color || '#6366f1',
    list.icon || '📋',
    list.created_at,
    list.updated_at,
    list.archived,
  ];
}

export async function getLists(includeArchived = false): Promise<TodoList[]> {
  const rows = await readSheet(LISTS_SHEET);
  return rows
    .filter((r) => r.length > 0 && r[0])
    .map(rowToList)
    .filter((l) => includeArchived || !l.archived);
}

export async function createList(input: CreateListInput): Promise<TodoList> {
  const now = nowISO();
  const list: TodoList = {
    id: nanoid(),
    name: input.name,
    description: input.description || '',
    color: input.color || '#6366f1',
    icon: input.icon || '📋',
    created_at: now,
    updated_at: now,
    archived: false,
  };
  await appendRow(LISTS_SHEET, listToRow(list));
  return list;
}

export async function updateList(id: string, input: UpdateListInput): Promise<TodoList> {
  const rows = await readSheet(LISTS_SHEET);
  const rowData = rows.find((r) => r[0] === id);
  if (!rowData) throw new Error(`List "${id}" not found`);

  const existing = rowToList(rowData);
  const updated: TodoList = {
    ...existing,
    ...input,
    updated_at: nowISO(),
  };
  const rowNum = await findRowIndex(LISTS_SHEET, id);
  await updateRow(LISTS_SHEET, rowNum, listToRow(updated));
  return updated;
}

export async function archiveList(id: string): Promise<void> {
  await updateList(id, { archived: true });
}
