"use client";

import { useEffect, useMemo, useState } from "react";
import { Mission, MissionProgress, MissionResult } from "@/app/lib/game-types";
import { MISSIONS } from "@/app/lib/missions";
import {
  evaluateMission,
  formatClock,
  missionCountdown,
  nextLevelXp,
  summaryStats,
  xpToLevel,
} from "@/app/lib/sql-coach";

type ArenaTab = "lesson" | "coach" | "solution";

function getProgressEntry(progress: Record<number, MissionProgress>, missionId: number): MissionProgress {
  return (
    progress[missionId] ?? {
      bestScore: 0,
      stars: 0,
      cleared: false,
      quizCorrect: false,
    }
  );
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((idx) => (
        <span key={idx} className={idx <= count ? "text-amber-300" : "text-cyan-100/35"}>
          ★
        </span>
      ))}
    </div>
  );
}

function SchemaArena({ mission }: { mission: Mission }) {
  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
  const nodeCount = mission.schema.tables.length;
  const minX = nodeCount >= 3 ? 20 : 18;
  const maxX = nodeCount >= 3 ? 80 : 82;
  const minY = 22;
  const maxY = 78;

  const positionedTables = mission.schema.tables.map((table, index) => {
    const fallbackX =
      nodeCount <= 1 ? 50 : minX + ((maxX - minX) * index) / Math.max(1, nodeCount - 1);
    const safeX = clamp(table.x ?? fallbackX, minX, maxX);
    const safeY = clamp(table.y, minY, maxY);
    return { ...table, x: safeX, y: safeY };
  });

  const tableById = new Map(positionedTables.map((table) => [table.id, table]));

  return (
    <div className="panel pixel-edge relative h-72 overflow-hidden rounded-2xl p-3">
      <div className="absolute inset-0 sql-grid opacity-30" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {mission.schema.links.map((link) => {
          const from = tableById.get(link.from);
          const to = tableById.get(link.to);

          if (!from || !to) {
            return null;
          }

          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;

          return (
            <g key={`${link.from}-${link.to}`}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                className="pulse-line"
                stroke="rgba(131,221,255,0.82)"
                strokeWidth="0.65"
                strokeDasharray="2 2"
              />
              <text
                x={midX}
                y={midY - 1.7}
                textAnchor="middle"
                fill="rgba(209,245,255,0.92)"
                fontSize="3"
              >
                {link.label}
              </text>
            </g>
          );
        })}
      </svg>

      {positionedTables.map((table) => (
        <div
          key={table.id}
          className="panel-strong absolute w-40 -translate-x-1/2 -translate-y-1/2 rounded-xl p-3 md:w-44"
          style={{ left: `${table.x}%`, top: `${table.y}%` }}
        >
          <p className="text-xs font-semibold tracking-wide text-cyan-100">{table.name}</p>
          <ul className="mt-2 space-y-1 font-mono text-[11px] text-cyan-50/90">
            {table.columns.map((column) => (
              <li key={column}>{column}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function DatasetPreview({ mission }: { mission: Mission }) {
  return (
    <div className="panel pixel-edge rounded-2xl p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Sample Dataset Snapshot</p>
      <div className="mt-3 overflow-x-auto rounded-lg border border-cyan-300/25">
        <table className="min-w-full border-collapse text-left text-xs text-cyan-50/90">
          <thead className="bg-cyan-900/55">
            <tr>
              {mission.datasetPreview.columns.map((column) => (
                <th key={column} className="px-2 py-2 font-semibold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mission.datasetPreview.rows.map((row, rowIdx) => (
              <tr key={`${mission.id}-row-${rowIdx}`} className="border-t border-cyan-300/20 bg-cyan-950/45">
                {row.map((cell, colIdx) => (
                  <td key={`${mission.id}-cell-${rowIdx}-${colIdx}`} className="px-2 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Home() {
  const [missionIndex, setMissionIndex] = useState(0);
  const [query, setQuery] = useState(MISSIONS[0].starterQuery);
  const [xp, setXp] = useState(0);
  const [lives, setLives] = useState(4);
  const [streak, setStreak] = useState(0);
  const [hintIndex, setHintIndex] = useState(0);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState<Record<number, number>>({});
  const [progress, setProgress] = useState<Record<number, MissionProgress>>({});
  const [lastResult, setLastResult] = useState<MissionResult | null>(null);
  const [message, setMessage] = useState(
    "Campaign initialized. Learn each SQL concept, complete missions, and build true mastery."
  );
  const [timer, setTimer] = useState(missionCountdown(MISSIONS[0].difficulty));
  const [activeTab, setActiveTab] = useState<ArenaTab>("lesson");
  const [showSolution, setShowSolution] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Record<number, number>>({});

  const mission = MISSIONS[missionIndex];
  const missionAttempt = attempts[mission.id] ?? 0;
  const missionProgress = getProgressEntry(progress, mission.id);
  const unlockedHints = mission.hints.slice(0, hintIndex);
  const level = xpToLevel(xp);
  const stats = useMemo(() => summaryStats(progress, MISSIONS.length), [progress]);
  const xpTarget = nextLevelXp(xp);
  const livePreview = useMemo(
    () => evaluateMission(mission, query, hintIndex, Math.max(1, missionAttempt + 1)),
    [mission, query, hintIndex, missionAttempt]
  );

  const unlockedMissionCount = Math.max(1, stats.clearedCount + 1);
  const currentQuizSelection = selectedQuiz[mission.id];
  const quizSolved = missionProgress.quizCorrect;

  useEffect(() => {
    const resetSeconds = missionCountdown(mission.difficulty);
    const interval = setInterval(() => {
      setTimer((current) => {
        if (current > 1) {
          return current - 1;
        }

        setStreak(0);
        setLives((existingLives) => {
          const remaining = existingLives - 1;

          if (remaining <= 0) {
            setMessage(
              "Timer expired and all lives were consumed. Lives restored to 4 for continued learning."
            );
            return 4;
          }

          setMessage(`Timer expired. ${remaining} life${remaining === 1 ? "" : "s"} remaining.`);
          return remaining;
        });

        return resetSeconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mission.id, mission.difficulty]);

  function loadMission(nextIndex: number): void {
    const nextMission = MISSIONS[nextIndex];
    const isLocked = nextMission.level > unlockedMissionCount;

    if (isLocked) {
      setMessage(
        `Level ${nextMission.level} is locked. Clear more missions to unlock it (currently unlocked: ${unlockedMissionCount}).`
      );
      return;
    }

    setMissionIndex(nextIndex);
    setQuery(nextMission.starterQuery);
    setHintIndex(0);
    setLastResult(null);
    setShowSolution(false);
    setActiveTab("lesson");
    setTimer(missionCountdown(nextMission.difficulty));
    setMessage(`Loaded Level ${nextMission.level}: ${nextMission.title}`);
  }

  function handleSubmit(): void {
    const nextAttempt = missionAttempt + 1;
    setAttempts((current) => ({ ...current, [mission.id]: nextAttempt }));

    const result = evaluateMission(mission, query, hintIndex, nextAttempt);
    setLastResult(result);
    setActiveTab("coach");

    const existing = getProgressEntry(progress, mission.id);
    const mergedProgress: MissionProgress = {
      ...existing,
      bestScore: Math.max(existing.bestScore, result.score),
      stars: Math.max(existing.stars, result.stars),
      cleared: existing.cleared || result.success,
    };
    setProgress((current) => ({ ...current, [mission.id]: mergedProgress }));

    if (result.success) {
      const firstClear = !existing.cleared;
      const reward = firstClear
        ? result.score + result.stars * 15 + 25
        : Math.max(10, Math.round(result.score * 0.28));

      setXp((current) => current + reward);
      setStreak((current) => current + 1);
      setMessage(
        firstClear
          ? `Mission cleared with ${result.stars} star(s). +${reward} XP earned.`
          : `Replay successful. +${reward} XP for optimization practice.`
      );
    } else {
      setStreak(0);
      setLives((current) => {
        const remaining = current - 1;
        if (remaining <= 0) {
          setMessage("No lives left after failed checks. Lives restored to 4 so you can keep learning.");
          return 4;
        }

        setMessage(`Mission not complete. ${remaining} life${remaining === 1 ? "" : "s"} remaining.`);
        return remaining;
      });
    }
  }

  function handleHint(): void {
    if (hintIndex >= mission.hints.length) {
      setMessage("All hints already revealed for this mission.");
      return;
    }

    setHintIndex((current) => current + 1);
    setTotalHintsUsed((current) => current + 1);
    setMessage("Hint unlocked. Use it, then resubmit to improve mastery.");
  }

  function resetMission(): void {
    setQuery(mission.starterQuery);
    setHintIndex(0);
    setLastResult(null);
    setShowSolution(false);
    setActiveTab("lesson");
    setTimer(missionCountdown(mission.difficulty));
    setMessage(`Mission reset: ${mission.title}`);
  }

  function openNextMission(): void {
    if (missionIndex >= MISSIONS.length - 1) {
      setMessage("Final level reached. Replay missions and target 3-star clears.");
      return;
    }

    loadMission(missionIndex + 1);
  }

  function answerQuiz(optionIndex: number): void {
    setSelectedQuiz((current) => ({ ...current, [mission.id]: optionIndex }));

    if (quizSolved) {
      setMessage("Quiz already solved for this mission.");
      return;
    }

    if (optionIndex === mission.quiz.correctIndex) {
      setProgress((current) => {
        const existing = getProgressEntry(current, mission.id);
        return {
          ...current,
          [mission.id]: {
            ...existing,
            quizCorrect: true,
          },
        };
      });
      setXp((current) => current + 30);
      setMessage("Quiz correct. +30 XP bonus for theory mastery.");
      return;
    }

    setMessage("Quiz answer not correct yet. Review the lesson and try again.");
  }

  return (
    <main className="sql-grid min-h-screen px-4 py-6 text-foreground md:px-8 md:py-8">
      <section className="mx-auto flex w-full max-w-[1500px] flex-col gap-4">
        <header className="panel floating pixel-edge rounded-2xl p-5 md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/85">SQL Learning Arena</p>
              <h1 className="mt-2 text-3xl font-bold leading-tight text-white md:text-4xl">
                Learn SQL End-to-End: Relational, Object, Spatial, and SGBD Dialects
              </h1>
              <p className="mt-2 max-w-4xl text-sm text-cyan-100/85 md:text-base">{message}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
              <div className="rounded-xl border border-cyan-300/35 bg-cyan-950/40 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-100/70">Level</p>
                <p className="text-xl font-semibold text-white">{level}</p>
              </div>
              <div className="rounded-xl border border-cyan-300/35 bg-cyan-950/40 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-100/70">XP</p>
                <p className="text-xl font-semibold text-white">{xp}</p>
              </div>
              <div className="rounded-xl border border-cyan-300/35 bg-cyan-950/40 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-100/70">Lives</p>
                <p className="text-xl font-semibold text-white">{lives}</p>
              </div>
              <div className="rounded-xl border border-cyan-300/35 bg-cyan-950/40 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-100/70">Streak</p>
                <p className="text-xl font-semibold text-white">{streak}</p>
              </div>
              <div className="rounded-xl border border-cyan-300/35 bg-cyan-950/40 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-100/70">Timer</p>
                <p className="text-xl font-semibold text-white">{formatClock(timer)}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-cyan-100/75">
                <span>Campaign Progress</span>
                <span>{stats.campaignPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-cyan-950/80">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-teal-300 via-cyan-300 to-amber-200 transition-all"
                  style={{ width: `${stats.campaignPercent}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-cyan-100/75">
                <span>XP To Next Level</span>
                <span>{Math.max(0, xpTarget - xp)}</span>
              </div>
              <div className="h-2 rounded-full bg-cyan-950/80">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-sky-300 to-violet-200 transition-all"
                  style={{ width: `${Math.min(100, Math.round(((xp % 240) / 240) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.25fr_1.1fr]">
          <aside className="space-y-4">
            <article className="panel pixel-edge rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Current Mission</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{mission.title}</h2>
                </div>
                <div className="rounded-lg border border-cyan-300/35 bg-cyan-900/40 px-2 py-1 text-xs text-cyan-100">
                  {mission.difficulty}
                </div>
              </div>

              <div className="mt-3 space-y-2 text-sm text-cyan-100/85">
                <p>
                  <span className="font-semibold text-cyan-50">Level:</span> {mission.level}
                </p>
                <p>
                  <span className="font-semibold text-cyan-50">Academy:</span> {mission.academy}
                </p>
                <p>
                  <span className="font-semibold text-cyan-50">Dialect:</span> {mission.dialect}
                </p>
                <p>{mission.story}</p>
                <p className="rounded-lg border border-cyan-300/30 bg-cyan-950/45 p-3 text-cyan-50">
                  <span className="font-semibold">Objective:</span> {mission.objective}
                </p>
              </div>
            </article>

            <article className="panel pixel-edge rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Level Navigator</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                {MISSIONS.map((item, index) => {
                  const itemProgress = getProgressEntry(progress, item.id);
                  const isActive = index === missionIndex;
                  const isLocked = item.level > unlockedMissionCount;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => loadMission(index)}
                      className={`rounded-xl border px-2 py-2 text-left transition ${
                        isActive
                          ? "border-cyan-100 bg-cyan-100 text-slate-900"
                          : isLocked
                            ? "border-cyan-300/20 bg-slate-950/30 text-cyan-100/40"
                            : itemProgress.cleared
                              ? "border-teal-200/65 bg-teal-300/12 text-teal-100"
                              : "border-cyan-300/35 bg-cyan-900/32 text-cyan-100 hover:bg-cyan-800/55"
                      }`}
                    >
                      <p className="font-semibold">L{item.level}</p>
                      <p className="truncate">{item.academy}</p>
                      <Stars count={itemProgress.stars} />
                    </button>
                  );
                })}
              </div>
            </article>

            <div className="space-y-3">
              <h3 className="text-sm uppercase tracking-[0.2em] text-cyan-100/75">Schema Radar</h3>
              <SchemaArena mission={mission} />
            </div>

            <DatasetPreview mission={mission} />
          </aside>

          <section className="space-y-4">
            <article className="panel-strong pixel-edge rounded-2xl p-4 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-white">Mission Command Console</h2>
                <p className="text-xs text-cyan-100/80">Attempt #{missionAttempt + 1}</p>
              </div>

              <textarea
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="mt-3 h-72 w-full resize-y rounded-xl border border-cyan-300/35 bg-slate-950/82 p-3 font-mono text-sm text-cyan-100 outline-none transition focus:border-cyan-200 focus:ring-2 focus:ring-cyan-300/45"
                spellCheck={false}
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="rounded-xl bg-gradient-to-r from-teal-300 to-cyan-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:brightness-110"
                >
                  Run Mission Check
                </button>
                <button
                  type="button"
                  onClick={handleHint}
                  className="rounded-xl border border-amber-200/70 bg-amber-200/12 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-200/22"
                >
                  Reveal Hint
                </button>
                <button
                  type="button"
                  onClick={resetMission}
                  className="rounded-xl border border-cyan-300/45 bg-cyan-900/35 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-800/55"
                >
                  Reset Query
                </button>
                <button
                  type="button"
                  onClick={openNextMission}
                  className="rounded-xl border border-violet-200/70 bg-violet-300/15 px-4 py-2 text-sm font-semibold text-violet-100 transition hover:bg-violet-300/25"
                >
                  Next Mission
                </button>
              </div>
            </article>

            <article className="panel pixel-edge rounded-2xl p-4">
              <div className="flex flex-wrap gap-2">
                {(["lesson", "coach", "solution"] as ArenaTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-lg border px-3 py-1 text-xs uppercase tracking-[0.12em] transition ${
                      activeTab === tab
                        ? "border-cyan-100 bg-cyan-100 text-slate-900"
                        : "border-cyan-300/35 bg-cyan-900/35 text-cyan-100 hover:bg-cyan-800/55"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === "lesson" ? (
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Concepts</p>
                    <ul className="mt-2 space-y-2 text-sm text-cyan-50/92">
                      {mission.concepts.map((concept) => (
                        <li key={concept} className="rounded-lg border border-cyan-300/25 bg-cyan-950/45 p-2">
                          {concept}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Common Mistakes</p>
                    <ul className="mt-2 space-y-2 text-sm text-rose-100/90">
                      {mission.commonMistakes.map((mistake) => (
                        <li key={mistake} className="rounded-lg border border-rose-300/30 bg-rose-400/10 p-2">
                          {mistake}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}

              {activeTab === "coach" ? (
                <div className="mt-3 space-y-3">
                  <p className="rounded-lg border border-cyan-300/30 bg-cyan-950/50 p-3 text-sm text-cyan-50">
                    Live mastery estimate: <span className="font-semibold">{livePreview.mastery}%</span>
                  </p>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Rule Coverage</p>
                    <div className="mt-2 h-2 rounded-full bg-cyan-950/80">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-teal-300 to-cyan-300 transition-all"
                        style={{ width: `${livePreview.mastery}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-[0.18em] text-cyan-100/70">Matched Rules</p>
                      <ul className="space-y-2 text-sm text-teal-100/95">
                        {livePreview.matchedRules.length ? (
                          livePreview.matchedRules.map((rule) => (
                            <li key={rule.label} className="rounded-lg border border-teal-200/35 bg-teal-300/10 p-2">
                              {rule.label}
                            </li>
                          ))
                        ) : (
                          <li className="text-cyan-100/70">No rules matched yet.</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-[0.18em] text-cyan-100/70">Missing Rules</p>
                      <ul className="space-y-2 text-sm text-rose-100/95">
                        {livePreview.missingRules.length ? (
                          livePreview.missingRules.map((rule) => (
                            <li key={rule.label} className="rounded-lg border border-rose-200/35 bg-rose-300/10 p-2">
                              <p className="font-medium">{rule.label}</p>
                              <p className="mt-1 text-xs text-rose-100/80">Tip: {rule.tip}</p>
                            </li>
                          ))
                        ) : (
                          <li className="text-teal-100">No missing rules.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === "solution" ? (
                <div className="mt-3 space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowSolution((current) => !current)}
                    className="rounded-lg border border-cyan-300/35 bg-cyan-900/35 px-3 py-2 text-sm text-cyan-50"
                  >
                    {showSolution ? "Hide Official Solution" : "Show Official Solution"}
                  </button>
                  {showSolution ? (
                    <pre className="overflow-x-auto rounded-lg border border-cyan-300/25 bg-slate-950/80 p-3 font-mono text-xs text-cyan-100">
                      {mission.solutionQuery}
                    </pre>
                  ) : (
                    <p className="text-sm text-cyan-100/75">
                      Reveal the official query only after you attempt the mission. Learning comes first.
                    </p>
                  )}
                </div>
              ) : null}
            </article>
          </section>

          <aside className="space-y-4">
            <article className="panel pixel-edge rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Hints</p>
              {unlockedHints.length ? (
                <ul className="mt-3 space-y-2 text-sm text-amber-100/95">
                  {unlockedHints.map((hint) => (
                    <li key={hint} className="rounded-lg border border-amber-200/35 bg-amber-200/10 p-2">
                      {hint}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-cyan-100/75">No hints revealed for this level yet.</p>
              )}
            </article>

            <article className="panel pixel-edge rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">AI SQL Explanation</p>
              <ul className="mt-3 space-y-2 text-sm text-cyan-50/90">
                {(lastResult?.explainPlan ?? livePreview.explainPlan).map((line) => (
                  <li key={line} className="rounded-lg border border-cyan-200/25 bg-cyan-950/45 p-2">
                    {line}
                  </li>
                ))}
              </ul>
            </article>

            <article className="panel pixel-edge rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Anti-Pattern Alerts</p>
              <ul className="mt-3 space-y-2 text-sm">
                {(lastResult?.antiPatterns ?? livePreview.antiPatterns).length ? (
                  (lastResult?.antiPatterns ?? livePreview.antiPatterns).map((warning) => (
                    <li key={warning} className="rounded-lg border border-rose-300/30 bg-rose-400/10 p-2 text-rose-100/92">
                      {warning}
                    </li>
                  ))
                ) : (
                  <li className="rounded-lg border border-teal-300/35 bg-teal-300/10 p-2 text-teal-100/95">
                    No anti-patterns detected.
                  </li>
                )}
              </ul>
            </article>

            <article className="panel pixel-edge rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Mission Quiz</p>
              <p className="mt-2 text-sm text-cyan-50">{mission.quiz.question}</p>
              <div className="mt-3 space-y-2">
                {mission.quiz.options.map((option, idx) => {
                  const isChosen = currentQuizSelection === idx;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => answerQuiz(idx)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                        isChosen
                          ? "border-cyan-100 bg-cyan-100 text-slate-900"
                          : "border-cyan-300/35 bg-cyan-900/35 text-cyan-50 hover:bg-cyan-800/55"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {typeof currentQuizSelection === "number" ? (
                <p
                  className={`mt-3 rounded-lg border p-2 text-xs ${
                    currentQuizSelection === mission.quiz.correctIndex
                      ? "border-teal-200/50 bg-teal-300/12 text-teal-100"
                      : "border-rose-200/45 bg-rose-400/10 text-rose-100"
                  }`}
                >
                  {currentQuizSelection === mission.quiz.correctIndex
                    ? mission.quiz.explanation
                    : "Not correct yet. Revisit concepts and try again."}
                </p>
              ) : null}
            </article>

            <article className="panel pixel-edge rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Campaign Stats</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-cyan-300/35 bg-cyan-900/35 p-2">
                  <p className="text-cyan-100/75">Cleared</p>
                  <p className="text-xl font-semibold text-white">{stats.clearedCount}</p>
                </div>
                <div className="rounded-lg border border-cyan-300/35 bg-cyan-900/35 p-2">
                  <p className="text-cyan-100/75">Total Stars</p>
                  <p className="text-xl font-semibold text-white">{stats.totalStars}</p>
                </div>
                <div className="rounded-lg border border-cyan-300/35 bg-cyan-900/35 p-2">
                  <p className="text-cyan-100/75">Perfect (3 star)</p>
                  <p className="text-xl font-semibold text-white">{stats.perfectCount}</p>
                </div>
                <div className="rounded-lg border border-cyan-300/35 bg-cyan-900/35 p-2">
                  <p className="text-cyan-100/75">Quiz Wins</p>
                  <p className="text-xl font-semibold text-white">{stats.quizWins}</p>
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-cyan-300/30 bg-cyan-950/45 p-2 text-xs text-cyan-100/85">
                Best score this mission: <span className="font-semibold text-white">{missionProgress.bestScore}</span>
                <span className="mx-2">|</span>
                Stars: <Stars count={missionProgress.stars} />
              </div>

              <p className="mt-3 text-xs text-cyan-100/70">Total hints used in campaign: {totalHintsUsed}</p>
            </article>
          </aside>
        </section>
      </section>
    </main>
  );
}
