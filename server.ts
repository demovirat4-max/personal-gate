import express from 'express';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import {
  getFallbackSummary,
  getFallbackFeynman,
  getFallbackFormulaSheet,
  getFallbackQuiz,
  getFallbackWeeklyPlan,
  getFallbackNews,
  getFallbackChatAnswer,
} from './server/fallbacks';
import {
  GATE_40_YEARS_PYQS,
  GATE_CHAPTER_CATEGORIES,
  GATE_PYQ_ERAS,
  GATE_VOLUMES,
} from './src/data/pyqData';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '5mb' }));

// NVIDIA OpenAI-Compatible Client Configuration
const NVIDIA_BASE_URL =
  process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
const NVIDIA_API_KEY =
  process.env.NVIDIA_API_KEY ||
  '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';
const NVIDIA_MODEL =
  process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b';

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      baseURL: NVIDIA_BASE_URL,
      apiKey: NVIDIA_API_KEY,
    });
  }
  return openaiClient;
}

// Local disk persistence for user data backup
const USER_DATA_FILE = path.join(process.cwd(), 'user_study_data.json');

function loadUserDataFromDisk() {
  try {
    if (fs.existsSync(USER_DATA_FILE)) {
      const raw = fs.readFileSync(USER_DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read user_study_data.json:', e);
  }
  return {
    userStates: {},
    pyqAttempts: {},
    studyStreak: {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      activeDates: [],
      history: {},
    },
    weeklyPlan: null,
    subjectWeights: null,
    customSheetUrl: null,
  };
}

function saveUserDataToDisk(data: any) {
  try {
    fs.writeFileSync(USER_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Could not write user_study_data.json:', e);
  }
}

let inMemoryUserData = loadUserDataFromDisk();

// Helper to extract JSON from model responses (handling markdown backticks ```json ... ```)
function extractJsonFromResponse(text: string): any {
  if (!text) return null;
  const clean = text.trim();
  try {
    return JSON.parse(clean);
  } catch (e) {
    // Try extracting from markdown code block
    const match = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch (e2) {
        // Continue
      }
    }
  }
  return null;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    engine: 'NVIDIA Nemotron 3 Ultra (integrate.api.nvidia.com)',
    model: NVIDIA_MODEL,
    time: new Date().toISOString(),
  });
});

// Proxy route for fetching Google Sheets CSV
app.post('/api/sheet/fetch-csv', async (req, res) => {
  try {
    let { url } = req.body;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'URL parameter is required' });
      return;
    }

    url = url.trim();

    if (url.includes('docs.google.com/spreadsheets/d/')) {
      const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        const sheetId = match[1];
        let gid = '0';
        const gidMatch = url.match(/gid=([0-9]+)/);
        if (gidMatch && gidMatch[1]) {
          gid = gidMatch[1];
        }
        if (!url.includes('/export?format=csv')) {
          url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
        }
      }
    }

    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      res.status(400).json({ error: 'Invalid URL protocol' });
      return;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'text/csv,text/plain,*/*',
      },
    });

    if (!response.ok) {
      res.status(response.status).json({
        error: `Failed to fetch sheet: HTTP ${response.status} ${response.statusText}`,
      });
      return;
    }

    const csvData = await response.text();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(csvData);
  } catch (err: any) {
    console.error('Error fetching sheet CSV:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch CSV' });
  }
});

// 1. Ask-AI multi-turn chat endpoint using NVIDIA Nemotron
app.post('/api/ai/chat', async (req, res) => {
  const {
    messages,
    subject = 'GATE CSE',
    topic = 'General',
    role = 'mentor',
  } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required' });
    return;
  }

  const latestUserMsg =
    [...messages].reverse().find((m: any) => m?.role === 'user')?.content || '';

  try {
    const client = getOpenAI();

    let roleDescription = '';
    if (role === 'traps') {
      roleDescription = `You are a strict GATE CSE PYQ Trap & Edge-Case Specialist. Focus on subtle boundary conditions, negative-marking pitfalls, and tricky question patterns.`;
    } else if (role === 'revision') {
      roleDescription = `You are a Rapid Revision & Formula Coach for GATE CSE. Provide ultra-concise, high-yield summaries, formulas, and time/space bounds.`;
    } else if (role === 'prover') {
      roleDescription = `You are a Mathematical & Algorithmic Proof Specialist for GATE CSE. Provide step-by-step mathematical reasoning and formal derivations.`;
    } else {
      roleDescription = `You are an elite GATE Computer Science & Information Technology (GATE CSE) mentor and examiner. Provide clear, mathematically rigorous, exam-targeted solutions.`;
    }

    const systemMessage = `${roleDescription}\n\nCurrent Subject: ${subject}\nCurrent Topic: ${topic}`;

    const formattedMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemMessage },
    ];

    messages
      .filter((m: any) => m && m.content && m.content.trim() && m.id !== 'welcome')
      .forEach((m: any) => {
        formattedMessages.push({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content.trim(),
        });
      });

    const completion = await client.chat.completions.create({
      model: NVIDIA_MODEL,
      messages: formattedMessages,
      temperature: role === 'prover' ? 0.1 : 0.4,
      max_tokens: 4096,
    });

    const reply = completion.choices[0]?.message?.content || 'No response generated.';
    res.json({
      reply,
      modelUsed: NVIDIA_MODEL,
    });
  } catch (err: any) {
    console.warn('NVIDIA chat completion failed, falling back:', err.message);
    const fallbackReply = getFallbackChatAnswer(latestUserMsg, subject, topic, role);
    res.json({
      reply: fallbackReply,
      modelUsed: 'curated-study-engine',
    });
  }
});

// Single-turn Ask endpoint
app.post('/api/ai/ask', async (req, res) => {
  const { question, subject = 'GATE CSE', topic = 'General', notes } = req.body;
  if (!question) {
    res.status(400).json({ error: 'Question is required' });
    return;
  }

  try {
    const client = getOpenAI();
    let prompt = `Student Question: ${question}\nSubject: ${subject}\nTopic: ${topic}\n`;
    if (notes) prompt += `Student Notes: ${notes}\n`;

    const completion = await client.chat.completions.create({
      model: NVIDIA_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are an elite GATE CSE mentor. Provide concise, mathematically rigorous, exam-focused solutions highlighting common exam traps and formulas.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    });

    res.json({ answer: completion.choices[0]?.message?.content || getFallbackChatAnswer(question, subject, topic, 'mentor') });
  } catch (err: any) {
    res.json({ answer: getFallbackChatAnswer(question, subject, topic, 'mentor') });
  }
});

// 2. Auto-generated Key Points & Concept Summary
app.post('/api/ai/summarize', async (req, res) => {
  const { title, subject = 'GATE CSE', topic, channel, transcript } = req.body;
  const targetTopic = topic || title || 'Core Concept';

  try {
    const client = getOpenAI();

    const prompt = `Generate a high-yield, exam-oriented concept summary for GATE CSE on:
Subject: ${subject}
Topic: ${targetTopic}
${title ? `Video Title: ${title}\n` : ''}${channel ? `Channel: ${channel}\n` : ''}${transcript ? `Notes: ${transcript}\n` : ''}

Output structured markdown with:
1. **Core Concept Overview** (2-3 crisp sentences)
2. **Key Formulas / Algorithms / Theorems** (bullet points with precise LaTeX notation)
3. **Time & Space Complexity / Critical Properties** (if applicable)
4. **Common GATE Exam Traps & PYQ Tips** (2-3 actionable points)`;

    const completion = await client.chat.completions.create({
      model: NVIDIA_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert GATE CSE instructor creating high-yield revision flashcard summaries.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 2048,
    });

    res.json({
      summary:
        completion.choices[0]?.message?.content ||
        getFallbackSummary(targetTopic, subject),
    });
  } catch (err: any) {
    res.json({ summary: getFallbackSummary(targetTopic, subject) });
  }
});

// 3. Quick Quiz Generator (10 MCQs)
app.post('/api/ai/quiz', async (req, res) => {
  const { subject = 'GATE CSE', topic = 'Core Topic', count = 10 } = req.body;

  try {
    const client = getOpenAI();

    const prompt = `Generate exactly ${count} authentic, conceptual, and calculation-based Multiple Choice Questions (MCQs) for GATE CSE on "${topic}" in subject "${subject}".
Include 4 distinct options (A, B, C, D), correct option letter, marks (1 or 2), and step-by-step mathematical explanation.
Return strictly valid JSON array of objects with keys:
id (string e.g. Q1), question (string), options (array of 4 strings prefixed with A), B), C), D)), correctAnswer (A/B/C/D), marks (1 or 2), explanation (string), tip (string).`;

    const completion = await client.chat.completions.create({
      model: NVIDIA_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert GATE CSE question creator. Return ONLY valid JSON array with no extra markdown conversational text.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    });

    const parsed = extractJsonFromResponse(completion.choices[0]?.message?.content || '');
    if (Array.isArray(parsed) && parsed.length > 0) {
      res.json({ questions: parsed });
      return;
    }
    res.json({ questions: getFallbackQuiz(topic, subject, count) });
  } catch (err: any) {
    res.json({ questions: getFallbackQuiz(topic, subject, count) });
  }
});

// 4. Feynman 3-Tier Concept Explainer
app.post('/api/ai/concept-feynman', async (req, res) => {
  const { subject = 'GATE CSE', topic = 'Core Topic' } = req.body;

  try {
    const client = getOpenAI();
    const prompt = `Explain the concept "${topic}" in subject "${subject}" using the Feynman Technique for GATE CSE.
Return strictly a valid JSON object with keys:
- analogy (string: intuitive plain-English real-world metaphor)
- technicalMechanics (string: precise mathematical formulation, formulas, data structure mechanics)
- gateTrapsAndEdgeCases (array of strings: 2-3 tricky boundary cases or traps tested in GATE PYQs)
- highYieldTips (array of strings: 2 exam rules of thumb or shortcuts)`;

    const completion = await client.chat.completions.create({
      model: NVIDIA_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an elite GATE Computer Science educator. Return ONLY valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 3072,
    });

    const parsed = extractJsonFromResponse(completion.choices[0]?.message?.content || '');
    if (parsed && parsed.analogy && parsed.technicalMechanics) {
      res.json(parsed);
      return;
    }
    res.json(getFallbackFeynman(topic, subject));
  } catch (err: any) {
    res.json(getFallbackFeynman(topic, subject));
  }
});

// 5. Formula & Complexity Matrix Cheat Sheet
app.post('/api/ai/formula-sheet', async (req, res) => {
  const { subject = 'GATE CSE', topic = 'Core Topic' } = req.body;

  try {
    const client = getOpenAI();
    const prompt = `Generate a high-yield formula, theorem, and complexity cheat sheet for GATE CSE on "${topic}" in "${subject}".
Return strictly valid JSON with keys:
- formulas: array of { title: string, equation: string, context: string }
- complexities: array of { operation: string, best: string, average: string, worst: string, space: string }
- keyTheorems: array of strings`;

    const completion = await client.chat.completions.create({
      model: NVIDIA_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a GATE CSE formula author. Return ONLY valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 3072,
    });

    const parsed = extractJsonFromResponse(completion.choices[0]?.message?.content || '');
    if (parsed && parsed.formulas && parsed.complexities) {
      res.json(parsed);
      return;
    }
    res.json(getFallbackFormulaSheet(topic, subject));
  } catch (err: any) {
    res.json(getFallbackFormulaSheet(topic, subject));
  }
});

// 6. AI Weekly Study Planner
app.post('/api/ai/weekly-plan', async (req, res) => {
  const {
    dailyHours = 3,
    holidayDays = ['Sunday'],
    focusSubjects = [],
    strategy = 'balanced',
    weekKey = '',
    weekStartDate = '',
    weekEndDate = '',
    dayDates = [],
    pendingTopicsList = [],
    revisionTopicsList = [],
  } = req.body;

  try {
    const client = getOpenAI();

    const prompt = `Create a customized 7-day GATE CSE study schedule.
- Daily Target: ${dailyHours} Hours/Day (${dailyHours * 60} mins)
- Rest / Holiday Days: ${holidayDays.join(', ') || 'None'}
- Focus Subjects: ${focusSubjects.join(', ') || 'Core GATE Subjects'}
- Week: ${weekKey} (${weekStartDate} to ${weekEndDate})
- Backlog: ${pendingTopicsList.slice(0, 10).map((t: any) => `[${t.subject}] ${t.topic}`).join('; ')}

Return strictly valid JSON object with keys:
- weekTheme (string)
- weeklyGoalSummary (string)
- totalPlannedHours (number)
- days: array of 7 day objects with { dayIndex (number), dayName (string), dateStr (string), isHoliday (boolean), holidayNote (string), allocatedMinutes (number), focusSubject (string), dailyObjective (string), tasks: array of { id, title, topicName, subjectName, type ('lecture'|'pyq'|'revision'|'quiz'|'rest'), durationMinutes, actionTip, completed: false } }`;

    const completion = await client.chat.completions.create({
      model: NVIDIA_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert GATE CSE study planner. Return ONLY valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    });

    const parsed = extractJsonFromResponse(completion.choices[0]?.message?.content || '');
    if (parsed && parsed.days && Array.isArray(parsed.days)) {
      const fullPlan = {
        id: `plan_${Date.now()}`,
        weekKey,
        weekStartDate,
        weekEndDate,
        dailyTargetHours: dailyHours,
        holidayDays,
        strategy,
        weekTheme: parsed.weekTheme || 'Weekly Syllabus Sprint',
        weeklyGoalSummary:
          parsed.weeklyGoalSummary || 'Cover core GATE topics and solidify revision.',
        totalPlannedHours:
          parsed.totalPlannedHours || (7 - holidayDays.length) * dailyHours,
        days: parsed.days.map((d: any, idx: number) => ({
          ...d,
          dayIndex: idx,
          dateStr: dayDates[idx]?.dateStr || d.dateStr || '',
          dayName: dayDates[idx]?.name || d.dayName || '',
          tasks: (d.tasks || []).map((t: any, tIdx: number) => ({
            ...t,
            id: t.id || `task_${idx}_${tIdx}_${Date.now()}`,
            completed: false,
          })),
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      res.json(fullPlan);
      return;
    }

    res.json(
      getFallbackWeeklyPlan(
        dailyHours,
        holidayDays,
        focusSubjects,
        strategy,
        weekKey,
        weekStartDate,
        weekEndDate,
        dayDates,
        pendingTopicsList
      )
    );
  } catch (err: any) {
    res.json(
      getFallbackWeeklyPlan(
        dailyHours,
        holidayDays,
        focusSubjects,
        strategy,
        weekKey,
        weekStartDate,
        weekEndDate,
        dayDates,
        pendingTopicsList
      )
    );
  }
});

// 7. GATE Exam News
app.post('/api/ai/news', async (req, res) => {
  try {
    const client = getOpenAI();
    const prompt = `Provide the latest official news, dates, and announcements regarding GATE (Graduate Aptitude Test in Engineering) Computer Science.
Return 4-6 concise update items covering organizing IIT announcements, exam dates, application windows, cutoff trends, and two-paper combinations.`;

    const completion = await client.chat.completions.create({
      model: NVIDIA_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an official GATE CSE news correspondent.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 2048,
    });

    const text = completion.choices[0]?.message?.content || '';
    if (text.trim()) {
      res.json({
        rawText: text,
        groundingSources: [
          { title: 'Official GATE Portal', uri: 'https://gate2026.iit.ac.in' },
          { title: 'GATE Information Brochure', uri: 'https://gate.iitr.ac.in' },
        ],
        searchQueries: ['GATE CSE 2026 exam schedule', 'GATE CSE notifications'],
        timestamp: new Date().toISOString(),
      });
      return;
    }
    res.json(getFallbackNews());
  } catch (err: any) {
    res.json(getFallbackNews());
  }
});

// ==========================================
// 8. 40-Year PYQ Bank, Categories & Chapters API
// ==========================================

app.get('/api/pyqs/categories', (req, res) => {
  res.json({
    volumes: GATE_VOLUMES,
    categories: GATE_CHAPTER_CATEGORIES,
    eras: GATE_PYQ_ERAS,
    totalQuestions: 3838,
  });
});

app.get('/api/pyqs', (req, res) => {
  const {
    volume,
    subject,
    chapter,
    topic,
    type,
    era,
    search,
    limit = 50,
    offset = 0,
  } = req.query;

  let results = [...GATE_40_YEARS_PYQS];

  if (volume && volume !== 'all') {
    const volNum = Number(volume);
    const volObj = GATE_VOLUMES.find((v) => v.volume === volNum);
    results = results.filter((q) => {
      if (q.volume && q.volume === volNum) return true;
      if (
        volObj &&
        volObj.subjects.some((s) => s.toLowerCase() === q.subject.toLowerCase())
      )
        return true;
      return false;
    });
  }

  if (subject && subject !== 'all') {
    const subStr = String(subject).toLowerCase();
    results = results.filter((q) => q.subject.toLowerCase() === subStr);
  }

  if (chapter && chapter !== 'all') {
    const chStr = String(chapter).toLowerCase();
    results = results.filter(
      (q) => q.chapter && q.chapter.toLowerCase().includes(chStr)
    );
  }

  if (topic && topic !== 'all') {
    const topStr = String(topic).toLowerCase();
    results = results.filter((q) => q.topic.toLowerCase().includes(topStr));
  }

  if (type && type !== 'all') {
    const typeStr = String(type).toLowerCase();
    results = results.filter((q) => q.type.toLowerCase() === typeStr);
  }

  if (era && era !== 'all') {
    const eraObj = GATE_PYQ_ERAS.find((e) => e.id === era);
    if (eraObj) {
      results = results.filter(
        (q) => q.year >= eraObj.minYear && q.year <= eraObj.maxYear
      );
    }
  }

  if (search && typeof search === 'string' && search.trim()) {
    const tokens = search
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 1);
    results = results.filter((q) => {
      const qText =
        `${q.examTag} ${q.year} ${q.subject} ${q.chapter || ''} ${q.topic} ${q.subtopic || ''} ${q.questionText} ${q.conceptTested} ${q.relatedChapterKeywords.join(' ')}`.toLowerCase();
      return tokens.every((t) => qText.includes(t));
    });
  }

  const total = results.length;
  const start = Number(offset) || 0;
  const count = Number(limit) || 50;
  const paginated = results.slice(start, start + count);

  res.json({
    total,
    offset: start,
    limit: count,
    questions: paginated,
  });
});

app.post('/api/pyqs/chapter-test', async (req, res) => {
  const { subject = 'Core Subject', chapter = '', topic = '', count = 10 } = req.body;
  const targetTopic = chapter || topic || subject;

  const topicTokens = targetTopic
    .toLowerCase()
    .split(/\s+/)
    .filter((t: string) => t.length > 2);
  const matched = GATE_40_YEARS_PYQS.filter((q) => {
    if (q.subject.toLowerCase() !== subject.toLowerCase()) return false;
    const qStr =
      `${q.chapter || ''} ${q.topic} ${q.conceptTested} ${q.relatedChapterKeywords.join(' ')}`.toLowerCase();
    return topicTokens.some((t: string) => qStr.includes(t));
  });

  if (matched.length >= count) {
    res.json({ questions: matched.slice(0, count), source: '40-year-archive' });
    return;
  }

  const needed = count - matched.length;
  const extra = getFallbackQuiz(targetTopic, subject, needed);
  const formattedExtra = extra.map((q, idx) => ({
    id: `synth-pyq-${Date.now()}-${idx}`,
    subject,
    topic: targetTopic,
    chapter: targetTopic,
    year: 2026,
    examTag: `GATE Mastery Drill (Q${matched.length + idx + 1})`,
    marks: q.marks || 1,
    type: 'MCQ' as const,
    questionText: q.question,
    options: (q.options || []).map((optStr, optIdx) => {
      const m = optStr.match(/^([A-D])[\)\.\:]\s*(.*)$/i);
      const key = (m
        ? m[1].toUpperCase()
        : String.fromCharCode(65 + optIdx)) as 'A' | 'B' | 'C' | 'D';
      const text = m ? m[2] : optStr;
      return { key, text };
    }),
    correctAnswer: q.correctAnswer.trim().toUpperCase().charAt(0),
    explanation: q.explanation,
    conceptTested: q.tip || `${targetTopic} Core Principle`,
    difficulty: 'Medium' as const,
    relatedChapterKeywords: [targetTopic, subject],
  }));

  res.json({
    questions: [...matched, ...formattedExtra].slice(0, count),
    source: matched.length > 0 ? 'hybrid-archive-curated' : 'curated-generator',
  });
});

// ==========================================
// 9. User State & Progress APIs
// ==========================================

app.get('/api/user/data', (req, res) => {
  res.json(inMemoryUserData);
});

app.post('/api/user/sync', (req, res) => {
  const {
    userStates,
    pyqAttempts,
    studyStreak,
    weeklyPlan,
    subjectWeights,
    customSheetUrl,
  } = req.body;

  if (userStates !== undefined) inMemoryUserData.userStates = userStates;
  if (pyqAttempts !== undefined) inMemoryUserData.pyqAttempts = pyqAttempts;
  if (studyStreak !== undefined) inMemoryUserData.studyStreak = studyStreak;
  if (weeklyPlan !== undefined) inMemoryUserData.weeklyPlan = weeklyPlan;
  if (subjectWeights !== undefined) inMemoryUserData.subjectWeights = subjectWeights;
  if (customSheetUrl !== undefined) inMemoryUserData.customSheetUrl = customSheetUrl;

  saveUserDataToDisk(inMemoryUserData);
  res.json({ success: true, savedAt: new Date().toISOString() });
});

app.post('/api/user/pyq-attempt', (req, res) => {
  const {
    questionId,
    selectedAnswer,
    isCorrect,
    timeSpentSeconds = 0,
  } = req.body;
  if (!questionId) {
    res.status(400).json({ error: 'questionId is required' });
    return;
  }

  if (!inMemoryUserData.pyqAttempts) {
    inMemoryUserData.pyqAttempts = {};
  }

  inMemoryUserData.pyqAttempts[questionId] = {
    questionId,
    selectedAnswer,
    isCorrect,
    attempted: true,
    timeSpentSeconds,
    attemptedAt: new Date().toISOString(),
  };

  saveUserDataToDisk(inMemoryUserData);
  res.json({ success: true, attempt: inMemoryUserData.pyqAttempts[questionId] });
});

app.post('/api/user/reset', (req, res) => {
  inMemoryUserData = {
    userStates: {},
    pyqAttempts: {},
    studyStreak: {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      activeDates: [],
      history: {},
    },
    weeklyPlan: null,
    subjectWeights: null,
    customSheetUrl: null,
  };
  saveUserDataToDisk(inMemoryUserData);
  res.json({ success: true, message: 'User state reset successfully' });
});

// Vite middleware in dev / static server in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GATE CSE Hub server running on http://0.0.0.0:${PORT} with NVIDIA Nemotron AI`);
  });
}

startServer();
