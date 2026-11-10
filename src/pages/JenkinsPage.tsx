import React, { useState } from 'react';
import {
  GitBranch,
  Play,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Terminal,
  ExternalLink,
  ChevronRight,
  Sparkles,
  GitCommit,
  User,
  Box
} from 'lucide-react';
import { useKubeOps } from '../context/KubeOpsContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { JenkinsPipeline, JenkinsStage } from '../types';

export const JenkinsPage: React.FC = () => {
  const { jenkinsPipelines, triggerJenkinsBuild } = useKubeOps();

  const [selectedPipeline, setSelectedPipeline] = useState<JenkinsPipeline>(jenkinsPipelines[0]);
  const [selectedStage, setSelectedStage] = useState<JenkinsStage>(jenkinsPipelines[0].stages[0]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Jenkins Automated CI/CD Pipelines</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
              Jenkins LTS v2.440.1
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Declarative multibranch pipelines deploying to AWS EKS production cluster
          </p>
        </div>

        <button
          onClick={() => triggerJenkinsBuild(selectedPipeline.id)}
          disabled={selectedPipeline.lastBuildStatus === 'IN_PROGRESS'}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/30 transition active:scale-95 disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          <span>Trigger Build #{selectedPipeline.lastBuildNumber + 1}</span>
        </button>
      </div>

      {/* Main Pipeline Showcase */}
      <div className="p-6 rounded-2xl bg-[#111726] border border-[#1e293b]">
        {/* Pipeline Meta Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#1e293b]">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-white font-mono">{selectedPipeline.name}</h3>
              <StatusBadge status={selectedPipeline.lastBuildStatus} size="sm" />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 mt-1">
              <span className="flex items-center gap-1 text-indigo-300">
                <GitBranch className="w-3.5 h-3.5" />
                {selectedPipeline.branch}
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <GitCommit className="w-3.5 h-3.5" />
                {selectedPipeline.commitHash}: {selectedPipeline.commitMessage}
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <User className="w-3.5 h-3.5" />
                {selectedPipeline.author}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-right">
              <p className="text-slate-400">Build Number</p>
              <p className="text-base font-bold text-white">#{selectedPipeline.lastBuildNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400">Total Duration</p>
              <p className="text-base font-bold text-emerald-400">{selectedPipeline.lastBuildDuration}</p>
            </div>
          </div>
        </div>

        {/* 5-Stage Visual Stepper */}
        <div className="my-8">
          <p className="text-xs uppercase font-mono font-semibold text-slate-400 mb-4">
            Pipeline Execution Flow (Click stage to inspect console output)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {selectedPipeline.stages.map((stage, idx) => {
              const isSelected = selectedStage.id === stage.id;
              const isSuccess = stage.status === 'SUCCESS';
              const isInProgress = stage.status === 'IN_PROGRESS';

              return (
                <div
                  key={stage.id}
                  onClick={() => setSelectedStage(stage)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-600/15 shadow-lg shadow-indigo-600/10'
                      : 'border-[#1e293b] bg-[#0a0d14] hover:border-slate-700'
                  }`}
                >
                  {/* Top indicator bar */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 ${
                      isSuccess
                        ? 'bg-emerald-500'
                        : isInProgress
                        ? 'bg-amber-500 animate-pulse'
                        : 'bg-slate-700'
                    }`}
                  />

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      Stage {idx + 1}
                    </span>
                    <StatusBadge status={stage.status} size="sm" showDot={false} />
                  </div>

                  <h4 className="text-xs font-bold text-white font-mono leading-tight mb-2">
                    {stage.name}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {(stage.durationMs / 1000).toFixed(1)}s
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Stage Console Logs Inspector */}
        <div className="rounded-xl bg-[#070a10] border border-[#1e293b] overflow-hidden">
          <div className="px-4 py-2.5 bg-[#0e1424] border-b border-[#1e293b] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-white">Stage Console Output: {selectedStage.name}</span>
            </div>
            <span className="text-slate-400">Duration: {(selectedStage.durationMs / 1000).toFixed(1)}s</span>
          </div>

          <div className="p-4 font-mono text-xs text-slate-300 max-h-56 overflow-y-auto space-y-1">
            <div className="text-slate-500">[Pipeline] {selectedStage.name} started</div>
            {(selectedStage.logs || [
              `Running step on agent "k8s-build-agent-04"`,
              `Executing command in workspace /var/jenkins_home/workspace/${selectedPipeline.name}`,
              `Container image verified and tagged`,
              `Exit status 0: Stage passed successfully`
            ]).map((log, lIdx) => (
              <div key={lIdx} className="text-slate-300 hover:bg-white/5 px-1 py-0.5 rounded">
                <span className="text-slate-600 select-none mr-2">[{lIdx + 1}]</span>
                <span>{log}</span>
              </div>
            ))}
            <div className="text-emerald-400 font-bold pt-1">[Pipeline] Stage finished with status SUCCESS</div>
          </div>
        </div>
      </div>

      {/* Build History Table */}
      <div className="p-5 rounded-2xl bg-[#111726] border border-[#1e293b]">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          Recent Build Runs &amp; Deployment Artifacts
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#0c101b] text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-4">Build #</th>
                <th className="py-2.5 px-3">Pipeline</th>
                <th className="py-2.5 px-3">Branch</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Docker Artifact Tag</th>
                <th className="py-2.5 px-4 text-right">Target Cluster</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b] text-slate-300">
              {[
                { num: 142, pipe: 'payment-service', branch: 'main', status: 'SUCCESS', dur: '3m 42s', tag: 'kubeops/payment-service:v2.4.1', cluster: 'prod-aws-us-east-1' },
                { num: 141, pipe: 'payment-service', branch: 'main', status: 'SUCCESS', dur: '3m 38s', tag: 'kubeops/payment-service:v2.4.0', cluster: 'prod-aws-us-east-1' },
                { num: 98, pipe: 'frontend-web', branch: 'release/v4.0', status: 'SUCCESS', dur: '2m 18s', tag: 'kubeops/frontend-web:v4.0.5', cluster: 'prod-aws-us-east-1' },
                { num: 97, pipe: 'frontend-web', branch: 'main', status: 'SUCCESS', dur: '2m 24s', tag: 'kubeops/frontend-web:v4.0.4', cluster: 'prod-aws-us-east-1' }
              ].map(item => (
                <tr key={`${item.pipe}-${item.num}`} className="hover:bg-[#151f33] transition">
                  <td className="py-3 px-4 font-bold text-white">#{item.num}</td>
                  <td className="py-3 px-3 text-indigo-300">{item.pipe}</td>
                  <td className="py-3 px-3 text-slate-400">{item.branch}</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                  <td className="py-3 px-3">{item.dur}</td>
                  <td className="py-3 px-3 text-emerald-400">{item.tag}</td>
                  <td className="py-3 px-4 text-right text-slate-400">{item.cluster}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

