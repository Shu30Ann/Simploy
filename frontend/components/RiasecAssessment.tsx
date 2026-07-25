"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Compass, RotateCcw, X } from "lucide-react";
import {
  riasecProfiles,
  riasecQuestions,
  scoreRiasec,
  type RiasecResult,
} from "@/lib/riasec";

const answerOptions = [
  { label: "No", value: 0 },
  { label: "Low", value: 1 },
  { label: "Maybe", value: 2 },
  { label: "Like", value: 3 },
  { label: "Love", value: 4 },
];

type RiasecAssessmentProps = {
  initialResult?: RiasecResult | null;
  compact?: boolean;
  allowSkip?: boolean;
  skipped?: boolean;
  onResultChange?: (result: RiasecResult | null, isComplete: boolean) => void;
  onSkip?: () => void;
};

export default function RiasecAssessment({
  initialResult = null,
  compact = false,
  allowSkip = false,
  skipped = false,
  onResultChange,
  onSkip,
}: RiasecAssessmentProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isOpen, setIsOpen] = useState(false);
  const result = useMemo(() => scoreRiasec(answers), [answers]);
  const activeResult = result ?? initialResult;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / riasecQuestions.length) * 100);

  useEffect(() => {
    onResultChange?.(result, !!result);
  }, [onResultChange, result]);

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  };

  const handleSkip = () => {
    setIsOpen(false);
    onSkip?.();
  };

  const containerClass = compact
    ? "rounded-lg border border-[#EAE3D3] bg-[#F7F3EA] p-4"
    : "rounded-lg border border-[#CBDFD4] bg-white p-5 shadow-[0_4px_24px_rgba(70,60,35,0.08)]";

  return (
    <>
      <section className={containerClass} aria-label="Career interest assessment">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#CBDFD4] bg-[#E7F0E9] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#114F3B]">
              <Compass size={14} />
              Career interest check
            </p>
            <h2 className="mt-3 text-xl font-bold text-[#1E2A44]">
              Match your work style to roles and an avatar
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Take a quick RIASEC-style test when you are ready. It opens separately so the signup form stays clean.
            </p>
            {skipped && !activeResult && (
              <p className="mt-2 text-sm font-semibold text-[#9CA3AF]">
                Skipped for now. You can take it later in dashboard settings.
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:min-w-[180px]">
            {activeResult && (
              <div className="rounded-lg border border-[#E3D8BC] bg-[#F6F1E4] px-4 py-3 text-center">
                <p className="text-4xl leading-none">{activeResult.animal}</p>
                <p className="mt-2 text-sm font-bold text-[#1E2A44]">{activeResult.animalName}</p>
                <p className="text-xs font-bold text-[#B08A44]">
                  {activeResult.hollandCode} - {activeResult.label}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#B08A44] px-4 py-2 text-sm font-bold text-white"
            >
              {activeResult ? "Retake test" : "Take test"}
            </button>
          </div>
        </div>

        {activeResult && (
          <div className="mt-4 rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-[#114F3B]" />
              <div>
                <p className="font-bold text-[#1E2A44]">{activeResult.label}</p>
                <p className="mt-1 text-sm leading-6 text-[#6B7280]">{activeResult.summary}</p>
              </div>
            </div>
          </div>
        )}

        {allowSkip && !activeResult && (
          <button
            type="button"
            onClick={handleSkip}
            className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#F7F3EA] px-4 py-2 text-sm font-bold text-[#6B7280] hover:text-[#B08A44]"
          >
            Skip the test
          </button>
        )}
      </section>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E2A44]/55 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="riasec-modal-title"
        >
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-[0_24px_80px_rgba(26,16,51,0.28)]">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#EAE3D3] bg-white px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#114F3B]">Career interest check</p>
                <h2 id="riasec-modal-title" className="mt-1 text-2xl font-bold text-[#1E2A44]">
                  Quick RIASEC test
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
                  Rate each activity. Simploy uses your strongest signal to suggest job themes and an animal avatar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#EAE3D3] text-[#6B7280] hover:bg-[#F7F3EA]"
                aria-label="Close career interest test"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-5">
              <div className="h-2 rounded-full bg-[#E9DFF8]">
                <div className="h-2 rounded-full bg-[#17694F]" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-xs font-bold text-[#9CA3AF]">
                {answeredCount}/{riasecQuestions.length} answered
              </p>

              <div className="mt-5 grid gap-3">
                {riasecQuestions.map((question, index) => {
                  const profile = riasecProfiles[question.code];
                  return (
                    <div key={question.id} className="rounded-lg border border-[#EAE3D3] bg-white p-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">
                            {index + 1}. {profile.name}
                          </p>
                          <p className="mt-1 text-sm font-semibold leading-5 text-[#1E2A44]">{question.text}</p>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5 sm:min-w-[260px]">
                          {answerOptions.map((option) => {
                            const isSelected = answers[question.id] === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleAnswer(question.id, option.value)}
                                className={`min-h-10 rounded-lg border px-2 text-xs font-bold transition ${
                                  isSelected
                                    ? "border-[#B08A44] bg-[#B08A44] text-white"
                                    : "border-[#DFD6C2] bg-[#F7F3EA] text-[#6B7280] hover:border-[#CBDFD4] hover:bg-[#EFF5F0]"
                                }`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {activeResult && (
                <div className="mt-5 rounded-lg border border-[#CBDFD4] bg-[#EFF5F0] p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-[#114F3B]" />
                    <div>
                      <p className="font-bold text-[#1E2A44]">
                        {activeResult.animal} {activeResult.hollandCode} - {activeResult.label}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#6B7280]">{activeResult.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {activeResult.jobThemes.map((theme) => (
                          <span
                            key={theme}
                            className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#114F3B]"
                          >
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setAnswers({})}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#DFD6BE] bg-white px-4 py-2 text-sm font-bold text-[#17694F]"
                >
                  <RotateCcw size={15} />
                  Reset answers
                </button>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {allowSkip && (
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="inline-flex items-center justify-center rounded-lg bg-[#F7F3EA] px-4 py-2 text-sm font-bold text-[#6B7280] hover:text-[#B08A44]"
                    >
                      Skip the test
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center justify-center rounded-lg bg-[#1E2A44] px-4 py-2 text-sm font-bold text-white"
                  >
                    {result ? "Done" : "Close"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
