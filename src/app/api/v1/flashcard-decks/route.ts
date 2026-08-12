import { NextResponse } from 'next/server';
import { KnowledgeService } from '@/server/services/knowledge.service';
import { CreateFlashcardDeckSchema } from '@/contracts/knowledge/knowledge.contract';

export async function GET() {
  try {
    const decks = await KnowledgeService.getDecks('user_default');
    return NextResponse.json({ success: true, data: decks });
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
    const parsed = CreateFlashcardDeckSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Invalid deck data' } },
        { status: 400 }
      );
    }

    const deck = await KnowledgeService.createDeck('user_default', parsed.data);
    return NextResponse.json({ success: true, data: deck });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'KNOWLEDGE_ERROR', message: err.message } },
      { status: 400 }
    );
  }
}
