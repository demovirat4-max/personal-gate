import { NextResponse } from 'next/server';
import { ContentQualityService } from '@/server/services/content-quality.service';
import { CreateContentSourceSchema } from '@/contracts/content/content.contract';

export async function GET() {
  try {
    const sources = await ContentQualityService.getSources('user_default');
    return NextResponse.json({ success: true, data: sources });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'CONTENT_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateContentSourceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Invalid content source data' } },
        { status: 400 }
      );
    }

    const source = await ContentQualityService.createSource('user_default', parsed.data);
    return NextResponse.json({ success: true, data: source });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'CONTENT_ERROR', message: err.message } },
      { status: 400 }
    );
  }
}
