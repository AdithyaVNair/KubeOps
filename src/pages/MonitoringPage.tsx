import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  Server,
  HardDrive,
  Cpu,
  Wifi,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useKubeOps } from '../context/KubeOpsContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { NagiosState } from '../types';

export const MonitoringPage: React.FC = () => {
  const {
    nagiosHosts,
    nagiosServices,
    nagiosAlerts,
    triggerNagiosCheck,
    acknowledgeNagiosAlert,
    simulatePodFailure,
    isSelfHealingActive
  } = useKubeOps();

  const [filterState, setFilterState] = useState<string>('all');

  const filteredServices = nagiosServices.filter(svc => {
    if (filterState === 'all') return true;
    return svc.state.toLowerCase() === filterState.toLowerCase();
  });

  const okCount = nagiosServices.filter(s => s.state === 'OK').length;
  const warningCount = nagiosServices.filter(s => s.state === 'WARNING').length;
  const criticalCount = nagiosServices.filter(s => s.state === 'CRITICAL').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Nagios Synthetic Monitoring Engine</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              Nagios Core v4.4.14
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Active synthetic HTTP, TCP &amp; NRPE agent polling across 4 Kubernetes nodes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => simulatePodFailure()}
            disabled={isSelfHealingActive}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition active:scale-95 disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Simulate Probe Outage</span>
          </button>
        </div>
      </div>

      {/* Host & Service Summary Counters (OK, WARNING, CRITICAL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Host Availability */}
        <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b] flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase text-slate-400">Host Availability</p>
            <h3 className="text-2xl font-bold font-mono text-white mt-1">
              {nagiosHosts.filter(h => h.status === 'UP').length} / {nagiosHosts.length} UP
            </h3>
            <p className="text-[11px] text-emerald-400 font-mono mt-1">Avg latency: 1.1ms</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Server className="w-6 h-6" />
          </div>
        </div>

        {/* Services OK */}
        <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b] flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase text-slate-400">Services OK</p>
            <h3 className="text-2xl font-bold font-mono text-emerald-400 mt-1">{okCount} Checks</h3>
            <p className="text-[11px] text-slate-400 font-mono mt-1">Normal SLA latency</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Services WARNING */}
        <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b] flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase text-slate-400">Services Warning</p>
            <h3 className="text-2xl font-bold font-mono text-amber-400 mt-1">{warningCount} Checks</h3>
            <p className="text-[11px] text-slate-400 font-mono mt-1">Exceeding soft threshold</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Services CRITICAL */}
        <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b] flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase text-slate-400">Services Critical</p>
            <h3 className={`text-2xl font-bold font-mono mt-1 ${criticalCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
              {criticalCount} Checks
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              {criticalCount > 0 ? 'Auto-healing responding' : 'Zero outages'}
            </p>
          </div>
          <div className={`p-3 rounded-xl border ${criticalCount > 0 ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Monitored Services Table */}
      <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Active Service Checks &amp; Telemetry</h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#0a0d14] p-1 rounded-xl border border-[#1e293b]">
            {(['all', 'ok', 'warning', 'critical'] as const).map(st => (
              <button
                key={st}
                onClick={() => setFilterState(st)}
                className={`px-3 py-1 text-xs rounded-lg font-mono font-medium uppercase transition ${
                  filterState === st
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#0c101b] text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-4">Host</th>
                <th className="py-3 px-3">Service Description</th>
                <th className="py-3 px-3">State</th>
                <th className="py-3 px-3">Last Check</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3">Attempt</th>
                <th className="py-3 px-4">Status Information</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b] text-slate-300">
              {filteredServices.map(svc => {
                const isCrit = svc.state === 'CRITICAL';
                return (
                  <tr
                    key={svc.id}
                    className={`hover:bg-[#151f33] transition ${
                      isCrit ? 'bg-rose-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-white">{svc.hostName}</td>
                    <td className="py-3 px-3 text-indigo-300">{svc.serviceDescription}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={svc.state} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-slate-400">{svc.lastCheck}</td>
                    <td className="py-3 px-3 text-slate-400">{svc.duration}</td>
                    <td className="py-3 px-3">{svc.attempt}</td>
                    <td className="py-3 px-4 text-[11px] text-slate-300 max-w-xs truncate">
                      {svc.statusInformation}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => triggerNagiosCheck(svc.id)}
                        title="Trigger immediate re-check"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nagios Alert History Table */}
      <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Nagios Alert History Log</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Logged to /var/log/nagios/nagios.log</span>
        </div>

        <div className="space-y-2.5">
          {nagiosAlerts.length === 0 ? (
            <div className="py-8 text-center text-slate-500 font-mono text-xs">
              No historical alerts in buffer.
            </div>
          ) : (
            nagiosAlerts.map(alt => (
              <div
                key={alt.id}
                className="p-3.5 rounded-xl bg-[#0a0d14] border border-[#1e293b] flex items-center justify-between gap-4 font-mono text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={alt.state} size="sm" />
                    <span className="text-slate-400 text-[11px]">{alt.timestamp}</span>
                    <span className="text-white font-bold">{alt.host}</span>
                  </div>
                  <p className="text-slate-300">{alt.message}</p>
                </div>

                <button
                  onClick={() => acknowledgeNagiosAlert(alt.id)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                >
                  Dismiss
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

