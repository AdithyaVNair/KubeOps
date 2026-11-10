import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Server,
  Layers,
  Sliders,
  Activity,
  GitBranch,
  HeartPulse,
  Zap,
  ArrowRight,
  X,
  Play,
  RotateCcw
} from 'lucide-react';
import { useKubeOps, ActivePage } from '../../context/KubeOpsContext';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setActivePage,
    pods,
    deployments,
    nodes,
    ansiblePlaybooks,
    jenkinsPipelines,
    simulatePodFailure,
    runTerraformPlan,
    runTerraformApply
  } = useKubeOps();

  const [query, setQuery] = useState('');

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };
    if (isCommandPaletteOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  // Reset query on open
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  interface CommandItem {
    id: string;
    category: 'Navigation' | 'Action' | 'Pods' | 'Deployments' | 'Playbooks' | 'Pipelines';
    title: string;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    action: () => void;
  }

  const allItems: CommandItem[] = useMemo(() => {
    const items: CommandItem[] = [
      // Core Actions
      {
        id: 'act-sim-fail',
        category: 'Action',
        title: 'Trigger Self-Healing Simulation (Simulate Pod Crash)',
        subtitle: 'Crashes payment pod, triggers Nagios check, and auto-recovers',
        icon: Zap,
        action: () => {
          setActivePage('self-healing');
          simulatePodFailure();
        }
      },
      {
        id: 'act-tf-apply',
        category: 'Action',
        title: 'Run Terraform Apply',
        subtitle: 'Executes simulated IaC rollout to AWS us-east-1',
        icon: Play,
        action: () => {
          setActivePage('terraform');
          runTerraformApply();
        }
      },
      {
        id: 'act-tf-plan',
        category: 'Action',
        title: 'Run Terraform Plan',
        subtitle: 'Inspect simulated resource diffs for AWS EKS',
        icon: Layers,
        action: () => {
          setActivePage('terraform');
          runTerraformPlan();
        }
      },

      // Navigation
      {
        id: 'nav-overview',
        category: 'Navigation',
        title: 'Go to Overview Dashboard',
        subtitle: 'Cluster metrics, resource utilization & recent activity',
        icon: Activity,
        action: () => setActivePage('overview')
      },
      {
        id: 'nav-k8s',
        category: 'Navigation',
        title: 'Go to Kubernetes Management',
        subtitle: 'Inspect nodes, pods, deployments, namespaces',
        icon: Server,
        action: () => setActivePage('kubernetes')
      },
      {
        id: 'nav-self-healing',
        category: 'Navigation',
        title: 'Go to Self-Healing Center',
        subtitle: 'Autonomous recovery state machine & incident logs',
        icon: HeartPulse,
        action: () => setActivePage('self-healing')
      },
      {
        id: 'nav-terraform',
        category: 'Navigation',
        title: 'Go to Terraform Provisioning',
        subtitle: 'AWS VPC, EKS cluster, node groups & IaC terminal',
        icon: Layers,
        action: () => setActivePage('terraform')
      },
      {
        id: 'nav-ansible',
        category: 'Navigation',
        title: 'Go to Ansible & Puppet',
        subtitle: 'Configuration management, host fleet & catalog drift',
        icon: Sliders,
        action: () => setActivePage('ansible')
      },
      {
        id: 'nav-nagios',
        category: 'Navigation',
        title: 'Go to Nagios Monitoring',
        subtitle: 'Synthetic HTTP probes, host checks & alert matrix',
        icon: Activity,
        action: () => setActivePage('nagios')
      },
      {
        id: 'nav-jenkins',
        category: 'Navigation',
        title: 'Go to Jenkins CI/CD',
        subtitle: 'Build stages, test reports & artifact deployment',
        icon: GitBranch,
        action: () => setActivePage('jenkins')
      },
      {
        id: 'nav-arch',
        category: 'Navigation',
        title: 'Go to Architecture Topology',
        subtitle: 'Interactive toolchain relationship diagram',
        icon: Server,
        action: () => setActivePage('architecture')
      }
    ];

    // Pods
    pods.forEach(p => {
      items.push({
        id: `pod-${p.id}`,
        category: 'Pods',
        title: p.name,
        subtitle: `Namespace: ${p.namespace} • Node: ${p.node} • Status: ${p.status}`,
        icon: Server,
        action: () => {
          setActivePage('kubernetes');
        }
      });
    });

    // Deployments
    deployments.forEach(d => {
      items.push({
        id: `dep-${d.id}`,
        category: 'Deployments',
        title: `Deployment: ${d.name}`,
        subtitle: `Image: ${d.image} • Replicas: ${d.replicas}`,
        icon: Server,
        action: () => {
          setActivePage('kubernetes');
        }
      });
    });

    // Playbooks
    ansiblePlaybooks.forEach(pb => {
      items.push({
        id: `pb-${pb.id}`,
        category: 'Playbooks',
        title: `Playbook: ${pb.name}`,
        subtitle: `File: ${pb.file} • Status: ${pb.status}`,
        icon: Sliders,
        action: () => {
          setActivePage('ansible');
        }
      });
    });

    // Pipelines
    jenkinsPipelines.forEach(jp => {
      items.push({
        id: `jp-${jp.id}`,
        category: 'Pipelines',
        title: `Pipeline: ${jp.name}`,
        subtitle: `Branch: ${jp.branch} • Build #${jp.lastBuildNumber}`,
        icon: GitBranch,
        action: () => {
          setActivePage('jenkins');
        }
      });
    });

    return items;
  }, [pods, deployments, ansiblePlaybooks, jenkinsPipelines, setActivePage, simulatePodFailure, runTerraformApply, runTerraformPlan]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 10);
    const q = query.toLowerCase();
    return allItems.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle?.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    ).slice(0, 15);
  }, [allItems, query]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#111726] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#1e293b] gap-3">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command, pod name, deployment, playbook, or page..."
            autoFocus
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-xs bg-slate-800 text-slate-400 rounded border border-slate-700 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No matching resources or commands found for "{query}".
            </div>
          ) : (
            filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  setIsCommandPaletteOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#18233b] transition text-left group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 group-hover:border-indigo-500/50 group-hover:bg-indigo-600/20 transition">
                    <item.icon className="w-4 h-4 text-slate-300 group-hover:text-indigo-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 group-hover:text-white truncate">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="text-xs text-slate-400 font-mono truncate">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {item.category}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[#0c101b] border-t border-[#1e293b] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="px-1 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">↵</kbd> Select
            </span>
          </div>
          <span className="text-indigo-400 font-medium">KubeOps Intelligent Command Bus</span>
        </div>
      </div>
    </div>
  );
};

