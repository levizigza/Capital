import { useMemo, useState } from "react";
import { GameButton, GamePanel } from "@/game-ui";
import { gradeMasteryQuiz, type MasteryGateDef } from "../masteryGate";

type Props = {
  gate: MasteryGateDef;
  onPassed: () => void;
  onFailed: () => void;
};

/**
 * Explicit learning gate: every answer must be correct to unlock.
 */
export function MasteryQuiz({ gate, onPassed, onFailed }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ allCorrect: boolean; wrongIds: string[] } | null>(null);

  const allAnswered = useMemo(
    () => gate.questions.every((q) => answers[q.id] !== undefined),
    [answers, gate.questions],
  );

  const submit = () => {
    const graded = gradeMasteryQuiz(gate, answers);
    setResult(graded);
    setSubmitted(true);
    if (graded.allCorrect) {
      window.setTimeout(onPassed, 600);
    }
  };

  return (
    <div className="mastery-quiz space-y-4 p-1" data-testid="mastery-quiz">
      <div className="text-center">
        <div className="text-4xl mb-1">🧠</div>
        <div className="cap-eyebrow">{gate.bossLabel}</div>
        <h2 className="cap-display text-2xl text-[var(--cap-ink)]">{gate.title}</h2>
        <p className="mt-2 text-sm font-semibold text-[var(--cap-coral)]">
          To pass this block you must get ALL answers correct. Learning is required — no skipping.
        </p>
        <p className="mt-1 text-sm text-[var(--cap-ink-soft)]">{gate.requirementCopy}</p>
      </div>

      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
        {gate.questions.map((q, qi) => {
          const wrong = submitted && result && result.wrongIds.includes(q.id);
          const right = submitted && result?.allCorrect;
          return (
            <GamePanel
              key={q.id}
              padding="default"
              className={
                wrong ? "border-rose-400 bg-rose-50/80" : right ? "border-emerald-400 bg-emerald-50/70" : undefined
              }
            >
              <div className="text-sm font-bold text-[var(--cap-ink)] mb-2">
                {qi + 1}. {q.prompt}
              </div>
              <div className="space-y-1.5">
                {q.choices.map((choice, ci) => {
                  const selected = answers[q.id] === ci;
                  return (
                    <button
                      key={ci}
                      type="button"
                      disabled={submitted && Boolean(result?.allCorrect)}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: ci }))}
                      className={`flex w-full items-start gap-2 rounded-xl border-2 px-3 py-2 text-left text-sm transition ${
                        selected
                          ? "border-[var(--cap-gold)] bg-[var(--cap-gold)]/15 font-bold"
                          : "border-[var(--cap-ink)]/12 bg-white hover:border-[var(--cap-tide)]"
                      }`}
                    >
                      <span className="font-black text-[var(--cap-ink-soft)]">{String.fromCharCode(65 + ci)}.</span>
                      <span>{choice}</span>
                    </button>
                  );
                })}
              </div>
              {submitted && wrong ? (
                <p className="mt-2 text-xs font-semibold text-rose-800">
                  Not quite. Hint: {q.explainCorrect}
                </p>
              ) : null}
              {submitted && result?.allCorrect ? (
                <p className="mt-2 text-xs font-semibold text-emerald-800">{q.explainCorrect}</p>
              ) : null}
            </GamePanel>
          );
        })}
      </div>

      {!submitted || !result?.allCorrect ? (
        <div className="flex flex-col gap-2">
          {submitted && result && !result.allCorrect ? (
            <p className="text-center text-sm font-bold text-rose-700">
              Boss not beaten — {result.wrongIds.length} wrong. Fix answers or retry the game.
            </p>
          ) : null}
          <div className="flex gap-2">
            <GameButton variant="outline" className="flex-1" onClick={onFailed}>
              Retry minigame
            </GameButton>
            <GameButton
              variant="primary"
              className="flex-1"
              disabled={!allAnswered}
              data-testid="mastery-quiz-submit"
              onClick={() => {
                if (submitted && result && !result.allCorrect) {
                  setSubmitted(false);
                  setResult(null);
                  return;
                }
                submit();
              }}
            >
              {submitted && result && !result.allCorrect ? "Try answers again" : "Submit — all must be correct"}
            </GameButton>
          </div>
        </div>
      ) : (
        <p className="text-center text-sm font-black text-emerald-800">All correct — block unlocked!</p>
      )}
    </div>
  );
}
