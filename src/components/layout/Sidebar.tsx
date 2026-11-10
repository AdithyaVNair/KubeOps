import React from 'react';
import {
  LayoutDashboard,
  Server,
  Layers,
  Sliders,
  Activity,
  GitBranch,
  HeartPulse,
  Network,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useKubeOps, ActivePage } from '../../context/KubeOpsContext';

interface NavItem {
  id: ActivePage;
  label: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const Sidebar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    failedPodsCount,
    isSelfHealingActive,
    infrastructureHealth,
    selectedCluster
  } = useKubeOps();

  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      description: 'Cluster health & metrics'
    },
    {
      id: 'kubernetes',
      label: 'Kubernetes',
      icon: Server,
      badge: failedPodsCount > 0 ? `${failedPodsCount} error` : '4 nodes',
      badgeColor: failedPodsCount > 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
      description: 'Pods, Nodes, Services'
    },
    {
      id: 'self-healing',
      label: 'Self-Healing Center',
      icon: HeartPulse,
      badge: isSelfHealingActive ? 'RUNNING' : 'Auto',
      badgeColor: isSelfHealingActive ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Autonomous recovery loop'
    },
    {
      id: 'terraform',
      label: 'Terraform IaC',
      icon: Layers,
      badge: '7 res',
      badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
      description: 'AWS VPC, EKS, Subnets'
    },
    {
      id: 'ansible',
      label: 'Ansible & Puppet',
      icon: Sliders,
      badge: 'Config',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
      description: 'Playbooks & Catalog drift'
    },
    {
      id: 'nagios',
      label: 'Nagios Monitoring',
      icon: Activity,
      badge: failedPodsCount > 0 ? 'CRITICAL' : '7 OK',
      badgeColor: failedPodsCount > 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      description: 'Host & Service health checks'
    },
    {
      id: 'jenkins',
      label: 'CI/CD Jenkins',
      icon: GitBranch,
      badge: '2 pipes',
      badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      description: 'Automated build & deploy'
    },
    {
      id: 'architecture',
      label: 'Architecture',
      icon: Network,
      badge: 'Interactive',
      badgeColor: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
      description: 'End-to-end topology'
    }
  ];

  return (
    <aside className="w-64 bg-[#0d121f] border-r border-[#1e293b] flex flex-col h-screen select-none shrink-0 transition-all duration-300">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#1e293b] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            {isSelfHealingActive && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white font-sans">KubeOps</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">v2.4</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">Autonomous DevOps</p>
          </div>
        </div>
      </div>

      {/* Primary Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Core Operations
        </div>

        {navItems.map(item => {
          const isActive = activePage === item.id;
          const isSpecial = item.id === 'self-healing';

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all duration-200 relative ${
                isActive
                  ? isSpecial
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-white border border-emerald-500/30 shadow-md shadow-emerald-500/10'
                    : 'bg-indigo-600/15 text-white border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#141b2d] border border-transparent'
              }`}
            >
              {isActive && (
                <div
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r ${
                    isSpecial ? 'bg-emerald-400' : 'bg-indigo-500'
                  }`}
                />
              )}

              <div className="flex items-center gap-3">
                <item.icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? isSpecial
                        ? 'text-emerald-400'
                        : 'text-indigo-400'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border font-mono font-medium ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Cluster Status Footer Pill */}
      <div className="p-3 border-t border-[#1e293b] bg-[#090d16]">
        <div className="p-2.5 rounded-lg bg-[#111726] border border-[#1e293b]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              SLA Health
            </span>
            <span className={`text-xs font-bold font-mono ${infrastructureHealth >= 90 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {infrastructureHealth}%
            </span>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                infrastructureHealth >= 90 ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${infrastructureHealth}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="truncate max-w-[130px] font-mono text-[10px] text-slate-300">
              {selectedCluster.name}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              EKS Ready
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div className="mt-2 text-center text-[10px] text-slate-400 font-mono tracking-wider flex items-center justify-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
          <span>Automate • Orchestrate • Recover</span>
        </div>
      </div>
    </aside>
  );
};

