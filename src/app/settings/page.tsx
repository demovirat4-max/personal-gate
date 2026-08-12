'use client';

import React from 'react';
import Link from 'next/link';
import { PHASE_1_MISSION_FIXTURE } from '@/features/mission/fixtures/mission.fixture';
import { Settings, Calendar, Clock, DollarSign, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SettingsPage() {
  const f = PHASE_1_MISSION_FIXTURE.examSettings;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <span>Application Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Exam Target • System Safeguards • AI Budget &amp; Data Audits
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exam Target Settings Panel */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>Exam Target &amp; Timezone</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Target GATE Paper</label>
              <input
                type="text"
                disabled
                value={f.paper}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Provisional Target Exam Date &amp; Time</label>
              <input
                type="text"
                disabled
                value={f.provisionalTimestamp}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Configured Timezone</label>
              <input
                type="text"
                disabled
                value={f.timezone}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Availability Settings Panel */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Weekly Study Capacity</span>
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Monday – Friday</span>
              <span className="font-mono text-slate-200 font-semibold">180 mins / day (3 hrs)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Saturday – Sunday</span>
              <span className="font-mono text-slate-200 font-semibold">360 mins / day (6 hrs)</span>
            </div>
            <div className="flex justify-between items-center py-2 text-cyan-400 font-medium pt-2">
              <span>Total Weekly Capacity</span>
              <span className="font-mono font-bold">1,620 mins (27 hrs/week)</span>
            </div>
          </div>
        </div>

        {/* AI Provider & Budget Settings */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 md:col-span-2">
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>AI Provider &amp; Cost Control Safeguards</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400">Configured Model</div>
              <div className="font-semibold text-slate-100 mt-1 font-mono">ZZLM 5.2 (NVIDIA NIM)</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400">Monthly Hard Budget Cap</div>
              <div className="font-semibold text-emerald-400 mt-1 font-mono">₹1,000 INR / month</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400">Warning Thresholds</div>
              <div className="font-semibold text-slate-100 mt-1 font-mono">70% • 90% • 100%</div>
            </div>
          </div>
        </div>

        {/* System & Content Quality Audit */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 md:col-span-2 flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>System &amp; Content Quality Audit</span>
            </h2>
            <p className="text-xs text-slate-400">View automated dataset ingestion, topic mappings &amp; question bank quality logs.</p>
          </div>
          <Link
            href="/content-quality"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center space-x-1.5"
          >
            <span>View Quality Audit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
