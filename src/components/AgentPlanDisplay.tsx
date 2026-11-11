import React from 'react';
import { AgentPlan } from '../utils/aiAgentEngine';
import { Bot, CheckCircle2, Loader2, Sparkles, X } from 'lucide-react';

interface AgentPlanDisplayProps {
  plan: AgentPlan | null;
  onDismiss: () => void;
  language: 'en' | 'bn';
  assistantName: string;
}

export const AgentPlanDisplay: React.FC<AgentPlanDisplayProps> = ({
  plan,
  onDismiss,
  language,
  assistantName,
}) => {
  if (!plan) return null;

  return (
    <div className="bg-[#050e1a]/95 border-2 border-emerald-400 rounded-xl p-4 hud-glow mb-4 font-mono-tech shadow-[0_0_25px_rgba(16,185,129,0.3)] relative animate-in fade-in duration-300">
      <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30 mb-3">
        <div className="flex items-center gap-2 text-emerald-400">
          <Bot className="w-5 h-5 text-emerald-300 animate-pulse" />
          <span className="font-bold tracking-wider text-xs sm:text-sm uppercase">
            {language === 'bn' ? `[এজেন্ট ${assistantName}] স্বয়ংক্রিয় মিশন:` : `[AI AGENT ${assistantName}] AUTONOMOUS SEQUENCE:`}
          </span>
          <span className="text-white font-bold">{plan.goal}</span>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Steps List */}
      <div className="space-y-1.5 text-xs">
        {plan.steps.map((step, idx) => (
          <div
            key={step.id}
            className={`flex items-center justify-between p-2 rounded border ${
              step.status === 'completed'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : step.status === 'running'
                ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200 animate-pulse'
                : 'bg-black/40 border-gray-800 text-gray-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-[10px] text-gray-400">#{idx + 1}</span>
              <span className="text-[10px] bg-black/60 px-1.5 py-0.5 rounded border border-gray-700 text-cyan-300 font-bold">
                {step.tool}
              </span>
              <span>{step.description}</span>
            </div>
            <div>
              {step.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {step.status === 'running' && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
              {step.status === 'pending' && <span className="text-[10px] text-gray-500">QUEUED</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
