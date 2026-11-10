import React, { useState } from 'react';
import {
  Sliders,
  Terminal,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Server,
  FileCode,
  Wrench,
  Sparkles,
  Zap
} from 'lucide-react';
import { useKubeOps } from '../context/KubeOpsContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { YamlViewerModal } from '../components/common/YamlViewerModal';
import { AnsiblePlaybook } from '../types';

export const ConfigManagementPage: React.FC = () => {
  const {
    ansiblePlaybooks,
    ansibleHosts,
    runningPlaybookId,
    runAnsiblePlaybook,
    puppetNodes,
    enforcePuppetCompliance
  } = useKubeOps();

  const [activeTool, setActiveTool] = useState<'ansible' | 'puppet'>('ansible');
  const [selectedPlaybook, setSelectedPlaybook] = useState<AnsiblePlaybook>(ansiblePlaybooks[0]);
  const [yamlModalOpen, setYamlModalOpen] = useState(false);

  // Playbook YAML template
  const playbookYaml = `---
- name: ${selectedPlaybook.name}
  hosts: ${selectedPlaybook.targetHosts.join(', ')}
  become: true
  tasks:
${selectedPlaybook.tasks
  .map(
    t => `    - name: ${t.name}
      command: echo "Ensuring state"
      register: task_result
`
  )
  .join('\n')}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Tool Switcher: Ansible vs Puppet */}
      <div className="flex items-center justify-between p-2 rounded-2xl bg-[#111726] border border-[#1e293b]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTool('ansible')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTool === 'ansible'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-rose-950/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Ansible Automation</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 font-mono">
              {ansiblePlaybooks.length} playbooks
            </span>
          </button>

          <button
            onClick={() => setActiveTool('puppet')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTool === 'puppet'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-orange-950/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Puppet Compliance &amp; Drift</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 font-mono">
              {puppetNodes.length} nodes
            </span>
          </button>
        </div>

        <div className="text-xs font-mono text-slate-400 pr-3 hidden sm:block">
          Continuous State Enforcement Engine
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: ANSIBLE */}
      {/* ======================================================== */}
      {activeTool === 'ansible' && (
        <div className="space-y-6">
          {/* Playbooks & Execution Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Playbooks List */}
            <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b] space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-rose-400" />
                  Available Playbooks
                </h3>
                <span className="text-xs font-mono text-slate-400">Inventory: AWS EKS</span>
              </div>

              <div className="space-y-2.5">
                {ansiblePlaybooks.map(pb => (
                  <div
                    key={pb.id}
                    onClick={() => setSelectedPlaybook(pb)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      selectedPlaybook.id === pb.id
                        ? 'bg-rose-950/20 border-rose-500/40 shadow-sm'
                        : 'bg-[#0a0d14] border-[#1e293b] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-xs font-bold text-white font-mono">{pb.name}</h4>
                      <StatusBadge status={pb.status} size="sm" />
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">{pb.file}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Targets: {pb.targetHosts.join(', ')}</span>
                      <span>Last: {pb.lastRun}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Playbook Live Execution Details */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-[#111726] border border-[#1e293b] flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1e293b]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white font-mono">{selectedPlaybook.name}</h3>
                      <StatusBadge status={selectedPlaybook.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      File: {selectedPlaybook.file} • Targets: {selectedPlaybook.targetHosts.join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setYamlModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 flex items-center gap-1.5 transition"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>View YAML</span>
                    </button>

                    <button
                      onClick={() => runAnsiblePlaybook(selectedPlaybook.id)}
                      disabled={runningPlaybookId === selectedPlaybook.id}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-950/30 transition active:scale-95 disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{runningPlaybookId === selectedPlaybook.id ? 'Running Playbook...' : 'Run Playbook'}</span>
                    </button>
                  </div>
                </div>

                {/* Simulated Playbook Tasks Stepper */}
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                    Playbook Tasks Progression ({selectedPlaybook.tasks.length} tasks)
                  </p>

                  <div className="space-y-2">
                    {selectedPlaybook.tasks.map((task, idx) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-xl bg-[#0a0d14] border border-[#1e293b] flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="text-slate-200 font-medium">TASK [{task.name}]</span>
                            <span className="text-[10px] text-slate-500 ml-2">host: {task.host}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 text-[11px]">{task.durationMs}ms</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              task.status === 'ok'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Play Recap */}
              <div className="mt-6 p-3 rounded-xl bg-[#070a10] border border-[#1e293b] font-mono text-xs text-slate-400 flex items-center justify-between">
                <span>PLAY RECAP:</span>
                <span className="text-emerald-400">ok=5</span>
                <span className="text-amber-400">changed=1</span>
                <span className="text-slate-400">unreachable=0</span>
                <span className="text-slate-400">failed=0</span>
              </div>
            </div>
          </div>

          {/* Managed Hosts Fleet Table */}
          <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b]">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              Ansible Managed Node Inventory
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#1e293b] text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Hostname</th>
                    <th className="py-2.5 px-3">Group</th>
                    <th className="py-2.5 px-3">IP Address</th>
                    <th className="py-2.5 px-3">Operating System</th>
                    <th className="py-2.5 px-3">State</th>
                    <th className="py-2.5 px-3">Last Ping</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b] text-slate-300">
                  {ansibleHosts.map(host => (
                    <tr key={host.id} className="hover:bg-[#151f33] transition">
                      <td className="py-3 px-3 font-bold text-white">{host.hostname}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 text-[10px]">
                          {host.group}
                        </span>
                      </td>
                      <td className="py-3 px-3">{host.ip}</td>
                      <td className="py-3 px-3 text-slate-400">{host.os}</td>
                      <td className="py-3 px-3">
                        <StatusBadge status={host.state === 'reachable' ? 'Ready' : 'Not Ready'} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-slate-400">{host.lastPing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: PUPPET */}
      {/* ======================================================== */}
      {activeTool === 'puppet' && (
        <div className="space-y-6">
          {/* Puppet Compliance Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b]">
              <p className="text-xs uppercase font-mono text-slate-400">Total Managed Nodes</p>
              <h3 className="text-2xl font-bold font-mono text-white mt-1">{puppetNodes.length} Nodes</h3>
              <p className="text-[11px] text-emerald-400 font-mono mt-1">100% Agent Healthy</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b]">
              <p className="text-xs uppercase font-mono text-slate-400">Fleet Compliance Score</p>
              <h3 className="text-2xl font-bold font-mono text-emerald-400 mt-1">98.8%</h3>
              <p className="text-[11px] text-slate-400 font-mono mt-1">Target catalog SLA: 98%</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b]">
              <p className="text-xs uppercase font-mono text-slate-400">Drift Detection</p>
              <h3 className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {puppetNodes.filter(n => n.drifts.length > 0).length} Drift Found
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-1">Auto-remediable via Catalog</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b]">
              <p className="text-xs uppercase font-mono text-slate-400">Puppet Server</p>
              <h3 className="text-2xl font-bold font-mono text-indigo-400 mt-1">v8.4.1</h3>
              <p className="text-[11px] text-slate-400 font-mono mt-1">Production Environment</p>
            </div>
          </div>

          {/* Managed Puppet Nodes Table */}
          <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Puppet Catalog Compliance &amp; Drift Monitor
              </h3>
              <span className="text-xs font-mono text-slate-400">Sync Interval: 30 minutes</span>
            </div>

            <div className="space-y-4">
              {puppetNodes.map(node => (
                <div
                  key={node.id}
                  className="p-4 rounded-xl bg-[#0a0d14] border border-[#1e293b] hover:border-slate-700 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white font-mono">{node.certname}</h4>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
                          {node.environment}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Puppet Agent {node.agentVersion} • Last Catalog Run: {node.lastCatalogApply}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-white">
                          {node.compliancePercent}% Compliance
                        </span>
                      </div>

                      <StatusBadge
                        status={node.drifts.length > 0 ? 'drift_detected' : 'compliant'}
                        size="sm"
                      />

                      {node.drifts.length > 0 && (
                        <button
                          onClick={() => enforcePuppetCompliance(node.id)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 transition active:scale-95 shadow"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Enforce Catalog (Fix Drift)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Drift details if any */}
                  {node.drifts.length > 0 ? (
                    <div className="mt-3 p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs font-mono space-y-1">
                      <p className="text-amber-300 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Drift Alert: Manual Configuration Alteration Detected
                      </p>
                      {node.drifts.map((drift, dIdx) => (
                        <div key={dIdx} className="text-slate-300 pt-1">
                          <span className="text-indigo-300">{drift.resource}</span>: expected{' '}
                          <span className="text-emerald-300 font-semibold">{drift.expected}</span>, but found{' '}
                          <span className="text-rose-300 font-semibold">{drift.actual}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs font-mono text-emerald-400/80 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>In total synchronization with Puppet master catalog.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Playbook YAML Modal */}
      <YamlViewerModal
        isOpen={yamlModalOpen}
        onClose={() => setYamlModalOpen(false)}
        title={`Ansible Playbook: ${selectedPlaybook.name}`}
        filename={selectedPlaybook.file}
        yamlContent={playbookYaml}
      />
    </div>
  );
};

