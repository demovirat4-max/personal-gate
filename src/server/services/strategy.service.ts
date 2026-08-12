import { supabaseAdmin } from '@/lib/supabase/server';
import {
  PreparationProfile,
  LongTermGoal,
  CreatePreparationProfileInput,
  CreateGoalInput,
  StudyScheduleBlock,
} from '@/contracts/strategy/strategy.contract';
import { PurePlanningEngine } from '@/server/ai/pure-planning.engine';

export class StrategyService {
  // 1. Preparation Profile
  static async getProfile(ownerId: string): Promise<PreparationProfile | null> {
    const { data } = await supabaseAdmin
      .from('preparation_profiles')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('profile_status', 'ACTIVE')
      .maybeSingle();

    if (!data) return null;
    return this.mapProfile(data);
  }

  static async saveProfile(ownerId: string, input: CreatePreparationProfileInput): Promise<PreparationProfile> {
    const { data, error } = await supabaseAdmin
      .from('preparation_profiles')
      .upsert({
        owner_id: ownerId,
        target_exam: input.targetExam,
        target_year: input.targetYear,
        weekly_study_minutes: input.weeklyStudyMinutes,
        strategy_mode: input.strategyMode,
        target_statement: input.targetStatement || null,
        profile_status: 'ACTIVE',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to save profile: ${error?.message}`);
    return this.mapProfile(data);
  }

  // 2. Long Term Goals
  static async getGoals(ownerId: string): Promise<LongTermGoal[]> {
    const { data, error } = await supabaseAdmin
      .from('long_term_goals')
      .select('*')
      .eq('owner_id', ownerId)
      .neq('status', 'ARCHIVED')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((g) => this.mapGoal(g));
  }

  static async createGoal(ownerId: string, input: CreateGoalInput): Promise<LongTermGoal> {
    const { data, error } = await supabaseAdmin
      .from('long_term_goals')
      .insert({
        owner_id: ownerId,
        goal_type: input.goalType,
        title: input.title,
        description: input.description || null,
        target_date: input.targetDate,
        target_value: input.targetValue || null,
        unit: input.unit || null,
        priority: input.priority,
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to create goal: ${error?.message}`);
    return this.mapGoal(data);
  }

  // 3. Schedule Generation & Management
  static async generateSchedule(ownerId: string): Promise<{ schedule: any; blocks: StudyScheduleBlock[] }> {
    const profile = await this.getProfile(ownerId);
    const weeklyMinutes = profile?.weeklyStudyMinutes || 1200;
    const mode = profile?.strategyMode || 'BALANCED';

    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    const planned = PurePlanningEngine.generateSchedule({
      weeklyStudyMinutes: weeklyMinutes,
      strategyMode: mode,
      startDate,
      daysCount: 7,
    });

    // Create Schedule Record
    const { data: schedule } = await supabaseAdmin
      .from('study_schedules')
      .insert({
        owner_id: ownerId,
        preparation_profile_id: profile?.id || null,
        title: `7-Day GATE CS Plan (${mode})`,
        start_date: startDate,
        end_date: endDate,
        status: 'CONFIRMED',
        strategy_mode: mode,
        planning_version: PurePlanningEngine.VERSION,
        input_fingerprint: planned.inputFingerprint,
        limitations: planned.limitations,
      })
      .select()
      .single();

    // Insert Blocks
    const blockInserts = planned.blocks.map((b) => ({
      schedule_id: schedule.id,
      owner_id: ownerId,
      block_date: b.blockDate,
      planned_minutes: b.plannedMinutes,
      activity_type: b.activityType,
      title: b.title,
      rationale_codes: b.rationaleCodes,
      priority: b.priority,
      position: b.position,
      status: 'PLANNED',
    }));

    const { data: blocks } = await supabaseAdmin.from('study_schedule_blocks').insert(blockInserts).select();

    return {
      schedule,
      blocks: (blocks || []).map((b) => this.mapBlock(b)),
    };
  }

  static async getScheduleBlocks(ownerId: string): Promise<StudyScheduleBlock[]> {
    const { data, error } = await supabaseAdmin
      .from('study_schedule_blocks')
      .select('*')
      .eq('owner_id', ownerId)
      .order('block_date', { ascending: true })
      .order('position', { ascending: true });

    if (error || !data) return [];
    return data.map((b) => this.mapBlock(b));
  }

  // Mappers
  private static mapProfile(data: any): PreparationProfile {
    return {
      id: data.id,
      ownerId: data.owner_id,
      targetExam: data.target_exam,
      targetYear: data.target_year,
      examDate: data.exam_date,
      timezone: data.timezone,
      weeklyStudyMinutes: data.weekly_study_minutes,
      minimumDailyMinutes: data.minimum_daily_minutes,
      maximumDailyMinutes: data.maximum_daily_minutes,
      preferredStudyDays: data.preferred_study_days || [],
      strategyMode: data.strategy_mode,
      targetStatement: data.target_statement,
      profileStatus: data.profile_status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private static mapGoal(data: any): LongTermGoal {
    return {
      id: data.id,
      ownerId: data.owner_id,
      preparationProfileId: data.preparation_profile_id,
      goalType: data.goal_type,
      title: data.title,
      description: data.description,
      subjectId: data.subject_id,
      topicId: data.topic_id,
      targetDate: data.target_date,
      targetValue: data.target_value ? Number(data.target_value) : null,
      unit: data.unit,
      priority: data.priority,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private static mapBlock(data: any): StudyScheduleBlock {
    return {
      id: data.id,
      scheduleId: data.schedule_id,
      ownerId: data.owner_id,
      blockDate: data.block_date,
      startTime: data.start_time,
      endTime: data.end_time,
      plannedMinutes: data.planned_minutes,
      activityType: data.activity_type,
      subjectId: data.subject_id,
      topicId: data.topic_id,
      lessonId: data.lesson_id,
      title: data.title,
      rationaleCodes: data.rationale_codes || [],
      priority: data.priority,
      status: data.status,
      actualMinutes: data.actual_minutes,
      completedAt: data.completed_at,
      position: data.position,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
