import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  getFallbackSummary,
  getFallbackFeynman,
  getFallbackFormulaSheet,
  getFallbackQuiz,
  getFallbackWeeklyPlan,
  getFallbackNews,
  getFallbackChatAnswer,
} from './server/fallbacks';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '5mb' }));

// Lazy initializer for Google GenAI client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Proxy route for fetching Google Sheets CSV (handles CORS, edit links, or publishing quirks smoothly)
app.post('/api/sheet/fetch-csv', async (req, res) => {
  try {
    let { url } = req.body;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'URL parameter is required' });
      return;
    }

    url = url.trim();

    // Automatically convert Google Sheet edit / view URL to export CSV URL
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

    // Ensure valid http/https URL
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      res.status(400).json({ error: 'Invalid URL protocol' });
      return;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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

// 1. Ask-AI multi-turn chat endpoint for GATE CSE
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
    const ai = getGenAI();

    // Role-specific System Instructions
    let roleDescription = '';
    if (role === 'traps') {
      roleDescription = `You are a strict GATE CSE PYQ Trap & Edge-Case Specialist.
Your primary objective is identifying tricky boundary conditions, negative-marking pitfalls, subtle misinterpretations of questions, and standard exam traps across GATE CSE subjects.`;
    } else if (role === 'revision') {
      roleDescription = `You are a Rapid Revision & Formula Coach for GATE CSE.
Provide ultra-concise, high-yield summaries, formulas, theorems, standard algorithm time/space bounds, and quick test drills. Keep explanations minimal and directly memorizable.`;
    } else if (role === 'prover') {
      roleDescription = `You are a Mathematical & Algorithmic Proof Specialist for GATE CSE.
Provide step-by-step mathematical reasoning, recurrence tree expansions, master theorem applications, formal proof sketches, and loop invariant verifications.`;
    } else {
      roleDescription = `You are an elite GATE Computer Science & Information Technology (GATE CSE) mentor and examiner.
Your answers are clear, mathematically sound, exam-targeted, and adhere to the official GATE CSE syllabus (Data Structures, Algorithms, Theory of Computation, Compiler Design, OS, DBMS, Computer Networks, COA, Digital Logic, Discrete Mathematics, Engineering Math).`;
    }

    const systemInstruction = `${roleDescription}

Core Guidelines:
1. Maintain multi-turn conversational context with the student.
2. Directly answer the question with technical rigor and clarity.
3. Highlight relevant GATE syllabus context, formulas, and common pitfalls.
4. Use clean Markdown, bold headers, and code/math blocks.
Current Subject Context: ${subject}
Current Topic Context: ${topic}`;

    const contents = messages
      .filter((m: any) => m && m.content && m.content.trim() && m.id !== 'welcome')
      .map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content.trim() }],
      }));

    if (contents.length === 0) {
      res.status(400).json({ error: 'Valid user messages are required' });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: role === 'prover' ? 0.1 : 0.3,
      },
    });

    res.json({
      reply: response.text || 'No response generated.',
      modelUsed: 'gemini-2.5-flash',
    });
  } catch (err: any) {
    // Graceful fallback with high-yield curated response
    const fallbackReply = getFallbackChatAnswer(latestUserMsg, subject, topic, role);
    res.json({
      reply: fallbackReply,
      modelUsed: 'curated-study-engine',
    });
  }
});

// Single-turn Ask endpoint (kept for backward compatibility)
app.post('/api/ai/ask', async (req, res) => {
  const { question, subject = 'GATE CSE', topic = 'General', notes } = req.body;
  if (!question) {
    res.status(400).json({ error: 'Question is required' });
    return;
  }

  try {
    const ai = getGenAI();

    const systemInstruction = `You are an elite GATE Computer Science & Information Technology (GATE CSE) mentor and examiner.
Your answers are concise, mathematically rigorous, and laser-focused on the official GATE CSE syllabus and previous year questions (PYQs).
Avoid fluff or generic textbook filler.
When answering:
1. Provide the direct conceptual answer, mathematical theorem, or formula first.
2. Highlight potential GATE traps, boundary conditions, or common calculation mistakes students make.
3. If relevant, mention time/space complexities or standard GATE PYQ patterns.
Use clean markdown, bolding, and code/math notations where appropriate.`;

    let userPrompt = `Student Question: ${question}\n`;
    if (subject) userPrompt += `Current Subject Context: ${subject}\n`;
    if (topic) userPrompt += `Current Topic Context: ${topic}\n`;
    if (notes) userPrompt += `Student's Personal Notes: ${notes}\n`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    res.json({ answer: response.text || 'No response generated.' });
  } catch (err: any) {
    const fallbackAnswer = getFallbackChatAnswer(question, subject, topic, 'mentor');
    res.json({ answer: fallbackAnswer });
  }
});

// 2. Auto-generated Key Points & Concept Summary
app.post('/api/ai/summarize', async (req, res) => {
  const { title, subject = 'GATE CSE', topic, channel, transcript } = req.body;
  const targetTopic = topic || title || 'Core Concept';

  try {
    const ai = getGenAI();

    const prompt = `Generate a high-yield, exam-oriented concept summary for a GATE CSE study topic.
Metadata:
- Subject: ${subject}
- Topic: ${targetTopic}
- Video Title: ${title || 'N/A'}
- Channel/Instructor: ${channel || 'N/A'}
${transcript ? `\nTranscript/Notes Snippet:\n${transcript}\n` : ''}

Output structured markdown with:
1. **Core Concept Overview** (2-3 crisp sentences)
2. **Key Formulas / Algorithms / Theorems** (bullet points with precise notations)
3. **Time & Space Complexity / Critical Properties** (if applicable)
4. **Common GATE Exam Traps & PYQ Tips** (2-3 actionable bullet points)`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert GATE CSE instructor creating high-yield revision flashcard summaries.',
        temperature: 0.2,
      },
    });

    res.json({ summary: response.text || getFallbackSummary(targetTopic, subject) });
  } catch (err: any) {
    res.json({ summary: getFallbackSummary(targetTopic, subject) });
  }
});

// 3. Quick Quiz Generator (GATE CSE MCQs / Numerical Style)
app.post('/api/ai/quiz', async (req, res) => {
  const { subject = 'GATE CSE', topic = 'Core Topic', count = 3 } = req.body;

  try {
    const ai = getGenAI();

    const prompt = `Generate ${count} authentic, conceptual, and calculation-based Multiple Choice Questions (MCQs) for GATE CSE on the topic "${topic}" in subject "${subject}".
Make them typical of standard GATE 1-mark and 2-mark difficulty. Include 4 distinct options (A, B, C, D), identify the correct option, and provide a clear step-by-step mathematical/logical explanation.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: 'Question ID (e.g. Q1)' },
              question: { type: Type.STRING, description: 'The question text including any code snippet or mathematical equation' },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Array of exactly 4 options prefixed with A), B), C), D)',
              },
              correctAnswer: { type: Type.STRING, description: 'The correct option letter, e.g., A, B, C, or D' },
              marks: { type: Type.NUMBER, description: 'Marks: 1 or 2' },
              explanation: { type: Type.STRING, description: 'Detailed step-by-step reasoning for the solution' },
              tip: { type: Type.STRING, description: 'Key GATE takeaway formula or tip' },
            },
            required: ['id', 'question', 'options', 'correctAnswer', 'marks', 'explanation'],
          },
        },
        temperature: 0.4,
      },
    });

    const parsedJson = JSON.parse(response.text || '[]');
    if (Array.isArray(parsedJson) && parsedJson.length > 0) {
      res.json({ questions: parsedJson });
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
    const ai = getGenAI();
    const prompt = `You are an elite GATE Computer Science educator applying the Feynman Technique to teach the concept:
Subject: ${subject}
Topic: ${topic}

Structure your explanation in 3 distinct tiers:
1. Analogy: An intuitive, plain-English real-world metaphor explaining the core idea without technical jargon.
2. Technical Mechanics: The precise mathematical formulation, data structure properties, or system mechanism under the hood required for GATE CSE.
3. GATE Traps & Edge Cases: 2-3 specific tricky boundary cases, misleading question formats, or calculation pitfalls tested in GATE PYQs.
4. High-Yield Tips: 2 practical rules of thumb or memorization mnemonics for the exam.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analogy: { type: Type.STRING, description: 'Intuitive real-world analogy' },
            technicalMechanics: { type: Type.STRING, description: 'Technical and mathematical inner mechanics' },
            gateTrapsAndEdgeCases: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Tricky GATE traps and boundary cases',
            },
            highYieldTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'High-yield exam tips and shortcuts',
            },
          },
          required: ['analogy', 'technicalMechanics', 'gateTrapsAndEdgeCases', 'highYieldTips'],
        },
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.analogy && parsed.technicalMechanics) {
      res.json(parsed);
      return;
    }
    res.json(getFallbackFeynman(topic, subject));
  } catch (err: any) {
    res.json(getFallbackFeynman(topic, subject));
  }
});

// 5. High-Yield Formula & Complexity Cheat Sheet
app.post('/api/ai/formula-sheet', async (req, res) => {
  const { subject = 'GATE CSE', topic = 'Core Topic' } = req.body;

  try {
    const ai = getGenAI();
    const prompt = `Generate a high-yield formula, theorem, and complexity cheat sheet for GATE CSE on:
Subject: ${subject}
Topic: ${topic}

Provide:
1. Key Mathematical Formulas / Relations (equations with variables explained and GATE context)
2. Time & Space Complexity comparison table (operations, best, avg, worst, space) if applicable, or property matrix
3. Core Theorems / Standard Laws tested in GATE`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            formulas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  equation: { type: Type.STRING },
                  context: { type: Type.STRING },
                },
                required: ['title', 'equation', 'context'],
              },
            },
            complexities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  operation: { type: Type.STRING },
                  best: { type: Type.STRING },
                  average: { type: Type.STRING },
                  worst: { type: Type.STRING },
                  space: { type: Type.STRING },
                },
                required: ['operation', 'best', 'average', 'worst', 'space'],
              },
            },
            keyTheorems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['formulas', 'complexities', 'keyTheorems'],
        },
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.formulas && parsed.complexities) {
      res.json(parsed);
      return;
    }
    res.json(getFallbackFormulaSheet(topic, subject));
  } catch (err: any) {
    res.json(getFallbackFormulaSheet(topic, subject));
  }
});

// 6. AI Weekly Study Planner (Holiday & Daily Hours Aware)
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
    const ai = getGenAI();

    const prompt = `You are an expert GATE CSE coach creating a customized 7-day weekly study plan for an engineering student.

Student Parameters:
- Daily Study Target: ${dailyHours} Hours/Day on active study days (${dailyHours * 60} minutes)
- Declared Holiday / Rest Days: ${holidayDays.length > 0 ? holidayDays.join(', ') : 'None (Active 7 Days)'}
- Focus Subjects: ${focusSubjects.length > 0 ? focusSubjects.join(', ') : 'High-weight core GATE CSE subjects'}
- Prep Strategy: ${strategy} (e.g. balanced theory + pyq, heavy problem solving, rapid revision)
- Week: ${weekKey} (${weekStartDate} to ${weekEndDate})

Current Student Syllabus Backlog & Candidates:
- Pending / In-Progress Topics: ${pendingTopicsList.slice(0, 15).map((t: any) => `[${t.subject}] ${t.topic}`).join('; ')}
- Topics Flagged for Revision: ${revisionTopicsList.slice(0, 10).map((t: any) => `[${t.subject}] ${t.topic}`).join('; ')}

Days of the Week:
${dayDates.map((d: any, idx: number) => `${idx}. ${d.name} (${d.dateStr}) - ${holidayDays.includes(d.name) ? 'HOLIDAY / REST DAY' : 'ACTIVE STUDY DAY'}`).join('\n')}

Plan Generation Rules:
1. For any day marked as HOLIDAY / REST DAY:
   - Set "isHoliday": true
   - Set "allocatedMinutes": 0 (or light 15-20 min optional flashcard recap)
   - "holidayNote": Encouraging message like "Rest Day • Mental reset & light flashcard recap"
   - Include at most 1 light rest/reflection task or empty tasks.
2. For ACTIVE STUDY DAYS:
   - Set "isHoliday": false
   - Set "allocatedMinutes": ${dailyHours * 60}
   - Assign 2 to 3 focused, concrete tasks covering syllabus topics and revision slots. Total duration of tasks should match ${dailyHours * 60} minutes.
   - Types of tasks: 'lecture' (video/theory), 'pyq' (GATE previous year problem solving), 'revision' (notes/formulas), 'quiz' (speed test).
   - Provide concrete actionable advice in actionTip.
3. Ensure high-weight GATE CSE subjects (Algorithms, Data Structures, OS, DBMS, Networks, TOC, COA, Math) are prioritized.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weekTheme: { type: Type.STRING, description: 'Overarching theme for this study week' },
            weeklyGoalSummary: { type: Type.STRING, description: 'Summary of what will be achieved this week' },
            totalPlannedHours: { type: Type.NUMBER, description: 'Total study hours planned across active days' },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayIndex: { type: Type.NUMBER },
                  dayName: { type: Type.STRING },
                  dateStr: { type: Type.STRING },
                  isHoliday: { type: Type.BOOLEAN },
                  holidayNote: { type: Type.STRING },
                  allocatedMinutes: { type: Type.NUMBER },
                  focusSubject: { type: Type.STRING },
                  dailyObjective: { type: Type.STRING },
                  tasks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        topicName: { type: Type.STRING },
                        subjectName: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['lecture', 'pyq', 'revision', 'quiz', 'rest'] },
                        durationMinutes: { type: Type.NUMBER },
                        actionTip: { type: Type.STRING },
                        completed: { type: Type.BOOLEAN },
                      },
                      required: ['id', 'title', 'topicName', 'subjectName', 'type', 'durationMinutes', 'completed'],
                    },
                  },
                },
                required: ['dayIndex', 'dayName', 'dateStr', 'isHoliday', 'allocatedMinutes', 'focusSubject', 'dailyObjective', 'tasks'],
              },
            },
          },
          required: ['weekTheme', 'weeklyGoalSummary', 'totalPlannedHours', 'days'],
        },
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    // Attach week metadata
    const fullPlan = {
      id: `plan_${Date.now()}`,
      weekKey,
      weekStartDate,
      weekEndDate,
      dailyTargetHours: dailyHours,
      holidayDays,
      strategy,
      weekTheme: parsed.weekTheme || 'Weekly Syllabus Sprint',
      weeklyGoalSummary: parsed.weeklyGoalSummary || 'Cover core GATE topics and solidify revision.',
      totalPlannedHours: parsed.totalPlannedHours || (7 - holidayDays.length) * dailyHours,
      days: (parsed.days || []).map((d: any, idx: number) => ({
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
  } catch (err: any) {
    const fallbackPlan = getFallbackWeeklyPlan(
      dailyHours,
      holidayDays,
      focusSubjects,
      strategy,
      weekKey,
      weekStartDate,
      weekEndDate,
      dayDates,
      pendingTopicsList
    );
    res.json(fallbackPlan);
  }
});

// 7. GATE Exam News & Official Updates with Google Search Grounding
app.post('/api/ai/news', async (req, res) => {
  try {
    const ai = getGenAI();

    const prompt = `Search for the latest official news, dates, and announcements regarding GATE (Graduate Aptitude Test in Engineering) Computer Science / GATE CSE.
Find recent updates about:
- Organizing IIT announcements (e.g. GATE 2025 / GATE 2026 organizing institute, portal launch)
- Official application dates, registration deadlines, and admit card dates
- Exam dates & schedule
- Syllabus changes, two-paper combination eligibility, or new paper patterns
- GATE CSE Cutoff trends and score card release dates

Provide 4 to 6 distinct, recent news items. For each item provide:
- Headline (concise and factual)
- Summary (1-2 clear sentences explaining the announcement or date)
- Source / Organizing Authority (e.g. Official GATE portal, IIT, Press Information Bureau)
- Category (e.g. "Exam Dates", "Registration", "Syllabus", "Counselling/Cutoffs", "Notification")
- Approximate Date / Status`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });

    const textOutput = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSearchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

    if (textOutput.trim()) {
      res.json({
        rawText: textOutput,
        groundingSources: groundingChunks
          .map((chunk: any) => ({
            title: chunk.web?.title || 'Official Source',
            uri: chunk.web?.uri || '',
          }))
          .filter((s: any) => s.uri),
        searchQueries: webSearchQueries,
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
import { GATE_40_YEARS_PYQS, GATE_CHAPTER_CATEGORIES, GATE_PYQ_ERAS, GATE_VOLUMES } from './src/data/pyqData';
import fs from 'fs';

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
    studyStreak: { currentStreak: 0, longestStreak: 0, lastActiveDate: '', activeDates: [], history: {} },
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

// GET /api/pyqs/categories - Return all 3 volumes and categorized chapters
app.get('/api/pyqs/categories', (req, res) => {
  res.json({
    volumes: GATE_VOLUMES,
    categories: GATE_CHAPTER_CATEGORIES,
    eras: GATE_PYQ_ERAS,
    totalQuestions: 3838,
  });
});

// GET /api/pyqs - Search and filter 40-year PYQ archive
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

  // Volume filter
  if (volume && volume !== 'all') {
    const volNum = Number(volume);
    const volObj = GATE_VOLUMES.find((v) => v.volume === volNum);
    results = results.filter((q) => {
      if (q.volume && q.volume === volNum) return true;
      if (volObj && volObj.subjects.some((s) => s.toLowerCase() === q.subject.toLowerCase())) return true;
      return false;
    });
  }

  // Subject filter
  if (subject && subject !== 'all') {
    const subStr = String(subject).toLowerCase();
    results = results.filter((q) => q.subject.toLowerCase() === subStr);
  }

  // Chapter filter
  if (chapter && chapter !== 'all') {
    const chStr = String(chapter).toLowerCase();
    results = results.filter((q) => q.chapter && q.chapter.toLowerCase().includes(chStr));
  }

  // Topic filter
  if (topic && topic !== 'all') {
    const topStr = String(topic).toLowerCase();
    results = results.filter((q) => q.topic.toLowerCase().includes(topStr));
  }

  // Question Type filter
  if (type && type !== 'all') {
    const typeStr = String(type).toLowerCase();
    results = results.filter((q) => q.type.toLowerCase() === typeStr);
  }

  // Era filter
  if (era && era !== 'all') {
    const eraObj = GATE_PYQ_ERAS.find((e) => e.id === era);
    if (eraObj) {
      results = results.filter((q) => q.year >= eraObj.minYear && q.year <= eraObj.maxYear);
    }
  }

  // Keyword search
  if (search && typeof search === 'string' && search.trim()) {
    const tokens = search.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
    results = results.filter((q) => {
      const qText = `${q.examTag} ${q.year} ${q.subject} ${q.chapter || ''} ${q.topic} ${q.subtopic || ''} ${q.questionText} ${q.conceptTested} ${q.relatedChapterKeywords.join(' ')}`.toLowerCase();
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

// POST /api/pyqs/chapter-test - Curate/generate exact 10-MCQ chapter test
app.post('/api/pyqs/chapter-test', async (req, res) => {
  const { subject = 'Core Subject', chapter = '', topic = '', count = 10 } = req.body;
  const targetTopic = chapter || topic || subject;

  // 1. First check static matched questions
  const topicTokens = targetTopic.toLowerCase().split(/\s+/).filter((t: string) => t.length > 2);
  let matched = GATE_40_YEARS_PYQS.filter((q) => {
    if (q.subject.toLowerCase() !== subject.toLowerCase()) return false;
    const qStr = `${q.chapter || ''} ${q.topic} ${q.conceptTested} ${q.relatedChapterKeywords.join(' ')}`.toLowerCase();
    return topicTokens.some((t: string) => qStr.includes(t));
  });

  if (matched.length >= count) {
    res.json({ questions: matched.slice(0, count), source: '40-year-archive' });
    return;
  }

  // 2. Fallback to generator / fallback pool
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
      const key = (m ? m[1].toUpperCase() : String.fromCharCode(65 + optIdx)) as 'A' | 'B' | 'C' | 'D';
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
// 9. Full User Data Sync & Backup APIs
// ==========================================

// GET /api/user/data - Load entire persisted state
app.get('/api/user/data', (req, res) => {
  res.json(inMemoryUserData);
});

// POST /api/user/sync - Bulk save user study states, attempts, streak, and plans
app.post('/api/user/sync', (req, res) => {
  const { userStates, pyqAttempts, studyStreak, weeklyPlan, subjectWeights, customSheetUrl } = req.body;

  if (userStates !== undefined) inMemoryUserData.userStates = userStates;
  if (pyqAttempts !== undefined) inMemoryUserData.pyqAttempts = pyqAttempts;
  if (studyStreak !== undefined) inMemoryUserData.studyStreak = studyStreak;
  if (weeklyPlan !== undefined) inMemoryUserData.weeklyPlan = weeklyPlan;
  if (subjectWeights !== undefined) inMemoryUserData.subjectWeights = subjectWeights;
  if (customSheetUrl !== undefined) inMemoryUserData.customSheetUrl = customSheetUrl;

  saveUserDataToDisk(inMemoryUserData);
  res.json({ success: true, savedAt: new Date().toISOString() });
});

// POST /api/user/pyq-attempt - Record a single PYQ answer attempt
app.post('/api/user/pyq-attempt', (req, res) => {
  const { questionId, selectedAnswer, isCorrect, timeSpentSeconds = 0 } = req.body;
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

// POST /api/user/reset - Reset user data
app.post('/api/user/reset', (req, res) => {
  inMemoryUserData = {
    userStates: {},
    pyqAttempts: {},
    studyStreak: { currentStreak: 0, longestStreak: 0, lastActiveDate: '', activeDates: [], history: {} },
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
    console.log(`GATE CSE Hub server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
