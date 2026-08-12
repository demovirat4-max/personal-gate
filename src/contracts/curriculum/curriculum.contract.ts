import { z } from 'zod';

export const PrioritySchema = z.enum(['HIGH', 'NORMAL', 'LOW']);
export type Priority = z.infer<typeof PrioritySchema>;

export const VerificationStatusSchema = z.enum(['VERIFIED', 'UNVERIFIED']);
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;

export const VideoResourceSchema = z.object({
  id: z.string().uuid(),
  subjectId: z.string().uuid().optional().nullable(),
  topicId: z.string().uuid().optional().nullable(),
  platform: z.string(),
  externalVideoId: z.string(),
  title: z.string(),
  channelName: z.string().optional().nullable(),
  durationSeconds: z.number().optional().nullable(),
  qualityStatus: z.string(),
  verificationStatus: z.string(),
  availabilityStatus: z.string(),
});
export type VideoResource = z.infer<typeof VideoResourceSchema>;

export const LectureSchema = z.object({
  id: z.string().uuid(),
  topicId: z.string().uuid(),
  subtopicId: z.string().uuid().optional().nullable(),
  courseId: z.string().uuid().optional().nullable(),
  title: z.string().min(1),
  youtubeVideoId: z.string().min(1),
  youtubeUrl: z.string().url(),
  lectureOrder: z.number().int().positive(),
  durationSeconds: z.number().int().nonnegative(),
  priority: PrioritySchema,
  notes: z.string().optional().nullable(),
  verificationStatus: VerificationStatusSchema,
  teacherName: z.string().optional().nullable(),
  courseTitle: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Lecture = z.infer<typeof LectureSchema>;

export const SubtopicSchema = z.object({
  id: z.string().uuid(),
  topicId: z.string().uuid(),
  title: z.string().min(1),
  orderIndex: z.number().int().positive(),
  lectures: z.array(LectureSchema),
});
export type Subtopic = z.infer<typeof SubtopicSchema>;

export const TopicSchema = z.object({
  id: z.string().uuid(),
  subjectId: z.string().uuid(),
  title: z.string().min(1),
  code: z.string().min(1),
  orderIndex: z.number().int().positive(),
  subtopics: z.array(SubtopicSchema),
  lectures: z.array(LectureSchema),
});
export type Topic = z.infer<typeof TopicSchema>;

export const SubjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  code: z.string().min(1),
  weightageMarks: z.number(),
  orderIndex: z.number().int().positive(),
  topics: z.array(TopicSchema),
  videoResources: z.array(VideoResourceSchema).optional(),
});
export type Subject = z.infer<typeof SubjectSchema>;

export const CurriculumTreeResponseSchema = z.object({
  subjects: z.array(SubjectSchema),
  totalSubjects: z.number().int().nonnegative(),
  totalTopics: z.number().int().nonnegative(),
  totalLectures: z.number().int().nonnegative(),
  totalDurationSeconds: z.number().int().nonnegative(),
});
export type CurriculumTreeResponse = z.infer<typeof CurriculumTreeResponseSchema>;
