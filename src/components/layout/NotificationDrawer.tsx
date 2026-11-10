import React, { useState } from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  Trash2,
  Filter,
  Check
} from 'lucide-react';
import { useKubeOps } from '../../context/KubeOpsContext';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    alerts,
    dismissAlert,
    events
  } = useKubeOps();

  const [activeTab, setActiveTab] = useState<'alerts' | 'events'>('alerts');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  if (!isNotificationDrawerOpen) return null;

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'all') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0d121f] border-l border-[#1e293b] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#1e293b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Notifications &amp; Activity</h2>
            {alerts.length > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                {alerts.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsNotificationDrawerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#1e293b] bg-[#111726]/50">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 transition border-b-2 ${
              activeTab === 'alerts'
                ? 'border-indigo-500 text-white bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Active Alerts ({alerts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 transition border-b-2 ${
              activeTab === 'events'
                ? 'border-indigo-500 text-white bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Event Stream ({events.length})</span>
          </button>
        </div>

        {/* Alerts Content */}
        {activeTab === 'alerts' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Filter pills */}
            <div className="flex items-center gap-2 pb-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {(['all', 'critical', 'warning', 'info'] as const).map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2 py-0.5 text-[10px] uppercase font-mono rounded transition ${
                    filterSeverity === sev
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {filteredAlerts.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-60" />
                <p className="text-sm font-medium text-slate-300">All alerts clear</p>
                <p className="text-xs text-slate-400 mt-1">Infrastructure is operating within SLA thresholds.</p>
              </div>
            ) : (
              filteredAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    alert.severity === 'critical'
                      ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                      : alert.severity === 'warning'
                      ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                      : 'bg-indigo-950/20 border-indigo-500/40 text-indigo-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                          alert.severity === 'critical'
                            ? 'bg-rose-500/30 text-rose-300'
                            : alert.severity === 'warning'
                            ? 'bg-amber-500/30 text-amber-300'
                            : 'bg-indigo-500/30 text-indigo-300'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">• {alert.source}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{alert.timestamp}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-white mb-1">{alert.title}</h4>
                  <p className="text-xs text-slate-300 mb-3">{alert.message}</p>

                  <div className="flex justify-end">
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 border border-slate-700 transition"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Acknowledge</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Events Content */}
        {activeTab === 'events' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {events.map(ev => (
              <div
                key={ev.id}
                className="p-3 rounded-xl bg-[#111726] border border-[#1e293b] hover:border-slate-600 transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                    {ev.source}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{ev.timestamp}</span>
                </div>
                <h4 className="text-xs font-semibold text-slate-200 mt-1">{ev.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{ev.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Drawer Footer */}
        <div className="p-3 border-t border-[#1e293b] bg-[#0c101b] text-center text-[11px] text-slate-400 font-mono">
          KubeOps Real-time Telemetry Bus
        </div>
      </div>
    </div>
  );
};

