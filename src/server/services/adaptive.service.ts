import { supabaseAdmin } from '@/lib/supabase/server';
import { CreateStudySessionInput, StudySession, DailyPlan } from '@/contracts/learning/adaptive.contract';
import { PureMasteryEngine } from '@/server/ai/pure-mastery.engine';

export class AdaptiveService {
  /**
   * Start a new study session safely
   */
  static async startSession(ownerId: string, input: CreateStudySessionInput): Promise<StudySession> {
    const { data: active } = await supabaseAdmin
      .from('study_sessions')
      .select('id')
      .eq('owner_id', ownerId)
      .eq('status', 'ACTIVE')
      .maybeSingle();

    if (active) {
      throw new Error('STUDY_SESSION_ALREADY_ACTIVE: You already have an active study session running.');
    }

    const { data, error } = await supabaseAdmin
      .from('study_sessions')
      .insert({
        owner_id: ownerId,
        subject_id: input.subjectId || null,
        topic_id: input.topicId || null,
        lesson_id: input.lessonId || null,
        daily_mission_item_id: input.dailyMissionItemId || null,
        session_type: input.sessionType,
        status: 'ACTIVE',
        source: 'web',
        metadata: input.metadata || {},
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create study session: ${error?.message || 'Database error'}`);
    }

    return this.mapSession(data);
  }

  /**
   * Complete a study session idempotently
   */
  static async completeSession(sessionId: string, ownerId: string): Promise<StudySession> {
    const { data: session } = await supabaseAdmin
      .from('study_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (!session) {
      throw new Error('STUDY_SESSION_NOT_FOUND: Session not found or unauthorized.');
    }

    if (session.status === 'COMPLETED') {
      return this.mapSession(session);
    }

    const started = new Date(session.started_at).getTime();
    const now = Date.now();
    const activeSecs = Math.max(0, Math.floor((now - started) / 1000) - session.paused_duration_seconds);

    const { data, error } = await supabaseAdmin
      .from('study_sessions')
      .update({
        status: 'COMPLETED',
        ended_at: new Date().toISOString(),
        active_duration_seconds: activeSecs,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to complete session: ${error?.message}`);
    }

    return this.mapSession(data);
  }

  /**
   * Generate Daily Adaptive Plan deterministically
   */
  static async generateDailyPlan(ownerId: string, availableMinutes: number = 120): Promise<DailyPlan> {
    const today = new Date().toISOString().split('T')[0];

    // Check existing confirmed or draft plan safely (order by created_at desc)
    const { data: existingList } = await supabaseAdmin
      .from('daily_plans')
      .select('*, daily_plan_items(*)')
      .eq('owner_id', ownerId)
      .eq('plan_date', today)
      .neq('status', 'SUPERSEDED')
      .order('created_at', { ascending: false })
      .limit(1);

    if (existingList && existingList.length > 0) {
      return this.mapPlan(existingList[0]);
    }

    // Fetch due revisions
    const { data: dueRevisions } = await supabaseAdmin
      .from('revisions')
      .select('id, subject_id, topic_id')
      .lte('next_review_at', new Date().toISOString())
      .limit(3);

    // Fetch open mistakes
    const { data: openMistakes } = await supabaseAdmin
      .from('mistakes')
      .select('id, question_id')
      .eq('status', 'OPEN')
      .limit(3);

    const planId = crypto.randomUUID();
    let plannedMinutes = 0;
    const items: any[] = [];
    let seq = 0;

    // 1. Add Revision Items
    if (dueRevisions && dueRevisions.length > 0) {
      for (const rev of dueRevisions) {
        if (plannedMinutes + 20 <= availableMinutes) {
          items.push({
            daily_plan_id: planId,
            owner_id: ownerId,
            item_type: 'REVISION',
            subject_id: rev.subject_id,
            topic_id: rev.topic_id,
            revision_item_id: rev.id,
            estimated_minutes: 20,
            priority_score: 90.0,
            sequence: seq++,
            reason_codes: ['REVISION_DUE'],
            explanation_data: { note: 'Scheduled spaced repetition' },
            status: 'PLANNED',
          });
          plannedMinutes += 20;
        }
      }
    }

    // 2. Add Mistake Review Items
    if (openMistakes && openMistakes.length > 0) {
      for (const mis of openMistakes) {
        if (plannedMinutes + 15 <= availableMinutes) {
          items.push({
            daily_plan_id: planId,
            owner_id: ownerId,
            item_type: 'MISTAKE_REVIEW',
            mistake_id: mis.id,
            estimated_minutes: 15,
            priority_score: 80.0,
            sequence: seq++,
            reason_codes: ['OPEN_MISTAKE'],
            explanation_data: { note: 'Review weak concept' },
            status: 'PLANNED',
          });
          plannedMinutes += 15;
        }
      }
    }

    // Fallback Learn Item
    if (items.length === 0 && plannedMinutes + 45 <= availableMinutes) {
      items.push({
        daily_plan_id: planId,
        owner_id: ownerId,
        item_type: 'LEARN',
        estimated_minutes: 45,
        priority_score: 70.0,
        sequence: seq++,
        reason_codes: ['CONTINUE_LESSON'],
        explanation_data: { note: 'Regular curriculum learning' },
        status: 'PLANNED',
      });
      plannedMinutes += 45;
    }

    const { data: planData, error: planErr } = await supabaseAdmin
      .from('daily_plans')
      .insert({
        id: planId,
        owner_id: ownerId,
        plan_date: today,
        timezone: 'Asia/Kolkata',
        status: 'CONFIRMED',
        available_minutes: availableMinutes,
        planned_minutes: plannedMinutes,
        strategy_version: 'v1.0.0',
        input_fingerprint: `fingerprint_${today}_${availableMinutes}`,
      })
      .select()
      .single();

    if (planErr || !planData) {
      throw new Error(`Failed to generate plan: ${planErr?.message}`);
    }

    if (items.length > 0) {
      await supabaseAdmin.from('daily_plan_items').insert(items);
    }

    const { data: finalPlan } = await supabaseAdmin
      .from('daily_plans')
      .select('*, daily_plan_items(*)')
      .eq('id', planId)
      .single();

    return this.mapPlan(finalPlan);
  }

  private static mapSession(data: any): StudySession {
    return {
      id: data.id,
      ownerId: data.owner_id,
      subjectId: data.subject_id,
      topicId: data.topic_id,
      lessonId: data.lesson_id,
      dailyMissionItemId: data.daily_mission_item_id,
      sessionType: data.session_type,
      status: data.status,
      source: data.source,
      startedAt: data.started_at,
      endedAt: data.ended_at,
      activeDurationSeconds: data.active_duration_seconds,
      pausedDurationSeconds: data.paused_duration_seconds,
      completedUnits: data.completed_units,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private static mapPlan(data: any): DailyPlan {
    const rawItems = data.daily_plan_items || [];
    return {
      id: data.id,
      ownerId: data.owner_id,
      planDate: data.plan_date,
      timezone: data.timezone,
      status: data.status,
      availableMinutes: data.available_minutes,
      plannedMinutes: data.planned_minutes,
      strategyVersion: data.strategy_version,
      inputFingerprint: data.input_fingerprint,
      generatedAt: data.generated_at,
      confirmedAt: data.confirmed_at,
      completedAt: data.completed_at,
      supersedesPlanId: data.supersedes_plan_id,
      items: rawItems.map((item: any) => ({
        id: item.id,
        dailyPlanId: item.daily_plan_id,
        ownerId: item.owner_id,
        itemType: item.item_type,
        subjectId: item.subject_id,
        topicId: item.topic_id,
        lessonId: item.lesson_id,
        mistakeId: item.mistake_id,
        revisionItemId: item.revision_item_id,
        estimatedMinutes: item.estimated_minutes,
        priorityScore: parseFloat(item.priority_score),
        sequence: item.sequence,
        reasonCodes: item.reason_codes || [],
        explanationData: item.explanation_data || {},
        status: item.status,
        startedAt: item.started_at,
        completedAt: item.completed_at,
      })),
    };
  }
}
