import { supabaseAdmin } from '@/lib/supabase/server';
import { LessonProgress, UpdateProgressRequest } from '@/contracts/learning/progress.contract';

export class ProgressService {
  /**
   * Retrieves current progress for a given lesson
   */
  static async getProgress(lessonId: string, userId = 'default_user'): Promise<LessonProgress | null> {
    const { data, error } = await supabaseAdmin
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch lesson progress: ${error.message}`);
    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      lessonId: data.lesson_id,
      youtubeVideoId: data.youtube_video_id,
      watchedSeconds: data.watched_seconds,
      furthestWatchedSeconds: data.furthest_watched_seconds,
      durationSeconds: data.duration_seconds,
      progressPercent: data.progress_percent,
      completed: data.completed,
      completionSource: data.completion_source,
      lastWatchedAt: data.last_watched_at,
      completedAt: data.completed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Updates watch progress safely and enforces furthest-watched monotonicity
   */
  static async updateProgress(
    lessonId: string,
    req: UpdateProgressRequest,
    userId = 'default_user'
  ): Promise<LessonProgress> {
    const existing = await this.getProgress(lessonId, userId);

    // Monotonic furthest progress protection
    const currentFurthest = existing ? existing.furthestWatchedSeconds : 0;
    const newFurthest = Math.max(currentFurthest, req.furthestWatchedSeconds, req.watchedSeconds);

    const duration = req.durationSeconds > 0 ? req.durationSeconds : existing?.durationSeconds || 0;
    const progressPercent = duration > 0 ? Math.min(100, Math.floor((newFurthest / duration) * 100)) : 0;

    // Automatic completion policy: >=90% watched coverage
    const isAutoCompleted = progressPercent >= 90;
    const completed = existing?.completed || isAutoCompleted;
    const completionSource = existing?.completed
      ? existing.completionSource
      : isAutoCompleted
        ? 'AUTOMATIC'
        : 'AUTOMATIC';
    const completedAt = completed ? existing?.completedAt || new Date().toISOString() : null;

    const { data, error } = await supabaseAdmin
      .from('lesson_progress')
      .upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          youtube_video_id: req.youtubeVideoId,
          watched_seconds: req.watchedSeconds,
          furthest_watched_seconds: newFurthest,
          duration_seconds: duration,
          progress_percent: progressPercent,
          completed,
          completion_source: completionSource,
          last_watched_at: new Date().toISOString(),
          completed_at: completedAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,lesson_id' }
      )
      .select('*')
      .single();

    if (error) throw new Error(`Failed to update lesson progress: ${error.message}`);

    return {
      id: data.id,
      userId: data.user_id,
      lessonId: data.lesson_id,
      youtubeVideoId: data.youtube_video_id,
      watchedSeconds: data.watched_seconds,
      furthestWatchedSeconds: data.furthest_watched_seconds,
      durationSeconds: data.duration_seconds,
      progressPercent: data.progress_percent,
      completed: data.completed,
      completionSource: data.completion_source,
      lastWatchedAt: data.last_watched_at,
      completedAt: data.completed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Explicitly marks a lesson as completed (Manual source)
   */
  static async markComplete(lessonId: string, userId = 'default_user'): Promise<LessonProgress> {
    const existing = await this.getProgress(lessonId, userId);

    const { data, error } = await supabaseAdmin
      .from('lesson_progress')
      .upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          youtube_video_id: existing?.youtubeVideoId || 'manual',
          watched_seconds: existing?.watchedSeconds || 0,
          furthest_watched_seconds: existing?.durationSeconds || existing?.furthestWatchedSeconds || 100,
          duration_seconds: existing?.durationSeconds || 100,
          progress_percent: 100,
          completed: true,
          completion_source: 'MANUAL',
          last_watched_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,lesson_id' }
      )
      .select('*')
      .single();

    if (error) throw new Error(`Failed to mark lesson complete: ${error.message}`);

    return {
      id: data.id,
      userId: data.user_id,
      lessonId: data.lesson_id,
      youtubeVideoId: data.youtube_video_id,
      watchedSeconds: data.watched_seconds,
      furthestWatchedSeconds: data.furthest_watched_seconds,
      durationSeconds: data.duration_seconds,
      progressPercent: data.progress_percent,
      completed: data.completed,
      completionSource: data.completion_source,
      lastWatchedAt: data.last_watched_at,
      completedAt: data.completed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
