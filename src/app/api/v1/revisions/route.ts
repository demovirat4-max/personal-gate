import { NextResponse } from 'next/server';
import { RevisionService } from '@/server/services/revision.service';

export async function GET() {
  try {
    const revisions = await RevisionService.getRevisions();
    return NextResponse.json({ success: true, data: revisions, error: null });
  } catch (err: any) {
    return NextResponse.json({ success: false, data: null, error: { message: err.message } }, { status: 500 });
  }
}
