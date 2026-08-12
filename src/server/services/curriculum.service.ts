import { supabaseAdmin } from '@/lib/supabase/server';
import { Subject, Topic, Subtopic, Lecture, VideoResource, CurriculumTreeResponse } from '@/contracts/curriculum/curriculum.contract';

export class CurriculumService {
  /**
   * Retrieves the full hierarchical curriculum tree from Supabase.
   */
  static async getCurriculumTree(): Promise<CurriculumTreeResponse> {
    // Fetch subjects
    const { data: subjectsData, error: subjectsError } = await supabaseAdmin
      .from('subjects')
      .select('*')
      .order('order_index', { ascending: true });

    if (subjectsError) throw new Error(`Failed to fetch subjects: ${subjectsError.message}`);

    // Fetch all topics
    const { data: topicsData, error: topicsError } = await supabaseAdmin
      .from('topics')
      .select('*')
      .order('order_index', { ascending: true });

    if (topicsError) throw new Error(`Failed to fetch topics: ${topicsError.message}`);

    // Fetch all subtopics
    const { data: subtopicsData, error: subtopicsError } = await supabaseAdmin
      .from('subtopics')
      .select('*')
      .order('order_index', { ascending: true });

    if (subtopicsError) throw new Error(`Failed to fetch subtopics: ${subtopicsError.message}`);

    // Fetch all lectures with joined course info
    const { data: lecturesData, error: lecturesError } = await supabaseAdmin
      .from('lectures')
      .select('*, courses(title, teacher_name)')
      .order('lecture_order', { ascending: true });

    if (lecturesError) throw new Error(`Failed to fetch lectures: ${lecturesError.message}`);

    // Fetch all video resources
    const { data: videoResData } = await supabaseAdmin
      .from('video_resources')
      .select('*')
      .order('created_at', { ascending: true });

    const videoResources: VideoResource[] = (videoResData || []).map((vr: any) => ({
      id: vr.id,
      subjectId: vr.subject_id ?? null,
      topicId: vr.topic_id ?? null,
      platform: vr.platform,
      externalVideoId: vr.external_video_id,
      title: vr.title,
      channelName: vr.channel_name ?? null,
      durationSeconds: vr.duration_seconds ?? null,
      qualityStatus: vr.quality_status,
      verificationStatus: vr.verification_status,
      availabilityStatus: vr.availability_status,
    }));

    // Map lectures
    const lectures: Lecture[] = (lecturesData || []).map((l: any) => ({
      id: l.id,
      topicId: l.topic_id,
      subtopicId: l.subtopic_id ?? null,
      courseId: l.course_id ?? null,
      title: l.title,
      youtubeVideoId: l.youtube_video_id,
      youtubeUrl: l.youtube_url,
      lectureOrder: l.lecture_order,
      durationSeconds: l.duration_seconds,
      priority: l.priority,
      notes: l.notes ?? null,
      verificationStatus: l.verification_status,
      teacherName: l.courses?.teacher_name ?? null,
      courseTitle: l.courses?.title ?? null,
      createdAt: l.created_at,
      updatedAt: l.updated_at,
    }));

    // Map subtopics
    const subtopics: Subtopic[] = (subtopicsData || []).map((st: any) => ({
      id: st.id,
      topicId: st.topic_id,
      title: st.title,
      orderIndex: st.order_index,
      lectures: lectures.filter((l) => l.subtopicId === st.id),
    }));

    // Map topics
    const topics: Topic[] = (topicsData || []).map((t: any) => ({
      id: t.id,
      subjectId: t.subject_id,
      title: t.title,
      code: t.code,
      orderIndex: t.order_index,
      subtopics: subtopics.filter((st) => st.topicId === t.id),
      lectures: lectures.filter((l) => l.topicId === t.id),
    }));

    // Map subjects
    const subjects: Subject[] = (subjectsData || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      code: s.code,
      weightageMarks: parseFloat(s.weightage_marks),
      orderIndex: s.order_index,
      topics: topics.filter((t) => t.subjectId === s.id),
      videoResources: videoResources.filter((vr) => vr.subjectId === s.id),
    }));

    const totalLectures = lectures.length;
    const totalDurationSeconds = lectures.reduce((acc, l) => acc + (l.durationSeconds || 0), 0);

    return {
      subjects,
      totalSubjects: subjects.length,
      totalTopics: topics.length,
      totalLectures,
      totalDurationSeconds,
    };
  }

  /**
   * Upserts subject, topic, subtopic, course, and lecture in Supabase.
   */
  static async commitNormalizedRow(row: {
    subject: string;
    topic: string;
    subtopic?: string | null;
    lectureTitle: string;
    youtubeUrl: string;
    youtubeVideoId: string;
    teacher?: string | null;
    courseOrPlaylist?: string | null;
    lectureOrder: number;
    priority: 'HIGH' | 'NORMAL' | 'LOW';
    notes?: string | null;
    durationSeconds: number;
  }): Promise<{ isInsert: boolean; isUpdate: boolean; isUnchanged: boolean }> {
    const subjectCode = `CS_${row.subject
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')}`;
    const { data: subjectData, error: subjectErr } = await supabaseAdmin
      .from('subjects')
      .upsert(
        {
          title: row.subject.trim(),
          code: subjectCode,
          weightage_marks: 8.0,
          order_index: 99,
        },
        { onConflict: 'code', ignoreDuplicates: false }
      )
      .select('id')
      .single();

    if (subjectErr) throw new Error(`Subject upsert failed: ${subjectErr.message}`);
    const subjectId = subjectData.id;

    const topicCode = `${subjectCode}_${row.topic
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')}`;
    const { data: topicData, error: topicErr } = await supabaseAdmin
      .from('topics')
      .upsert(
        {
          subject_id: subjectId,
          title: row.topic.trim(),
          code: topicCode,
          order_index: 99,
        },
        { onConflict: 'subject_id,title', ignoreDuplicates: false }
      )
      .select('id')
      .single();

    if (topicErr) throw new Error(`Topic upsert failed: ${topicErr.message}`);
    const topicId = topicData.id;

    let subtopicId: string | null = null;
    if (row.subtopic && row.subtopic.trim()) {
      const { data: subtopicData, error: subtopicErr } = await supabaseAdmin
        .from('subtopics')
        .upsert(
          { topic_id: topicId, title: row.subtopic.trim(), order_index: 99 },
          { onConflict: 'topic_id,title', ignoreDuplicates: false }
        )
        .select('id')
        .single();

      if (subtopicErr) throw new Error(`Subtopic upsert failed: ${subtopicErr.message}`);
      subtopicId = subtopicData.id;
    }

    let courseId: string | null = null;
    if (row.courseOrPlaylist && row.courseOrPlaylist.trim()) {
      const { data: courseData, error: courseErr } = await supabaseAdmin
        .from('courses')
        .upsert(
          { title: row.courseOrPlaylist.trim(), teacher_name: row.teacher?.trim() ?? null },
          { onConflict: 'title,teacher_name', ignoreDuplicates: false }
        )
        .select('id')
        .single();

      if (courseErr) throw new Error(`Course upsert failed: ${courseErr.message}`);
      courseId = courseData.id;
    }

    const { data: existingLecture } = await supabaseAdmin
      .from('lectures')
      .select('id, title, lecture_order, priority, duration_seconds')
      .eq('topic_id', topicId)
      .eq('youtube_video_id', row.youtubeVideoId)
      .maybeSingle();

    if (existingLecture) {
      const isUnchanged =
        existingLecture.title === row.lectureTitle &&
        existingLecture.lecture_order === row.lectureOrder &&
        existingLecture.priority === row.priority &&
        existingLecture.duration_seconds === row.durationSeconds;

      if (isUnchanged) return { isInsert: false, isUpdate: false, isUnchanged: true };

      const { error: updateErr } = await supabaseAdmin
        .from('lectures')
        .update({
          title: row.lectureTitle,
          subtopic_id: subtopicId,
          course_id: courseId,
          lecture_order: row.lectureOrder,
          priority: row.priority,
          notes: row.notes ?? null,
          duration_seconds: row.durationSeconds,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingLecture.id);

      if (updateErr) throw new Error(`Lecture update failed: ${updateErr.message}`);
      return { isInsert: false, isUpdate: true, isUnchanged: false };
    }

    const { error: insertErr } = await supabaseAdmin.from('lectures').insert({
      topic_id: topicId,
      subtopic_id: subtopicId,
      course_id: courseId,
      title: row.lectureTitle,
      youtube_video_id: row.youtubeVideoId,
      youtube_url: row.youtubeUrl,
      lecture_order: row.lectureOrder,
      duration_seconds: row.durationSeconds,
      priority: row.priority,
      notes: row.notes ?? null,
      verification_status: 'UNVERIFIED',
    });

    if (insertErr) throw new Error(`Lecture insert failed: ${insertErr.message}`);
    return { isInsert: true, isUpdate: false, isUnchanged: false };
  }

  static async resetStore() {
    await supabaseAdmin.from('lectures').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('subtopics').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('topics').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  }
}
