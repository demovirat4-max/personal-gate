import { supabaseAdmin } from '@/lib/supabase/server';
import {
  QuizClient,
  QuizAttempt,
  QuizResult,
  SaveAnswerRequest,
  SubmitAttemptRequest,
} from '@/contracts/learning/quiz.contract';
import { MistakeService } from './mistake.service';

export class QuizService {
  /**
   * Retrieves quiz for client consumption (Strips correct_answer_json!)
   */
  static async getQuizForClient(quizId: string): Promise<QuizClient> {
    const { data: quiz, error: quizErr } = await supabaseAdmin.from('quizzes').select('*').eq('id', quizId).single();

    if (quizErr || !quiz) throw new Error(`Quiz not found: ${quizId}`);

    const { data: questions, error: qErr } = await supabaseAdmin
      .from('quiz_questions')
      .select(
        'id, quiz_id, question_text, question_type, options_json, explanation, marks, negative_marks, order_index'
      )
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true });

    if (qErr) throw new Error(`Failed to fetch quiz questions: ${qErr.message}`);

    return {
      id: quiz.id,
      topicId: quiz.topic_id,
      lessonId: quiz.lesson_id,
      title: quiz.title,
      description: quiz.description,
      passPercentage: quiz.pass_percentage,
      questions: (questions || []).map((q: any) => ({
        id: q.id,
        quizId: q.quiz_id,
        questionText: q.question_text,
        questionType: q.question_type,
        optionsJson: q.options_json,
        explanation: q.explanation,
        marks: parseFloat(q.marks),
        negativeMarks: parseFloat(q.negative_marks),
        orderIndex: q.order_index,
      })),
    };
  }

  /**
   * Creates a new attempt for a quiz
   */
  static async createAttempt(quizId: string, userId = 'default_user'): Promise<QuizAttempt> {
    const { data, error } = await supabaseAdmin
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        quiz_id: quizId,
        status: 'IN_PROGRESS',
        started_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create quiz attempt: ${error.message}`);

    return {
      id: data.id,
      userId: data.user_id,
      quizId: data.quiz_id,
      status: data.status,
      score: parseFloat(data.score),
      maxScore: parseFloat(data.max_score),
      startedAt: data.started_at,
      submittedAt: data.submitted_at,
    };
  }

  /**
   * Saves or updates an answer for an active attempt
   */
  static async saveAnswer(
    attemptId: string,
    questionId: string,
    req: SaveAnswerRequest,
    userId = 'default_user'
  ): Promise<void> {
    // Check attempt state
    const { data: attempt } = await supabaseAdmin
      .from('quiz_attempts')
      .select('status, user_id')
      .eq('id', attemptId)
      .single();

    if (!attempt || attempt.user_id !== userId) throw new Error('Attempt not found or unauthorized');
    if (attempt.status !== 'IN_PROGRESS') throw new Error('Cannot edit answers on a non-active attempt');

    const { error } = await supabaseAdmin.from('quiz_answers').upsert(
      {
        attempt_id: attemptId,
        question_id: questionId,
        selected_answer_json: req.selectedAnswerJson,
      },
      { onConflict: 'attempt_id,question_id' }
    );

    if (error) throw new Error(`Failed to save answer: ${error.message}`);
  }

  /**
   * Deterministic server-side grading and transactional attempt submission
   */
  static async submitAttempt(
    attemptId: string,
    req: SubmitAttemptRequest,
    userId = 'default_user'
  ): Promise<QuizResult> {
    const { data: attempt } = await supabaseAdmin
      .from('quiz_attempts')
      .select('*, quizzes(*)')
      .eq('id', attemptId)
      .single();

    if (!attempt || attempt.user_id !== userId) throw new Error('Attempt not found or unauthorized');

    // Idempotent retry check
    if (attempt.status === 'SUBMITTED') {
      return this.getAttemptResult(attemptId, userId);
    }

    // Fetch questions & answers
    const { data: questions } = await supabaseAdmin.from('quiz_questions').select('*').eq('quiz_id', attempt.quiz_id);

    const { data: userAnswers } = await supabaseAdmin.from('quiz_answers').select('*').eq('attempt_id', attemptId);

    const answersMap = new Map((userAnswers || []).map((a: any) => [a.question_id, a.selected_answer_json]));

    let totalScore = 0;
    let maxScore = 0;
    const gradedAnswers: any[] = [];
    const mistakesToCreate: any[] = [];

    for (const q of questions || []) {
      const qMarks = parseFloat(q.marks);
      const qNegMarks = parseFloat(q.negative_marks);
      maxScore += qMarks;

      const selected = answersMap.get(q.id);
      let isCorrect = false;

      if (selected !== undefined && selected !== null) {
        // Compare with server correct answer
        isCorrect = JSON.stringify(selected) === JSON.stringify(q.correct_answer_json);
      }

      let awarded = 0;
      if (isCorrect) {
        awarded = qMarks;
      } else if (selected !== undefined && selected !== null) {
        awarded = -qNegMarks; // Apply negative marks if answered incorrectly
      }

      totalScore += awarded;

      gradedAnswers.push({
        attempt_id: attemptId,
        question_id: q.id,
        selected_answer_json: selected ?? null,
        is_correct: isCorrect,
        awarded_marks: awarded,
      });

      if (!isCorrect && selected !== undefined && selected !== null) {
        mistakesToCreate.push({
          questionId: q.id,
          attemptId,
          subjectId: attempt.quizzes?.subject_id || null,
          topicId: attempt.quizzes?.topic_id || null,
          userAnswerJson: selected,
          correctAnswerJson: q.correct_answer_json,
        });
      }
    }

    const submittedAt = new Date().toISOString();

    // Update attempt
    await supabaseAdmin
      .from('quiz_attempts')
      .update({
        status: 'SUBMITTED',
        score: totalScore,
        max_score: maxScore,
        submitted_at: submittedAt,
        idempotency_key: req.idempotencyKey,
      })
      .eq('id', attemptId);

    // Save graded answers
    for (const ga of gradedAnswers) {
      await supabaseAdmin.from('quiz_answers').upsert(ga, { onConflict: 'attempt_id,question_id' });
    }

    // Transactionally track mistakes
    for (const m of mistakesToCreate) {
      await MistakeService.recordMistake(m, userId);
    }

    return this.getAttemptResult(attemptId, userId);
  }

  /**
   * Retrieves full result payload after submission
   */
  static async getAttemptResult(attemptId: string, userId = 'default_user'): Promise<QuizResult> {
    const { data: attempt } = await supabaseAdmin
      .from('quiz_attempts')
      .select('*, quizzes(*)')
      .eq('id', attemptId)
      .single();

    if (!attempt || attempt.user_id !== userId) throw new Error('Attempt not found or unauthorized');

    const { data: answers } = await supabaseAdmin
      .from('quiz_answers')
      .select('*, quiz_questions(*)')
      .eq('attempt_id', attemptId);

    const score = parseFloat(attempt.score);
    const maxScore = parseFloat(attempt.max_score);
    const passPercentage = attempt.quizzes?.pass_percentage || 60;
    const passed = maxScore > 0 ? (score / maxScore) * 100 >= passPercentage : false;

    return {
      attemptId: attempt.id,
      status: attempt.status,
      score,
      maxScore,
      passed,
      submittedAt: attempt.submitted_at,
      answers: (answers || []).map((a: any) => ({
        questionId: a.question_id,
        selectedAnswerJson: a.selected_answer_json,
        correctAnswerJson: a.quiz_questions?.correct_answer_json,
        isCorrect: a.is_correct ?? false,
        awardedMarks: parseFloat(a.awarded_marks || 0),
        explanation: a.quiz_questions?.explanation ?? null,
      })),
    };
  }
}
