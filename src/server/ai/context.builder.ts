import { supabaseAdmin } from '@/lib/supabase/server';

export class ContextBuilder {
  /**
   * Builds grounded context string safely without answer leaks or prompt injection
   */
  static async buildContext(capability: string, sourceId?: string): Promise<string> {
    if (!sourceId) {
      return 'General GATE CS/IT 2028 Academic Context.';
    }

    if (capability === 'LESSON_SUMMARY' || capability === 'STUDY_NOTES' || capability === 'CONCEPT_EXPLANATION') {
      const { data: lecture } = await supabaseAdmin
        .from('lectures')
        .select('title, notes, topic_id')
        .eq('id', sourceId)
        .maybeSingle();

      if (!lecture) {
        return `Resource ID: ${sourceId}\nContext: GATE CS 2028 Study Material`;
      }

      let topicTitle = 'General Topic';
      let subjectTitle = 'CS/IT';

      if (lecture.topic_id) {
        const { data: topic } = await supabaseAdmin
          .from('topics')
          .select('title, subject_id')
          .eq('id', lecture.topic_id)
          .maybeSingle();

        if (topic) {
          topicTitle = topic.title;
          if (topic.subject_id) {
            const { data: subject } = await supabaseAdmin
              .from('subjects')
              .select('title')
              .eq('id', topic.subject_id)
              .maybeSingle();

            if (subject) subjectTitle = subject.title;
          }
        }
      }

      return `Subject: ${subjectTitle}
Topic: ${topicTitle}
Lecture Title: ${lecture.title}
Lecture Notes: ${lecture.notes || 'Standard curriculum lecture for GATE CS.'}`;
    }

    if (capability === 'MISTAKE_ANALYSIS') {
      const { data: mistake } = await supabaseAdmin
        .from('mistakes')
        .select('user_answer_json, correct_answer_json, reflection, question_id')
        .eq('id', sourceId)
        .maybeSingle();

      if (!mistake) {
        return `Mistake ID: ${sourceId}\nContext: GATE CS Mistake Review`;
      }

      let questionText = 'N/A';
      let explanation = 'N/A';

      if (mistake.question_id) {
        const { data: question } = await supabaseAdmin
          .from('quiz_questions')
          .select('question_text, explanation')
          .eq('id', mistake.question_id)
          .maybeSingle();

        if (question) {
          questionText = question.question_text;
          explanation = question.explanation || 'N/A';
        }
      }

      return `Question Text: ${questionText}
User Selected Answer: ${JSON.stringify(mistake.user_answer_json)}
Correct Answer: ${JSON.stringify(mistake.correct_answer_json)}
Official Explanation: ${explanation}
User Reflection: ${mistake.reflection || 'None'}`;
    }

    return 'Grounded GATE CS 2028 Study Context.';
  }
}
