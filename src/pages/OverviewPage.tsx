import React, { useState } from 'react';
import {
  Server,
  Cpu,
  Layers,
  HeartPulse,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  HardDrive,
  RefreshCw,
  Zap,
  ShieldCheck,
  Radio
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useKubeOps } from '../context/KubeOpsContext';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';

export const OverviewPage: React.FC = () => {
  const {
    selectedCluster,
    clusters,
    nodes,
    pods,
    deployments,
    cpuUtilization,
    memoryUtilization,
    infrastructureHealth,
    failedPodsCount,
    metricsHistory,
    events,
    alerts,
    dismissAlert,
    setActivePage,
    simulatePodFailure,
    isSelfHealingActive
  } = useKubeOps();

  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('1h');
  const [eventFilter, setEventFilter] = useState<string>('all');

  const runningPodsCount = pods.filter(p => p.status === 'Running').length;
  const workerNodes = nodes.filter(n => n.role === 'worker');

  // Filter events
  const filteredEvents = events.filter(e => {
    if (eventFilter === 'all') return true;
    return e.source.toLowerCase() === eventFilter.toLowerCase();
  });

  // Node resource distribution data for chart
  const nodeStatsData = nodes.map(n => ({
    name: n.name.replace('k8s-', '').replace('-node', ''),
    role: n.role,
    cpu: n.cpuUsagePercent,
    memory: n.memoryUsagePercent,
    pods: n.podsAllocated
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Self-Healing Alert Banner (if active) */}
      {isSelfHealingActive && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between shadow-lg shadow-amber-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 animate-pulse">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">
                Self-Healing Loop Active on Cluster '{selectedCluster.name}'
              </h4>
              <p className="text-xs text-amber-300/80">
                KubeOps autonomous remediation engine has detected an incident and is performing automated pod reconciliation.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActivePage('self-healing')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow"
          >
            <span>View Remediation Stepper</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Core Metrics Grid (7 items matching requirements) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Kubernetes Clusters */}
        <MetricCard
          title="Total Clusters"
          value={clusters.length}
          subtext={`${selectedCluster.name} (Active)`}
          icon={Server}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10 border-blue-500/20"
          change="AWS EKS v1.29"
          changeType="positive"
        />

        {/* 2. Active Worker Nodes */}
        <MetricCard
          title="Active Worker Nodes"
          value={workerNodes.length}
          subtext="1 Control Plane + 3 Workers"
          icon={HardDrive}
          iconColor="text-indigo-400"
          iconBg="bg-indigo-500/10 border-indigo-500/20"
          change="100% Ready"
          changeType="positive"
        />

        {/* 3. Running Pods */}
        <MetricCard
          title="Running Pods"
          value={runningPodsCount}
          subtext={`Total allocated: ${pods.length} pods`}
          icon={Layers}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10 border-emerald-500/20"
          change={`${Math.round((runningPodsCount / pods.length) * 100)}% active`}
          changeType="positive"
        />

        {/* 4. Failed Pods */}
        <MetricCard
          title="Failed Pods"
          value={failedPodsCount}
          subtext={failedPodsCount > 0 ? 'CrashLoopBackOff detected' : 'Zero pod failures'}
          icon={AlertTriangle}
          iconColor={failedPodsCount > 0 ? 'text-rose-400' : 'text-slate-400'}
          iconBg={failedPodsCount > 0 ? 'bg-rose-500/15 border-rose-500/30' : 'bg-slate-800 border-slate-700'}
          change={failedPodsCount > 0 ? 'Self-healing triggered' : 'Optimal'}
          changeType={failedPodsCount > 0 ? 'negative' : 'positive'}
        />

        {/* 5. CPU Utilization */}
        <MetricCard
          title="CPU Utilization"
          value={`${cpuUtilization}%`}
          subtext="12.2 Cores allocated / 20.0"
          icon={Cpu}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/10 border-cyan-500/20"
          progressPercent={cpuUtilization}
          progressColor="bg-cyan-500"
          change="Normal Load"
          changeType="positive"
        />

        {/* 6. Memory Utilization */}
        <MetricCard
          title="Memory Utilization"
          value={`${memoryUtilization}%`}
          subtext="54.4 GB used / 80.0 GB"
          icon={Activity}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/10 border-purple-500/20"
          progressPercent={memoryUtilization}
          progressColor="bg-purple-500"
          change="Within buffer"
          changeType="neutral"
        />

        {/* 7. Infrastructure Health Percentage */}
        <div className="sm:col-span-2 lg:col-span-2 p-5 rounded-2xl bg-gradient-to-r from-[#111726] to-[#141d33] border border-[#1e293b] flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Infrastructure Health Score
              </p>
            </div>
            <div className="flex items-baseline gap-3">
              <h3 className={`text-4xl font-extrabold font-mono tracking-tight ${infrastructureHealth >= 90 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {infrastructureHealth}%
              </h3>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                infrastructureHealth >= 90 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {infrastructureHealth >= 90 ? 'SLA Compliant (99.95%)' : 'Degraded SLA - Remediation in progress'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Composite telemetry from K8s API, Nagios checks, Puppet catalog &amp; Jenkins probes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => simulatePodFailure()}
              disabled={isSelfHealingActive}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition ${
                isSelfHealingActive
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white border border-rose-400/30 shadow-indigo-900/30 active:scale-95'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Simulate Pod Failure</span>
            </button>
          </div>
        </div>
      </div>

      {/* Charts Section: CPU & Memory Usage + Node Resource Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-time CPU & Memory Telemetry */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#111726] border border-[#1e293b]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Cluster Telemetry (CPU &amp; Memory Utilization)
              </h3>
              <p className="text-xs text-slate-400">Continuous telemetry sampled every 10 minutes</p>
            </div>

            <div className="flex items-center gap-1 bg-[#0a0d14] p-1 rounded-lg border border-[#1e293b]">
              {(['1h', '6h', '24h'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-2.5 py-1 text-xs rounded-md font-mono font-medium transition ${
                    timeRange === t
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricsHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d121f',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#cpuGradient)"
                  name="CPU Utilization (%)"
                />
                <Area
                  type="monotone"
                  dataKey="memory"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#memGradient)"
                  name="Memory Utilization (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                CPU: {cpuUtilization}%
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                Memory: {memoryUtilization}%
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-500">Live telemetry via Nagios NRPE &amp; Prometheus</span>
          </div>
        </div>

        {/* Right 1 Col: Node Capacity & Pod Allocation */}
        <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                Worker Node Distribution
              </h3>
              <button
                onClick={() => setActivePage('kubernetes')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                <span>View Nodes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Pod allocation across active worker nodes</p>

            <div className="space-y-3">
              {nodes.map(node => (
                <div key={node.id} className="p-3 rounded-xl bg-[#0a0d14] border border-[#1e293b]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-medium text-slate-200">{node.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({node.role})</span>
                    </div>
                    <StatusBadge status={node.status} size="sm" />
                  </div>

                  {/* Pods capacity bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${(node.podsAllocated / node.maxPods) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{node.podsAllocated} / {node.maxPods} pods</span>
                    <span>CPU: {node.cpuUsagePercent}% • Mem: {node.memoryUsagePercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between text-xs text-slate-400">
            <span>Cluster Architecture: Multi-AZ</span>
            <span className="text-emerald-400 font-mono font-semibold">Healthy</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Active Alerts & Deployment Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Active Infrastructure Alerts</h3>
              {alerts.length > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {alerts.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setActivePage('nagios')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>Nagios Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {alerts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border border-dashed border-[#1e293b] rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-300">No active alerts detected</p>
              <p className="text-xs text-slate-400">All cluster services and pods are operating within threshold.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                    alert.severity === 'critical'
                      ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                      : alert.severity === 'warning'
                      ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                      : 'bg-indigo-950/20 border-indigo-500/40 text-indigo-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-black/30">
                        {alert.severity}
                      </span>
                      <h4 className="text-xs font-bold text-white">{alert.title}</h4>
                      <span className="text-[10px] font-mono text-slate-400">• {alert.source}</span>
                    </div>
                    <p className="text-xs text-slate-300">{alert.message}</p>
                  </div>

                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition shrink-0"
                  >
                    Acknowledge
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deployments Activity */}
        <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Kubernetes Deployments</h3>
            </div>
            <button
              onClick={() => setActivePage('kubernetes')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {deployments.map(dep => (
              <div
                key={dep.id}
                className="p-3 rounded-xl bg-[#0a0d14] border border-[#1e293b] flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white font-mono">{dep.name}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {dep.namespace}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{dep.image}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-slate-200">
                      {dep.availableReplicas} / {dep.replicas} Replicas
                    </p>
                    <p className="text-[10px] text-slate-500">{dep.strategy}</p>
                  </div>
                  <StatusBadge status={dep.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Infrastructure Events Stream */}
      <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Live Infrastructure Event Stream</h3>
              <p className="text-xs text-slate-400">Aggregated real-time audit log across all integrated tools</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#0a0d14] p-1 rounded-xl border border-[#1e293b]">
            {(['all', 'Kubernetes', 'Nagios', 'Jenkins', 'Terraform', 'Ansible', 'Puppet', 'Self-Healing'] as const).map(src => (
              <button
                key={src}
                onClick={() => setEventFilter(src)}
                className={`px-2.5 py-1 text-[11px] rounded-lg font-mono font-medium transition ${
                  eventFilter === src
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {src}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {filteredEvents.map(ev => (
            <div
              key={ev.id}
              className="p-3 rounded-xl bg-[#0a0d14] border border-[#1e293b] hover:border-slate-600 transition flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  ev.type === 'error' ? 'bg-rose-400 animate-ping' :
                  ev.type === 'warning' ? 'bg-amber-400' :
                  ev.type === 'success' ? 'bg-emerald-400' : 'bg-blue-400'
                }`} />

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                      {ev.source}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-200 truncate">{ev.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{ev.message}</p>
                </div>
              </div>

              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                {ev.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

