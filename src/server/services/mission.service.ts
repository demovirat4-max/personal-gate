import { supabaseAdmin } from '@/lib/supabase/server';
import { DailyMissionResponse, MissionItem, LearningSummary } from '@/contracts/learning/mission.contract';
import { RevisionService } from './revision.service';
import { CurriculumService } from './curriculum.service';

export class MissionService {
  /**
   * Generates real deterministic Daily Mission tasks
   */
  static async getDailyMission(userId = 'default_user'): Promise<DailyMissionResponse> {
    const today = RevisionService.getKolkataTodayDate();
    const items: MissionItem[] = [];

    // 1. Overdue & Due Revisions (Priority 1 & 2)
    const revisions = await RevisionService.getRevisions(userId);
    const dueRevisions = revisions.filter((r) => r.status === 'DUE');

    dueRevisions.forEach((rev, idx) => {
      const isOverdue = rev.dueDate < today;
      items.push({
        id: `rev_${rev.id}`,
        type: isOverdue ? 'OVERDUE_REVISION' : 'DUE_REVISION',
        title: isOverdue ? `[Overdue] Review ${rev.sourceType}` : `Review ${rev.sourceType}`,
        subtitle: `Due ${rev.dueDate} (Interval: ${rev.intervalDays}d)`,
        targetUrl: '/revision',
        priority: isOverdue ? 1 : 2,
        completed: false,
        metadata: { revisionId: rev.id },
      });
    });

    // 2. In-Progress Quiz Attempts (Priority 3)
    const { data: activeAttempts } = await supabaseAdmin
      .from('quiz_attempts')
      .select('id, quiz_id, quizzes(title)')
      .eq('user_id', userId)
      .eq('status', 'IN_PROGRESS');

    (activeAttempts || []).forEach((att: any) => {
      items.push({
        id: `att_${att.id}`,
        type: 'IN_PROGRESS_QUIZ',
        title: `Continue Quiz: ${att.quizzes?.title || 'Active Quiz'}`,
        subtitle: 'Resume submitted answers',
        targetUrl: `/learn?quizId=${att.quiz_id}`,
        priority: 3,
        completed: false,
        metadata: { attemptId: att.id },
      });
    });

    // 3. In-Progress & Next Curriculum Lessons (Priority 4 & 5)
    const tree = await CurriculumService.getCurriculumTree();
    const { data: progressData } = await supabaseAdmin.from('lesson_progress').select('*').eq('user_id', userId);

    const progressMap = new Map((progressData || []).map((p: any) => [p.lesson_id, p]));

    let foundNextLesson = false;
    for (const subject of tree.subjects) {
      for (const topic of subject.topics) {
        for (const lecture of topic.lectures) {
          const prog = progressMap.get(lecture.id);

          if (prog && !prog.completed && prog.furthest_watched_seconds > 0) {
            items.push({
              id: `les_${lecture.id}`,
              type: 'IN_PROGRESS_LESSON',
              title: `Resume Lecture: ${lecture.title}`,
              subtitle: `${subject.title} • Watched ${prog.progress_percent}%`,
              targetUrl: `/learn?lessonId=${lecture.id}`,
              priority: 4,
              completed: false,
              metadata: { lessonId: lecture.id, watchedPercent: prog.progress_percent },
            });
          } else if (!prog && !foundNextLesson) {
            items.push({
              id: `les_next_${lecture.id}`,
              type: 'NEXT_LESSON',
              title: `Next Up: ${lecture.title}`,
              subtitle: `${subject.title} • Topic: ${topic.title}`,
              targetUrl: `/learn?lessonId=${lecture.id}`,
              priority: 5,
              completed: false,
              metadata: { lessonId: lecture.id },
            });
            foundNextLesson = true;
          }
        }
      }
    }

    // 4. Fallback if no lessons imported yet
    if (tree.totalSubjects === 0) {
      items.push({
        id: 'setup_import',
        type: 'SETUP_IMPORT',
        title: 'Import GATE CS 2028 Curriculum',
        subtitle: 'Upload CSV or Google Sheets link to populate lectures',
        targetUrl: '/settings',
        priority: 7,
        completed: false,
      });
    }

    // Sort by priority ascending
    items.sort((a, b) => a.priority - b.priority);

    const completedTasks = items.filter((i) => i.completed).length;

    return {
      date: today,
      items,
      totalTasks: items.length,
      completedTasks,
    };
  }

  /**
   * Aggregates real Mission Control metrics
   */
  static async getLearningSummary(userId = 'default_user'): Promise<LearningSummary> {
    const today = RevisionService.getKolkataTodayDate();

    // 1. Lessons metrics
    const { data: progressList } = await supabaseAdmin.from('lesson_progress').select('*').eq('user_id', userId);

    const lessonsStarted = (progressList || []).length;
    const lessonsCompleted = (progressList || []).filter((p: any) => p.completed).length;
    const totalWatchedSeconds = (progressList || []).reduce((acc: number, p: any) => acc + (p.watched_seconds || 0), 0);

    const activeProgress = (progressList || []).find((p: any) => !p.completed);
    const currentLessonId = activeProgress?.lesson_id || null;

    // 2. Quiz attempts metrics
    const { data: attempts } = await supabaseAdmin
      .from('quiz_attempts')
      .select('score, max_score, status')
      .eq('user_id', userId)
      .eq('status', 'SUBMITTED')
      .order('submitted_at', { ascending: false });

    const quizAttemptsSubmitted = (attempts || []).length;
    let recentQuizScore: number | null = null;
    if (attempts && attempts.length > 0 && parseFloat(attempts[0].max_score) > 0) {
      recentQuizScore = Math.round((parseFloat(attempts[0].score) / parseFloat(attempts[0].max_score)) * 100);
    }

    // 3. Open mistakes
    const { count: openMistakesCount } = await supabaseAdmin
      .from('mistakes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'OPEN');

    // 4. Revisions
    const { data: revisions } = await supabaseAdmin
      .from('revisions')
      .select('due_date, status')
      .eq('user_id', userId)
      .eq('status', 'DUE');

    const dueRevisionsCount = (revisions || []).length;
    const overdueRevisionsCount = (revisions || []).filter((r: any) => r.due_date < today).length;

    return {
      currentLessonId,
      lessonsStarted,
      lessonsCompleted,
      totalWatchedSeconds,
      quizAttemptsSubmitted,
      recentQuizScore,
      openMistakesCount: openMistakesCount || 0,
      dueRevisionsCount,
      overdueRevisionsCount,
      todayCompletedMissionCount: 0,
    };
  }
}
