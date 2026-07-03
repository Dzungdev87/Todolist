import { NextRequest } from 'next/server';
import { getLists, createList } from '@/lib/lists';

export async function GET() {
  try {
    const lists = await getLists();
    return Response.json(lists);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const list = await createList(body);
    return Response.json(list, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: msg }, { status: 500 });
  }
}
