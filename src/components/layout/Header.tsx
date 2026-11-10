import React, { useState } from 'react';
import {
  Search,
  Bell,
  Zap,
  Globe,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useKubeOps } from '../../context/KubeOpsContext';

export const Header: React.FC = () => {
  const {
    activePage,
    clusters,
    selectedCluster,
    setSelectedCluster,
    setIsCommandPaletteOpen,
    setIsNotificationDrawerOpen,
    alerts,
    simulatePodFailure,
    resetSelfHealing,
    selfHealingPhase,
    isSelfHealingActive,
    infrastructureHealth
  } = useKubeOps();

  const [clusterDropdownOpen, setClusterDropdownOpen] = useState(false);
  const unreadAlertsCount = alerts.filter(a => !a.acknowledged).length;

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    overview: {
      title: 'Infrastructure Overview',
      subtitle: 'Real-time telemetry, cluster health & deployment status'
    },
    kubernetes: {
      title: 'Kubernetes Cluster Management',
      subtitle: 'Nodes, pods, deployments, namespaces & service topologies'
    },
    'self-healing': {
      title: 'Autonomous Self-Healing Center',
      subtitle: 'Closed-loop failure detection, Kubelet reconciliation & probe verification'
    },
    terraform: {
      title: 'Terraform Infrastructure as Code',
      subtitle: 'AWS VPC, EKS cluster, worker node groups & state management'
    },
    ansible: {
      title: 'Configuration Management (Ansible & Puppet)',
      subtitle: 'Continuous state enforcement, catalog compliance & automated playbooks'
    },
    nagios: {
      title: 'Nagios Synthetic Monitoring',
      subtitle: 'Active NRPE host availability, HTTP probes & service telemetry'
    },
    jenkins: {
      title: 'CI/CD Pipelines (Jenkins)',
      subtitle: 'Continuous delivery stages from commit checkout to Kubernetes rollout'
    },
    architecture: {
      title: 'Enterprise Architecture & Toolchain',
      subtitle: 'End-to-end integration topology of all KubeOps infrastructure layers'
    }
  };

  const currentInfo = pageTitles[activePage] || {
    title: 'KubeOps Dashboard',
    subtitle: 'Automated Kubernetes Infrastructure'
  };

  return (
    <header className="h-16 bg-[#0a0d14]/90 backdrop-blur-md border-b border-[#1e293b] px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Page Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold text-white tracking-tight">{currentInfo.title}</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 font-mono">
            {selectedCluster.name}
          </span>
        </div>
        <p className="text-xs text-slate-400 hidden sm:block">{currentInfo.subtitle}</p>
      </div>

      {/* Right: Actions, Search, Cluster Selector, Simulate Button, Notifications */}
      <div className="flex items-center gap-3">
        {/* Cluster Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setClusterDropdownOpen(!clusterDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111726] border border-[#1e293b] text-xs font-medium text-slate-200 hover:border-slate-600 transition"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono text-xs truncate max-w-[120px]">{selectedCluster.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {clusterDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#111726] border border-[#1e293b] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-[#1e293b] mb-1">
                Select Active Kubernetes Cluster
              </div>
              {clusters.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCluster(c);
                    setClusterDropdownOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition ${
                    selectedCluster.id === c.id
                      ? 'bg-indigo-600/20 text-white border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-[#161f33]'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-white">{c.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{c.provider} • {c.region}</p>
                  </div>
                  {selectedCluster.id === c.id && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Global Search Button */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111726] border border-[#1e293b] text-slate-400 hover:text-slate-200 hover:border-slate-600 transition text-xs"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Quick Search...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded border border-slate-700 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Simulate Pod Failure Button (Global prominent trigger) */}
        {isSelfHealingActive ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold animate-pulse">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Self-Healing In Progress...</span>
            </div>
            <button
              onClick={resetSelfHealing}
              title="Reset state"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => simulatePodFailure()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-semibold shadow-lg shadow-rose-900/30 border border-rose-400/30 transition transform active:scale-95 group"
          >
            <Zap className="w-3.5 h-3.5 text-amber-200 group-hover:scale-110 transition-transform" />
            <span>Simulate Pod Failure</span>
          </button>
        )}

        {/* Notification Bell Button */}
        <button
          onClick={() => setIsNotificationDrawerOpen(true)}
          className="relative p-2 rounded-lg bg-[#111726] border border-[#1e293b] text-slate-300 hover:text-white hover:border-slate-600 transition"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-lg shadow-rose-500/50">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* User Profile avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#1e293b]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-xs text-white border border-indigo-400/40 shadow-sm">
            KO
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-none">DevOps Admin</p>
            <p className="text-[10px] text-slate-400 font-mono leading-none mt-1">Staff SRE</p>
          </div>
        </div>
      </div>
    </header>
  );
};

