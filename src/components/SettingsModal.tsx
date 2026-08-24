import React, { useState } from 'react';
import { StudyStreakData, SubjectWeightConfig, UserStudyStateMap } from '../types';
import { DEFAULT_SUBJECT_WEIGHTS } from '../data/defaultSyllabus';
import {
  X,
  RotateCcw,
  Download,
  Upload,
  Check,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customSheetUrl: string;
  onSaveSheetUrl: (url: string) => void;
  subjectWeights: SubjectWeightConfig;
  onSaveSubjectWeights: (weights: SubjectWeightConfig) => void;
  userStates: UserStudyStateMap;
  studyStreak?: StudyStreakData;
  onImportStates: (importedStates: UserStudyStateMap) => void;
  onImportStreak?: (streak: StudyStreakData) => void;
  onResetStates: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  customSheetUrl,
  onSaveSheetUrl,
  subjectWeights,
  onSaveSubjectWeights,
  userStates,
  studyStreak,
  onImportStates,
  onImportStreak,
  onResetStates,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'weights' | 'sheet' | 'backup'>('weights');
  const [sheetInput, setSheetInput] = useState(customSheetUrl);
  const [weightsInput, setWeightsInput] = useState<SubjectWeightConfig>({ ...subjectWeights });
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalWeight = Object.values(weightsInput).reduce<number>((sum, val) => sum + (Number(val) || 0), 0);

  const handleWeightChange = (subject: string, val: number) => {
    setWeightsInput((prev) => ({
      ...prev,
      [subject]: Math.max(0, val),
    }));
  };

  const handleSaveWeights = () => {
    onSaveSubjectWeights(weightsInput);
    showNotice('Subject weights saved.');
  };

  const handleResetWeights = () => {
    setWeightsInput({ ...DEFAULT_SUBJECT_WEIGHTS });
    onSaveSubjectWeights({ ...DEFAULT_SUBJECT_WEIGHTS });
    showNotice('Subject weights reset to standard distribution.');
  };

  const handleSaveSheet = () => {
    onSaveSheetUrl(sheetInput.trim());
    showNotice(sheetInput.trim() ? 'Google Sheet URL saved.' : 'Reverted to built-in syllabus.');
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(
      {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        userStates,
        subjectWeights,
        sheetUrl: customSheetUrl,
        studyStreak,
      },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gate-study-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed && parsed.userStates) {
          onImportStates(parsed.userStates);
          if (parsed.subjectWeights) {
            onSaveSubjectWeights(parsed.subjectWeights);
            setWeightsInput(parsed.subjectWeights);
          }
          if (parsed.sheetUrl) {
            onSaveSheetUrl(parsed.sheetUrl);
            setSheetInput(parsed.sheetUrl);
          }
          if (parsed.studyStreak && onImportStreak) {
            onImportStreak(parsed.studyStreak);
          }
          showNotice('Study progress imported successfully.');
        } else {
          showNotice('Error: Invalid backup file format.');
        }
      } catch (err) {
        showNotice('Error: Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const showNotice = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="settings-modal"
        className="relative w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden flex flex-col max-h-[85vh] text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Settings & configuration
            </h3>
            <p className="text-xs text-slate-500">
              Syllabus weights, data source, and progress backups
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex items-center space-x-1 px-4 py-2 border-b border-slate-100 bg-slate-50 text-xs">
          <button
            onClick={() => setActiveSubTab('weights')}
            className={`px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
              activeSubTab === 'weights'
                ? 'bg-white text-slate-900 font-medium border border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Subject weights ({totalWeight}%)
          </button>
          <button
            onClick={() => setActiveSubTab('sheet')}
            className={`px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
              activeSubTab === 'sheet'
                ? 'bg-white text-slate-900 font-medium border border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Google Sheet source
          </button>
          <button
            onClick={() => setActiveSubTab('backup')}
            className={`px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
              activeSubTab === 'backup'
                ? 'bg-white text-slate-900 font-medium border border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Backup & reset
          </button>
        </div>

        {/* Notice Banner */}
        {savedNotice && (
          <div className="px-4 py-2 bg-slate-900 text-white text-xs flex items-center space-x-2">
            <Check className="w-3.5 h-3.5 text-slate-200" />
            <span>{savedNotice}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* 1. Subject Weights Editor */}
          {activeSubTab === 'weights' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Marks weight allocated per subject for calculating weighted readiness.
                </p>

                <button
                  onClick={handleResetWeights}
                  className="flex items-center space-x-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 rounded border border-slate-200 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Standard weights</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.keys(weightsInput).map((subj) => (
                  <div
                    key={subj}
                    className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="text-slate-800 truncate">
                      {subj}
                    </span>
                    <div className="flex items-center space-x-1 shrink-0">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={weightsInput[subj]}
                        onChange={(e) => handleWeightChange(subj, Number(e.target.value))}
                        className="w-12 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-center text-slate-900 text-xs focus:outline-none focus:border-slate-400"
                      />
                      <span className="text-xs text-slate-400">%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  Total weight:{' '}
                  <strong className={totalWeight === 100 ? 'text-slate-900' : 'text-slate-700'}>
                    {totalWeight}%
                  </strong>{' '}
                  {totalWeight !== 100 && '(target 100%)'}
                </span>
                <button
                  onClick={handleSaveWeights}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium cursor-pointer"
                >
                  Save weights
                </button>
              </div>
            </div>
          )}

          {/* 2. Google Sheet CSV Setup */}
          {activeSubTab === 'sheet' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-medium text-slate-900 mb-1">
                  Google Sheet link
                </h4>
                <p className="text-xs text-slate-500">
                  Connect a Google Sheet or CSV export to dynamically load syllabus video items.
                </p>
              </div>

              <div className="space-y-2">
                <input
                  id="sheet-url-input"
                  type="url"
                  value={sheetInput}
                  onChange={(e) => setSheetInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit or /pub?output=csv"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
                />

                <div className="flex items-center justify-between text-xs">
                  <button
                    onClick={() => setSheetInput('')}
                    className="text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Clear (use built-in syllabus)
                  </button>
                  <button
                    onClick={handleSaveSheet}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded cursor-pointer"
                  >
                    Save and load
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                <span className="font-medium text-slate-900 block">How to link a Google Sheet:</span>
                <ol className="list-decimal pl-4 space-y-1 text-xs">
                  <li>Ensure columns for: Subject, Topic, YouTube URL, Channel, Priority.</li>
                  <li>In Google Sheets, choose File → Share → Publish to web (CSV), or paste the standard share link.</li>
                </ol>
              </div>
            </div>
          )}

          {/* 3. Data Backup & Local Storage */}
          {activeSubTab === 'backup' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-medium text-slate-900 mb-1">
                  Progress backup & restore
                </h4>
                <p className="text-xs text-slate-500">
                  Export your study progress, notes, and timers to a JSON file.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                  <div className="text-xs font-medium text-slate-900">
                    Export backup
                  </div>
                  <p className="text-xs text-slate-500">
                    Download a JSON file of your local study state.
                  </p>
                  <button
                    onClick={handleExportData}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 rounded border border-slate-200 text-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>Download JSON</span>
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                  <div className="text-xs font-medium text-slate-900">
                    Import backup
                  </div>
                  <p className="text-xs text-slate-500">
                    Restore study state from a JSON file.
                  </p>
                  <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 rounded border border-slate-200 text-xs transition-colors">
                    <Upload className="w-3.5 h-3.5 text-slate-600" />
                    <span>Select JSON file</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Danger Zone: Reset Local Data */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-medium text-slate-900">
                  Reset local progress
                </div>
                <p className="text-xs text-slate-500">
                  Clear all topic checkboxes, revision marks, and notes stored in this browser.
                </p>
                <button
                  onClick={() => {
                    onResetStates();
                    showNotice('All study progress has been reset.');
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded border border-slate-200 text-xs transition-colors cursor-pointer font-medium"
                >
                  Reset all progress
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs rounded transition-colors cursor-pointer font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
