import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true
}) => {
  const normalized = status.toLowerCase();

  let styles = 'bg-slate-800 text-slate-300 border-slate-700';
  let dotColor = 'bg-slate-400';
  let isPulsing = false;

  if (
    normalized === 'ready' ||
    normalized === 'running' ||
    normalized === 'ok' ||
    normalized === 'up' ||
    normalized === 'success' ||
    normalized === 'healthy' ||
    normalized === 'compliant' ||
    normalized === 'applied' ||
    normalized === 'active' ||
    normalized === 'recovered'
  ) {
    styles = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    dotColor = 'bg-emerald-400';
  } else if (
    normalized === 'warning' ||
    normalized === 'pending' ||
    normalized === 'progressing' ||
    normalized === 'drift_detected' ||
    normalized === 'containercreating' ||
    normalized === 'in_progress' ||
    normalized === 'in-progress'
  ) {
    styles = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    dotColor = 'bg-amber-400';
    isPulsing = true;
  } else if (
    normalized === 'not ready' ||
    normalized === 'notready' ||
    normalized === 'crashloopbackoff' ||
    normalized === 'error' ||
    normalized === 'critical' ||
    normalized === 'down' ||
    normalized === 'failed' ||
    normalized === 'degraded' ||
    normalized === 'terminating' ||
    normalized === 'alert'
  ) {
    styles = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    dotColor = 'bg-rose-400';
    isPulsing = true;
  }

  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-md border ${sizeClasses} ${styles}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColor} ${isPulsing ? 'animate-pulse' : ''}`}
        />
      )}
      <span>{status}</span>
    </span>
  );
};

