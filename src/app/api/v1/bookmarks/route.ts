import { NextResponse } from 'next/server';
import { KnowledgeService } from '@/server/services/knowledge.service';
import { CreateBookmarkSchema } from '@/contracts/knowledge/knowledge.contract';

export async function GET() {
  try {
    const bookmarks = await KnowledgeService.getBookmarks('user_default');
    return NextResponse.json({ success: true, data: bookmarks });
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
    const parsed = CreateBookmarkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Invalid bookmark data' } },
        { status: 400 }
      );
    }

    const bookmark = await KnowledgeService.createBookmark('user_default', parsed.data);
    return NextResponse.json({ success: true, data: bookmark });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'KNOWLEDGE_ERROR', message: err.message } },
      { status: 400 }
    );
  }
}
