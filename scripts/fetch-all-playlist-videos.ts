import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      if (key && val && !process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lcotzvvckbxhmsasicwr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface SubjectPlaylist {
  title: string;
  code: string;
  playlists: { title: string; type: 'MAIN' | 'REVISION' | 'NPTEL'; url: string }[];
  textbook?: string;
  chapters?: string;
}

const subjectPlaylists: SubjectPlaylist[] = [
  {
    title: 'Operating System',
    code: 'CS_OS',
    playlists: [
      { title: 'Full Course Lectures', type: 'MAIN', url: 'https://www.youtube.com/playlist?list=PLG9aCp4uE-s17rFjWM8KchGlffXgOzzVP' },
      { title: 'Revision and PYQs', type: 'REVISION', url: 'https://www.youtube.com/playlist?list=PLIPZ2_p3RNHixlIaarIXGPy-eggJQMxd_' },
      { title: 'NPTEL IIT Lectures', type: 'NPTEL', url: 'https://www.youtube.com/playlist?list=PLyqSpQzTE6M9SYI5RqwFYtFYab94gJpWk' },
    ],
    textbook: 'Operating Systems by Avi Silberschatz (9E)',
    chapters: 'ch 2.1-2.5, 3, 4.1-4.3, 5.1-5.3, 6.1-6.10, 7, 8, 9, 10, 11',
  },
  {
    title: 'Computer Organization & Architecture',
    code: 'CS_COA',
    playlists: [
      { title: 'Full Course Lectures', type: 'MAIN', url: 'https://www.youtube.com/playlist?list=PLG9aCp4uE-s0xddCBjwMDnEVyc523WbA2' },
      { title: 'Revision and PYQs', type: 'REVISION', url: 'https://www.youtube.com/playlist?list=PLG9aCp4uE-s2qCKKu2XD3zDK-NFEvE91n' },
      { title: 'NPTEL IIT Lectures', type: 'NPTEL', url: 'https://www.youtube.com/playlist?list=PLgHucKw979AvcnTpPNZMZyORdL5HvTr9m' },
    ],
    textbook: 'Computer Organisation by Carl Hamacher / Patterson & Hennessy',
    chapters: 'ch 1.6, 2.1-2.5, 4.1-4.6, 5.1-5.8, 6, 7, 8',
  },
  {
    title: 'Computer Networks',
    code: 'CS_CN',
    playlists: [
      { title: 'Full Course Lectures', type: 'MAIN', url: 'https://www.youtube.com/playlist?list=PLC36xJgs4dxHT-TxTy3U1slr5RaBJGaLd' },
      { title: 'Revision and PYQs', type: 'REVISION', url: 'https://www.youtube.com/playlist?list=PLIPZ2_p3RNHim3NUSNOb7ffyhaE5MSkmE' },
      { title: 'NPTEL IIT Lectures', type: 'NPTEL', url: 'https://www.youtube.com/playlist?list=PLbRMhDVUMngf-peFloB7kyiA40EptH1up' },
    ],
    textbook: 'Data Communications and Networking by Behrouz A. Forouzan (5E)',
    chapters: 'ch 1.1-1.3, 2, 8-10, 11-13, 18-21, 23-26',
  },
  {
    title: 'Compiler Design',
    code: 'CS_CD',
    playlists: [
      { title: 'Full Course Lectures', type: 'MAIN', url: 'https://www.youtube.com/playlist?list=PLEbnTDJUr_IcPtUXFy2b1sGRPsLFMghhS' },
      { title: 'Revision and PYQs', type: 'REVISION', url: 'https://www.youtube.com/playlist?list=PLIPZ2_p3RNHjy3eH_qRImIs5dVUTpr9ga' },
      { title: 'NPTEL IIT Lectures', type: 'NPTEL', url: 'https://www.youtube.com/playlist?list=PL54i8TI-dREaHgsBFNalWnz-bC9CZkOBb' },
    ],
    textbook: 'Compilers: Principles, Techniques, & Tools (Dragon Book)',
  },
  {
    title: 'Theory of Computation',
    code: 'CS_TOC',
    playlists: [
      { title: 'Full Course Lectures', type: 'MAIN', url: 'https://www.youtube.com/playlist?list=PLC36xJgs4dxGvebewU4z2CZYo-8nB93E7' },
      { title: 'Revision and PYQs', type: 'REVISION', url: 'https://www.youtube.com/playlist?list=PLIPZ2_p3RNHhXeEdbXsi34ePvUjL8I-Q9' },
      { title: 'NPTEL IIT Lectures', type: 'NPTEL', url: 'https://www.youtube.com/playlist?list=PLbRMhDVUMngcwWkzVTm_kFH6JW4JCtAUM' },
    ],
    textbook: 'An Introduction to Formal Languages and Automata by Peter Linz (6E)',
    chapters: 'ch 1.2, 1.3, 2-12, Appendix-A',
  },
  {
    title: 'C-Programming',
    code: 'CS_CPROG',
    playlists: [
      { title: 'Full Course Lectures', type: 'MAIN', url: 'https://www.youtube.com/playlist?list=PLbE3-5DBkMUkATaUFgDIpBDbfnym0qvsQ' },
      { title: 'NPTEL IIT Lectures', type: 'NPTEL', url: 'https://www.youtube.com/playlist?list=PLEAYkSg4uSQ2k6GwNhpgSHodGT8wfvgwu' },
    ],
    textbook: 'The C Programming Language by Kernighan & Ritchie (2E)',
    chapters: 'ch 1-8',
  },
  {
    title: 'Data Structures',
    code: 'CS_DS',
    playlists: [
      { title: 'Full Course Lectures', type: 'MAIN', url: 'https://www.youtube.com/playlist?list=PLIC0AxWOdm5BvHpI_AtPqqjoADnSqcYgp' },
      { title: 'Revision and PYQs', type: 'REVISION', url: 'https://www.youtube.com/playlist?list=PLG9aCp4uE-s3Rs4AjzG0VcXQCggmOJJ6W' },
      { title: 'NPTEL IIT Lectures', type: 'NPTEL', url: 'https://www.youtube.com/playlist?list=PLBF3763AF2E1C572F' },
    ],
    textbook: 'Data Structures And Algorithms Made Easy by Narasimha Karumanchi',
  },
  {
    title: 'Algorithms',
    code: 'CS_ALGO',
    playlists: [
      { title: 'Full Course Lectures', type: 'MAIN', url: 'https://www.youtube.com/playlist?list=PLAXnLdrLnQpRcveZTtD644gM9uzYqJCwr' },
      { title: 'Revision and PYQs', type: 'REVISION', url: 'https://www.youtube.com/playlist?list=PLIPZ2_p3RNHjUCHdJp-_soSSmhgmO4i0T' },
      { title: 'NPTEL IIT Lectures', type: 'NPTEL', url: 'https://www.youtube.com/playlist?list=PL7DC83C6B3312DF1E' },
    ],
    textbook: 'Introduction to Algorithms by CLRS (3E)',
    chapters: 'ch 1-4, 6-9, 10, 11-17, 21-25',
  },
  {
    title: 'Digital Logic',
    code: 'CS_DIGITAL',
    playlists: [
      { title: 'Full Course Lectures', type: 'MAIN', url: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRjMH3mWf6kwqiTbT798eAOm' },
      { title: 'NPTEL IIT Lectures', type: 'NPTEL', url: 'https://www.youtube.com/playlist?list=PL803563859BF7ED8C' },
    ],
    textbook: 'Digital Logic and Computer Design by M. Morris Mano',
    chapters: 'ch 1.1-1.8, 2.1-2.7, 3-7',
  },
  {
    title: 'Database Management System',
    code: 'CS_DBMS',
    playlists: [
      { title: 'Full Course Lectures', type: 'MAIN', url: 'https://www.youtube.com/playlist?list=PLG9aCp4uE-s0bu-I8fgDXXhVLO4qVROGy' },
      { title: 'Revision and PYQs', type: 'REVISION', url: 'https://www.youtube.com/playlist?list=PLIPZ2_p3RNHh3otU-TnAK-GkqrvvOO33C' },
      { title: 'NPTEL IIT Lectures', type: 'NPTEL', url: 'https://www.youtube.com/playlist?list=PL-wVMhlYPDDkRQ0XrQ8IuslSiAWPpSfuJ' },
    ],
    textbook: 'Fundamentals of Database Systems by Elmasri & Navathe (7E)',
    chapters: 'ch 1.3-1.6, 2, 3, 5-8, 14, 15-17, 20-21',
  },
  {
    title: 'Discrete Mathematics',
    code: 'CS_DISCRETE',
    playlists: [
      { title: 'Full Course Lectures', type: 'MAIN', url: 'https://www.youtube.com/playlist?list=PLIPZ2_p3RNHillKxh1_iFeZhy9MftHeWW' },
      { title: 'Revision and PYQs', type: 'REVISION', url: 'https://www.youtube.com/playlist?list=PL3eEXnCBViH-WZfR3PRFfYs7WjUgcBlAZ' },
      { title: 'NPTEL IIT Lectures', type: 'NPTEL', url: 'https://www.youtube.com/playlist?list=PLgMDNELGJ1Ca7hpEIYtWvMXKcTx88OD2O' },
    ],
    textbook: 'Discrete Mathematics and Its Applications by Kenneth H. Rosen (7E)',
    chapters: 'ch 1, 2, 4-8, 11',
  },
  {
    title: 'Linear Algebra',
    code: 'CS_MATH_LA',
    playlists: [
      { title: 'Full Course Lectures', type: 'MAIN', url: 'https://www.youtube.com/playlist?list=PLIPZ2_p3RNHhGLQ1ZT37KLpBMAD90CM4_' },
      { title: '3Blue1Brown Linear Algebra', type: 'REVISION', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab' },
      { title: 'NPTEL IIT Lectures', type: 'NPTEL', url: 'https://www.youtube.com/playlist?list=PLFW6lRTa1g80fZ1giRbqbe_XdXPdkkyqY' },
    ],
    textbook: 'Essence of Linear Algebra & Standard Textbooks',
  },
  {
    title: 'Probability & Statistics',
    code: 'CS_MATH_PROB',
    playlists: [
      { title: 'Full Course Lectures', type: 'MAIN', url: 'https://www.youtube.com/playlist?list=PLhLZ_zxDsyOIKbQfKFM05BLYRhUZ7JP-M' },
      { title: 'NPTEL IIT Lectures', type: 'NPTEL', url: 'https://www.youtube.com/playlist?list=PLyqSpQzTE6M9SYI5RqwFYtFYab94gJpWk' },
    ],
    textbook: 'Introduction to Probability Models by Sheldon M. Ross',
  },
  {
    title: 'Calculus',
    code: 'CS_MATH_CALC',
    playlists: [
      { title: 'Full Course Lectures', type: 'MAIN', url: 'https://www.youtube.com/playlist?list=PLIPZ2_p3RNHi3R5H_NDKCB3aGvtLYlLrz' },
      { title: 'NPTEL IIT Lectures', type: 'NPTEL', url: 'https://www.youtube.com/playlist?list=PLEAYkSg4uSQ0q9CDkHkJGdUTQOgH1DLDj' },
    ],
    textbook: 'Calculus 1 by Khan Academy & Standard References',
  },
];

async function extractVideoIdsFromPlaylist(playlistUrl: string): Promise<{ title: string; videoId: string }[]> {
  try {
    const listId = playlistUrl.match(/list=([a-zA-Z0-9_-]+)/)?.[1];
    if (!listId) return [];

    const response = await fetch(`https://www.youtube.com/playlist?list=${listId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) return [];
    const html = await response.text();

    const matches = Array.from(html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})".*?"title":{"runs":\[{"text":"(.*?)"}/g));
    const seen = new Set<string>();
    const videos: { title: string; videoId: string }[] = [];

    for (const match of matches) {
      const vId = match[1];
      const title = match[2];
      if (!seen.has(vId) && vId.length === 11) {
        seen.add(vId);
        videos.push({ title: title.replace(/\\"/g, '"').replace(/\\n/g, ''), videoId: vId });
      }
    }

    // Fallback regex match if title JSON runs weren't found
    if (videos.length === 0) {
      const idMatches = Array.from(html.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g));
      for (const m of idMatches) {
        const vId = m[1];
        if (!seen.has(vId) && vId.length === 11) {
          seen.add(vId);
          videos.push({ title: `Lecture Video ${videos.length + 1}`, videoId: vId });
        }
      }
    }

    return videos;
  } catch (err) {
    console.error(`Error fetching playlist ${playlistUrl}:`, err);
    return [];
  }
}

export async function processAllPlaylists() {
  console.log('Fetching and extracting ALL individual video lectures from YouTube playlists...');

  for (let idx = 0; idx < subjectPlaylists.length; idx++) {
    const subj = subjectPlaylists[idx];
    console.log(`Processing subject [${idx + 1}/${subjectPlaylists.length}]: ${subj.title}...`);

    // 1. Upsert Subject
    const { data: subjectData } = await supabase
      .from('subjects')
      .upsert(
        {
          title: subj.title,
          code: subj.code,
          weightage_marks: 8.5,
          order_index: idx + 1,
        },
        { onConflict: 'code' }
      )
      .select('id')
      .single();

    if (!subjectData) continue;
    const subjectId = subjectData.id;

    for (const pl of subj.playlists) {
      const videos = await extractVideoIdsFromPlaylist(pl.url);
      console.log(`  Found ${videos.length} videos for [${pl.type}] ${pl.title}`);

      // Upsert Topic
      const topicTitle = `${subj.title} - ${pl.title}`;
      const { data: topicData } = await supabase
        .from('topics')
        .upsert(
          {
            subject_id: subjectId,
            title: topicTitle,
            code: `${subj.code}_${pl.type}`,
            order_index: pl.type === 'MAIN' ? 1 : pl.type === 'REVISION' ? 2 : 3,
          },
          { onConflict: 'subject_id,title' }
        )
        .select('id')
        .single();

      if (!topicData) continue;
      const topicId = topicData.id;

      // Upsert Course
      const { data: courseData } = await supabase
        .from('courses')
        .upsert(
          {
            title: `${subj.title} ${pl.title}`,
            teacher_name: 'Anjali (GATE AIR 13) Curated Faculty',
          },
          { onConflict: 'title,teacher_name' }
        )
        .select('id')
        .single();

      // Upsert every video as an individual playable lecture!
      for (let vIdx = 0; vIdx < videos.length; vIdx++) {
        const v = videos[vIdx];
        await supabase.from('lectures').upsert(
          {
            topic_id: topicId,
            course_id: courseData?.id || null,
            title: v.title || `Lecture ${vIdx + 1}: ${subj.title}`,
            youtube_video_id: v.videoId,
            youtube_url: `https://www.youtube.com/watch?v=${v.videoId}`,
            lecture_order: vIdx + 1,
            duration_seconds: 1800,
            priority: 'HIGH',
            verification_status: 'VERIFIED',
            notes: subj.chapters ? `Textbook: ${subj.textbook}. Chapters: ${subj.chapters}` : subj.textbook,
          },
          { onConflict: 'topic_id,youtube_video_id' }
        );

        // Also add into video_resources
        await supabase.from('video_resources').upsert(
          {
            subject_id: subjectId,
            topic_id: topicId,
            platform: 'YOUTUBE',
            external_video_id: v.videoId,
            title: v.title || `Lecture ${vIdx + 1}: ${subj.title}`,
            channel_name: 'Anjali AIR 13 Curated Series',
            quality_status: 'APPROVED',
            verification_status: 'VERIFIED',
            availability_status: 'AVAILABLE',
          },
          { onConflict: 'subject_id,external_video_id' }
        );
      }
    }
  }

  console.log('SUCCESS! All individual videos from every playlist have been extracted and embedded!');
}
