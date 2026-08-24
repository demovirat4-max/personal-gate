import React from 'react';
import { StudyStreakData } from '../types';
import { getStudyHoursTrendData } from '../utils/storage';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  Clock,
  TrendingUp,
  Flame,
  Calendar,
  Zap,
} from 'lucide-react';

interface StudyHoursTrendChartProps {
  streakData: StudyStreakData;
  onRecordActivity?: (activityCount?: number, minutes?: number) => void;
}

interface TooltipPayloadItem {
  value: number;
  payload: {
    dateStr: string;
    dayLabel: string;
    dayNum: string;
    fullDateLabel: string;
    isToday: boolean;
    hours: number;
    minutes: number;
    activities: number;
    formattedDuration: string;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

const CustomTrendTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-lg shadow-lg border border-slate-800 text-xs">
        <div className="flex items-center justify-between gap-3 mb-1 text-slate-400 text-[11px]">
          <span>{data.fullDateLabel} ({data.dayLabel})</span>
          {data.isToday && (
            <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-medium text-[10px]">
              Today
            </span>
          )}
        </div>
        <div className="flex items-baseline space-x-1.5 font-medium">
          <span className="text-base font-bold font-mono text-white">
            {data.formattedDuration}
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            ({data.hours} hrs)
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
          <Flame className="w-3 h-3 text-amber-400 inline" />
          <span>{data.activities} {data.activities === 1 ? 'activity logged' : 'activities logged'}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const StudyHoursTrendChart: React.FC<StudyHoursTrendChartProps> = ({
  streakData,
}) => {
  const trend = getStudyHoursTrendData(streakData);

  // Determine Y-axis max domain with a nice buffer
  const maxVal = Math.max(...trend.data.map((d) => d.hours), 1);
  const yAxisMax = Math.ceil(maxVal * 1.2 * 2) / 2 || 2; // rounds to nearest 0.5

  return (
    <div
      id="study-hours-trend-widget"
      className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs relative"
    >
      {/* Header Row: Title & Top Summary Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Study Hours Trend (Last 7 Days)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Consecutive study volume calculated from your active study sessions & timers
          </p>
        </div>

        {/* Highlight Stats Pill */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 flex items-center space-x-1.5">
            <span className="text-slate-500">7-Day Total:</span>
            <span className="font-bold text-slate-900 font-mono">
              {trend.totalHours} hrs
            </span>
          </div>

          <div className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-blue-700 font-medium">Avg:</span>
            <span className="font-bold text-blue-900 font-mono">
              {trend.avgHoursPerDay}h/day
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Trend Area / Line Chart Container */}
      <div className="mt-5 w-full h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={trend.data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="studyHoursGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />

            <XAxis
              dataKey="dayLabel"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
              dy={6}
            />

            <YAxis
              domain={[0, yAxisMax]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
              tickFormatter={(v) => `${v}h`}
              dx={-4}
            />

            <Tooltip content={<CustomTrendTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />

            {/* Average benchmark reference line */}
            {trend.avgHoursPerDay > 0 && (
              <ReferenceLine
                y={trend.avgHoursPerDay}
                stroke="#94a3b8"
                strokeDasharray="3 3"
                strokeWidth={1}
                label={{
                  value: `Avg ${trend.avgHoursPerDay}h`,
                  position: 'right',
                  fill: '#94a3b8',
                  fontSize: 10,
                  fontFamily: 'monospace',
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="hours"
              stroke="#2563eb"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#studyHoursGradient)"
              activeDot={{
                r: 6,
                fill: '#2563eb',
                stroke: '#ffffff',
                strokeWidth: 2,
                className: 'drop-shadow-xs',
              }}
              dot={{
                r: 3.5,
                fill: '#ffffff',
                stroke: '#2563eb',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Summary Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Peak study day:{' '}
            <strong className="text-slate-800 font-mono">
              {trend.peakHours > 0 ? `${trend.peakDayLabel} (${trend.peakHours}h)` : 'No hours logged yet'}
            </strong>
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
          <span>Hours tracked via timers & streak activities</span>
        </div>
      </div>
    </div>
  );
};
