import React, { useState } from 'react';
import {
  Layers,
  Play,
  RotateCcw,
  Trash2,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  FileCode,
  ShieldAlert,
  Server,
  Cloud,
  ArrowRight
} from 'lucide-react';
import { useKubeOps } from '../context/KubeOpsContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { sampleTerraformPlanOutput } from '../data/mockData';

export const TerraformPage: React.FC = () => {
  const {
    terraformResources,
    terraformLogs,
    isTerraformRunning,
    runTerraformPlan,
    runTerraformApply,
    runTerraformDestroy
  } = useKubeOps();

  const [activeTab, setActiveTab] = useState<'resources' | 'terminal' | 'plan' | 'hcl'>('terminal');
  const [copiedPlan, setCopiedPlan] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const filteredResources = terraformResources.filter(r => {
    if (filterType === 'all') return true;
    return r.type.includes(filterType);
  });

  const sampleHCL = `# AWS Infrastructure Provisioning with Terraform
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.30.0"
    }
  }
  backend "s3" {
    bucket         = "kubeops-terraform-tfstate"
    key            = "prod/eks-cluster.tfstate"
    region         = "us-east-1"
    dynamodb_table = "kubeops-tfstate-lock"
  }
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.1.0"

  name = "kubeops-vpc-production"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway   = true
  single_nat_gateway   = true
  enable_dns_hostnames = true
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "prod-aws-us-east-1"
  cluster_version = "1.29"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    workers = {
      min_size     = 3
      max_size     = 10
      desired_size = 3
      instance_types = ["m5.xlarge"]
      capacity_type  = "ON_DEMAND"
    }
  }
}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Banner & Action Controls */}
      <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">AWS Infrastructure Provisioning</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
              Terraform v1.7.4
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Target State: s3://kubeops-terraform-tfstate • Lock: DynamoDB • Provider: AWS us-east-1
          </p>
        </div>

        {/* Action Buttons: Plan, Apply, Destroy */}
        <div className="flex items-center gap-2">
          <button
            onClick={runTerraformPlan}
            disabled={isTerraformRunning}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isTerraformRunning ? 'animate-spin' : ''}`} />
            <span>terraform plan</span>
          </button>

          <button
            onClick={runTerraformApply}
            disabled={isTerraformRunning}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-900/30 border border-indigo-400/30 transition active:scale-95 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 text-indigo-200" />
            <span>terraform apply</span>
          </button>

          <button
            onClick={runTerraformDestroy}
            disabled={isTerraformRunning}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>terraform destroy</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1e293b] gap-2">
        {[
          { id: 'terminal', label: 'Simulated Execution Terminal', icon: Terminal },
          { id: 'resources', label: `Tracked Resources (${terraformResources.length})`, icon: Layers },
          { id: 'plan', label: 'Execution Plan Output', icon: FileCode },
          { id: 'hcl', label: 'main.tf (HCL Configuration)', icon: FileCode }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2 transition ${
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
      {/* TAB 1: TERMINAL OUTPUT */}
      {/* ======================================================== */}
      {activeTab === 'terminal' && (
        <div className="rounded-2xl bg-[#090d16] border border-[#1e293b] overflow-hidden shadow-2xl">
          {/* Terminal Window Header */}
          <div className="px-4 py-2.5 bg-[#111726] border-b border-[#1e293b] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-xs font-mono text-slate-400 ml-2">bash - terraform@kubeops-bastion:~/infra</span>
            </div>

            <div className="flex items-center gap-2">
              {isTerraformRunning && (
                <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Running...
                </span>
              )}
              <span className="text-[11px] font-mono text-slate-500">AWS_PROFILE=kubeops-prod</span>
            </div>
          </div>

          {/* Terminal Output Body */}
          <div className="p-4 font-mono text-xs text-slate-300 min-h-[360px] max-h-[500px] overflow-y-auto space-y-1.5 bg-[#070a10]">
            {terraformLogs.map((log, index) => {
              let textStyle = 'text-slate-300';
              if (log.includes('Creating...') || log.includes('Still creating...')) {
                textStyle = 'text-cyan-400 font-semibold';
              } else if (log.includes('Creation complete') || log.includes('Apply complete!')) {
                textStyle = 'text-emerald-400 font-bold';
              } else if (log.includes('WARN') || log.includes('blocked')) {
                textStyle = 'text-amber-400 font-semibold';
              } else if (log.includes('Plan:')) {
                textStyle = 'text-indigo-300 font-bold';
              }

              return (
                <div key={index} className={textStyle}>
                  {log}
                </div>
              );
            })}

            {isTerraformRunning && (
              <div className="flex items-center gap-2 text-cyan-400 pt-2">
                <span className="animate-spin inline-block">⠋</span>
                <span>Applying changes to AWS Cloud API (estimated: 12s)...</span>
              </div>
            )}
          </div>

          {/* Terminal Footer with Quick Command Chips */}
          <div className="px-4 py-2.5 bg-[#111726] border-t border-[#1e293b] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-400">
              <span>Quick execute:</span>
              <button
                onClick={runTerraformPlan}
                className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 hover:bg-slate-700 transition"
              >
                terraform plan
              </button>
              <button
                onClick={runTerraformApply}
                className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 hover:bg-slate-700 transition"
              >
                terraform apply
              </button>
            </div>
            <span className="text-slate-500">Workspace: default</span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: RESOURCES LIST */}
      {/* ======================================================== */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#111726] border border-[#1e293b]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Filter by Type:</span>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="bg-[#0a0d14] border border-[#1e293b] rounded-lg px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none"
              >
                <option value="all">all resources</option>
                <option value="vpc">VPC &amp; Subnets</option>
                <option value="eks">EKS &amp; Workers</option>
                <option value="gateway">Gateways</option>
              </select>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {filteredResources.length} resources in state
            </span>
          </div>

          <div className="rounded-2xl bg-[#111726] border border-[#1e293b] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#1e293b] bg-[#0c101b] text-slate-400 uppercase text-[10px]">
                    <th className="py-3 px-4">Resource Address</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Provider</th>
                    <th className="py-3 px-4">Attributes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b] text-slate-300">
                  {filteredResources.map(res => (
                    <tr key={res.id} className="hover:bg-[#151f33] transition">
                      <td className="py-3 px-4 font-bold text-white">{res.address}</td>
                      <td className="py-3 px-3 text-indigo-400">{res.type}</td>
                      <td className="py-3 px-3">
                        <StatusBadge status={res.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-slate-400">{res.provider}</td>
                      <td className="py-3 px-4 text-[11px] text-slate-400">
                        {Object.entries(res.attributes).map(([k, v]) => (
                          <span key={k} className="mr-3 inline-block">
                            <span className="text-slate-500">{k}:</span> <span className="text-slate-200">{v}</span>
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PLAN OUTPUT */}
      {/* ======================================================== */}
      {activeTab === 'plan' && (
        <div className="rounded-2xl bg-[#090d16] border border-[#1e293b] p-5 font-mono text-xs text-slate-300">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e293b] mb-4">
            <span className="font-bold text-white">Execution Plan Diff (Dry Run)</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(sampleTerraformPlanOutput);
                setCopiedPlan(true);
                setTimeout(() => setCopiedPlan(false), 2000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700"
            >
              {copiedPlan ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPlan ? 'Copied' : 'Copy Plan'}</span>
            </button>
          </div>

          <pre className="whitespace-pre overflow-x-auto text-xs leading-relaxed">
            {sampleTerraformPlanOutput.split('\n').map((line, idx) => {
              let lineClass = 'text-slate-300';
              if (line.trim().startsWith('+')) {
                lineClass = 'text-emerald-400 font-semibold bg-emerald-950/20 px-1 rounded';
              } else if (line.trim().startsWith('~')) {
                lineClass = 'text-amber-400 font-semibold bg-amber-950/20 px-1 rounded';
              } else if (line.trim().startsWith('-')) {
                lineClass = 'text-rose-400 font-semibold bg-rose-950/20 px-1 rounded';
              } else if (line.startsWith('Plan:')) {
                lineClass = 'text-indigo-300 font-bold';
              }
              return (
                <div key={idx} className={lineClass}>
                  {line}
                </div>
              );
            })}
          </pre>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: HCL CODE */}
      {/* ======================================================== */}
      {activeTab === 'hcl' && (
        <div className="rounded-2xl bg-[#090d16] border border-[#1e293b] p-5 font-mono text-xs text-slate-300">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e293b] mb-4">
            <span className="font-bold text-white">main.tf (Terraform Specification)</span>
            <span className="text-slate-400">AWS EKS Architecture Module</span>
          </div>
          <pre className="whitespace-pre overflow-x-auto leading-relaxed text-indigo-200">
            {sampleHCL}
          </pre>
        </div>
      )}
    </div>
  );
};

