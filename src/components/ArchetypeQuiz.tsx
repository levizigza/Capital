import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, Check, Sparkle, ArrowsClockwise, Compass } from '@phosphor-icons/react'
import { Confetti } from '@/components/Confetti'
import { useQuizJuice } from '@/islands/quiz'
import {
  ARCHETYPE_QUESTIONS,
  ARCHETYPES,
  calculateArchetypeScores,
  getDominantArchetype,
  getSecondaryArchetype,
  type ArchetypeId,
} from '@/data/archetype-questions'
import './ArchetypeQuiz.css'

interface ArchetypeQuizProps {
  onComplete: (primaryArchetype: ArchetypeId, secondaryArchetype: ArchetypeId | null) => void
  onSkip?: () => void
}

type Phase = 'intro' | 'quiz' | 'results'

const ORDER: ArchetypeId[] = ['navigator', 'strategist', 'creator', 'guardian']

// Each archetype sits at a cardinal point of the compass.
const DIRECTION: Record<ArchetypeId, { dx: number; dy: number; label: string }> = {
  navigator: { dx: 0, dy: -1, label: 'N' },
  strategist: { dx: 1, dy: 0, label: 'E' },
  creator: { dx: 0, dy: 1, label: 'S' },
  guardian: { dx: -1, dy: 0, label: 'W' },
}

const VAR: Record<ArchetypeId, string> = {
  navigator: 'var(--aq-nav)',
  strategist: 'var(--aq-str)',
  creator: 'var(--aq-cre)',
  guardian: 'var(--aq-gua)',
}

function answersToArray(answers: Record<number, number>): number[][] {
  return Array(ARCHETYPE_QUESTIONS.length)
    .fill([])
    .map((_, idx) => (answers[idx] !== undefined ? [answers[idx]] : []))
}

/** Live compass whose needle points toward the emerging archetype. */
function CompassRose({
  scores,
  leader,
  locked,
}: {
  scores: Record<ArchetypeId, number>
  leader: ArchetypeId | null
  locked?: boolean
}) {
  const total = ORDER.reduce((s, a) => s + scores[a], 0)
  const vx = scores.strategist - scores.guardian
  const vy = scores.creator - scores.navigator
  const magnitude = Math.min(1, Math.hypot(vx, vy) / Math.max(1, total))
  const angle = total === 0 ? -90 : (Math.atan2(vy, vx) * 180) / Math.PI
  const needleLen = 26 + magnitude * 40

  const cx = 100
  const cy = 100
  const R = 78

  return (
    <svg className="aq-compass" viewBox="0 0 200 200" role="img" aria-label="Your financial compass">
      <defs>
        <radialGradient id="aq-face" cx="50%" cy="45%">
          <stop offset="0%" stopColor="rgba(30,41,59,0.95)" />
          <stop offset="100%" stopColor="rgba(2,6,23,0.95)" />
        </radialGradient>
        <filter id="aq-blur"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>

      {/* glow */}
      <circle
        className="aq-compass-glow"
        cx={cx}
        cy={cy}
        r={R + 6}
        fill={leader ? VAR[leader] : 'rgba(129,140,248,0.6)'}
        filter="url(#aq-blur)"
        opacity={0.4}
      />
      <circle cx={cx} cy={cy} r={R} fill="url(#aq-face)" stroke="rgba(148,163,184,0.35)" strokeWidth={2} />
      <circle
        className="aq-compass-ring"
        cx={cx}
        cy={cy}
        r={R - 8}
        fill="none"
        stroke={leader ? VAR[leader] : 'rgba(148,163,184,0.25)'}
        strokeWidth={1.5}
        strokeDasharray="2 6"
        opacity={0.6}
      />

      {/* archetype poles + fills */}
      {ORDER.map((a) => {
        const dir = DIRECTION[a]
        const px = cx + dir.dx * (R - 22)
        const py = cy + dir.dy * (R - 22)
        const isLead = leader === a
        const share = total === 0 ? 0 : scores[a] / total
        return (
          <g key={a}>
            <circle
              className="aq-pole"
              cx={px}
              cy={py}
              r={isLead ? 7 + share * 6 : 4 + share * 6}
              fill={VAR[a]}
              opacity={0.25 + share}
            />
            <text
              className="aq-pole-label"
              x={cx + dir.dx * (R + 12)}
              y={cy + dir.dy * (R + 12) + 4}
              textAnchor="middle"
              fontSize={11}
              fill={isLead ? '#fff' : 'rgba(226,232,240,0.7)'}
              opacity={isLead ? 1 : 0.75}
            >
              {ARCHETYPES[a].icon}
            </text>
          </g>
        )
      })}

      {/* needle */}
      <g className="aq-needle" style={{ transform: `rotate(${angle + 90}deg)` }}>
        <polygon
          points={`${cx},${cy - needleLen} ${cx - 6},${cy} ${cx + 6},${cy}`}
          fill={leader ? VAR[leader] : '#818cf8'}
        />
        <polygon points={`${cx},${cy + 22} ${cx - 5},${cy} ${cx + 5},${cy}`} fill="rgba(148,163,184,0.55)" />
      </g>
      <circle cx={cx} cy={cy} r={locked ? 9 : 6} fill="#f8fafc" stroke={leader ? VAR[leader] : '#818cf8'} strokeWidth={3} />
    </svg>
  )
}

function MeterRow({ id, score, total, lead }: { id: ArchetypeId; score: number; total: number; lead: boolean }) {
  const a = ARCHETYPES[id]
  const pct = total === 0 ? 0 : Math.round((score / total) * 100)
  return (
    <div className="aq-meter">
      <span className="aq-meter-icon">{a.icon}</span>
      <span className={`aq-meter-name ${lead ? 'aq-meter-lead' : ''}`} style={lead ? { color: VAR[id] } : undefined}>
        {a.name}
      </span>
      <div className="aq-meter-track">
        <div
          className="aq-meter-fill"
          style={{ width: `${Math.max(pct, score > 0 ? 6 : 0)}%`, background: VAR[id], color: VAR[id] }}
        />
      </div>
    </div>
  )
}

export default function ArchetypeQuiz({ onComplete, onSkip }: ArchetypeQuizProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const juice = useQuizJuice()

  const scores = useMemo(() => calculateArchetypeScores(answersToArray(answers)), [answers])
  const total = ORDER.reduce((s, a) => s + scores[a], 0)
  const leader = useMemo<ArchetypeId | null>(() => {
    if (total === 0) return null
    return ORDER.reduce((best, a) => (scores[a] > scores[best] ? a : best), ORDER[0])
  }, [scores, total])

  const question = ARCHETYPE_QUESTIONS[currentQuestion]
  const answeredCount = Object.keys(answers).length

  const goResults = useCallback(() => {
    juice.complete()
    setPhase('results')
  }, [juice])

  const advance = useCallback(() => {
    if (currentQuestion < ARCHETYPE_QUESTIONS.length - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        const next = currentQuestion + 1
        setCurrentQuestion(next)
        setSelectedAnswer(answers[next] ?? null)
        setIsTransitioning(false)
      }, 220)
    } else {
      setIsTransitioning(true)
      setTimeout(() => {
        setIsTransitioning(false)
        goResults()
      }, 240)
    }
  }, [currentQuestion, answers, goResults])

  const handleAnswerSelect = useCallback(
    (answerIndex: number) => {
      if (isTransitioning) return
      setSelectedAnswer(answerIndex)
      setAnswers((prev) => ({ ...prev, [currentQuestion]: answerIndex }))
      juice.lock()
      setTimeout(() => advance(), 520)
    },
    [currentQuestion, isTransitioning, juice, advance]
  )

  const handleBack = useCallback(() => {
    if (isTransitioning || currentQuestion === 0) return
    setIsTransitioning(true)
    setTimeout(() => {
      const prev = currentQuestion - 1
      setCurrentQuestion(prev)
      setSelectedAnswer(answers[prev] ?? null)
      setIsTransitioning(false)
    }, 200)
  }, [answers, currentQuestion, isTransitioning])

  useEffect(() => {
    if (phase !== 'quiz') return
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '4') {
        const idx = parseInt(e.key, 10) - 1
        if (idx < question.answers.length) {
          e.preventDefault()
          handleAnswerSelect(idx)
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handleBack()
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [phase, question, handleAnswerSelect, handleBack])

  const finalize = useCallback(() => {
    const s = calculateArchetypeScores(answersToArray(answers))
    const primary = getDominantArchetype(s)
    const secondary = getSecondaryArchetype(s, primary)
    onComplete(primary, secondary)
  }, [answers, onComplete])

  const restart = () => {
    setAnswers({})
    setSelectedAnswer(null)
    setCurrentQuestion(0)
    setIsTransitioning(false)
    setPhase('quiz')
  }

  // ---------- INTRO ----------
  if (phase === 'intro') {
    return (
      <div className="aq-root">
        <div className="aq-stars" />
        <div className="aq-shell flex min-h-screen flex-col items-center justify-center gap-8 text-center">
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 140, damping: 14 }}>
            <div className="mx-auto w-full max-w-[240px]">
              <CompassRose scores={scores} leader={null} />
            </div>
          </motion.div>
          <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className="space-y-3">
            <div className="aq-situation mx-auto"><Compass weight="fill" /> Capital · Orientation</div>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">Calibrate Your Financial Compass</h1>
            <p className="mx-auto max-w-xl text-base text-slate-300 md:text-lg">
              Ten quick money moments. No right answers — just yours. Watch the needle swing as it learns how you
              think, then discover the archetype that will shape your journey through Capital.
            </p>
          </motion.div>
          <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }} className="flex flex-col items-center gap-3">
            <Button size="lg" className="bg-indigo-500 px-8 text-lg text-white hover:bg-indigo-400" onClick={() => setPhase('quiz')}>
              Begin Calibration <ArrowRight className="ml-2" weight="bold" />
            </Button>
            {onSkip && (
              <button onClick={onSkip} className="text-sm text-slate-400 underline-offset-4 hover:text-slate-200 hover:underline">
                Skip and explore on my own
              </button>
            )}
          </motion.div>
        </div>
      </div>
    )
  }

  // ---------- RESULTS ----------
  if (phase === 'results') {
    const primary = getDominantArchetype(scores)
    const secondary = getSecondaryArchetype(scores, primary)
    const pData = ARCHETYPES[primary]
    const sData = secondary ? ARCHETYPES[secondary] : null

    return (
      <div className="aq-root">
        <div className="aq-stars" />
        <Confetti trigger />
        <div className="aq-shell flex min-h-screen items-center justify-center py-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-4xl">
            <div className="grid gap-6 md:grid-cols-[300px_1fr] md:items-center">
              <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 150 }} className="flex flex-col items-center gap-4">
                <CompassRose scores={scores} leader={primary} locked />
                <div className="w-full space-y-1">
                  {ORDER.map((id) => (
                    <MeterRow key={id} id={id} score={scores[id]} total={total} lead={id === primary} />
                  ))}
                </div>
              </motion.div>

              <div className="aq-card p-6 md:p-8">
                <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                  <div className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-400">Your compass locks on</div>
                  <div className="flex items-center gap-3">
                    <span className="text-5xl">{pData.icon}</span>
                    <div>
                      <h2 className="text-3xl font-black" style={{ color: VAR[primary] }}>{pData.name}</h2>
                      <p className="text-slate-300">{pData.tagline}</p>
                    </div>
                  </div>
                  {sData && (
                    <Badge variant="outline" className="mt-3 border-slate-600 text-slate-200">
                      Shaded with {sData.name} {sData.icon}
                    </Badge>
                  )}
                </motion.div>

                <motion.blockquote initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="my-5 border-l-4 pl-4 text-lg font-medium italic text-slate-200" style={{ borderColor: VAR[primary] }}>
                  “{pData.motto}”
                </motion.blockquote>

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-sm text-slate-300">
                  {pData.description}
                </motion.p>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }} className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-200"><Sparkle weight="fill" className="text-amber-400" /> Strengths</h3>
                    <ul className="space-y-1.5">
                      {pData.strengths.slice(0, 4).map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <Check weight="bold" className="mt-0.5 flex-shrink-0 text-emerald-400" size={14} />{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-2 text-sm font-bold text-slate-200">Best played through</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {pData.preferredLearning.slice(0, 4).map((l, i) => (
                        <span key={i} className="rounded-full bg-slate-700/60 px-2.5 py-1 text-[11px] font-medium text-slate-200">{l}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-6 flex flex-col gap-3">
                  <Button size="lg" className="w-full text-lg text-white" style={{ backgroundColor: `color-mix(in oklab, ${VAR[primary]} 85%, black)` }} onClick={finalize}>
                    Enter Capital <ArrowRight className="ml-2" weight="bold" />
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 border-slate-600 bg-transparent text-slate-200 hover:bg-slate-800" onClick={restart}>
                      <ArrowsClockwise className="mr-2" size={15} /> Recalibrate
                    </Button>
                    {onSkip && (
                      <Button variant="ghost" size="sm" className="flex-1 text-slate-400 hover:text-slate-200" onClick={onSkip}>
                        Skip
                      </Button>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // ---------- QUIZ ----------
  const progress = Math.round(((answeredCount) / ARCHETYPE_QUESTIONS.length) * 100)

  return (
    <div className="aq-root">
      <div className="aq-stars" />
      <div className="aq-shell">
        <div className="grid gap-6 py-6 md:grid-cols-[300px_1fr] md:items-start">
          {/* Compass sidebar */}
          <div className="flex flex-col items-center gap-4 md:sticky md:top-6">
            <CompassRose scores={scores} leader={leader} />
            <div className="w-full max-w-[300px] space-y-0.5">
              {ORDER.map((id) => (
                <MeterRow key={id} id={id} score={scores[id]} total={total} lead={id === leader} />
              ))}
            </div>
            <p className="text-center text-xs text-slate-400">
              {leader ? (
                <>Reading you as <span className="font-bold" style={{ color: VAR[leader] }}>{ARCHETYPES[leader].name}</span>… keep going.</>
              ) : (
                <>Your compass is listening…</>
              )}
            </p>
          </div>

          {/* Question */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span className="font-semibold">Moment {currentQuestion + 1} of {ARCHETYPE_QUESTIONS.length}</span>
              <span className="font-bold text-indigo-300">{progress}% calibrated</span>
            </div>
            <div className="aq-dots">
              {ARCHETYPE_QUESTIONS.map((_, idx) => (
                <span
                  key={idx}
                  className={`aq-dot ${idx === currentQuestion ? 'aq-dot-current' : answers[idx] !== undefined ? 'aq-dot-done' : ''}`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.28 }}
                className="aq-card p-5 md:p-7"
              >
                <div className="aq-situation mb-3">{question.situation}</div>
                <h2 className="mb-5 text-xl font-bold leading-snug text-white md:text-2xl">{question.question}</h2>
                <div className="space-y-2.5">
                  {question.answers.map((answer, index) => {
                    const selected = selectedAnswer === index
                    const topTrait = ORDER.reduce((best, a) =>
                      answer.weights[a] > answer.weights[best] ? a : best, ORDER[0])
                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        className={`aq-answer ${selected ? 'aq-answer-selected' : ''}`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        role="radio"
                        aria-checked={selected}
                        aria-label={`Answer ${index + 1}: ${answer.text}`}
                        disabled={isTransitioning}
                      >
                        <div className="flex items-start gap-3">
                          <span className="aq-answer-key">{selected ? <Check weight="bold" size={13} /> : index + 1}</span>
                          <span className="flex-1 pt-0.5 text-sm md:text-base">{answer.text}</span>
                        </div>
                        <AnimatePresence>
                          {selected && (
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="mt-2 flex items-center gap-2 pl-[2.7rem]"
                            >
                              <span className="aq-nudge" style={{ color: VAR[topTrait] }}>
                                {ARCHETYPES[topTrait].icon} needle → {ARCHETYPES[topTrait].name}
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    )
                  })}
                </div>

                <div className="mt-5 flex items-center justify-between">
                  {currentQuestion > 0 ? (
                    <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white" onClick={handleBack} disabled={isTransitioning}>
                      <ArrowLeft className="mr-1.5" weight="bold" size={15} /> Back
                    </Button>
                  ) : onSkip ? (
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200" onClick={onSkip}>
                      Skip
                    </Button>
                  ) : <span />}
                  <p className="hidden text-xs text-slate-500 sm:block">
                    Press <span className="aq-kbd">1</span>–<span className="aq-kbd">4</span> · <span className="aq-kbd">←</span> back
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
