import React, { useState } from 'react';
import {
  Network,
  Cloud,
  Layers,
  Terminal,
  ShieldCheck,
  Server,
  GitBranch,
  Activity,
  BarChart2,
  Box,
  HeartPulse,
  ArrowRight,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useKubeOps } from '../context/KubeOpsContext';

interface ArchitectureNode {
  id: string;
  name: string;
  category: 'Cloud' | 'Provisioning' | 'Configuration' | 'Runtime' | 'Orchestration' | 'CI/CD' | 'Observability' | 'Self-Healing';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
  bgGradient: string;
  role: string;
  inputs: string[];
  outputs: string[];
  configSnippet: string;
}

export const ArchitecturePage: React.FC = () => {
  const { setActivePage } = useKubeOps();

  const architectureNodes: ArchitectureNode[] = [
    {
      id: 'aws',
      name: 'AWS Cloud Infrastructure',
      category: 'Cloud',
      icon: Cloud,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      bgGradient: 'from-amber-950/20 to-orange-950/10',
      role: 'Underlying cloud platform hosting VPC (10.0.0.0/16), multi-AZ subnets, Internet Gateways, NAT Gateways, EC2 m5.xlarge instances, and IAM roles.',
      inputs: ['Terraform IaC specifications'],
      outputs: ['Cloud resources, VPC network, EC2 compute instances to Kubernetes & Ansible'],
      configSnippet: `resource "aws_vpc" "kubeops" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
}`
    },
    {
      id: 'terraform',
      name: 'Terraform (IaC)',
      category: 'Provisioning',
      icon: Layers,
      color: 'text-purple-400',
      borderColor: 'border-purple-500/30',
      bgGradient: 'from-purple-950/20 to-indigo-950/10',
      role: 'Automates provisioning and lifecycle management of AWS VPC, EKS cluster, managed worker node groups, security groups, and storage classes.',
      inputs: ['Git-tracked .tf HCL templates, AWS provider credentials'],
      outputs: ['EKS Control Plane, Worker Node Autoscaling Groups, VPC state'],
      configSnippet: `module "eks" {
  source       = "terraform-aws-modules/eks/aws"
  cluster_name = "prod-aws-us-east-1"
}`
    },
    {
      id: 'ansible',
      name: 'Ansible Automation',
      category: 'Configuration',
      icon: Terminal,
      color: 'text-rose-400',
      borderColor: 'border-rose-500/30',
      bgGradient: 'from-rose-950/20 to-red-950/10',
      role: 'Agentless host bootstrapping, kernel sysctl tuning (br_netfilter), container runtime installation, security hardening, and NRPE daemon deployment.',
      inputs: ['Inventory file (dynamic AWS EC2), YAML playbooks'],
      outputs: ['Hardened node OS, configured containerd runtime, active NRPE agent'],
      configSnippet: `- name: Configure Worker Nodes
  hosts: workers
  tasks:
    - name: Setup containerd config
      template: src=config.toml dest=/etc/containerd/`
    },
    {
      id: 'puppet',
      name: 'Puppet Compliance',
      category: 'Configuration',
      icon: ShieldCheck,
      color: 'text-orange-400',
      borderColor: 'border-orange-500/30',
      bgGradient: 'from-orange-950/20 to-amber-950/10',
      role: 'Continuous declarative state verification and drift remediation. Periodically pulls master catalog to guarantee zero unauthorized OS or security drifts.',
      inputs: ['Puppet master catalog manifests'],
      outputs: ['Enforced file permissions, sysctl settings, and compliance audit reports'],
      configSnippet: `node 'k8s-worker-node' {
  file { '/etc/security/limits.d/99-nofile.conf':
    content => 'nofile 65536',
  }
}`
    },
    {
      id: 'docker',
      name: 'Docker & Containerd',
      category: 'Runtime',
      icon: Box,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      bgGradient: 'from-cyan-950/20 to-blue-950/10',
      role: 'CRI-compliant container runtime executing microservices inside isolated cgroups and namespaces, managed directly by the Kubelet daemon.',
      inputs: ['OCI Container images built by Jenkins CI/CD'],
      outputs: ['Running container processes, cgroup CPU/Memory telemetry to Kubelet'],
      configSnippet: `containerd:
  version = 2
  [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
    SystemdCgroup = true`
    },
    {
      id: 'kubernetes',
      name: 'Kubernetes (K8s)',
      category: 'Orchestration',
      icon: Server,
      color: 'text-blue-400',
      borderColor: 'border-blue-500/30',
      bgGradient: 'from-blue-950/20 to-indigo-950/10',
      role: 'Central container orchestrator. Houses control plane (API Server, Controller Manager, Scheduler, etcd) and worker nodes running pods, services, and ingresses.',
      inputs: ['YAML manifests from Jenkins, infrastructure from Terraform, node OS from Ansible'],
      outputs: ['Running pod workloads, liveness/readiness status, service mesh routing'],
      configSnippet: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-service
spec:
  replicas: 2`
    },
    {
      id: 'jenkins',
      name: 'Jenkins CI/CD',
      category: 'CI/CD',
      icon: GitBranch,
      color: 'text-indigo-400',
      borderColor: 'border-indigo-500/30',
      bgGradient: 'from-indigo-950/20 to-violet-950/10',
      role: 'Automates git commit checkout, compilation, unit testing, Docker image creation, security scanning, and deployment rollout to Kubernetes clusters.',
      inputs: ['Git commit webhooks, source code repository'],
      outputs: ['Packaged container images pushed to registry, kubectl rolling updates to K8s'],
      configSnippet: `pipeline {
  agent any
  stages {
    stage('Docker Build') { ... }
    stage('Deploy K8s') { ... }
  }
}`
    },
    {
      id: 'nagios',
      name: 'Nagios Core',
      category: 'Observability',
      icon: Activity,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgGradient: 'from-emerald-950/20 to-teal-950/10',
      role: 'Synthetic probe monitoring engine. Checks host ping availability, HTTP microservice endpoints, NRPE CPU/memory thresholds, and fires instant failure alerts.',
      inputs: ['Host IP endpoints, NRPE agent daemon on workers, HTTP /healthz probes'],
      outputs: ['CRITICAL/WARNING alerts dispatched to KubeOps EventBus & Self-Healing engine'],
      configSnippet: `define service {
  host_name             k8s-worker-node-01
  service_description   HTTP Service: payment-service
  check_command         check_http!-p 8080 -u /healthz
}`
    },
    {
      id: 'prometheus-grafana',
      name: 'Prometheus & Grafana',
      category: 'Observability',
      icon: BarChart2,
      color: 'text-violet-400',
      borderColor: 'border-violet-500/30',
      bgGradient: 'from-violet-950/20 to-purple-950/10',
      role: 'Time-series telemetry ingestion (cAdvisor, kube-state-metrics, node-exporter) rendered into rich dashboards and alerting rule evaluations.',
      inputs: ['Scrape endpoints (/metrics) from Kubernetes nodes and pods'],
      outputs: ['Time-series history, Grafana dashboard graphs, HPA scaling metrics'],
      configSnippet: `scrape_configs:
  - job_name: 'kubernetes-nodes'
    scheme: https
    tls_config: { ca_file: ... }`
    },
    {
      id: 'self-healing',
      name: 'KubeOps Self-Healing Loop',
      category: 'Self-Healing',
      icon: HeartPulse,
      color: 'text-teal-400',
      borderColor: 'border-teal-500/30',
      bgGradient: 'from-teal-950/20 to-emerald-950/10',
      role: 'Autonomous feedback loop uniting Nagios synthetic alerts and Kubernetes controller reconciliation. Replaces crashed containers, validates healthz probes, and logs MTTR.',
      inputs: ['Nagios CRITICAL alerts, K8s Pod CrashLoop events'],
      outputs: ['Automated pod rolling restart, traffic failover, alert clearing'],
      configSnippet: `remediation_policy:
  trigger: "Nagios_CRITICAL || K8s_CrashLoop"
  action: "k8s_replica_replacement"
  timeout: "30s"`
    }
  ];

  const [selectedNode, setSelectedNode] = useState<ArchitectureNode>(architectureNodes[5]); // Default Kubernetes

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Enterprise Architecture Topology</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-mono">
              End-to-End DevOps Integration
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Interactive system topology illustrating data flow and relationship between all 10 platform layers
          </p>
        </div>

        <button
          onClick={() => setActivePage('self-healing')}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
        >
          <span>View Self-Healing Flow</span>
          <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
        </button>
      </div>

      {/* Main Interactive Diagram & Inspection Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Architectural Layer Topology Grid */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111726] border border-[#1e293b] space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Network className="w-4 h-4 text-indigo-400" />
              Integrated Component Graph (Click node to inspect specs)
            </h3>
            <span className="text-xs font-mono text-slate-400">10 Connected Components</span>
          </div>

          {/* Grouped by Logical Tiers */}
          <div className="space-y-4">
            {/* Tier 1: Cloud & Provisioning */}
            <div>
              <p className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider mb-2">
                Tier 1: Cloud &amp; Infrastructure as Code
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[architectureNodes[0], architectureNodes[1]].map(node => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                      selectedNode.id === node.id
                        ? `${node.borderColor} bg-gradient-to-br ${node.bgGradient} shadow-lg ring-1 ring-indigo-500`
                        : 'border-[#1e293b] bg-[#0a0d14] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg bg-slate-900 border border-slate-800 ${node.color}`}>
                        <node.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white font-mono">{node.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{node.category}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tier 2: Configuration & Continuous Compliance */}
            <div>
              <p className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider mb-2">
                Tier 2: Configuration Management &amp; Drift Remediation
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[architectureNodes[2], architectureNodes[3]].map(node => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                      selectedNode.id === node.id
                        ? `${node.borderColor} bg-gradient-to-br ${node.bgGradient} shadow-lg ring-1 ring-indigo-500`
                        : 'border-[#1e293b] bg-[#0a0d14] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg bg-slate-900 border border-slate-800 ${node.color}`}>
                        <node.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white font-mono">{node.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{node.category}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tier 3: Core Runtime & Orchestration */}
            <div>
              <p className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider mb-2">
                Tier 3: Container Runtime &amp; Kubernetes Orchestration
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[architectureNodes[4], architectureNodes[5]].map(node => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                      selectedNode.id === node.id
                        ? `${node.borderColor} bg-gradient-to-br ${node.bgGradient} shadow-lg ring-1 ring-indigo-500`
                        : 'border-[#1e293b] bg-[#0a0d14] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg bg-slate-900 border border-slate-800 ${node.color}`}>
                        <node.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white font-mono">{node.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{node.category}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tier 4: CI/CD Pipeline & Delivery */}
            <div>
              <p className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider mb-2">
                Tier 4: Automated CI/CD Delivery
              </p>
              <div className="grid grid-cols-1 gap-3">
                {[architectureNodes[6]].map(node => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                      selectedNode.id === node.id
                        ? `${node.borderColor} bg-gradient-to-br ${node.bgGradient} shadow-lg ring-1 ring-indigo-500`
                        : 'border-[#1e293b] bg-[#0a0d14] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg bg-slate-900 border border-slate-800 ${node.color}`}>
                        <node.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white font-mono">{node.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{node.category}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tier 5: Observability & Self-Healing Feedback Loop */}
            <div>
              <p className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider mb-2">
                Tier 5: Observability &amp; Self-Healing Loop
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[architectureNodes[7], architectureNodes[8], architectureNodes[9]].map(node => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                      selectedNode.id === node.id
                        ? `${node.borderColor} bg-gradient-to-br ${node.bgGradient} shadow-lg ring-1 ring-indigo-500`
                        : 'border-[#1e293b] bg-[#0a0d14] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 ${node.color}`}>
                        <node.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white font-mono truncate">{node.name}</h4>
                        <span className="text-[9px] text-slate-400 font-mono">{node.category}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Component Deep Dive Inspector */}
        <div className="p-6 rounded-2xl bg-[#111726] border border-[#1e293b] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-[#1e293b]">
              <div className={`p-3 rounded-xl bg-slate-900 border border-slate-800 ${selectedNode.color}`}>
                <selectedNode.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-mono">{selectedNode.name}</h3>
                <span className="text-xs font-mono uppercase font-bold text-indigo-400">
                  {selectedNode.category} Layer
                </span>
              </div>
            </div>

            {/* Role & Description */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-1">
                Architectural Role
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#0a0d14] p-3 rounded-xl border border-[#1e293b]">
                {selectedNode.role}
              </p>
            </div>

            {/* Inputs / Upstream Data Flow */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-1">
                Inputs / Upstream
              </h4>
              <div className="space-y-1">
                {selectedNode.inputs.map((inFlow, idx) => (
                  <div key={idx} className="text-xs text-slate-400 font-mono flex items-start gap-1.5">
                    <span className="text-indigo-400">←</span>
                    <span>{inFlow}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Outputs / Downstream Data Flow */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-1">
                Outputs / Downstream
              </h4>
              <div className="space-y-1">
                {selectedNode.outputs.map((outFlow, idx) => (
                  <div key={idx} className="text-xs text-slate-400 font-mono flex items-start gap-1.5">
                    <span className="text-emerald-400">→</span>
                    <span>{outFlow}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Config Manifest */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-1">
                Sample Infrastructure Manifest
              </h4>
              <pre className="p-3 rounded-xl bg-[#070a10] border border-[#1e293b] font-mono text-[11px] text-indigo-200 overflow-x-auto leading-relaxed">
                {selectedNode.configSnippet}
              </pre>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#1e293b] flex items-center justify-between text-xs font-mono text-slate-400">
            <span>KubeOps Integration: Certified</span>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

