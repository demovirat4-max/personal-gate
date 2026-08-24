import React, { useState, useRef, useEffect } from 'react';
import { VideoResource } from '../types';
import Markdown from 'react-markdown';
import {
  Bot,
  X,
  Send,
  Copy,
  Check,
  Loader2,
  Trash2,
  Sparkles,
  Zap,
  Brain,
  ShieldAlert,
  BookOpen,
} from 'lucide-react';

interface AskAIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeResource: VideoResource | null;
}

export type ChatRolePreset = 'mentor' | 'traps' | 'revision' | 'prover';
export type ModelMode = 'fast' | 'general' | 'complex';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  rolePreset?: ChatRolePreset;
}

const ROLE_PRESETS: Record<
  ChatRolePreset,
  { name: string; description: string; icon: React.FC<{ className?: string }> }
> = {
  mentor: {
    name: 'GATE Mentor',
    description: 'Comprehensive syllabus explanations, proofs, and standard PYQ patterns',
    icon: Bot,
  },
  traps: {
    name: 'Trap Hunter',
    description: 'Tricky boundary cases, negative marking pitfalls, and deceptive options',
    icon: ShieldAlert,
  },
  revision: {
    name: 'Formula Drill',
    description: 'Crisp equations, algorithm complexities, and rapid memory flashcards',
    icon: Zap,
  },
  prover: {
    name: 'Algorithm Prover',
    description: 'Formal mathematical proofs, recurrence trees, and loop invariants',
    icon: Brain,
  },
};

const MODEL_MODES: Record<
  ModelMode,
  { label: string; modelName: string; description: string }
> = {
  fast: {
    label: 'Fast',
    modelName: 'gemini-3.1-flash-lite',
    description: 'Quick definitions and formula lookups',
  },
  general: {
    label: 'General',
    modelName: 'gemini-3.7-flash',
    description: 'Standard syllabus queries and multi-step solutions',
  },
  complex: {
    label: 'Deep Reasoning',
    modelName: 'gemini-3.1-pro-preview',
    description: 'Complex math derivations and advanced algorithm analysis',
  },
};

export const AskAIPanel: React.FC<AskAIPanelProps> = ({
  isOpen,
  onClose,
  activeResource,
}) => {
  const [selectedRole, setSelectedRole] = useState<ChatRolePreset>('mentor');
  const [selectedModelMode, setSelectedModelMode] = useState<ModelMode>('general');
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### Welcome to GATE CSE Mentor
I maintain full conversation history across our chat session. 

**How I can help:**
- Step-by-step solutions for difficult GATE previous year questions
- Precise formulas, time/space complexity proofs, and boundary traps
- Standard textbook algorithms (CLRS, Galvin, Korth, Ullman, Tanenbaum)

*Select a specific role or model above, or ask a question directly below.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rolePreset: 'mentor',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to bottom of conversation on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputValue;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Append user message to thread
    const newMessagesList = [...messages, userMsg];
    setMessages(newMessagesList);
    if (!queryText) setInputValue('');
    setIsLoading(true);

    try {
      // Send conversation history to multi-turn /api/ai/chat endpoint
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessagesList,
          subject: activeResource?.subject || '',
          topic: activeResource?.topic || '',
          role: selectedRole,
          modelMode: selectedModelMode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error HTTP ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || MODEL_MODES[selectedModelMode].modelName,
        rolePreset: selectedRole,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Ask AI multi-turn error:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `**Request Failed:** ${err.message || 'Unable to connect to AI server. Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `### Welcome to GATE CSE Mentor\nConversation history has been cleared. What would you like to explore next?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rolePreset: selectedRole,
      },
    ]);
  };

  const quickPrompts = activeResource
    ? [
        `Explain "${activeResource.topic}" using the Feynman Technique (intuitive analogy, mechanics, and GATE traps).`,
        `Generate a high-yield formula & complexity cheat sheet for "${activeResource.topic}".`,
        `Generate a tricky 2-mark GATE question on "${activeResource.topic}" and explain the trap options.`,
        `What are the most common edge cases and boundary pitfalls in "${activeResource.topic}"?`,
      ]
    : [
        'Explain Master Theorem edge cases and non-polynomial gaps with examples.',
        'Generate a formula card for Computer Networks (TCP congestion, subnetting, CRC).',
        'How to solve Conflict Serializability vs View Serializability in DBMS?',
        'Derive standard recurrence relations for divide-and-conquer algorithms.',
      ];

  const CurrentRoleIcon = ROLE_PRESETS[selectedRole].icon;

  return (
    <aside
      id="ask-ai-drawer"
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] bg-white border-l border-slate-200 shadow-xl flex flex-col justify-between"
    >
      {/* Drawer Header */}
      <div className="p-3.5 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded bg-slate-100 text-slate-800">
            <CurrentRoleIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="text-xs font-semibold text-slate-900">
                {ROLE_PRESETS[selectedRole].name}
              </h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                {MODEL_MODES[selectedModelMode].label}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-[220px]">
              {ROLE_PRESETS[selectedRole].description}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            title="Switch chatbot role or model"
            className="px-2 py-1 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors cursor-pointer"
          >
            {showRoleMenu ? 'Hide options' : 'Options'}
          </button>
          <button
            onClick={handleClear}
            title="Clear conversation history"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            title="Close panel"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Role & Model Selector Panel (Collapsible) */}
      {showRoleMenu && (
        <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2.5 text-xs">
          {/* Chatbot Persona / Role Presets */}
          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1.5">
              Chatbot Role & System Instruction:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(ROLE_PRESETS) as ChatRolePreset[]).map((rKey) => {
                const rInfo = ROLE_PRESETS[rKey];
                const Icon = rInfo.icon;
                const isSelected = selectedRole === rKey;
                return (
                  <button
                    key={rKey}
                    onClick={() => {
                      setSelectedRole(rKey);
                      setShowRoleMenu(false);
                    }}
                    className={`p-2 rounded text-left border transition-colors cursor-pointer flex items-start space-x-2 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="font-medium text-xs truncate">{rInfo.name}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isSelected ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        {rInfo.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Reasoning Mode */}
          <div className="pt-2 border-t border-slate-200/60">
            <label className="text-[11px] font-medium text-slate-600 block mb-1.5">
              Task Complexity & Model:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(MODEL_MODES) as ModelMode[]).map((mKey) => {
                const mInfo = MODEL_MODES[mKey];
                const isSelected = selectedModelMode === mKey;
                return (
                  <button
                    key={mKey}
                    onClick={() => {
                      setSelectedModelMode(mKey);
                      setShowRoleMenu(false);
                    }}
                    className={`py-1.5 px-2 rounded text-center border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 font-medium'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs">{mInfo.label}</div>
                    <div
                      className={`text-[9px] font-mono ${
                        isSelected ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      {mInfo.modelName.replace('gemini-', '')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Active Topic Context Banner */}
      {activeResource && (
        <div className="px-3.5 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="truncate text-slate-700">
            <span className="text-slate-900 font-medium">Context:</span> {activeResource.topic}
          </div>
          <span className="text-[11px] text-slate-500 shrink-0 font-mono">
            {activeResource.subject}
          </span>
        </div>
      )}

      {/* Multi-turn Chat Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-slate-50/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[92%] rounded-lg p-3 border ${
                msg.role === 'user'
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="space-y-2 prose prose-slate prose-xs max-w-none">
                  <div className="markdown-body text-slate-800 leading-relaxed text-xs [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-2 [&>ol]:list-decimal [&>ol]:pl-4 [&>h3]:text-slate-900 [&>h3]:text-xs [&>h3]:font-semibold [&>h3]:mt-2 [&>h3]:mb-1 [&>code]:bg-slate-100 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded [&>code]:font-mono [&>code]:text-slate-900">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                  <div className="pt-1.5 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                    <div className="flex items-center space-x-1.5">
                      <span>{msg.timestamp}</span>
                      {msg.modelUsed && (
                        <span className="font-mono text-[10px] text-slate-400">
                          • {msg.modelUsed.replace('gemini-', '')}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="flex items-center space-x-1 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                          <span className="text-emerald-600 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="whitespace-pre-wrap text-white">{msg.content}</p>
                  <span className="text-[11px] text-slate-300 block text-right mt-1">
                    {msg.timestamp}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 max-w-[85%]">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-900 shrink-0" />
            <span>
              Consulting syllabus & generating step-by-step reasoning ({MODEL_MODES[selectedModelMode].label})...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="p-2.5 bg-white border-t border-slate-100 space-y-1">
        <span className="text-[11px] text-slate-400 block px-1">
          Suggested queries:
        </span>
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap transition-colors disabled:opacity-50 cursor-pointer text-xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Input Field */}
      <div className="p-3 bg-white border-t border-slate-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            ref={inputRef}
            id="ai-panel-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Ask ${ROLE_PRESETS[selectedRole].name} anything about GATE CSE...`}
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2 rounded bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
};
