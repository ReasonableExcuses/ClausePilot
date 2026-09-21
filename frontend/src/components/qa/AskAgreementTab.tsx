import React, { useState } from 'react';
import {
  HelpCircle,
  Send,
  Loader2,
  BookOpen,
  Sparkles,
  ShieldAlert,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { QAAnswer } from '../../types';
import { api } from '../../services/api';

interface AskAgreementTabProps {
  contractId: string;
}

const PRESET_QUESTIONS = [
  'When is the rent due?',
  'How much is the security deposit?',
  'When should the security deposit be returned?',
  'Who is responsible for repairs?',
  'What happens if rent is paid late?',
  'How much notice must I give before terminating?',
];

export const AskAgreementTab: React.FC<AskAgreementTabProps> = ({ contractId }) => {
  const [questionInput, setQuestionInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<QAAnswer | null>(null);
  const [qaHistory, setQaHistory] = useState<QAAnswer[]>([]);

  const handleAsk = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await api.askQuestion(contractId, queryText.trim());
      setCurrentAnswer(res);
      setQaHistory((prev) => [res, ...prev]);
      setQuestionInput('');
    } catch (err) {
      console.error(err);
      alert('Failed to obtain answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetClick = (q: string) => {
    setQuestionInput(q);
    handleAsk(q);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-editorial">
      {/* Intro Header */}
      <div className="editorial-panel p-6 rounded-2xl text-center">
        <div className="w-10 h-10 rounded-xl bg-obsidian-800 border border-obsidian-750 flex items-center justify-center mx-auto mb-3 text-obsidian-200">
          <MessageSquare className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-semibold text-white tracking-tight mb-1">Ask Your Agreement</h3>
        <p className="text-xs text-obsidian-400 max-w-md mx-auto leading-relaxed">
          Ask questions in natural language. Answers are synthesized deterministically from contractual clauses with exact page and clause citations.
        </p>

        {/* Preset suggestions */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetClick(q)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-lg bg-obsidian-850 hover:bg-obsidian-800 border border-obsidian-750 hover:border-obsidian-700 text-obsidian-300 hover:text-white transition-all text-left disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Question Input Box (Command Bar Style) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(questionInput);
        }}
        className="bg-obsidian-900 border border-obsidian-750 focus-within:border-obsidian-600 p-2 rounded-2xl flex items-center gap-2 shadow-xl transition-all"
      >
        <input
          id="ask-agreement-input"
          type="text"
          placeholder="Ask a question (e.g., When must the security deposit be refunded?)..."
          value={questionInput}
          onChange={(e) => setQuestionInput(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-transparent text-xs sm:text-sm text-white placeholder-obsidian-500 focus:outline-none"
        />
        <button
          id="ask-agreement-submit-btn"
          type="submit"
          disabled={!questionInput.trim() || isLoading}
          className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-obsidian-950 font-semibold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-40 flex-shrink-0"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Current Answer Display */}
      {currentAnswer && (
        <div className="editorial-panel p-6 rounded-2xl border border-obsidian-700 shadow-2xl space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-obsidian-750 text-xs">
            <span className="font-medium text-obsidian-200">
              Q: "{currentAnswer.question}"
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-obsidian-800 border border-obsidian-750 text-obsidian-300 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              {Math.round(currentAnswer.confidence * 100)}% Confidence
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono font-medium tracking-wider text-obsidian-400 block mb-1">
              Synthesized Answer
            </span>
            <p className="text-sm sm:text-base font-medium text-white leading-relaxed font-editorial">
              {currentAnswer.answer}
            </p>
          </div>

          {/* Supporting Evidence Sources */}
          {currentAnswer.evidence_sources.length > 0 && (
            <div className="pt-3 border-t border-obsidian-750 space-y-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-obsidian-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-obsidian-300" />
                <span>Supporting Contract Evidence</span>
              </span>

              <div className="space-y-2">
                {currentAnswer.evidence_sources.map((src, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-obsidian-950 border border-obsidian-800 text-xs text-obsidian-200 space-y-1.5"
                  >
                    <div className="flex items-center justify-between font-medium text-white">
                      <span>
                        Clause {src.clause_number}: {src.clause_title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-obsidian-800 border border-obsidian-750 text-obsidian-300">
                        Page {src.page_number}
                      </span>
                    </div>
                    <p className="text-obsidian-400 italic text-[11px] leading-relaxed font-mono-code">
                      "{src.snippet}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Anti-Hallucination Disclaimer */}
          <div className="text-[10px] text-obsidian-500 pt-2 flex items-center gap-1.5 font-mono">
            <ShieldAlert className="w-3 h-3 text-obsidian-400 flex-shrink-0" />
            <span>{currentAnswer.disclaimer}</span>
          </div>
        </div>
      )}

      {/* Prior Q&A History */}
      {qaHistory.length > 1 && (
        <div className="pt-4 border-t border-obsidian-750 space-y-3">
          <h4 className="text-xs font-mono font-medium uppercase tracking-wider text-obsidian-500">
            Previous Inquiries
          </h4>
          <div className="space-y-2">
            {qaHistory.slice(1, 4).map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-obsidian-900/50 border border-obsidian-800 text-xs space-y-1"
              >
                <div className="font-medium text-obsidian-200">Q: {item.question}</div>
                <div className="text-obsidian-400 italic line-clamp-2 text-[11px]">{item.answer}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
