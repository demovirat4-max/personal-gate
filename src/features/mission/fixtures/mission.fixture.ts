import { z } from 'zod';

export const MissionTaskFixtureSchema = z.object({
  id: z.string(),
  topicId: z.string(),
  topicName: z.string(),
  subjectName: z.string(),
  taskType: z.enum(['LECTURE', 'PRACTICE', 'REVISION']),
  allocatedMinutes: z.number().positive(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']),
  orderIndex: z.number().positive(),
});

export const MissionDashboardFixtureSchema = z.object({
  examSettings: z.object({
    paper: z.string(),
    targetYear: z.number(),
    provisionalTimestamp: z.string(),
    timezone: z.string(),
    totalWeeklyCapacityMins: z.number(),
  }),
  todaysMission: z.array(MissionTaskFixtureSchema),
  dailyProgress: z.object({
    completedMinutes: z.number(),
    plannedMinutes: z.number(),
    percentage: z.number(),
    streakDays: z.number(),
  }),
  nextBestAction: z.object({
    title: z.string(),
    subtitle: z.string(),
    actionUrl: z.string(),
    type: z.enum(['PRACTICE', 'LECTURE', 'REVISION']),
  }),
  continueLearning: z.object({
    lectureTitle: z.string(),
    subjectName: z.string(),
    teacherName: z.string(),
    durationFormatted: z.string(),
    progressPercentage: z.number(),
    videoPlaceholderId: z.string(),
  }),
  weakTopics: z.array(
    z.object({
      id: z.string(),
      topicName: z.string(),
      subjectName: z.string(),
      masteryScore: z.number(),
      retentionRisk: z.enum(['HIGH', 'MEDIUM', 'LOW']),
    })
  ),
  air1Trajectory: z.object({
    readinessScore: z.number(),
    statusBand: z.enum(['AIR-1 TRAJECTORY', 'TOP 100 TRAJECTORY', 'QUALIFYING TRAJECTORY', 'ACTION REQUIRED']),
    syllabusCoveragePct: z.number(),
    pyqAccuracyPct: z.number(),
  }),
});

export type MissionTaskFixture = z.infer<typeof MissionTaskFixtureSchema>;
export type MissionDashboardFixture = z.infer<typeof MissionDashboardFixtureSchema>;

export const PHASE_1_MISSION_FIXTURE: MissionDashboardFixture = MissionDashboardFixtureSchema.parse({
  examSettings: {
    paper: 'GATE CS (Computer Science & Information Technology)',
    targetYear: 2028,
    provisionalTimestamp: '2028-02-05T09:30:00+05:30',
    timezone: 'Asia/Kolkata',
    totalWeeklyCapacityMins: 1620,
  },
  todaysMission: [
    {
      id: 'task-101',
      topicId: 'topic-ds-trees',
      topicName: 'Binary Search Trees & AVL Rotations',
      subjectName: 'Data Structures',
      taskType: 'LECTURE',
      allocatedMinutes: 60,
      status: 'IN_PROGRESS',
      orderIndex: 1,
    },
    {
      id: 'task-102',
      topicId: 'topic-algo-sorting',
      topicName: 'QuickSort & HeapSort Time Complexities',
      subjectName: 'Algorithms',
      taskType: 'PRACTICE',
      allocatedMinutes: 45,
      status: 'PENDING',
      orderIndex: 2,
    },
    {
      id: 'task-103',
      topicId: 'topic-os-paging',
      topicName: 'Virtual Memory & Page Replacement Algorithms',
      subjectName: 'Operating Systems',
      taskType: 'REVISION',
      allocatedMinutes: 45,
      status: 'PENDING',
      orderIndex: 3,
    },
  ],
  dailyProgress: {
    completedMinutes: 30,
    plannedMinutes: 180,
    percentage: 17,
    streakDays: 12,
  },
  nextBestAction: {
    title: 'Complete AVL Tree Rotations Lecture',
    subtitle: '15 mins remaining in current focus block',
    actionUrl: '/learn/lecture/task-101',
    type: 'LECTURE',
  },
  continueLearning: {
    lectureTitle: 'Lecture 14: Balanced Search Trees & AVL Rotations',
    subjectName: 'Data Structures',
    teacherName: 'Gate Smashers',
    durationFormatted: '48 mins',
    progressPercentage: 65,
    videoPlaceholderId: 'v-avl-trees-01',
  },
  weakTopics: [
    {
      id: 'topic-os-paging',
      topicName: 'Page Replacement Algorithms (LRU / FIFO)',
      subjectName: 'Operating Systems',
      masteryScore: 42,
      retentionRisk: 'HIGH',
    },
    {
      id: 'topic-toc-pumping',
      topicName: 'Pumping Lemma for Regular Languages',
      subjectName: 'Theory of Computation',
      masteryScore: 54,
      retentionRisk: 'MEDIUM',
    },
    {
      id: 'topic-dbms-normalization',
      topicName: '3NF & BCNF Functional Dependencies',
      subjectName: 'Databases',
      masteryScore: 61,
      retentionRisk: 'MEDIUM',
    },
  ],
  air1Trajectory: {
    readinessScore: 82.4,
    statusBand: 'TOP 100 TRAJECTORY',
    syllabusCoveragePct: 38.5,
    pyqAccuracyPct: 86.2,
  },
});
