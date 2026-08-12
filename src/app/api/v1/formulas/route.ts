import { NextResponse } from 'next/server';
import { KnowledgeService } from '@/server/services/knowledge.service';
import { CreateFormulaEntrySchema } from '@/contracts/knowledge/knowledge.contract';

export async function GET() {
  try {
    const formulas = await KnowledgeService.getFormulas('user_default');
    return NextResponse.json({ success: true, data: formulas });
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
    const parsed = CreateFormulaEntrySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Invalid formula data' } },
        { status: 400 }
      );
    }

    const formula = await KnowledgeService.createFormula('user_default', parsed.data);
    return NextResponse.json({ success: true, data: formula });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'KNOWLEDGE_ERROR', message: err.message } },
      { status: 400 }
    );
  }
}
