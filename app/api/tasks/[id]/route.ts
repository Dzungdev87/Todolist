import { NextRequest } from 'next/server';
import { updateTask, completeTask, restoreTask, deleteTask } from '@/lib/tasks';

type Params = Promise<{ id: string }>;

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Handle special actions
    if (body.action === 'complete') {
      const task = await completeTask(id);
      return Response.json(task);
    }
    if (body.action === 'restore') {
      const task = await restoreTask(id);
      return Response.json(task);
    }

    // Strip action field before passing to updateTask
    const { action: _action, ...updateData } = body;
    const task = await updateTask(id, updateData);
    return Response.json(task);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params;
    await deleteTask(id);
    return Response.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: msg }, { status: 500 });
  }
}
