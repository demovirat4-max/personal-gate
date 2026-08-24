import { GATE_40_YEARS_PYQS, GATE_PYQ_ERAS, GATE_VOLUMES } from '../data/pyqData';
import {
  PYQAttemptMap,
  PYQRecommendation,
  PYQuestion,
  UserStudyStateMap,
  VideoResource,
  VolumeNumber,
} from '../types';

/**
 * Normalizes text for keyword matching (lowercased, alphanumeric tokens)
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/**
 * Matches 40-year PYQs against a specific subject and topic/chapter
 */
export function matchPYQsForTopic(subject: string, topicName: string): PYQuestion[] {
  const topicTokens = tokenize(topicName);

  // Subject filter
  const subjectPYQs = GATE_40_YEARS_PYQS.filter(
    (q) => q.subject.toLowerCase() === subject.toLowerCase()
  );

  if (subjectPYQs.length === 0) {
    // If no exact subject match, search all PYQs
    return GATE_40_YEARS_PYQS.filter((q) => {
      const qText = `${q.chapter || ''} ${q.topic} ${q.subtopic || ''} ${q.conceptTested} ${q.relatedChapterKeywords.join(' ')}`.toLowerCase();
      return topicTokens.some((t) => qText.includes(t));
    });
  }

  // Score each question
  const scored = subjectPYQs.map((q) => {
    let score = 0;
    const qTopicLower = q.topic.toLowerCase();
    const qChapterLower = (q.chapter || '').toLowerCase();
    const topicLower = topicName.toLowerCase();

    // Direct match
    if (qTopicLower === topicLower || topicLower.includes(qTopicLower) || qTopicLower.includes(topicLower)) {
      score += 25;
    }
    if (qChapterLower && (topicLower.includes(qChapterLower) || qChapterLower.includes(topicLower))) {
      score += 20;
    }

    // Keyword matching
    for (const kw of q.relatedChapterKeywords) {
      const kwLower = kw.toLowerCase();
      if (topicLower.includes(kwLower)) {
        score += 10;
      }
      for (const token of topicTokens) {
        if (kwLower.includes(token)) {
          score += 4;
        }
      }
    }

    // Question content match
    const qCombined = `${q.subtopic || ''} ${q.conceptTested} ${q.questionText}`.toLowerCase();
    for (const token of topicTokens) {
      if (qCombined.includes(token)) {
        score += 2;
      }
    }

    return { question: q, score };
  });

  // Filter positive scores or return top subject PYQs if no specific keyword matched
  const positive = scored.filter((item) => item.score > 0).sort((a, b) => b.score - a.score);
  if (positive.length > 0) {
    return positive.map((item) => item.question);
  }

  // Fallback: return up to 6 subject questions
  return subjectPYQs.slice(0, 6);
}

/**
 * Returns up to 10 MCQs specifically tailored for a chapter or topic
 */
export function getChapterMCQQuestions(subject: string, topicName: string, maxCount = 10): PYQuestion[] {
  const matched = matchPYQsForTopic(subject, topicName);
  if (matched.length >= maxCount) {
    return matched.slice(0, maxCount);
  }

  // Fill up with subject questions if needed
  const remaining = GATE_40_YEARS_PYQS.filter(
    (q) => q.subject.toLowerCase() === subject.toLowerCase() && !matched.some((m) => m.id === q.id)
  );

  return [...matched, ...remaining].slice(0, maxCount);
}

/**
 * Analyzes completed syllabus chapters and automatically generates 40-Year PYQ Drill recommendations
 */
export function getCompletedChapterRecommendations(
  resources: VideoResource[],
  userStates: UserStudyStateMap,
  attempts: PYQAttemptMap
): PYQRecommendation[] {
  // Find all completed resources
  const completedResources = resources.filter((res) => {
    const state = userStates[res.id];
    return state && state.progress === 'done';
  });

  // Sort by most recently completed
  completedResources.sort((a, b) => {
    const timeA = new Date(userStates[a.id]?.updatedAt || 0).getTime();
    const timeB = new Date(userStates[b.id]?.updatedAt || 0).getTime();
    return timeB - timeA;
  });

  // Deduplicate by Subject + Topic
  const seenTopics = new Set<string>();
  const recommendations: PYQRecommendation[] = [];

  for (const res of completedResources) {
    const key = `${res.subject}::${res.topic}`;
    if (seenTopics.has(key)) continue;
    seenTopics.add(key);

    const matchedQuestions = matchPYQsForTopic(res.subject, res.topic);
    if (matchedQuestions.length === 0) continue;

    const solvedCount = matchedQuestions.filter(
      (q) => attempts[q.id] && attempts[q.id].attempted && attempts[q.id].isCorrect
    ).length;

    // Detect volume
    const vol = GATE_VOLUMES.find((v) =>
      v.subjects.some((s) => s.toLowerCase() === res.subject.toLowerCase())
    );

    recommendations.push({
      resourceId: res.id,
      subject: res.subject,
      topic: res.topic,
      volume: vol?.volume || 1,
      completedAt: userStates[res.id]?.updatedAt || new Date().toISOString(),
      pyqCount: matchedQuestions.length,
      solvedCount,
      questions: matchedQuestions,
    });
  }

  return recommendations;
}

/**
 * Filter 40-year PYQ questions by volume, category, era, subject, topic, chapter, type, status, and search query
 */
export function filterPYQs(
  questions: PYQuestion[],
  options: {
    volume?: VolumeNumber | 'all';
    eraId?: string;
    subject?: string;
    chapter?: string;
    topic?: string;
    type?: string;
    status?: 'all' | 'unsolved' | 'correct' | 'incorrect' | 'bookmarked';
    searchQuery?: string;
    attempts: PYQAttemptMap;
  }
): PYQuestion[] {
  const {
    volume = 'all',
    eraId = 'all',
    subject = 'all',
    chapter = 'all',
    topic = 'all',
    type = 'all',
    status = 'all',
    searchQuery = '',
    attempts,
  } = options;

  const era = GATE_PYQ_ERAS.find((e) => e.id === eraId) || GATE_PYQ_ERAS[0];

  return questions.filter((q) => {
    // Volume check
    if (volume !== 'all') {
      const volObj = GATE_VOLUMES.find((v) => v.volume === volume);
      if (q.volume && q.volume !== volume) {
        return false;
      }
      if (!q.volume && volObj && !volObj.subjects.some((s) => s.toLowerCase() === q.subject.toLowerCase())) {
        return false;
      }
    }

    // Year / Era check
    if (q.year < era.minYear || q.year > era.maxYear) {
      return false;
    }

    // Subject check
    if (subject !== 'all' && q.subject.toLowerCase() !== subject.toLowerCase()) {
      return false;
    }

    // Chapter check
    if (chapter !== 'all' && q.chapter && q.chapter.toLowerCase() !== chapter.toLowerCase()) {
      return false;
    }

    // Topic check
    if (topic !== 'all' && q.topic.toLowerCase() !== topic.toLowerCase()) {
      return false;
    }

    // Question type check (MCQ, MSQ, NAT)
    if (type !== 'all' && q.type.toLowerCase() !== type.toLowerCase()) {
      return false;
    }

    // Status check
    const attempt = attempts[q.id];
    if (status === 'unsolved' && attempt?.attempted) {
      return false;
    }
    if (status === 'correct' && (!attempt || !attempt.isCorrect)) {
      return false;
    }
    if (status === 'incorrect' && (!attempt || !attempt.attempted || attempt.isCorrect)) {
      return false;
    }
    if (status === 'bookmarked' && (!attempt || !attempt.bookmarked)) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const qStr = `${q.examTag} ${q.year} ${q.subject} ${q.chapter || ''} ${q.topic} ${q.subtopic || ''} ${q.questionText} ${q.conceptTested} ${q.relatedChapterKeywords.join(' ')}`.toLowerCase();
      const sTokens = tokenize(searchQuery);
      if (!sTokens.every((token) => qStr.includes(token))) {
        return false;
      }
    }

    return true;
  });
}

