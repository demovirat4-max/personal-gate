import { supabaseAdmin } from '@/lib/supabase/server';
import { RevisionItem, CompleteRevisionRequest } from '@/contracts/learning/revision.contract';

// Versioned Spaced Repetition Schedule: +1d, +3d, +7d, +14d, +30d
const INTERVAL_LADDER = [1, 3, 7, 14, 30];

export class RevisionService {
  /**
   * Helper to get current YYYY-MM-DD date string in Asia/Kolkata timezone
   */
  static getKolkataTodayDate(): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date()); // Outputs YYYY-MM-DD
  }

  /**
   * Helper to calculate future YYYY-MM-DD date after N days in Asia/Kolkata
   */
  static addDaysKolkata(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(d);
  }

  /**
   * Ensures a revision item exists for a source (Mistake/Lesson/Topic)
   */
  static async ensureRevisionItem(params: {
    sourceType: 'MISTAKE' | 'LESSON' | 'TOPIC';
    sourceId: string;
    topicId?: string | null;
    lessonId?: string | null;
    userId?: string;
  }): Promise<RevisionItem> {
    const userId = params.userId || 'default_user';
    const today = this.getKolkataTodayDate();

    const { data: existing } = await supabaseAdmin
      .from('revisions')
      .select('*')
      .eq('user_id', userId)
      .eq('source_type', params.sourceType)
      .eq('source_id', params.sourceId)
      .maybeSingle();

    if (existing) {
      // If completed, reset to DUE today
      if (existing.status === 'COMPLETED') {
        const { data } = await supabaseAdmin
          .from('revisions')
          .update({ status: 'DUE', due_date: today, interval_days: 1, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select('*')
          .single();
        return this.mapRevision(data);
      }
      return this.mapRevision(existing);
    }

    const { data, error } = await supabaseAdmin
      .from('revisions')
      .insert({
        user_id: userId,
        source_type: params.sourceType,
        source_id: params.sourceId,
        topic_id: params.topicId ?? null,
        lesson_id: params.lessonId ?? null,
        status: 'DUE',
        due_date: today,
        interval_days: 1,
        review_count: 0,
      })
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create revision item: ${error.message}`);
    return this.mapRevision(data);
  }

  /**
   * Retrieves revision queue for user
   */
  static async getRevisions(userId = 'default_user'): Promise<RevisionItem[]> {
    const today = this.getKolkataTodayDate();

    // Auto-update status to DUE if due_date <= today
    await supabaseAdmin
      .from('revisions')
      .update({ status: 'DUE' })
      .eq('user_id', userId)
      .lte('due_date', today)
      .eq('status', 'UPCOMING');

    const { data, error } = await supabaseAdmin
      .from('revisions')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) throw new Error(`Failed to fetch revisions: ${error.message}`);
    return (data || []).map((r: any) => this.mapRevision(r));
  }

  /**
   * Completes a revision review and reschedules next due date
   */
  static async completeReview(
    revisionId: string,
    req: CompleteRevisionRequest,
    userId = 'default_user'
  ): Promise<RevisionItem> {
    const { data: rev } = await supabaseAdmin
      .from('revisions')
      .select('*')
      .eq('id', revisionId)
      .eq('user_id', userId)
      .single();

    if (!rev) throw new Error('Revision item not found');

    const currentReviewCount = rev.review_count;
    let nextInterval = 1;

    if (req.outcome === 'SUCCESS') {
      const ladderIndex = Math.min(currentReviewCount, INTERVAL_LADDER.length - 1);
      nextInterval = INTERVAL_LADDER[ladderIndex];
    } else {
      nextInterval = 1; // Reset to 1 day on failure
    }

    const nextDueDate = this.addDaysKolkata(nextInterval);
    const now = new Date().toISOString();

    // Log immutable review outcome
    await supabaseAdmin.from('revision_reviews').insert({
      revision_id: revisionId,
      outcome: req.outcome,
      interval_days_applied: nextInterval,
    });

    const { data: updated, error } = await supabaseAdmin
      .from('revisions')
      .update({
        status: 'UPCOMING',
        due_date: nextDueDate,
        interval_days: nextInterval,
        review_count: currentReviewCount + 1,
        last_reviewed_at: now,
        next_review_at: new Date(`${nextDueDate}T00:00:00.000Z`).toISOString(),
        updated_at: now,
      })
      .eq('id', revisionId)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to update revision item: ${error.message}`);
    return this.mapRevision(updated);
  }

  private static mapRevision(r: any): RevisionItem {
    return {
      id: r.id,
      userId: r.user_id,
      sourceType: r.source_type,
      sourceId: r.source_id,
      topicId: r.topic_id,
      lessonId: r.lesson_id,
      title: `${r.source_type} Revision`,
      status: r.status,
      dueDate: r.due_date,
      intervalDays: r.interval_days,
      reviewCount: r.review_count,
      lastReviewedAt: r.last_reviewed_at,
      nextReviewAt: r.next_review_at,
    };
  }
}
