import { supabaseAdmin } from '@/lib/supabase/server';
import { Mistake, UpdateMistakeRequest } from '@/contracts/learning/mistake.contract';
import { RevisionService } from './revision.service';

export class MistakeService {
  /**
   * Records or updates a mistake from an incorrect quiz answer
   */
  static async recordMistake(
    params: {
      questionId: string;
      attemptId?: string | null;
      subjectId?: string | null;
      topicId?: string | null;
      userAnswerJson: any;
      correctAnswerJson: any;
    },
    userId = 'default_user'
  ): Promise<Mistake> {
    const existing = await supabaseAdmin
      .from('mistakes')
      .select('*')
      .eq('user_id', userId)
      .eq('question_id', params.questionId)
      .maybeSingle();

    const now = new Date().toISOString();
    let mistakeData: any;

    if (existing.data) {
      const { data, error } = await supabaseAdmin
        .from('mistakes')
        .update({
          attempt_id: params.attemptId ?? existing.data.attempt_id,
          user_answer_json: params.userAnswerJson,
          correct_answer_json: params.correctAnswerJson,
          status: 'OPEN', // Re-open mistake on new failure
          occurrence_count: existing.data.occurrence_count + 1,
          last_seen_at: now,
          updated_at: now,
        })
        .eq('id', existing.data.id)
        .select('*')
        .single();

      if (error) throw new Error(`Failed to update mistake: ${error.message}`);
      mistakeData = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('mistakes')
        .insert({
          user_id: userId,
          question_id: params.questionId,
          attempt_id: params.attemptId ?? null,
          subject_id: params.subjectId ?? null,
          topic_id: params.topicId ?? null,
          user_answer_json: params.userAnswerJson,
          correct_answer_json: params.correctAnswerJson,
          status: 'OPEN',
          occurrence_count: 1,
          first_seen_at: now,
          last_seen_at: now,
        })
        .select('*')
        .single();

      if (error) throw new Error(`Failed to record mistake: ${error.message}`);
      mistakeData = data;
    }

    // Automatically queue for spaced revision
    await RevisionService.ensureRevisionItem({
      sourceType: 'MISTAKE',
      sourceId: mistakeData.id,
      topicId: mistakeData.topic_id,
      userId,
    });

    return this.mapMistake(mistakeData);
  }

  /**
   * Retrieves mistakes for user
   */
  static async getMistakes(statusFilter?: string, userId = 'default_user'): Promise<Mistake[]> {
    let query = supabaseAdmin
      .from('mistakes')
      .select('*, quiz_questions(question_text, explanation)')
      .eq('user_id', userId)
      .order('last_seen_at', { ascending: false });

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch mistakes: ${error.message}`);

    return (data || []).map((m: any) => ({
      id: m.id,
      userId: m.user_id,
      questionId: m.question_id,
      attemptId: m.attempt_id,
      subjectId: m.subject_id,
      topicId: m.topic_id,
      questionText: m.quiz_questions?.question_text,
      userAnswerJson: m.user_answer_json,
      correctAnswerJson: m.correct_answer_json,
      explanation: m.quiz_questions?.explanation,
      status: m.status,
      occurrenceCount: m.occurrence_count,
      firstSeenAt: m.first_seen_at,
      lastSeenAt: m.last_seen_at,
      reviewedAt: m.reviewed_at,
      reflection: m.reflection,
    }));
  }

  /**
   * Updates mistake status or reflection text
   */
  static async updateMistake(mistakeId: string, req: UpdateMistakeRequest, userId = 'default_user'): Promise<Mistake> {
    const updates: any = { updated_at: new Date().toISOString() };
    if (req.status) {
      updates.status = req.status;
      if (req.status === 'REVIEWED') updates.reviewed_at = new Date().toISOString();
    }
    if (req.reflection !== undefined) updates.reflection = req.reflection;

    const { data, error } = await supabaseAdmin
      .from('mistakes')
      .update(updates)
      .eq('id', mistakeId)
      .eq('user_id', userId)
      .select('*, quiz_questions(question_text, explanation)')
      .single();

    if (error || !data) throw new Error(`Failed to update mistake: ${error?.message || 'Not found'}`);

    return {
      id: data.id,
      userId: data.user_id,
      questionId: data.question_id,
      attemptId: data.attempt_id,
      subjectId: data.subject_id,
      topicId: data.topic_id,
      questionText: data.quiz_questions?.question_text,
      userAnswerJson: data.user_answer_json,
      correctAnswerJson: data.correct_answer_json,
      explanation: data.quiz_questions?.explanation,
      status: data.status,
      occurrenceCount: data.occurrence_count,
      firstSeenAt: data.first_seen_at,
      lastSeenAt: data.last_seen_at,
      reviewedAt: data.reviewed_at,
      reflection: data.reflection,
    };
  }

  private static mapMistake(m: any): Mistake {
    return {
      id: m.id,
      userId: m.user_id,
      questionId: m.question_id,
      attemptId: m.attempt_id,
      subjectId: m.subject_id,
      topicId: m.topic_id,
      userAnswerJson: m.user_answer_json,
      correctAnswerJson: m.correct_answer_json,
      status: m.status,
      occurrenceCount: m.occurrence_count,
      firstSeenAt: m.first_seen_at,
      lastSeenAt: m.last_seen_at,
      reviewedAt: m.reviewed_at,
      reflection: m.reflection,
    };
  }
}
