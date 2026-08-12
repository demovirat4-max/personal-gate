import { supabaseAdmin } from '@/lib/supabase/server';
import { ContentSource, CreateContentSourceInput, ContentQualityIssue } from '@/contracts/content/content.contract';
import { PureContentCoverageEngine, ContentCoverageSnapshot } from '@/server/ai/pure-coverage.engine';

export class ContentQualityService {
  // 1. Content Sources
  static async getSources(ownerId: string): Promise<ContentSource[]> {
    const { data, error } = await supabaseAdmin
      .from('content_sources')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((s) => this.mapSource(s));
  }

  static async createSource(ownerId: string, input: CreateContentSourceInput): Promise<ContentSource> {
    const { data, error } = await supabaseAdmin
      .from('content_sources')
      .insert({
        owner_id: ownerId,
        source_type: input.sourceType,
        publisher: input.publisher,
        title: input.title,
        source_url: input.sourceUrl || null,
        exam_year: input.examYear || null,
        verification_status: 'UNVERIFIED',
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to create source: ${error?.message}`);
    return this.mapSource(data);
  }

  static async verifySource(sourceId: string): Promise<ContentSource> {
    const { data, error } = await supabaseAdmin
      .from('content_sources')
      .update({
        verification_status: 'VERIFIED',
        verified_at: new Date().toISOString(),
        verified_by: 'GATE_CURATOR',
      })
      .eq('id', sourceId)
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to verify source: ${error?.message}`);
    return this.mapSource(data);
  }

  // 2. Quality Issues
  static async getQualityIssues(): Promise<ContentQualityIssue[]> {
    const { data, error } = await supabaseAdmin
      .from('content_quality_issues')
      .select('*')
      .neq('status', 'ARCHIVED')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((i) => this.mapIssue(i));
  }

  // 3. Content Coverage Snapshot
  static async getCoverageSnapshot(): Promise<ContentCoverageSnapshot> {
    const { count: subjectCount } = await supabaseAdmin.from('subjects').select('*', { count: 'exact', head: true });
    const { count: topicCount } = await supabaseAdmin.from('topics').select('*', { count: 'exact', head: true });
    const { count: lectureCount } = await supabaseAdmin.from('lectures').select('*', { count: 'exact', head: true });
    const { count: questionCount } = await supabaseAdmin
      .from('question_bank_questions')
      .select('*', { count: 'exact', head: true });

    const { count: pyqCount } = await supabaseAdmin
      .from('question_bank_questions')
      .select('*', { count: 'exact', head: true })
      .eq('source_type', 'VERIFIED_PYQ');

    const { count: unverifiedCount } = await supabaseAdmin
      .from('question_bank_questions')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'UNVERIFIED');

    return PureContentCoverageEngine.calculateCoverage({
      totalSubjects: subjectCount || 0,
      totalTopics: topicCount || 0,
      totalLectures: lectureCount || 0,
      totalQuestions: questionCount || 0,
      verifiedPyqCount: pyqCount || 0,
      unverifiedQuestionCount: unverifiedCount || 0,
      missingAnswerCount: 0,
      videoNeedsReviewCount: 0,
    });
  }

  // Mappers
  private static mapSource(data: any): ContentSource {
    return {
      id: data.id,
      ownerId: data.owner_id,
      sourceType: data.source_type,
      publisher: data.publisher,
      title: data.title,
      sourceUrl: data.source_url,
      examName: data.exam_name,
      examYear: data.exam_year,
      verificationStatus: data.verification_status,
      verifiedAt: data.verified_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private static mapIssue(data: any): ContentQualityIssue {
    return {
      id: data.id,
      entityType: data.entity_type,
      entityId: data.entity_id,
      issueCode: data.issue_code,
      severity: data.severity,
      status: data.status,
      title: data.title,
      description: data.description,
      detectedBy: data.detected_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
