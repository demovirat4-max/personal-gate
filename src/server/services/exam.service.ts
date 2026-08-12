import { supabaseAdmin } from '@/lib/supabase/server';
import { QuestionBankQuestion, ExamTest, ExamAttempt } from '@/contracts/exam/exam.contract';
import { PureScoringEngine } from '@/server/ai/pure-scoring.engine';

export class ExamService {
  /**
   * Fetch verified PYQs & questions from Question Bank
   */
  static async getQuestions(subjectId?: string): Promise<QuestionBankQuestion[]> {
    let query = supabaseAdmin
      .from('question_bank_questions')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data.map((q) => this.mapQuestion(q));
  }

  /**
   * Get available Exam Tests
   */
  static async getTests(): Promise<ExamTest[]> {
    const { data, error } = await supabaseAdmin
      .from('exam_tests')
      .select('*')
      .eq('status', 'READY')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((t) => this.mapTest(t));
  }

  /**
   * Start or resume an exam attempt
   */
  static async startAttempt(testId: string, ownerId: string): Promise<ExamAttempt> {
    const idempotencyKey = `attempt_${ownerId}_${testId}`;

    const { data: existing } = await supabaseAdmin
      .from('exam_attempts')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (existing) {
      return this.mapAttempt(existing);
    }

    const { data: test } = await supabaseAdmin.from('exam_tests').select('*').eq('id', testId).single();

    if (!test) throw new Error('EXAM_TEST_NOT_FOUND: Test does not exist');

    const durationSecs = test.duration_seconds || 10800; // 3 hours default
    const startedAt = new Date();
    const deadlineAt = new Date(startedAt.getTime() + durationSecs * 1000);

    const { data, error } = await supabaseAdmin
      .from('exam_attempts')
      .insert({
        owner_id: ownerId,
        test_id: testId,
        status: 'IN_PROGRESS',
        started_at: startedAt.toISOString(),
        server_deadline_at: deadlineAt.toISOString(),
        elapsed_seconds: 0,
        idempotency_key: idempotencyKey,
        test_snapshot: test,
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to start attempt: ${error?.message}`);
    return this.mapAttempt(data);
  }

  /**
   * Save answer to question in attempt
   */
  static async saveAnswer(attemptId: string, testQuestionId: string, payload: any): Promise<any> {
    const { data, error } = await supabaseAdmin
      .from('exam_answers')
      .upsert({
        attempt_id: attemptId,
        test_question_id: testQuestionId,
        answer_payload: payload,
        status: 'SAVED',
        saved_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) throw new Error(`Failed to save answer: ${error?.message}`);
    return data;
  }

  /**
   * Submit attempt explicitly & run deterministic evaluation
   */
  static async submitAttempt(attemptId: string, ownerId: string): Promise<ExamAttempt> {
    const { data: attempt } = await supabaseAdmin
      .from('exam_attempts')
      .select('*')
      .eq('id', attemptId)
      .eq('owner_id', ownerId)
      .single();

    if (!attempt) throw new Error('EXAM_ATTEMPT_NOT_FOUND');
    if (attempt.status === 'SUBMITTED') return this.mapAttempt(attempt);

    // Fetch attempt answers
    const { data: answers } = await supabaseAdmin.from('exam_answers').select('*').eq('attempt_id', attemptId);

    // Fetch test questions snapshots
    const { data: questions } = await supabaseAdmin.from('question_bank_questions').select('*').eq('status', 'ACTIVE');

    let totalScore = 0;
    let maxScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    if (questions) {
      for (const q of questions) {
        maxScore += Number(q.marks);
        const userAns = answers?.find((a) => a.test_question_id === q.id);

        const evalRes = PureScoringEngine.evaluateQuestion({
          questionType: q.question_type,
          userAnswerPayload: userAns?.answer_payload,
          correctAnswerSnapshot: q.correct_answer,
          marks: Number(q.marks),
          negativeMarks: Number(q.negative_marks),
        });

        totalScore += evalRes.awardedMarks;
        if (evalRes.status === 'CORRECT') correctCount++;
        else if (evalRes.status === 'INCORRECT') incorrectCount++;
        else unansweredCount++;
      }
    }

    const { data: updated, error } = await supabaseAdmin
      .from('exam_attempts')
      .update({
        status: 'SUBMITTED',
        submitted_at: new Date().toISOString(),
        score: parseFloat(totalScore.toFixed(2)),
        max_score: maxScore,
        correct_count: correctCount,
        incorrect_count: incorrectCount,
        unanswered_count: unansweredCount,
        evaluation_version: PureScoringEngine.VERSION,
      })
      .eq('id', attemptId)
      .select()
      .single();

    if (error || !updated) throw new Error(`Failed to submit attempt: ${error?.message}`);
    return this.mapAttempt(updated);
  }

  // Mappers
  private static mapQuestion(data: any): QuestionBankQuestion {
    return {
      id: data.id,
      ownerScope: data.owner_scope,
      subjectId: data.subject_id,
      topicId: data.topic_id,
      lessonId: data.lesson_id,
      questionType: data.question_type,
      questionText: data.question_text,
      questionContentFormat: data.question_content_format,
      options: data.options || [],
      correctAnswer: data.correct_answer,
      explanation: data.explanation,
      marks: Number(data.marks),
      negativeMarks: Number(data.negative_marks),
      examName: data.exam_name,
      examYear: data.exam_year,
      sourceType: data.source_type,
      verificationStatus: data.verification_status,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private static mapTest(data: any): ExamTest {
    return {
      id: data.id,
      ownerId: data.owner_id,
      title: data.title,
      description: data.description,
      testType: data.test_type,
      subjectId: data.subject_id,
      topicId: data.topic_id,
      sourcePolicy: data.source_policy,
      status: data.status,
      durationSeconds: data.duration_seconds,
      totalQuestions: data.total_questions,
      totalMarks: Number(data.total_marks),
      instructions: data.instructions,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private static mapAttempt(data: any): ExamAttempt {
    return {
      id: data.id,
      ownerId: data.owner_id,
      testId: data.test_id,
      status: data.status,
      startedAt: data.started_at,
      serverDeadlineAt: data.server_deadline_at,
      submittedAt: data.submitted_at,
      elapsedSeconds: data.elapsed_seconds,
      score: data.score !== null ? Number(data.score) : null,
      maxScore: data.max_score !== null ? Number(data.max_score) : null,
      correctCount: data.correct_count,
      incorrectCount: data.incorrect_count,
      unansweredCount: data.unanswered_count,
      idempotencyKey: data.idempotency_key,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
