import React, { useState } from 'react';
import { X, Copy, Check, FileCode } from 'lucide-react';

interface YamlViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  filename?: string;
  yamlContent: string;
}

export const YamlViewerModal: React.FC<YamlViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  filename = 'manifest.yaml',
  yamlContent
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(yamlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#0c101b] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#1e293b] bg-[#111726] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="text-[11px] font-mono text-slate-400">{filename}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy YAML</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4 bg-[#080b12] text-xs font-mono text-slate-300 leading-relaxed">
          <pre className="whitespace-pre overflow-x-auto selection:bg-indigo-500/30">
            {yamlContent.split('\n').map((line, idx) => {
              // Simple syntax styling
              let lineClass = 'text-slate-300';
              if (line.trim().startsWith('#')) {
                lineClass = 'text-slate-400 italic';
              } else if (line.includes(':')) {
                const parts = line.split(':');
                return (
                  <div key={idx} className="hover:bg-white/5 px-2 py-0.5 rounded">
                    <span className="text-slate-400 select-none inline-block w-8 text-right mr-3 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="text-indigo-300 font-semibold">{parts[0]}:</span>
                    <span className="text-emerald-300">{parts.slice(1).join(':')}</span>
                  </div>
                );
              }
              return (
                <div key={idx} className={`hover:bg-white/5 px-2 py-0.5 rounded ${lineClass}`}>
                  <span className="text-slate-400 select-none inline-block w-8 text-right mr-3 text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{line}</span>
                </div>
              );
            })}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#111726] border-t border-[#1e293b] flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Read-only configuration manifest</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

