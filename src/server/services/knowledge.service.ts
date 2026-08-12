import { supabaseAdmin } from '@/lib/supabase/server';
import {
  CreatePersonalNoteInput,
  PersonalNote,
  CreateFormulaEntryInput,
  FormulaEntry,
  CreateBookmarkInput,
  Bookmark,
  CreateFlashcardDeckInput,
  FlashcardDeck,
  SubmitFlashcardReviewInput,
} from '@/contracts/knowledge/knowledge.contract';
import { PureFlashcardSchedulerEngine } from '@/server/ai/pure-flashcard.engine';

export class KnowledgeService {
  // 1. Personal Notes
  static async createNote(ownerId: string, input: CreatePersonalNoteInput): Promise<PersonalNote> {
    const { data, error } = await supabaseAdmin
      .from('personal_notes')
      .insert({
        owner_id: ownerId,
        subject_id: input.subjectId || null,
        topic_id: input.topicId || null,
        lesson_id: input.lessonId || null,
        mistake_id: input.mistakeId || null,
        title: input.title,
        content: input.content,
        content_format: input.contentFormat || 'MARKDOWN',
        note_type: input.noteType || 'GENERAL',
        status: 'ACTIVE',
        source_type: 'USER_AUTHORED',
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to create note: ${error?.message}`);
    return this.mapNote(data);
  }

  static async getNotes(ownerId: string): Promise<PersonalNote[]> {
    const { data, error } = await supabaseAdmin
      .from('personal_notes')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((n) => this.mapNote(n));
  }

  // 2. Formula Entries
  static async createFormula(ownerId: string, input: CreateFormulaEntryInput): Promise<FormulaEntry> {
    const { data, error } = await supabaseAdmin
      .from('formula_entries')
      .insert({
        owner_id: ownerId,
        subject_id: input.subjectId,
        topic_id: input.topicId || null,
        title: input.title,
        expression: input.expression,
        expression_format: input.expressionFormat || 'LATEX',
        description: input.description || null,
        variable_definitions: input.variableDefinitions || [],
        conditions: input.conditions || null,
        example: input.example || null,
        status: 'ACTIVE',
        source_type: 'USER_AUTHORED',
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to create formula: ${error?.message}`);
    return this.mapFormula(data);
  }

  static async getFormulas(ownerId: string): Promise<FormulaEntry[]> {
    const { data, error } = await supabaseAdmin
      .from('formula_entries')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((f) => this.mapFormula(f));
  }

  // 3. Bookmarks
  static async createBookmark(ownerId: string, input: CreateBookmarkInput): Promise<Bookmark> {
    const { data, error } = await supabaseAdmin
      .from('bookmarks')
      .insert({
        owner_id: ownerId,
        subject_id: input.subjectId || null,
        topic_id: input.topicId || null,
        lesson_id: input.lessonId || null,
        target_type: input.targetType,
        target_id: input.targetId || null,
        external_url: input.externalUrl || null,
        title: input.title,
        description: input.description || null,
        status: 'ACTIVE',
        source_type: 'USER_AUTHORED',
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to create bookmark: ${error?.message}`);
    return this.mapBookmark(data);
  }

  static async getBookmarks(ownerId: string): Promise<Bookmark[]> {
    const { data, error } = await supabaseAdmin
      .from('bookmarks')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((b) => this.mapBookmark(b));
  }

  // 4. Flashcard Decks & Reviews
  static async createDeck(ownerId: string, input: CreateFlashcardDeckInput): Promise<FlashcardDeck> {
    const { data, error } = await supabaseAdmin
      .from('flashcard_decks')
      .insert({
        owner_id: ownerId,
        subject_id: input.subjectId || null,
        topic_id: input.topicId || null,
        title: input.title,
        description: input.description || null,
        status: 'ACTIVE',
        source_type: 'USER_AUTHORED',
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to create deck: ${error?.message}`);
    return this.mapDeck(data);
  }

  static async getDecks(ownerId: string): Promise<FlashcardDeck[]> {
    const { data, error } = await supabaseAdmin
      .from('flashcard_decks')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((d) => this.mapDeck(d));
  }

  static async submitFlashcardReview(cardId: string, ownerId: string, input: SubmitFlashcardReviewInput): Promise<any> {
    const { data: existingReview } = await supabaseAdmin
      .from('flashcard_reviews')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('idempotency_key', input.idempotencyKey)
      .maybeSingle();

    if (existingReview) {
      return existingReview;
    }

    const { data: state } = await supabaseAdmin
      .from('flashcard_review_states')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('flashcard_id', cardId)
      .maybeSingle();

    const currentStatus = state?.status || 'NEW';
    const currentInterval = state?.interval_days || 0;
    const successes = state?.consecutive_successes || 0;
    const lapses = state?.lapse_count || 0;

    const scheduled = PureFlashcardSchedulerEngine.scheduleNextReview({
      status: currentStatus,
      rating: input.rating,
      currentIntervalDays: currentInterval,
      consecutiveSuccesses: successes,
      lapseCount: lapses,
      lastReviewedAt: state?.last_reviewed_at || null,
      reviewedAt: new Date().toISOString(),
    });

    // Upsert State
    const { data: newState } = await supabaseAdmin
      .from('flashcard_review_states')
      .upsert({
        owner_id: ownerId,
        flashcard_id: cardId,
        algorithm_version: PureFlashcardSchedulerEngine.VERSION,
        status: scheduled.nextState,
        due_at: scheduled.dueAt,
        interval_days: scheduled.intervalDays,
        consecutive_successes: scheduled.consecutiveSuccesses,
        lapse_count: scheduled.lapseCount,
        last_reviewed_at: new Date().toISOString(),
        last_rating: input.rating,
        input_fingerprint: scheduled.inputFingerprint,
      })
      .select()
      .single();

    // Log Immutable Event
    const { data: reviewLog } = await supabaseAdmin
      .from('flashcard_reviews')
      .insert({
        owner_id: ownerId,
        flashcard_id: cardId,
        review_state_id: newState.id,
        rating: input.rating,
        previous_state: currentStatus,
        resulting_state: scheduled.nextState,
        previous_due_at: state?.due_at || null,
        resulting_due_at: scheduled.dueAt,
        previous_interval_days: currentInterval,
        resulting_interval_days: scheduled.intervalDays,
        algorithm_version: PureFlashcardSchedulerEngine.VERSION,
        reviewed_at: new Date().toISOString(),
        idempotency_key: input.idempotencyKey,
      })
      .select()
      .single();

    return reviewLog;
  }

  // Mappers
  private static mapNote(data: any): PersonalNote {
    return {
      id: data.id,
      ownerId: data.owner_id,
      subjectId: data.subject_id,
      topicId: data.topic_id,
      lessonId: data.lesson_id,
      mistakeId: data.mistake_id,
      title: data.title,
      content: data.content,
      contentFormat: data.content_format,
      noteType: data.note_type,
      status: data.status,
      sourceType: data.source_type,
      sourceId: data.source_id,
      provenance: data.provenance || {},
      isPinned: data.is_pinned,
      revision: data.revision,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      archivedAt: data.archived_at,
    };
  }

  private static mapFormula(data: any): FormulaEntry {
    return {
      id: data.id,
      ownerId: data.owner_id,
      subjectId: data.subject_id,
      topicId: data.topic_id,
      title: data.title,
      expression: data.expression,
      expressionFormat: data.expression_format,
      description: data.description,
      variableDefinitions: data.variable_definitions || [],
      conditions: data.conditions,
      example: data.example,
      sourceType: data.source_type,
      sourceId: data.source_id,
      provenance: data.provenance || {},
      status: data.status,
      isPinned: data.is_pinned,
      revision: data.revision,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      archivedAt: data.archived_at,
    };
  }

  private static mapBookmark(data: any): Bookmark {
    return {
      id: data.id,
      ownerId: data.owner_id,
      subjectId: data.subject_id,
      topicId: data.topic_id,
      lessonId: data.lesson_id,
      targetType: data.target_type,
      targetId: data.target_id,
      externalUrl: data.external_url,
      title: data.title,
      description: data.description,
      sourceType: data.source_type,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      archivedAt: data.archived_at,
    };
  }

  private static mapDeck(data: any): FlashcardDeck {
    return {
      id: data.id,
      ownerId: data.owner_id,
      subjectId: data.subject_id,
      topicId: data.topic_id,
      title: data.title,
      description: data.description,
      status: data.status,
      sourceType: data.source_type,
      provenance: data.provenance || {},
      cardCount: data.card_count,
      dueCardCount: data.due_card_count,
      revision: data.revision,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      archivedAt: data.archived_at,
    };
  }
}
