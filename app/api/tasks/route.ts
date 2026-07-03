import { NextRequest } from 'next/server';
import { getTasks, createTask } from '@/lib/tasks';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tasks = await getTasks({
      status: (searchParams.get('status') as 'doing' | 'completed') || undefined,
      list_id: searchParams.get('list_id') || undefined,
      completed_month: searchParams.get('completed_month') || undefined,
      keyword: searchParams.get('keyword') || undefined,
    });
    return Response.json(tasks);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const task = await createTask(body);
    return Response.json(task, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: msg }, { status: 500 });
  }
}
