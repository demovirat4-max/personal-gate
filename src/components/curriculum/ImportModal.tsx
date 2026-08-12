'use client';

import React, { useState } from 'react';
import { Upload, Link as LinkIcon, FileText, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { useImportDryRunMutation, useImportCommitMutation } from '@/hooks/use-curriculum';
import { ImportSourceType, ImportDryRunResponse } from '@/contracts/curriculum/import.contract';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const [sourceType, setSourceType] = useState<ImportSourceType>('GOOGLE_SHEETS');
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dryRunResult, setDryRunResult] = useState<ImportDryRunResponse | null>(null);

  const dryRunMutation = useImportDryRunMutation();
  const commitMutation = useImportCommitMutation();

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleExecuteDryRun = async () => {
    try {
      if (sourceType === 'GOOGLE_SHEETS') {
        if (!googleSheetsUrl) return;
        const res = await dryRunMutation.mutateAsync({
          sourceType: 'GOOGLE_SHEETS',
          sourceLabel: 'Google Sheets Import',
          googleSheetsUrl,
        });
        setDryRunResult(res);
      } else {
        if (!selectedFile) return;
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const res = await dryRunMutation.mutateAsync({
            sourceType,
            sourceLabel: selectedFile.name,
            fileContentBase64: base64,
          });
          setDryRunResult(res);
        };
        reader.readAsDataURL(selectedFile);
      }
    } catch {
      // Handled via mutation state
    }
  };

  const handleCommit = async () => {
    if (!dryRunResult) return;
    const idempotencyKey = `commit_${dryRunResult.batchId}_${Date.now()}`;
    await commitMutation.mutateAsync({
      batchId: dryRunResult.batchId,
      reviewToken: dryRunResult.reviewToken,
      idempotencyKey,
    });
    setDryRunResult(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-dialog-title"
    >
      <div className="w-full max-w-4xl max-h-[90vh] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <h2 id="import-dialog-title" className="text-base font-bold text-[var(--text-main)]">
              Import GATE CS Curriculum & Lectures
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Validate via dry-run review before committing to your personal preparation database.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-main)]"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {!dryRunResult ? (
            /* Tab selection & Input */
            <div className="space-y-4">
              <div className="flex gap-2 p-1 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                <button
                  onClick={() => {
                    setSourceType('GOOGLE_SHEETS');
                    setSelectedFile(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-colors ${
                    sourceType === 'GOOGLE_SHEETS'
                      ? 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Public Google Sheets CSV</span>
                </button>
                <button
                  onClick={() => {
                    setSourceType('CSV_UPLOAD');
                    setSelectedFile(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-colors ${
                    sourceType === 'CSV_UPLOAD'
                      ? 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>CSV Upload</span>
                </button>
                <button
                  onClick={() => {
                    setSourceType('XLSX_UPLOAD');
                    setSelectedFile(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-colors ${
                    sourceType === 'XLSX_UPLOAD'
                      ? 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>XLSX Upload</span>
                </button>
              </div>

              {sourceType === 'GOOGLE_SHEETS' ? (
                <div className="space-y-2">
                  <label htmlFor="sheets-url" className="text-xs font-medium text-[var(--text-muted)]">
                    Public Google Sheets URL or CSV Export Link
                  </label>
                  <input
                    id="sheets-url"
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
                    value={googleSheetsUrl}
                    onChange={(e) => setGoogleSheetsUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-page)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] focus:border-[var(--accent-cyan)] outline-none"
                  />
                  <p className="text-[11px] text-[var(--text-dim)]">
                    Supports published CSV URLs or public viewable Google Sheet links.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label htmlFor="file-input" className="text-xs font-medium text-[var(--text-muted)]">
                    Select {sourceType === 'CSV_UPLOAD' ? '.csv' : '.xlsx'} File
                  </label>
                  <input
                    id="file-input"
                    type="file"
                    accept={sourceType === 'CSV_UPLOAD' ? '.csv' : '.xlsx'}
                    onChange={handleFileChange}
                    className="w-full text-xs text-[var(--text-muted)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[var(--accent-cyan)]/20 file:text-[var(--accent-cyan)] hover:file:bg-[var(--accent-cyan)]/30"
                  />
                </div>
              )}

              {dryRunMutation.isError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                  {dryRunMutation.error.message}
                </div>
              )}

              <button
                onClick={handleExecuteDryRun}
                disabled={
                  dryRunMutation.isPending || (sourceType === 'GOOGLE_SHEETS' ? !googleSheetsUrl : !selectedFile)
                }
                className="w-full py-2.5 rounded-lg bg-[var(--accent-cyan)] text-[#060913] font-semibold text-xs hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {dryRunMutation.isPending ? (
                  <span>Parsing & Validating Dry Run...</span>
                ) : (
                  <>
                    <span>Run Dry-Run Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Dry Run Review Results */
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-center">
                  <div className="text-lg font-bold text-[var(--text-main)]">{dryRunResult.rowCount}</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Total Rows</div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center">
                  <div className="text-lg font-bold text-emerald-400">{dryRunResult.insertCount}</div>
                  <div className="text-[10px] text-emerald-400">New Lectures</div>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
                  <div className="text-lg font-bold text-amber-400">{dryRunResult.warningCount}</div>
                  <div className="text-[10px] text-amber-400">Warnings</div>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
                  <div className="text-lg font-bold text-red-400">{dryRunResult.rejectedCount}</div>
                  <div className="text-[10px] text-red-400">Rejected</div>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-[var(--border-subtle)] rounded-lg overflow-hidden max-h-60 overflow-y-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] sticky top-0">
                    <tr>
                      <th className="p-2 border-b border-[var(--border-subtle)]">Row</th>
                      <th className="p-2 border-b border-[var(--border-subtle)]">Status</th>
                      <th className="p-2 border-b border-[var(--border-subtle)]">Subject / Topic</th>
                      <th className="p-2 border-b border-[var(--border-subtle)]">Title</th>
                      <th className="p-2 border-b border-[var(--border-subtle)]">Notes / Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dryRunResult.rows.map((row) => (
                      <tr key={row.rowNumber} className="border-b border-[var(--border-subtle)]/50">
                        <td className="p-2 text-[var(--text-dim)] font-mono">{row.rowNumber}</td>
                        <td className="p-2">
                          {row.status === 'VALID' && (
                            <span className="inline-flex items-center gap-1 text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                          )}
                          {row.status === 'WARNING' && (
                            <span className="inline-flex items-center gap-1 text-amber-400">
                              <AlertTriangle className="w-3 h-3" /> Warning
                            </span>
                          )}
                          {row.status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1 text-red-400">
                              <XCircle className="w-3 h-3" /> Rejected
                            </span>
                          )}
                        </td>
                        <td className="p-2 truncate max-w-[150px]">
                          {row.normalizedRow ? `${row.normalizedRow.subject} / ${row.normalizedRow.topic}` : '-'}
                        </td>
                        <td className="p-2 truncate max-w-[180px]">{row.normalizedRow?.lectureTitle || '-'}</td>
                        <td className="p-2 text-[11px] text-[var(--text-muted)] truncate max-w-[200px]">
                          {row.errorMessage || 'Ready for import'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {commitMutation.isError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                  {commitMutation.error.message}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setDryRunResult(null)}
                  className="flex-1 py-2 rounded-lg bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] text-xs hover:text-[var(--text-main)]"
                >
                  Back to Setup
                </button>
                <button
                  onClick={handleCommit}
                  disabled={commitMutation.isPending || dryRunResult.insertCount === 0}
                  className="flex-1 py-2 rounded-lg bg-emerald-500 text-black font-semibold text-xs hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {commitMutation.isPending ? 'Committing Batch...' : 'Commit Batch to Database'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
