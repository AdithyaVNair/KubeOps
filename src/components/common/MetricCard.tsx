import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtext?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  iconBg?: string;
  progressPercent?: number;
  progressColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  subtext,
  icon: Icon,
  iconColor = 'text-indigo-400',
  iconBg = 'bg-indigo-500/10 border-indigo-500/20',
  progressPercent,
  progressColor = 'bg-indigo-500'
}) => {
  return (
    <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b] hover:border-slate-600 transition-all duration-300 shadow-sm relative group overflow-hidden">
      {/* Background subtle gradient hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 font-sans">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-white tracking-tight font-mono">{value}</h3>
        </div>

        <div className={`p-2.5 rounded-xl border ${iconBg} shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>

      {/* Progress Bar (Optional) */}
      {typeof progressPercent === 'number' && (
        <div className="mt-3">
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${progressColor}`}
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        </div>
      )}

      {/* Subtext or Change */}
      <div className="mt-3 flex items-center justify-between text-xs">
        {subtext && <span className="text-slate-400 truncate">{subtext}</span>}

        {change && (
          <span
            className={`flex items-center font-semibold font-mono text-[11px] ${
              changeType === 'positive'
                ? 'text-emerald-400'
                : changeType === 'negative'
                ? 'text-rose-400'
                : 'text-slate-400'
            }`}
          >
            {changeType === 'positive' ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : changeType === 'negative' ? (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <Minus className="w-3.5 h-3.5 mr-0.5" />
            )}
            {change}
          </span>
        )}
      </div>
    </div>
  );
};

