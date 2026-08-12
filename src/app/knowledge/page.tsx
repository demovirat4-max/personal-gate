'use client';

import React, { useState } from 'react';
import {
  usePersonalNotes,
  useCreatePersonalNote,
  useFormulas,
  useBookmarks,
  useFlashcardDecks,
} from '@/hooks/use-knowledge';
import { BookOpen, Layers, Bookmark, Code, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function KnowledgePage() {
  const { data: notes, isLoading: notesLoading } = usePersonalNotes();
  const { data: formulas } = useFormulas();
  const { data: bookmarks } = useBookmarks();
  const { data: decks } = useFlashcardDecks();

  const createNoteMutation = useCreatePersonalNote();
  const [activeTab, setActiveTab] = useState<'notes' | 'formulas' | 'bookmarks' | 'decks'>('notes');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Flashcard Flipper State
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const sampleCards = [
    { front: 'Master Theorem for T(n) = 2T(n/2) + O(n)', back: 'Case 2: T(n) = Θ(n log n)', subject: 'Algorithms' },
    { front: 'What is the minimum number of frames required for LRU Page Replacement to prevent thrashing?', back: 'Number of pages in the working set of the process.', subject: 'Operating Systems' },
    { front: '3NF vs BCNF Dependency Condition', back: 'BCNF requires every non-trivial FD X → Y to have X as a Superkey. 3NF allows Y to be a prime attribute.', subject: 'DBMS' },
    { front: 'Handshaking Lemma in Graph Theory', back: 'Sum of degrees of all vertices = 2 × (Number of Edges). Number of odd degree vertices is always EVEN.', subject: 'Discrete Maths' },
  ];

  const currentCard = sampleCards[cardIndex % sampleCards.length];

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !noteContent) return;
    await createNoteMutation.mutateAsync({
      title: noteTitle,
      content: noteContent,
      contentFormat: 'MARKDOWN',
      noteType: 'CONCEPT',
    });
    setNoteTitle('');
    setNoteContent('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest flex items-center space-x-1.5">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>PERSONAL KNOWLEDGE SYSTEM</span>
          </span>
          <h1 className="text-3xl font-bold text-slate-100 mt-1">Knowledge Cockpit</h1>
          <p className="text-sm text-slate-400">
            Organize, search, and connect your personal GATE CS study notes, formulas &amp; flashcards
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'notes'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Notes ({notes?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('decks')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'decks'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Flashcards ({decks?.length || sampleCards.length})
          </button>
          <button
            onClick={() => setActiveTab('formulas')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'formulas'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Formulas ({formulas?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'bookmarks'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bookmarks ({bookmarks?.length || 0})
          </button>
        </div>
      </div>

      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Note Editor Form */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200">Create Personal Note</h2>
            <form onSubmit={handleCreateNote} className="space-y-4">
              <input
                type="text"
                placeholder="Note Title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />
              <textarea
                placeholder="Write your markdown study note..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />
              <button
                type="submit"
                disabled={createNoteMutation.isPending}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-semibold rounded-xl transition shadow-md"
              >
                {createNoteMutation.isPending ? 'Saving...' : 'Save Personal Note'}
              </button>
            </form>
          </div>

          {/* Notes List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Your Personal Notes</h2>
            {notesLoading ? (
              <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading notes...</div>
            ) : notes && notes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.map((note) => (
                  <div key={note.id} className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-mono rounded">
                        {note.noteType}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100">{note.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{note.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl">
                No personal notes created yet. Use the editor to add your first study note.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Anki Flashcard Flipper */}
      {activeTab === 'decks' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>GATE CS Spaced Repetition Flipper</span>
            </h2>
            <span className="text-xs font-mono text-cyan-400">
              Card {cardIndex + 1} / {sampleCards.length}
            </span>
          </div>

          {/* Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-64 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 hover:border-cyan-500/50 rounded-2xl p-8 flex flex-col justify-between cursor-pointer transition shadow-2xl relative"
          >
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span className="px-2.5 py-0.5 bg-slate-800 rounded font-mono text-cyan-300">
                {currentCard.subject}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                {isFlipped ? 'Answer' : 'Question (Click to Flip)'}
              </span>
            </div>

            <div className="my-auto text-center px-4">
              <p className="text-base font-semibold text-slate-100 leading-relaxed font-mono">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
            </div>

            <div className="text-center text-[11px] text-slate-500 italic">
              {isFlipped ? 'Tap card to view question' : 'Tap card to flip answer'}
            </div>
          </div>

          {/* Rating Controls */}
          {isFlipped && (
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCardIndex(cardIndex + 1);
                }}
                className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-xl border border-red-500/30 transition"
              >
                Hard / Repeat
              </button>
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCardIndex(cardIndex + 1);
                }}
                className="flex-1 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-xl border border-amber-500/30 transition"
              >
                Good (3 Days)
              </button>
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCardIndex(cardIndex + 1);
                }}
                className="flex-1 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-500/30 transition"
              >
                Easy (7 Days)
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'formulas' && (
        <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-2">
          <Code className="w-8 h-8 mx-auto text-cyan-400" />
          <h3 className="text-base font-bold text-slate-200">LaTeX Formula Vault</h3>
          <p>LaTeX &amp; Plain Text Formula storage active. Add formulas directly during lesson study sessions.</p>
        </div>
      )}

      {activeTab === 'bookmarks' && (
        <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-2">
          <Bookmark className="w-8 h-8 mx-auto text-cyan-400" />
          <h3 className="text-base font-bold text-slate-200">Bookmarks Vault</h3>
          <p>Save internal targets and safe HTTPS external study resources.</p>
        </div>
      )}
    </div>
  );
}
