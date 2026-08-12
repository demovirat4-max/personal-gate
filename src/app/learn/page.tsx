'use client';

import React, { useState } from 'react';
import { AiAssistantModal } from '@/components/ai/ai-assistant-modal';

// ─── Spreadsheet data: Anjali (GATE AIR 13) & Nikhil Dhama (GATE AIR 8) ───────
const SUBJECTS = [
  {
    code: 'OS',
    title: 'Operating System',
    color: 'cyan',
    textbook: 'Operating Systems by Avi Silberschatz (9E)',
    chapters: 'ch 2.1-2.5, 3, 4.1-4.3, 5.1-5.3, 6.1-6.10, 7, 8, 9, 10, 11',
    playlists: [
      { label: '🎬 Full Course', type: 'MAIN', id: 'PLG9aCp4uE-s17rFjWM8KchGlffXgOzzVP' },
      { label: '⚡ Revision & PYQs', type: 'REVISION', id: 'PLIPZ2_p3RNHixlIaarIXGPy-eggJQMxd_' },
      { label: '🎓 NPTEL IIT', type: 'NPTEL', id: 'PLyqSpQzTE6M9SYI5RqwFYtFYab94gJpWk' },
    ],
  },
  {
    code: 'COA',
    title: 'Computer Organization & Architecture',
    color: 'purple',
    textbook: 'Computer Organisation by Carl Hamacher / Patterson & Hennessy',
    chapters: 'ch 1.6, 2.1-2.5, 4.1-4.6, 5.1-5.8, 6, 7, 8',
    playlists: [
      { label: '🎬 Full Course', type: 'MAIN', id: 'PLG9aCp4uE-s0xddCBjwMDnEVyc523WbA2' },
      { label: '⚡ Revision & PYQs', type: 'REVISION', id: 'PLG9aCp4uE-s2qCKKu2XD3zDK-NFEvE91n' },
      { label: '🎓 NPTEL IIT', type: 'NPTEL', id: 'PLgHucKw979AvcnTpPNZMZyORdL5HvTr9m' },
    ],
  },
  {
    code: 'CN',
    title: 'Computer Networks',
    color: 'emerald',
    textbook: 'Data Communications and Networking by Behrouz A. Forouzan (5E)',
    chapters: 'ch 1.1-1.3, 2, 8-10, 11-13, 18-21, 23-26',
    playlists: [
      { label: '🎬 Full Course', type: 'MAIN', id: 'PLC36xJgs4dxHT-TxTy3U1slr5RaBJGaLd' },
      { label: '⚡ Revision & PYQs', type: 'REVISION', id: 'PLIPZ2_p3RNHim3NUSNOb7ffyhaE5MSkmE' },
      { label: '🎓 NPTEL IIT', type: 'NPTEL', id: 'PLbRMhDVUMngf-peFloB7kyiA40EptH1up' },
    ],
  },
  {
    code: 'CD',
    title: 'Compiler Design',
    color: 'rose',
    textbook: 'Compilers: Principles, Techniques, & Tools (Dragon Book)',
    chapters: 'ch 1-4, 5 (SDT), 6 (IR), 7 (Runtime Env), 8 (Code Gen)',
    playlists: [
      { label: '🎬 Full Course', type: 'MAIN', id: 'PLEbnTDJUr_IcPtUXFy2b1sGRPsLFMghhS' },
      { label: '⚡ Revision & PYQs', type: 'REVISION', id: 'PLIPZ2_p3RNHjy3eH_qRImIs5dVUTpr9ga' },
      { label: '🎓 NPTEL IIT', type: 'NPTEL', id: 'PL54i8TI-dREaHgsBFNalWnz-bC9CZkOBb' },
    ],
  },
  {
    code: 'TOC',
    title: 'Theory of Computation',
    color: 'amber',
    textbook: 'An Introduction to Formal Languages and Automata by Peter Linz (6E)',
    chapters: 'ch 1.2, 1.3, 2-12, Appendix-A',
    playlists: [
      { label: '🎬 Full Course', type: 'MAIN', id: 'PLC36xJgs4dxGvebewU4z2CZYo-8nB93E7' },
      { label: '⚡ Revision & PYQs', type: 'REVISION', id: 'PLIPZ2_p3RNHhXeEdbXsi34ePvUjL8I-Q9' },
      { label: '🎓 NPTEL IIT', type: 'NPTEL', id: 'PLbRMhDVUMngcwWkzVTm_kFH6JW4JCtAUM' },
    ],
  },
  {
    code: 'CPROG',
    title: 'C-Programming',
    color: 'sky',
    textbook: 'The C Programming Language by Kernighan & Ritchie (2E)',
    chapters: 'ch 1-8',
    playlists: [
      { label: '🎬 Full Course', type: 'MAIN', id: 'PLbE3-5DBkMUkATaUFgDIpBDbfnym0qvsQ' },
      { label: '🎓 NPTEL IIT', type: 'NPTEL', id: 'PLEAYkSg4uSQ2k6GwNhpgSHodGT8wfvgwu' },
    ],
  },
  {
    code: 'DS',
    title: 'Data Structures',
    color: 'violet',
    textbook: 'Data Structures And Algorithms Made Easy by Narasimha Karumanchi',
    chapters: 'Arrays, LL, Stack, Queue, Trees, Graphs, Hashing',
    playlists: [
      { label: '🎬 Full Course', type: 'MAIN', id: 'PLIC0AxWOdm5BvHpI_AtPqqjoADnSqcYgp' },
      { label: '⚡ Revision & PYQs', type: 'REVISION', id: 'PLG9aCp4uE-s3Rs4AjzG0VcXQCggmOJJ6W' },
      { label: '🎓 NPTEL IIT', type: 'NPTEL', id: 'PLBF3763AF2E1C572F' },
    ],
  },
  {
    code: 'ALGO',
    title: 'Algorithms',
    color: 'fuchsia',
    textbook: 'Introduction to Algorithms by CLRS (3E)',
    chapters: 'ch 1-4, 6-9, 10, 11-17, 21-25',
    playlists: [
      { label: '🎬 Full Course', type: 'MAIN', id: 'PLAXnLdrLnQpRcveZTtD644gM9uzYqJCwr' },
      { label: '⚡ Revision & PYQs', type: 'REVISION', id: 'PLIPZ2_p3RNHjUCHdJp-_soSSmhgmO4i0T' },
      { label: '🎓 NPTEL IIT', type: 'NPTEL', id: 'PL7DC83C6B3312DF1E' },
    ],
  },
  {
    code: 'DL',
    title: 'Digital Logic',
    color: 'teal',
    textbook: 'Digital Logic and Computer Design by M. Morris Mano',
    chapters: 'ch 1.1-1.8, 2.1-2.7, 3-7',
    playlists: [
      { label: '🎬 Full Course', type: 'MAIN', id: 'PLBlnK6fEyqRjMH3mWf6kwqiTbT798eAOm' },
      { label: '🎓 NPTEL IIT', type: 'NPTEL', id: 'PL803563859BF7ED8C' },
    ],
  },
  {
    code: 'DBMS',
    title: 'Database Management System',
    color: 'orange',
    textbook: 'Fundamentals of Database Systems by Elmasri & Navathe (7E)',
    chapters: 'ch 1.3-1.6, 2, 3, 5-8, 14, 15-17, 20-21',
    playlists: [
      { label: '🎬 Full Course', type: 'MAIN', id: 'PLG9aCp4uE-s0bu-I8fgDXXhVLO4qVROGy' },
      { label: '⚡ Revision & PYQs', type: 'REVISION', id: 'PLIPZ2_p3RNHh3otU-TnAK-GkqrvvOO33C' },
      { label: '🎓 NPTEL IIT', type: 'NPTEL', id: 'PL-wVMhlYPDDkRQ0XrQ8IuslSiAWPpSfuJ' },
    ],
  },
  {
    code: 'DISCRETE',
    title: 'Discrete Mathematics',
    color: 'lime',
    textbook: 'Discrete Mathematics and Its Applications by Kenneth H. Rosen (7E)',
    chapters: 'ch 1, 2, 4-8, 11',
    playlists: [
      { label: '🎬 Full Course', type: 'MAIN', id: 'PLIPZ2_p3RNHillKxh1_iFeZhy9MftHeWW' },
      { label: '⚡ Revision & PYQs', type: 'REVISION', id: 'PL3eEXnCBViH-WZfR3PRFfYs7WjUgcBlAZ' },
      { label: '🎓 NPTEL IIT', type: 'NPTEL', id: 'PLgMDNELGJ1Ca7hpEIYtWvMXKcTx88OD2O' },
    ],
  },
  {
    code: 'LA',
    title: 'Linear Algebra',
    color: 'indigo',
    textbook: 'Essence of Linear Algebra (3Blue1Brown) + Standard Textbooks',
    chapters: 'Vectors, Matrices, Determinants, Eigenvalues & Eigenvectors',
    playlists: [
      { label: '🎬 Full Course', type: 'MAIN', id: 'PLIPZ2_p3RNHhGLQ1ZT37KLpBMAD90CM4_' },
      { label: '⚡ 3Blue1Brown Visual', type: 'REVISION', id: 'PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab' },
      { label: '🎓 NPTEL IIT', type: 'NPTEL', id: 'PLFW6lRTa1g80fZ1giRbqbe_XdXPdkkyqY' },
    ],
  },
  {
    code: 'PROB',
    title: 'Probability & Statistics',
    color: 'pink',
    textbook: 'Introduction to Probability Models by Sheldon M. Ross',
    chapters: 'ch 1-7',
    playlists: [
      { label: '🎬 Full Course', type: 'MAIN', id: 'PLhLZ_zxDsyOIKbQfKFM05BLYRhUZ7JP-M' },
      { label: '🎓 NPTEL IIT', type: 'NPTEL', id: 'PLEAYkSg4uSQ3hi6K_4sLMOnEKQ8bZuDEZ' },
    ],
  },
  {
    code: 'CALC',
    title: 'Calculus',
    color: 'yellow',
    textbook: 'Calculus by Stewart / Khan Academy Series',
    chapters: 'Limits, Derivatives, Integrals, Maxima Minima',
    playlists: [
      { label: '🎬 Full Course', type: 'MAIN', id: 'PLIPZ2_p3RNHi3R5H_NDKCB3aGvtLYlLrz' },
      { label: '🎓 NPTEL IIT', type: 'NPTEL', id: 'PLEAYkSg4uSQ0q9CDkHkJGdUTQOgH1DLDj' },
    ],
  },
];

type PlaylistEntry = { label: string; type: string; id: string };
type Subject = (typeof SUBJECTS)[number];

const COLOR_MAP: Record<string, string> = {
  cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  purple: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  rose: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  amber: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  sky: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  violet: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
  fuchsia: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30',
  teal: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
  orange: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
  lime: 'bg-lime-500/10 text-lime-300 border-lime-500/30',
  indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
  pink: 'bg-pink-500/10 text-pink-300 border-pink-500/30',
  yellow: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
};

export default function LearnPage() {
  const [selectedSubject, setSelectedSubject] = useState<Subject>(SUBJECTS[0]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistEntry>(SUBJECTS[0].playlists[0]);
  const [showTextbooks, setShowTextbooks] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const embedUrl = `https://www.youtube.com/embed/videoseries?list=${selectedPlaylist.id}&autoplay=0&rel=0&modestbranding=1`;

  const accentClass = COLOR_MAP[selectedSubject.color] || COLOR_MAP['cyan'];

  function selectSubject(subj: Subject) {
    setSelectedSubject(subj);
    setSelectedPlaylist(subj.playlists[0]);
    setShowTextbooks(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              GATE 2028 Video Library
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:block">
              Curated by Anjali (AIR 13) &amp; Nikhil Dhama (AIR 8)
            </span>
          </div>
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-semibold rounded-xl shadow transition"
          >
            ✨ AI Study Actions
          </button>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* ── Left Sidebar: Subject List ────────────────────────────── */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest">14 GATE Subjects</h2>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-180px)] divide-y divide-slate-800/50">
              {SUBJECTS.map((subj) => {
                const active = selectedSubject.code === subj.code;
                const cls = COLOR_MAP[subj.color] || COLOR_MAP['cyan'];
                return (
                  <button
                    key={subj.code}
                    onClick={() => selectSubject(subj)}
                    className={`w-full text-left px-4 py-3 transition flex items-center space-x-3 ${
                      active
                        ? `${cls} bg-opacity-20 font-semibold`
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded border ${active ? cls : 'border-slate-700 text-slate-500'}`}
                    >
                      {subj.code}
                    </span>
                    <span className="text-xs leading-tight">{subj.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ── Main Area ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 space-y-5">
          {/* Subject title + playlist tabs */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-black text-slate-100">{selectedSubject.title}</h1>
              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${accentClass}`}>
                {selectedSubject.code}
              </span>
            </div>

            {/* Playlist tab strip */}
            <div className="flex flex-wrap gap-2">
              {selectedSubject.playlists.map((pl) => {
                const active = selectedPlaylist.id === pl.id && !showTextbooks;
                return (
                  <button
                    key={pl.id}
                    onClick={() => {
                      setSelectedPlaylist(pl);
                      setShowTextbooks(false);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      active ? accentClass : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
                    }`}
                  >
                    {pl.label}
                  </button>
                );
              })}
              <button
                onClick={() => setShowTextbooks(true)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  showTextbooks
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
                }`}
              >
                📚 Textbooks Guide
              </button>
            </div>
          </div>

          {/* ── Embedded Player or Textbook Panel ─────────────────── */}
          {!showTextbooks ? (
            <div className="space-y-4">
              {/* Playlist info bar */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="text-xs text-slate-400">
                  <span className="text-slate-300 font-semibold">{selectedPlaylist.label}</span>
                  <span className="mx-2 text-slate-600">·</span>
                  <span>Full playlist · all videos accessible inside player</span>
                </div>
                <a
                  href={`https://www.youtube.com/playlist?list=${selectedPlaylist.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-500 hover:text-cyan-400 transition underline"
                >
                  Open playlist on YouTube ↗
                </a>
              </div>

              {/* ★ The actual embedded iframe ★ */}
              <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  key={selectedPlaylist.id}
                  src={embedUrl}
                  title={`${selectedSubject.title} — ${selectedPlaylist.label}`}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* How-to hint */}
              <p className="text-xs text-slate-500 leading-relaxed">
                💡 <strong className="text-slate-400">All videos are inside this player.</strong> Click the playlist icon
                (☰) inside the top-right corner of the player to browse and switch between individual videos in the
                playlist — no need to open YouTube.
              </p>
            </div>
          ) : (
            /* ── Textbook Guide Panel ──────────────────────────────── */
            <div className="space-y-5 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
                  AIR 8 &amp; AIR 13 Recommended Resources
                </div>
                <h2 className="text-lg font-black text-slate-100">{selectedSubject.title} — Books &amp; Chapters</h2>
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-amber-300">📖 Standard Textbook</h3>
                <p className="text-sm text-slate-300 font-mono leading-relaxed">{selectedSubject.textbook}</p>
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-cyan-300">📑 GATE-Relevant Chapters</h3>
                <p className="text-sm text-slate-300 font-mono leading-relaxed">{selectedSubject.chapters}</p>
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-emerald-300">🔗 Extra GATE Resources</h3>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li>
                    • GATEOverflow Topicwise PYQs:{' '}
                    <a
                      href="https://github.com/GATEOverflow/GO-PDFs/releases/tag/gatecse-2025"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 underline hover:text-cyan-300"
                    >
                      View Official PDFs
                    </a>
                  </li>
                  <li>
                    • AIR 13 Google Sheet:{' '}
                    <a
                      href="https://docs.google.com/spreadsheets/d/1As59CVH3AVzfKhK0t_Aw3rmF6RY9i2E-e0q2r349LwA/edit"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 underline hover:text-cyan-300"
                    >
                      Open Full Resource Sheet
                    </a>
                  </li>
                  <li>
                    • Standard Book Notes:{' '}
                    <a
                      href="https://drive.google.com/drive/folders/1oGCYictHLqXE1skdkJ8PnaefBnLrRXwG"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 underline hover:text-cyan-300"
                    >
                      Google Drive Notes
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </main>
      </div>

      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        sourceId={selectedPlaylist.id}
        title={`AI Actions: ${selectedSubject.title} — ${selectedPlaylist.label}`}
      />
    </div>
  );
}
