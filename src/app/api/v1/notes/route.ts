import { NextResponse } from 'next/server';
import { KnowledgeService } from '@/server/services/knowledge.service';
import { CreatePersonalNoteSchema } from '@/contracts/knowledge/knowledge.contract';

export async function GET() {
  try {
    const notes = await KnowledgeService.getNotes('user_default');
    return NextResponse.json({ success: true, data: notes });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'KNOWLEDGE_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreatePersonalNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Invalid note data' } },
        { status: 400 }
      );
    }

    const note = await KnowledgeService.createNote('user_default', parsed.data);
    return NextResponse.json({ success: true, data: note });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'KNOWLEDGE_ERROR', message: err.message } },
      { status: 400 }
    );
  }
}
