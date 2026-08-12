import { supabaseAdmin } from '@/lib/supabase/server';
import { PureBrainContextEngine } from '@/server/ai/pure-brain-context.engine';
import { PureBrainDecisionEngine } from '@/server/ai/pure-brain-decision.engine';
import { BrainDecision, FocusSessionPlan } from '@/contracts/brain/brain.contract';

export class GlobalBrainService {
  // 1. Generate Brain Snapshot & Candidate Decisions
  static async generateBrainSnapshot(ownerId: string, triggerType: string = 'COMMAND') {
    const { count: lessonsCompleted } = await supabaseAdmin
      .from('user_lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'COMPLETED');

    const { count: openMistakesCount } = await supabaseAdmin
      .from('mistakes')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'OPEN');

    const { count: dueRevisionsCount } = await supabaseAdmin
      .from('revisions')
      .select('*', { count: 'exact', head: true })
      .lte('next_review_at', new Date().toISOString());

    const { count: pyqCount } = await supabaseAdmin
      .from('question_bank_questions')
      .select('*', { count: 'exact', head: true })
      .eq('source_type', 'VERIFIED_PYQ');

    const { count: notesCount } = await supabaseAdmin
      .from('personal_notes')
      .select('*', { count: 'exact', head: true });

    const snapshotRes = PureBrainContextEngine.buildSnapshot(
      {
        lessonsCompleted: lessonsCompleted || 0,
        openMistakesCount: openMistakesCount || 0,
        dueRevisionsCount: dueRevisionsCount || 0,
        pyqCount: pyqCount || 0,
        notesCount: notesCount || 0,
        profileMode: 'BALANCED',
      },
      triggerType
    );

    const { data: snapshotData, error: sErr } = await supabaseAdmin
      .from('brain_context_snapshots')
      .insert({
        owner_id: ownerId,
        snapshot_version: snapshotRes.snapshotVersion,
        trigger_type: triggerType,
        scope: 'GLOBAL',
        input_fingerprint: snapshotRes.inputFingerprint,
        context_payload: snapshotRes.contextPayload,
        source_references: snapshotRes.sourceReferences,
      })
      .select()
      .single();

    if (sErr || !snapshotData) throw new Error(`Failed to insert snapshot: ${sErr?.message}`);

    // Evaluate Decisions
    const candidateDecisions = PureBrainDecisionEngine.evaluateDecisions(snapshotRes.contextPayload);
    const decisionsToInsert = candidateDecisions.map((d) => ({
      owner_id: ownerId,
      snapshot_id: snapshotData.id,
      decision_type: d.decisionType,
      status: 'PROPOSED',
      priority: d.priority,
      title: d.title,
      summary: d.summary,
      reason_codes: d.reasonCodes,
      requires_confirmation: true,
    }));

    const { data: createdDecisions } = await supabaseAdmin.from('brain_decisions').insert(decisionsToInsert).select();

    return {
      snapshot: snapshotData,
      decisions: (createdDecisions || []).map((d) => this.mapDecision(d)),
    };
  }

  // 2. Get Recent Decisions
  static async getDecisions(ownerId: string): Promise<BrainDecision[]> {
    const { data, error } = await supabaseAdmin
      .from('brain_decisions')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((d) => this.mapDecision(d));
  }

  // 3. Confirm Decision
  static async confirmDecision(decisionId: string): Promise<BrainDecision> {
    const { data, error } = await supabaseAdmin
      .from('brain_decisions')
      .update({
        status: 'CONFIRMED',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', decisionId)
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to confirm decision: ${error?.message}`);
    return this.mapDecision(data);
  }

  // 4. Focus Sessions
  static async getFocusSessions(ownerId: string): Promise<FocusSessionPlan[]> {
    const { data, error } = await supabaseAdmin
      .from('focus_session_plans')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((f) => this.mapFocusSession(f));
  }

  static async createFocusSession(
    ownerId: string,
    objective: string,
    durationMinutes: number = 45
  ): Promise<FocusSessionPlan> {
    const { data, error } = await supabaseAdmin
      .from('focus_session_plans')
      .insert({
        owner_id: ownerId,
        session_type: 'LEARN',
        status: 'CONFIRMED',
        planned_duration_minutes: durationMinutes,
        objective,
        steps: ['Read topic summary', 'Solve 5 practice problems', 'Review mistakes'],
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to create focus session: ${error?.message}`);
    return this.mapFocusSession(data);
  }

  // Mappers
  private static mapDecision(data: any): BrainDecision {
    return {
      id: data.id,
      ownerId: data.owner_id,
      snapshotId: data.snapshot_id,
      decisionType: data.decision_type,
      status: data.status,
      priority: data.priority,
      title: data.title,
      summary: data.summary,
      reasonCodes: data.reason_codes || [],
      targetEntityType: data.target_entity_type,
      targetEntityId: data.target_entity_id,
      requiresConfirmation: data.requires_confirmation,
      confirmedAt: data.confirmed_at,
      executedAt: data.executed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private static mapFocusSession(data: any): FocusSessionPlan {
    return {
      id: data.id,
      subjectId: data.subject_id,
      topicId: data.topic_id,
      sessionType: data.session_type,
      status: data.status,
      plannedDurationMinutes: data.planned_duration_minutes,
      objective: data.objective,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      createdAt: data.created_at,
    };
  }
}
