import React, { useState } from 'react';
import {
  Server,
  Layers,
  Search,
  Filter,
  Plus,
  Minus,
  RefreshCw,
  Trash2,
  FileCode,
  Terminal,
  Cpu,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Zap,
  Globe,
  Radio
} from 'lucide-react';
import { useKubeOps } from '../context/KubeOpsContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { YamlViewerModal } from '../components/common/YamlViewerModal';
import { K8sPod, K8sDeployment } from '../types';

export const KubernetesPage: React.FC = () => {
  const {
    selectedCluster,
    nodes,
    pods,
    deployments,
    namespaces,
    services,
    scaleDeployment,
    restartDeployment,
    deletePod,
    restartPod,
    simulatePodFailure,
    isSelfHealingActive
  } = useKubeOps();

  // Tab state
  const [activeTab, setActiveTab] = useState<'pods' | 'nodes' | 'deployments' | 'services' | 'namespaces'>('pods');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [namespaceFilter, setNamespaceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [yamlModalOpen, setYamlModalOpen] = useState(false);
  const [yamlModalData, setYamlModalData] = useState<{ title: string; filename: string; content: string }>({
    title: '',
    filename: '',
    content: ''
  });

  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [activeLogPod, setActiveLogPod] = useState<K8sPod | null>(null);

  // Filtered pods
  const filteredPods = pods.filter(pod => {
    const matchesSearch =
      pod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pod.deployment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pod.node.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNamespace = namespaceFilter === 'all' || pod.namespace === namespaceFilter;
    const matchesStatus = statusFilter === 'all' || pod.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesNamespace && matchesStatus;
  });

  // Open YAML helper
  const handleOpenPodYaml = (pod: K8sPod) => {
    const yaml = `apiVersion: v1
kind: Pod
metadata:
  name: ${pod.name}
  namespace: ${pod.namespace}
  labels:
    app: ${pod.deployment}
    cluster: ${selectedCluster.name}
spec:
  nodeName: ${pod.node}
  containers:
  - name: ${pod.deployment}
    image: kubeops/${pod.deployment}:v2.4.1
    imagePullPolicy: IfNotPresent
    ports:
    - containerPort: 8080
      name: http
    resources:
      requests:
        cpu: "100m"
        memory: "256Mi"
      limits:
        cpu: "500m"
        memory: "512Mi"
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 15
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 5
  restartPolicy: Always
status:
  phase: ${pod.status}
  podIP: ${pod.ip}
  hostIP: 10.0.2.14
  startTime: "${new Date().toISOString()}"`;

    setYamlModalData({
      title: `Pod Manifest: ${pod.name}`,
      filename: `${pod.name}.yaml`,
      content: yaml
    });
    setYamlModalOpen(true);
  };

  const handleOpenDeploymentYaml = (dep: K8sDeployment) => {
    const yaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${dep.name}
  namespace: ${dep.namespace}
spec:
  replicas: ${dep.replicas}
  strategy:
    type: ${dep.strategy}
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 0
  selector:
    matchLabels:
      app: ${dep.name}
  template:
    metadata:
      labels:
        app: ${dep.name}
    spec:
      containers:
      - name: ${dep.name}
        image: ${dep.image}
        ports:
        - containerPort: 8080
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"`;

    setYamlModalData({
      title: `Deployment Manifest: ${dep.name}`,
      filename: `${dep.name}-deployment.yaml`,
      content: yaml
    });
    setYamlModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Cluster Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#111726] to-[#151e33] border border-[#1e293b] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-mono">{selectedCluster.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                {selectedCluster.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {selectedCluster.provider} • {selectedCluster.region} • Version {selectedCluster.version}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono">
          <div>
            <p className="text-slate-400">Control Plane</p>
            <p className="text-sm font-bold text-slate-200">1 Node (Ready)</p>
          </div>
          <div>
            <p className="text-slate-400">Worker Nodes</p>
            <p className="text-sm font-bold text-slate-200">{nodes.filter(n => n.role === 'worker').length} Active</p>
          </div>
          <div>
            <p className="text-slate-400">Total Pods</p>
            <p className="text-sm font-bold text-indigo-300">{pods.length} Deployed</p>
          </div>
          <div>
            <button
              onClick={() => simulatePodFailure()}
              disabled={isSelfHealingActive}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-900/20 transition active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Simulate Crash</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1e293b] gap-2 overflow-x-auto pb-1">
        {[
          { id: 'pods', label: `Pods (${pods.length})`, icon: Layers },
          { id: 'nodes', label: `Nodes (${nodes.length})`, icon: Server },
          { id: 'deployments', label: `Deployments (${deployments.length})`, icon: Layers },
          { id: 'services', label: `Services (${services.length})`, icon: Globe },
          { id: 'namespaces', label: `Namespaces (${namespaces.length})`, icon: Radio }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2 transition shrink-0 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-[#111726]'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* PODS TAB */}
      {/* ======================================================== */}
      {activeTab === 'pods' && (
        <div className="space-y-4">
          {/* Controls Bar: Search & Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#111726] border border-[#1e293b]">
            <div className="flex items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter pods by name, deployment, node..."
                  className="w-full bg-[#0a0d14] border border-[#1e293b] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Namespace Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-mono">Namespace:</span>
                <select
                  value={namespaceFilter}
                  onChange={e => setNamespaceFilter(e.target.value)}
                  className="bg-[#0a0d14] border border-[#1e293b] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="all">all namespaces</option>
                  <option value="production">production</option>
                  <option value="staging">staging</option>
                  <option value="monitoring">monitoring</option>
                  <option value="kube-system">kube-system</option>
                  <option value="ingress-nginx">ingress-nginx</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-mono">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-[#0a0d14] border border-[#1e293b] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="all">all statuses</option>
                  <option value="running">Running</option>
                  <option value="crashloopbackoff">CrashLoopBackOff</option>
                  <option value="containercreating">ContainerCreating</option>
                </select>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-400">
              Showing <span className="text-white font-bold">{filteredPods.length}</span> of {pods.length} pods
            </div>
          </div>

          {/* Pods Table */}
          <div className="rounded-2xl bg-[#111726] border border-[#1e293b] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1e293b] bg-[#0c101b] text-slate-400 font-mono uppercase text-[10px]">
                    <th className="py-3 px-4">Pod Name</th>
                    <th className="py-3 px-3">Namespace</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Restarts</th>
                    <th className="py-3 px-3">Age</th>
                    <th className="py-3 px-3">CPU / Memory</th>
                    <th className="py-3 px-3">Node</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {filteredPods.map(pod => {
                    const isFailing = pod.status === 'CrashLoopBackOff' || pod.status === 'Error';

                    return (
                      <tr
                        key={pod.id}
                        className={`hover:bg-[#151f33] transition ${
                          isFailing ? 'bg-rose-950/20' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-200">{pod.name}</span>
                            {pod.isTargetOfFailure && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono">
                                Target
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            IP: {pod.ip} • Ready: {pod.readyContainers}
                          </p>
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                            {pod.namespace}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <StatusBadge status={pod.status} size="sm" />
                        </td>

                        <td className="py-3 px-3 font-mono font-medium text-slate-300">
                          {pod.restarts}
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-400">{pod.age}</td>

                        <td className="py-3 px-3 font-mono text-slate-300">
                          <div>CPU: {pod.cpuUsage}</div>
                          <div className="text-[10px] text-slate-400">RAM: {pod.memUsage}</div>
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                          {pod.node}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Logs Button */}
                            <button
                              onClick={() => {
                                setActiveLogPod(pod);
                                setLogsModalOpen(true);
                              }}
                              title="View Container Logs"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                            >
                              <Terminal className="w-3.5 h-3.5" />
                            </button>

                            {/* YAML Button */}
                            <button
                              onClick={() => handleOpenPodYaml(pod)}
                              title="Inspect YAML Manifest"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                            >
                              <FileCode className="w-3.5 h-3.5" />
                            </button>

                            {/* Restart Button */}
                            <button
                              onClick={() => restartPod(pod.id)}
                              title="Restart Pod"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 transition"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Pod Button */}
                            <button
                              onClick={() => deletePod(pod.id)}
                              title="Delete Pod"
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* NODES TAB */}
      {/* ======================================================== */}
      {activeTab === 'nodes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {nodes.map(node => (
              <div
                key={node.id}
                className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b] hover:border-slate-600 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-white text-sm">{node.name}</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                        {node.role}
                      </span>
                    </div>
                    <StatusBadge status={node.status} size="sm" />
                  </div>

                  <div className="space-y-2 text-xs font-mono text-slate-300 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Instance:</span>
                      <span>{node.instanceType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Internal IP:</span>
                      <span>{node.internalIP}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Zone:</span>
                      <span>{node.zone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kubelet:</span>
                      <span>{node.kubeletVersion}</span>
                    </div>
                  </div>

                  {/* CPU Usage Bar */}
                  <div className="space-y-1 mb-2">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">CPU Usage</span>
                      <span className="text-cyan-400">{node.cpuUsagePercent}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{ width: `${node.cpuUsagePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Memory Usage Bar */}
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Memory Usage</span>
                      <span className="text-purple-400">{node.memoryUsagePercent}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-400 rounded-full"
                        style={{ width: `${node.memoryUsagePercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Allocated: {node.podsAllocated} / {node.maxPods} pods</span>
                  <span>Age: {node.age}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DEPLOYMENTS TAB */}
      {/* ======================================================== */}
      {activeTab === 'deployments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deployments.map(dep => (
              <div
                key={dep.id}
                className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b] hover:border-slate-600 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-bold text-white font-mono">{dep.name}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{dep.image}</p>
                    </div>
                    <StatusBadge status={dep.status} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#0a0d14] border border-[#1e293b] my-4 text-xs font-mono">
                    <div>
                      <p className="text-slate-500">Namespace</p>
                      <p className="text-slate-200 font-semibold">{dep.namespace}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Strategy</p>
                      <p className="text-slate-200 font-semibold">{dep.strategy}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Updated</p>
                      <p className="text-slate-200">{dep.updatedAt.split(' ')[0]}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Health State</p>
                      <p className="text-emerald-400 font-semibold">Ready</p>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Replica Count Scaler Controls */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#1e293b]">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-mono">Replicas:</span>
                      <div className="flex items-center gap-2 bg-[#0a0d14] p-1 rounded-xl border border-[#1e293b]">
                        <button
                          onClick={() => scaleDeployment(dep.id, -1)}
                          disabled={dep.replicas <= 1}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-sm text-white px-2">
                          {dep.replicas}
                        </span>
                        <button
                          onClick={() => scaleDeployment(dep.id, 1)}
                          disabled={dep.replicas >= 10}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => restartDeployment(dep.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Restart</span>
                      </button>

                      <button
                        onClick={() => handleOpenDeploymentYaml(dep)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
                      >
                        <FileCode className="w-3.5 h-3.5 text-slate-400" />
                        <span>YAML</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SERVICES TAB */}
      {/* ======================================================== */}
      {activeTab === 'services' && (
        <div className="rounded-2xl bg-[#111726] border border-[#1e293b] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1e293b] bg-[#0c101b] text-slate-400 uppercase text-[10px]">
                  <th className="py-3 px-4">Service Name</th>
                  <th className="py-3 px-3">Namespace</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Cluster IP</th>
                  <th className="py-3 px-3">External Endpoint</th>
                  <th className="py-3 px-3">Port(s)</th>
                  <th className="py-3 px-4">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b] text-slate-300">
                {services.map(svc => (
                  <tr key={svc.name} className="hover:bg-[#151f33] transition">
                    <td className="py-3 px-4 font-bold text-white">{svc.name}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {svc.namespace}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-indigo-400">{svc.type}</td>
                    <td className="py-3 px-3">{svc.clusterIP}</td>
                    <td className="py-3 px-3 text-emerald-400">
                      {svc.externalIP || '<none>'}
                    </td>
                    <td className="py-3 px-3">{svc.ports}</td>
                    <td className="py-3 px-4 text-slate-400">{svc.age}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* NAMESPACES TAB */}
      {/* ======================================================== */}
      {activeTab === 'namespaces' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {namespaces.map(ns => (
            <div
              key={ns.name}
              className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b] hover:border-slate-600 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white font-mono">{ns.name}</h3>
                <StatusBadge status={ns.status} size="sm" />
              </div>

              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pods Running:</span>
                  <span className="font-bold text-indigo-400">{ns.podsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Services:</span>
                  <span>{ns.servicesCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CPU Quota:</span>
                  <span>{ns.cpuQuota}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Memory Quota:</span>
                  <span>{ns.memoryQuota}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* YAML Viewer Modal */}
      <YamlViewerModal
        isOpen={yamlModalOpen}
        onClose={() => setYamlModalOpen(false)}
        title={yamlModalData.title}
        filename={yamlModalData.filename}
        yamlContent={yamlModalData.content}
      />

      {/* Pod Logs Modal */}
      {logsModalOpen && activeLogPod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-3xl bg-[#0c101b] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-[#1e293b] bg-[#111726] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{activeLogPod.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Container: {activeLogPod.deployment} • Namespace: {activeLogPod.namespace}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLogsModalOpen(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-[#080b12] text-xs font-mono text-slate-300 space-y-1.5">
              {(activeLogPod.recentLogs && activeLogPod.recentLogs.length > 0
                ? activeLogPod.recentLogs
                : [
                    `[${new Date().toLocaleTimeString()}] [INFO] Container initialized normally`,
                    `[${new Date().toLocaleTimeString()}] [INFO] Listening for HTTP requests on 0.0.0.0:8080`,
                    `[${new Date().toLocaleTimeString()}] [PROBE] Readiness check passed`
                  ]
              ).map((logLine, idx) => (
                <div
                  key={idx}
                  className={`p-1 rounded font-mono ${
                    logLine.includes('FATAL') || logLine.includes('OOMKilled') || logLine.includes('CRITICAL')
                      ? 'bg-rose-950/40 text-rose-300'
                      : logLine.includes('WARN')
                      ? 'bg-amber-950/40 text-amber-300'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {logLine}
                </div>
              ))}
            </div>

            <div className="px-4 py-2 bg-[#111726] border-t border-[#1e293b] text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <span>Streaming tail 100 lines (simulated)</span>
              <span className="text-emerald-400">Live stream connected</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

