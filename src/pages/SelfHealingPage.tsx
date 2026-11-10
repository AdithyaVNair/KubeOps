import React, { useState } from 'react';
import {
  HeartPulse,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Server,
  Radio,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Terminal,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useKubeOps } from '../context/KubeOpsContext';
import { StatusBadge } from '../components/common/StatusBadge';

export const SelfHealingPage: React.FC = () => {
  const {
    selfHealingPhase,
    selfHealingSteps,
    selfHealingLogs,
    recoveryHistory,
    simulatePodFailure,
    resetSelfHealing,
    isSelfHealingActive,
    infrastructureHealth,
    pods
  } = useKubeOps();

  const [selectedFailureType, setSelectedFailureType] = useState('OOMKilled / Heap Exhaustion');
  const targetPod = pods.find(p => p.isTargetOfFailure) || pods[0];

  const failureTypes = [
    {
      id: 'oom',
      name: 'OOMKilled / Heap Exhaustion',
      desc: 'Memory exceeds 512Mi limit; Linux kernel sends SIGKILL (exit code 137)',
      impact: 'High'
    },
    {
      id: 'liveness',
      name: 'Liveness Probe Timeout',
      desc: 'GET /healthz returns 504 Gateway Timeout during thread deadlock',
      impact: 'Medium'
    },
    {
      id: 'segfault',
      name: 'Fatal Runtime Panic',
      desc: 'Null pointer dereference inside payment gateway transaction runner',
      impact: 'Critical'
    },
    {
      id: 'evict',
      name: 'Worker Node Eviction',
      desc: 'Node condition disk pressure triggers pod rescheduling to healthy worker',
      impact: 'High'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Hero Simulation Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111726] via-[#161a30] to-[#121c2b] border border-[#1e293b] shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20">
                <HeartPulse className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                KubeOps Self-Healing Autonomous Engine
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                Closed-Loop Active
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Experience the core capability of KubeOps: autonomous failure detection, synthetic health probe alerts,
              and sub-second Kubernetes pod replacement without requiring human SRE intervention.
            </p>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1">
              <span>Target Service: <strong className="text-indigo-300">payment-service</strong></span>
              <span>•</span>
              <span>Active Policy: <strong className="text-emerald-400">RestartPolicy: Always</strong></span>
              <span>•</span>
              <span>Health Score: <strong className={infrastructureHealth >= 90 ? 'text-emerald-400' : 'text-rose-400'}>{infrastructureHealth}%</strong></span>
            </div>
          </div>

          {/* Trigger Button & Controls */}
          <div className="flex flex-col items-end gap-3">
            {isSelfHealingActive ? (
              <div className="flex items-center gap-2">
                <div className="px-5 py-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/10 animate-pulse">
                  <Zap className="w-5 h-5 text-amber-400 animate-spin" />
                  <span>Healing in Progress...</span>
                </div>
                <button
                  onClick={resetSelfHealing}
                  title="Reset simulation to initial state"
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition shadow"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => simulatePodFailure(selectedFailureType)}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm flex items-center gap-2.5 shadow-xl shadow-rose-900/40 border border-rose-400/40 transition-all transform active:scale-95 group"
                >
                  <Zap className="w-5 h-5 text-amber-200 group-hover:scale-125 transition-transform" />
                  <span>Simulate Pod Failure</span>
                </button>
                {selfHealingPhase === 'recovered' && (
                  <button
                    onClick={resetSelfHealing}
                    title="Reset to idle state"
                    className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            <p className="text-[11px] text-slate-400 font-mono">
              Runs automated 6-step recovery workflow
            </p>
          </div>
        </div>
      </div>

      {/* Failure Scenario Selector */}
      <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">
            Select Failure Scenario to Inject
          </h3>
          <span className="text-xs text-indigo-400 font-mono">
            Target Pod: {targetPod.name}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {failureTypes.map(ft => (
            <div
              key={ft.id}
              onClick={() => !isSelfHealingActive && setSelectedFailureType(ft.name)}
              className={`p-3.5 rounded-xl border cursor-pointer transition ${
                selectedFailureType === ft.name
                  ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-600/10'
                  : 'bg-[#0a0d14] border-[#1e293b] hover:border-slate-700'
              } ${isSelfHealingActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-white text-xs font-mono">{ft.name}</span>
                <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {ft.impact}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{ft.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 6-Step Workflow Stepper Visualization */}
      <div className="p-6 rounded-2xl bg-[#111726] border border-[#1e293b]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              6-Stage Autonomous Remediation Flow
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated reconciliation cycle executing across Kubernetes API, Nagios, and KubeOps controller
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-slate-400">Current Phase: </span>
            <span className="text-xs font-mono font-bold uppercase text-indigo-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              {selfHealingPhase.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Vertical/Horizontal Responsive Stepper */}
        <div className="space-y-4">
          {selfHealingSteps.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isAlert = step.status === 'alert';
            const isInProgress = step.status === 'in-progress';
            const isWaiting = step.status === 'waiting';

            return (
              <div
                key={step.stepNumber}
                className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                  isAlert
                    ? 'bg-rose-950/20 border-rose-500/50 shadow-lg shadow-rose-950/20'
                    : isCompleted
                    ? 'bg-emerald-950/15 border-emerald-500/40 shadow-sm'
                    : isInProgress
                    ? 'bg-indigo-950/25 border-indigo-500 shadow-md shadow-indigo-600/10'
                    : 'bg-[#0a0d14] border-[#1e293b] opacity-60'
                }`}
              >
                {/* Left vertical status line */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    isAlert
                      ? 'bg-rose-500'
                      : isCompleted
                      ? 'bg-emerald-400'
                      : isInProgress
                      ? 'bg-indigo-500 animate-pulse'
                      : 'bg-slate-700'
                  }`}
                />

                <div className="flex flex-wrap items-start justify-between gap-3 pl-2">
                  <div className="flex items-start gap-3">
                    {/* Step number badge */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono shrink-0 ${
                        isAlert
                          ? 'bg-rose-500 text-white animate-bounce'
                          : isCompleted
                          ? 'bg-emerald-500 text-slate-950'
                          : isInProgress
                          ? 'bg-indigo-500 text-white animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isCompleted ? '✓' : step.stepNumber}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white font-mono">{step.title}</h4>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                          {step.system}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{step.description}</p>
                      {step.details && (
                        <p className="text-xs font-mono text-indigo-300 mt-1.5 bg-black/40 p-2 rounded-lg border border-slate-800">
                          {step.details}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {step.timestamp && (
                      <span className="text-[11px] font-mono text-slate-400">
                        {step.timestamp}
                      </span>
                    )}
                    <span
                      className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                        isAlert
                          ? 'bg-rose-500 text-white'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isInProgress
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Streaming Remediation Terminal Log */}
      <div className="rounded-2xl bg-[#090d16] border border-[#1e293b] overflow-hidden shadow-2xl">
        <div className="px-4 py-2.5 bg-[#111726] border-b border-[#1e293b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-white">
              Self-Healing Event Stream Log
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Listener Active
          </span>
        </div>

        <div className="p-4 font-mono text-xs text-slate-300 min-h-[180px] max-h-[260px] overflow-y-auto space-y-1.5 bg-[#070a10]">
          {selfHealingLogs.map((log, lIdx) => {
            let lineClass = 'text-slate-300';
            if (log.includes('CRASH') || log.includes('FATAL')) {
              lineClass = 'text-rose-400 font-bold bg-rose-950/20 p-1 rounded';
            } else if (log.includes('NAGIOS PROBE') || log.includes('ALERTMGMT')) {
              lineClass = 'text-amber-300 font-semibold';
            } else if (log.includes('AUTO-HEAL COMPLETE') || log.includes('RESTORED')) {
              lineClass = 'text-emerald-400 font-bold bg-emerald-950/20 p-1 rounded';
            } else if (log.includes('K8S RECONCILE')) {
              lineClass = 'text-indigo-300';
            }
            return (
              <div key={lIdx} className={lineClass}>
                {log}
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulated Incident Recovery History */}
      <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Automated Incident Recovery History (MTTR Log)</h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            Average MTTR: 12.2 seconds
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#0c101b] text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-4">Incident ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Failed Pod</th>
                <th className="py-2.5 px-3">Root Cause</th>
                <th className="py-2.5 px-4">Remediation Action</th>
                <th className="py-2.5 px-3">Downtime</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b] text-slate-300">
              {recoveryHistory.map(item => (
                <tr key={item.id} className="hover:bg-[#151f33] transition">
                  <td className="py-3 px-4 font-bold text-white">{item.incidentId}</td>
                  <td className="py-3 px-3 text-slate-400">{item.timestamp}</td>
                  <td className="py-3 px-3 text-indigo-300">{item.podName}</td>
                  <td className="py-3 px-3 text-slate-300 max-w-xs">{item.rootCause}</td>
                  <td className="py-3 px-4 text-[11px] text-slate-400 max-w-sm">{item.remediationAction}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">{item.downtimeSeconds}s</td>
                  <td className="py-3 px-4 text-right">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

