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

interface ResourceSubject {
  title: string;
  code: string;
  youtubeVideos?: string;
  revisionVideos?: string;
  nptelVideos?: string;
  textbook?: string;
  relevantChapters?: string;
  extraLinks?: { title: string; url: string }[];
}

const resources: ResourceSubject[] = [
  {
    title: 'Operating System',
    code: 'CS_OS',
    youtubeVideos: 'https://youtube.com/playlist?list=PLG9aCp4uE-s17rFjWM8KchGlffXgOzzVP&si=ZMitdCTm8l32csO1',
    revisionVideos: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHixlIaarIXGPy-eggJQMxd_&si=RYjiG6Ewmyszn0Mv',
    nptelVideos: 'https://youtube.com/playlist?list=PLyqSpQzTE6M9SYI5RqwFYtFYab94gJpWk&si=zMmUw6nYg5o4ZG0A',
    textbook: 'Operating Systems by Avi Silberschatz, Greg Gagne, and Peter Baer Galvin (International 9E)',
    relevantChapters: 'ch 2.1-2.5, 3, 4.1-4.3, 4.6, 5.1-5.3, 6.1-6.10, 7, 8.1-8.6, 91.-9.6, 9.9, 10, 11.1-11.5, 12.1-12.6',
    extraLinks: [
      { title: 'GATEOverflow PYQ PDF', url: 'https://github.com/GATEOverflow/GO-PDFs/releases/tag/gatecse-2025' },
    ],
  },
  {
    title: 'Computer Organization and Architecture (COA)',
    code: 'CS_COA',
    youtubeVideos: 'https://youtube.com/playlist?list=PLG9aCp4uE-s0xddCBjwMDnEVyc523WbA2&si=MhOhWHFeKSPLCc3D',
    revisionVideos: 'https://youtube.com/playlist?list=PLG9aCp4uE-s2qCKKu2XD3zDK-NFEvE91n&si=3F_wVgi9yxcNRAGM',
    nptelVideos: 'https://youtube.com/playlist?list=PLgHucKw979AvcnTpPNZMZyORdL5HvTr9m&si=45QV0I_l38BhQs8l',
    textbook: 'Computer Organisation by Carl Hamacher / David A Patterson and John L. Hennessy (5E)',
    relevantChapters: 'ch 1.6, 2.1-2.5, 2.9, 2.10, 4.1-4.2, 4.4-4.6, 5.1, 5.2, 5.4-5.8, 6.1-6.4, 7, 8.1-8.5',
  },
  {
    title: 'Computer Network (CN)',
    code: 'CS_CN',
    youtubeVideos: 'https://youtube.com/playlist?list=PLC36xJgs4dxHT-TxTy3U1slr5RaBJGaLd&si=2NKdNOM8SCj7GV7m',
    revisionVideos: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHim3NUSNOb7ffyhaE5MSkmE&si=K_BGtR_91PzzpPRK',
    nptelVideos: 'https://youtube.com/playlist?list=PLbRMhDVUMngf-peFloB7kyiA40EptH1up&si=DrRWF-OoBVLFpV4b',
    textbook: 'Data Communications and Networking by Behrouz A. Forouzan (5E)',
    relevantChapters: '1.1-1.3, 2, 3.6, 8-10, 11.1-2, 12, 13.1-13.2, 17.1, 18-19.2, 20-21.2, 23-24.3, 25.1-25.2, 26',
    extraLinks: [
      { title: 'Jim Kurose CN Videos', url: 'https://www.youtube.com/@JimKurose/videos' },
    ],
  },
  {
    title: 'Compiler Design (CD)',
    code: 'CS_CD',
    youtubeVideos: 'https://youtube.com/playlist?list=PLEbnTDJUr_IcPtUXFy2b1sGRPsLFMghhS&si=9gh9zkll_uPxONSj',
    revisionVideos: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHjy3eH_qRImIs5dVUTpr9ga&si=5qmgBYDkFhvkZgZH',
    nptelVideos: 'https://youtube.com/playlist?list=PL54i8TI-dREaHgsBFNalWnz-bC9CZkOBb&si=G65o3fHjR549Y2OJ',
    textbook: 'Compilers: Principles, Techniques, & Tools (Dragon Book by Aho, Sethi, Ullman)',
    extraLinks: [
      { title: 'Stanford Compilers Course by Alex Aiken', url: 'https://www.edx.org/learn/computer-science/stanford-university-compilers' },
    ],
  },
  {
    title: 'Theory of Computation (TOC)',
    code: 'CS_TOC',
    youtubeVideos: 'https://youtube.com/playlist?list=PLC36xJgs4dxGvebewU4z2CZYo-8nB93E7&si=iKAopfWszFTAf1eL',
    revisionVideos: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHhXeEdbXsi34ePvUjL8I-Q9&si=xymd0FQXQQYK6idE',
    nptelVideos: 'https://youtube.com/playlist?list=PLbRMhDVUMngcwWkzVTm_kFH6JW4JCtAUM&si=Vzf6zkHe9Ly7_NXi',
    textbook: 'An Introduction to Formal Languages and Automata by Peter Linz (6E)',
    relevantChapters: 'ch 1.2, 1.3, 2-12, Appendix-A',
  },
  {
    title: 'C-Programming',
    code: 'CS_CPROG',
    youtubeVideos: 'https://youtube.com/playlist?list=PLbE3-5DBkMUkATaUFgDIpBDbfnym0qvsQ&si=tLgWVRmDfwlMCbvj',
    nptelVideos: 'https://youtube.com/playlist?list=PLEAYkSg4uSQ2k6GwNhpgSHodGT8wfvgwu&si=3Yo1XGiLn7ZURbpm',
    textbook: 'The C Programming Language by Brian Kernighan and Dennis Ritchie (2E)',
    relevantChapters: 'ch 1-8',
  },
  {
    title: 'Data Structures (DS)',
    code: 'CS_DS',
    youtubeVideos: 'https://youtube.com/playlist?list=PLIC0AxWOdm5BvHpI_AtPqqjoADnSqcYgp&si=q_Qps7uYmU2RjuLr',
    revisionVideos: 'https://youtube.com/playlist?list=PLG9aCp4uE-s3Rs4AjzG0VcXQCggmOJJ6W&si=YgSf-sgQNlmT2tBd',
    nptelVideos: 'https://youtube.com/playlist?list=PLBF3763AF2E1C572F&si=oiRSnIiN4ntMIPQL',
    textbook: 'Data Structures And Algorithms Made Easy by Narasimha Karumanchi',
  },
  {
    title: 'Algorithms',
    code: 'CS_ALGO',
    youtubeVideos: 'https://youtube.com/playlist?list=PLAXnLdrLnQpRcveZTtD644gM9uzYqJCwr&si=U_A4tdPO33X3xV8I',
    revisionVideos: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHjUCHdJp-_soSSmhgmO4i0T&si=5LN5dM51DjRDMOJ1',
    nptelVideos: 'https://youtube.com/playlist?list=PL7DC83C6B3312DF1E&si=pme4ZTL1jou81mt4',
    textbook: 'Introduction to Algorithms by CLRS (3E) / Kleinberg & Tardos',
    relevantChapters: 'ch 1-4, 6-9, 10, 11.1-11.4, 12.1-21.3, 15, 16.1-16.3, 17, 21-25.2',
  },
  {
    title: 'Digital Logic',
    code: 'CS_DIGITAL',
    youtubeVideos: 'https://youtube.com/playlist?list=PLBlnK6fEyqRjMH3mWf6kwqiTbT798eAOm&si=4C0Z9de3YKT4zHeb',
    revisionVideos: 'https://www.youtube.com/live/h-SDoV0_pwQ?si=PmwmIQ__UHWvUorW',
    nptelVideos: 'https://youtube.com/playlist?list=PL803563859BF7ED8C&si=OXD8r2PBFbS6gbcC',
    textbook: 'Digital Logic and Computer Design by M. Morris Mano',
    relevantChapters: '1.1-1.8, 2.1-2.7, 3-7',
  },
  {
    title: 'Database Management System (DBMS)',
    code: 'CS_DBMS',
    youtubeVideos: 'https://youtube.com/playlist?list=PLG9aCp4uE-s0bu-I8fgDXXhVLO4qVROGy&si=5Iies1OyzDGms31i',
    revisionVideos: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHh3otU-TnAK-GkqrvvOO33C&si=8Kazn74m30yhUDvh',
    nptelVideos: 'https://youtube.com/playlist?list=PL-wVMhlYPDDkRQ0XrQ8IuslSiAWPpSfuJ&si=wEyZRgIxdNZgyqXE',
    textbook: 'Fundamentals of Database Systems by Elmasri and Navathe (7E)',
    relevantChapters: 'ch 1.3-1.6, 2.1-2.3, 3, 5-8, 9.1, 14.1-14.5, 15.1-15.4, 16.1-16.7, 17.1-17.6, 20.1-20.5',
  },
  {
    title: 'Discrete Maths',
    code: 'CS_DISCRETE',
    youtubeVideos: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHillKxh1_iFeZhy9MftHeWW&si=4om73pMxQvuToQvh',
    revisionVideos: 'https://youtube.com/playlist?list=PL3eEXnCBViH-WZfR3PRFfYs7WjUgcBlAZ&si=_QvuJAWFGK_Dswby',
    nptelVideos: 'https://youtube.com/playlist?list=PLgMDNELGJ1Ca7hpEIYtWvMXKcTx88OD2O&si=1WcmQtcIG0sFqSlg',
    textbook: 'Discrete Mathematics and Its Applications by Kenneth H. Rosen (7E)',
    relevantChapters: 'ch 1, 2, 4-8, 11.1-11.3',
  },
  {
    title: 'Linear Algebra (LA)',
    code: 'CS_MATH_LA',
    youtubeVideos: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHhGLQ1ZT37KLpBMAD90CM4_&si=VpylHczkW8ylqspx',
    revisionVideos: 'https://www.youtube.com/live/7vdSWFVKzZg?si=STl2XSSu8T7S_Iaw',
    nptelVideos: 'https://youtube.com/playlist?list=PLFW6lRTa1g80fZ1giRbqbe_XdXPdkkyqY&si=l3-KeMND-CfmrJzv',
    extraLinks: [
      { title: 'Essence of Linear Algebra (3Blue1Brown)', url: 'https://youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab&si=YAaXZ9srWqvlpwz8' },
    ],
  },
  {
    title: 'Probability',
    code: 'CS_MATH_PROB',
    youtubeVideos: 'https://youtube.com/playlist?list=PLhLZ_zxDsyOIKbQfKFM05BLYRhUZ7JP-M&si=PhhEGh77ahUsqikf',
    revisionVideos: 'https://youtu.be/_nuQwy9DGmw?si=rr7WOwRJ_F0Qqjn8',
    nptelVideos: 'https://youtube.com/playlist?list=PLyqSpQzTE6M9SYI5RqwFYtFYab94gJpWk&si=zMmUw6nYg5o4ZG0A',
    textbook: 'Introduction to Probability Models by Sheldon M. Ross / probabilitycourse.com',
  },
  {
    title: 'Calculus',
    code: 'CS_MATH_CALC',
    youtubeVideos: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHi3R5H_NDKCB3aGvtLYlLrz&si=DGxz1haxSAbWSEsq',
    revisionVideos: 'https://youtube.com/playlist?list=PLIPZ2_p3RNHi3R5H_NDKCB3aGvtLYlLrz&si=DGxz1haxSAbWSEsq',
    nptelVideos: 'https://youtube.com/playlist?list=PLEAYkSg4uSQ0q9CDkHkJGdUTQOgH1DLDj&si=Rt5U9aaad4jiXdT_',
    extraLinks: [
      { title: 'Khan Academy Calculus 1', url: 'https://www.khanacademy.org/math/calculus-1' },
    ],
  },
];

export async function seedAir13Resources() {
  console.log('Seeding Anjali (GATE AIR 13) curated video resources...');

  // Clean old video_resources and lectures to ensure clean playlist IDs
  await supabase.from('video_resources').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  for (let idx = 0; idx < resources.length; idx++) {
    const res = resources[idx];

    // 1. Upsert Subject
    const { data: subjectData, error: subErr } = await supabase
      .from('subjects')
      .upsert(
        {
          title: res.title,
          code: res.code,
          weightage_marks: 8.5,
          order_index: idx + 1,
        },
        { onConflict: 'code' }
      )
      .select('id')
      .single();

    if (subErr || !subjectData) {
      console.error(`Error upserting subject ${res.title}:`, subErr?.message);
      continue;
    }
    const subjectId = subjectData.id;

    // 2. Upsert default Topic for Subject
    const { data: topicData, error: topErr } = await supabase
      .from('topics')
      .upsert(
        {
          subject_id: subjectId,
          title: `${res.title} Full Course & Problem Solving`,
          code: `${res.code}_FULL`,
          order_index: 1,
        },
        { onConflict: 'subject_id,title' }
      )
      .select('id')
      .single();

    if (topErr) {
      console.error(`Error upserting topic for ${res.title}:`, topErr.message);
    }

    const topicId = topicData?.id;

    // 3. Insert Main Youtube Video Course
    if (res.youtubeVideos && topicId) {
      const playlistId = res.youtubeVideos.match(/list=([a-zA-Z0-9_-]+)/)?.[1] || 'PL_DEFAULT';
      
      // Upsert Course
      const { data: courseData } = await supabase
        .from('courses')
        .upsert(
          {
            title: `${res.title} Complete Video Course (AIR 13 Recommended)`,
            teacher_name: 'GATE Expert Faculty (Curated by Anjali AIR 13)',
          },
          { onConflict: 'title,teacher_name' }
        )
        .select('id')
        .single();

      // Upsert Lecture with untruncated playlistId
      await supabase.from('lectures').upsert(
        {
          topic_id: topicId,
          course_id: courseData?.id || null,
          title: `${res.title} Full Playlist & Conceptual Lectures`,
          youtube_video_id: playlistId,
          youtube_url: res.youtubeVideos,
          lecture_order: 1,
          duration_seconds: 36000,
          priority: 'HIGH',
          verification_status: 'VERIFIED',
          notes: res.relevantChapters ? `Book: ${res.textbook}. Chapters: ${res.relevantChapters}` : res.textbook,
        },
        { onConflict: 'topic_id,youtube_video_id' }
      );

      // Insert into video_resources table
      await supabase.from('video_resources').insert({
        subject_id: subjectId,
        topic_id: topicId,
        platform: 'YOUTUBE',
        external_video_id: playlistId,
        title: `${res.title} Youtube Playlist`,
        channel_name: 'Curated Free Video Series',
        quality_status: 'APPROVED',
        verification_status: 'VERIFIED',
        availability_status: 'AVAILABLE',
      });
    }

    // 4. Insert Revision / PYQs Video Resource
    if (res.revisionVideos && topicId) {
      const revMatch = res.revisionVideos.match(/list=([a-zA-Z0-9_-]+)/) || res.revisionVideos.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
      const revId = revMatch?.[1] || res.revisionVideos;
      await supabase.from('video_resources').insert({
        subject_id: subjectId,
        topic_id: topicId,
        platform: 'YOUTUBE',
        external_video_id: revId,
        title: `${res.title} Revision and PYQs Video Solution`,
        channel_name: 'PYQ & Fast Revision Solutions',
        quality_status: 'APPROVED',
        verification_status: 'VERIFIED',
        availability_status: 'AVAILABLE',
      });
    }

    // 5. Insert NPTEL Video Resource
    if (res.nptelVideos && topicId) {
      const nptelMatch = res.nptelVideos.match(/list=([a-zA-Z0-9_-]+)/) || res.nptelVideos.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
      const nptelId = nptelMatch?.[1] || res.nptelVideos;
      await supabase.from('video_resources').insert({
        subject_id: subjectId,
        topic_id: topicId,
        platform: 'YOUTUBE',
        external_video_id: nptelId,
        title: `${res.title} NPTEL IIT Video Lectures`,
        channel_name: 'NPTEL HRD IIT Lectures',
        quality_status: 'APPROVED',
        verification_status: 'VERIFIED',
        availability_status: 'AVAILABLE',
      });
    }
  }

  console.log('Anjali (GATE AIR 13) video resources successfully seeded into Supabase with full untruncated IDs!');
}
