'use client';

import React, { useState } from 'react';
import { ReActTrace } from '../../lib/types';
import { Terminal, Bot, Sparkles, Copy, Check, ChevronRight } from 'lucide-react';

interface ReasoningTraceTerminalProps {
  trace: ReActTrace;
}

export function ReasoningTraceTerminal({ trace }: ReasoningTraceTerminalProps) {
  const [activeTab, setActiveTab] = useState<'scratchpad' | 'synthesis'>('scratchpad');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${trace.thoughts.join('\n')}\n\nSynthesis:\n${trace.synthesis}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[#2D3748] bg-[#070B12] overflow-hidden shadow-xs">
      {/* Terminal Title Bar */}
      <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mac-style Window Dots */}
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-300 dark:border-slate-800">
            <Terminal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-mono font-medium text-slate-800 dark:text-slate-300">
              LangChain ReAct Agent Reasoning Trace
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-mono shadow-xs">
            <button
              onClick={() => setActiveTab('scratchpad')}
              className={`px-2.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'scratchpad'
                  ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 font-semibold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Scratchpad
            </button>
            <button
              onClick={() => setActiveTab('synthesis')}
              className={`px-2.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'synthesis'
                  ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 font-semibold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Synthesis
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Copy trace to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Content Area */}
      <div className="p-4 font-mono text-xs text-slate-300 space-y-4 max-h-72 overflow-y-auto leading-relaxed bg-[#0B101B]">
        {activeTab === 'scratchpad' ? (
          <>
            {/* Thought Sequence */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Agent Thought Chain
              </span>
              {trace.thoughts.map((t, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-200">
                  <span className="text-blue-400 shrink-0 select-none">❯</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>

            {/* Tool Invocations & Observations */}
            {trace.actions && trace.actions.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Tool Executions & Spatial Observations
                </span>
                {trace.actions.map((act) => (
                  <div
                    key={act.step}
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1"
                  >
                    <div className="flex items-center gap-2 text-rose-300">
                      <span className="px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold">
                        Tool {act.step}: {act.tool}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      <span className="text-slate-500">Input: </span>
                      <span className="text-slate-200">{act.input}</span>
                    </div>
                    <div className="text-emerald-400 text-[11px]">
                      <span className="text-slate-500">Observation: </span>
                      {act.observation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}

        {/* Explainable AI Synthesis Box */}
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explainable AI Synthesis & Governance Rationale</span>
          </div>
          <p className="text-slate-200 text-xs leading-normal font-sans">
            "{trace.synthesis}"
          </p>
        </div>
      </div>
    </div>
  );
}
