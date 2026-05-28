import { Mission, MissionProgress, MissionResult, SqlRule } from "@/app/lib/game-types";

function compactSql(input: string): string {
  return input.replace(/\s+/g, " ").trim().toLowerCase();
}

function stripComments(sql: string): string {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--.*$/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesRule(rule: SqlRule, noCommentSql: string, rawSql: string): boolean {
  return rule.pattern.test(noCommentSql) || rule.pattern.test(rawSql);
}

function detectAntiPatterns(sql: string): string[] {
  const patterns: string[] = [];
  const normalized = compactSql(sql);

  if (/select\s+\*/i.test(normalized)) {
    patterns.push("Avoid `SELECT *` in learning drills; pick explicit columns.");
  }

  if (/from\s+\w+\s*,\s*\w+/i.test(normalized)) {
    patterns.push("Implicit comma join detected. Prefer explicit `JOIN ... ON ...` syntax.");
  }

  if (/where\s+.*=\s*null/i.test(normalized)) {
    patterns.push("Use `IS NULL` instead of `= NULL`.");
  }

  if (/group\s+by/i.test(normalized) && !/having/i.test(normalized) && /sum\(|count\(|avg\(/i.test(normalized)) {
    patterns.push("You aggregate rows. Verify if a `HAVING` clause is needed for grouped filters.");
  }

  return patterns;
}

function explainSql(query: string): string[] {
  const lines: string[] = [];
  const noComments = stripComments(query);
  const normalized = compactSql(noComments);

  const selectMatch = normalized.match(/select\s+(.+?)\s+from\s+/i);
  if (selectMatch) {
    lines.push(`Projection: returns ${selectMatch[1]}.`);
  }

  const fromMatch = normalized.match(/from\s+([a-z0-9_\.]+)/i);
  if (fromMatch) {
    lines.push(`Source: starts from table/view \`${fromMatch[1]}\`.`);
  }

  const joins = [...normalized.matchAll(/(inner|left|right|full|cross)?\s*join\s+([a-z0-9_\.]+)\s+on\s+(.+?)(?=\s+(inner|left|right|full|cross)?\s*join|\s+where|\s+group\s+by|\s+having|\s+order\s+by|\s+limit|\s+offset|$)/gi)];
  joins.forEach((match, index) => {
    const joinType = match[1] ? `${match[1].toUpperCase()} JOIN` : "JOIN";
    lines.push(`Join ${index + 1}: ${joinType} with \`${match[2]}\` on ${match[3]}.`);
  });

  const whereMatch = normalized.match(/where\s+(.+?)(?=\s+group\s+by|\s+having|\s+order\s+by|\s+limit|\s+offset|$)/i);
  if (whereMatch) {
    lines.push(`Row filter: ${whereMatch[1]}.`);
  }

  const groupMatch = normalized.match(/group\s+by\s+(.+?)(?=\s+having|\s+order\s+by|\s+limit|\s+offset|$)/i);
  if (groupMatch) {
    lines.push(`Grouping: creates groups by ${groupMatch[1]}.`);
  }

  const havingMatch = normalized.match(/having\s+(.+?)(?=\s+order\s+by|\s+limit|\s+offset|$)/i);
  if (havingMatch) {
    lines.push(`Group filter: keeps groups where ${havingMatch[1]}.`);
  }

  const windowMatches = [...normalized.matchAll(/\bover\s*\((.*?)\)/gi)];
  if (windowMatches.length) {
    lines.push(`Window analytics: ${windowMatches.length} OVER() clause(s) detected.`);
  }

  const orderMatch = normalized.match(/order\s+by\s+(.+?)(?=\s+limit|\s+offset|$)/i);
  if (orderMatch) {
    lines.push(`Ordering: sorted by ${orderMatch[1]}.`);
  }

  if (/limit\s+\d+/i.test(normalized)) {
    const limitMatch = normalized.match(/limit\s+(\d+)/i);
    if (limitMatch) {
      lines.push(`Row cap: returns at most ${limitMatch[1]} rows.`);
    }
  }

  if (/offset\s+\d+\s+rows/i.test(normalized)) {
    const offset = normalized.match(/offset\s+(\d+)\s+rows/i);
    if (offset) {
      lines.push(`Pagination: skips first ${offset[1]} row(s) before returning results.`);
    }
  }

  if (/->>|jsonb|@>/i.test(normalized)) {
    lines.push("Object SQL: JSON/JSONB access patterns are active.");
  }

  if (/st_dwithin|st_distance|st_intersects|geometry|geography/i.test(normalized)) {
    lines.push("Spatial SQL: geospatial functions detected.");
  }

  if (/on\s+conflict/i.test(normalized)) {
    lines.push("Upsert flow: `ON CONFLICT` handles insert/update in one statement.");
  }

  if (!lines.length) {
    lines.push("No recognizable SQL structure found yet. Add SELECT/FROM and required clauses.");
  }

  return lines;
}

function coachNotes(query: string): string[] {
  const notes: string[] = [];
  const normalized = compactSql(query);

  if (/join\s+/i.test(normalized)) {
    notes.push("Great: join logic detected, so you are modeling table communication.");
  }

  if (/group\s+by/i.test(normalized)) {
    notes.push("Grouping detected. Check that selected columns are grouped or aggregated.");
  }

  if (/row_number|rank|dense_rank|over\s*\(/i.test(normalized)) {
    notes.push("Window function detected. This is key for advanced analytics.");
  }

  if (/->>|jsonb|@>/i.test(normalized)) {
    notes.push("Object SQL mode detected. Consider indexes on frequent JSON paths.");
  }

  if (/st_dwithin|st_intersects|st_distance/i.test(normalized)) {
    notes.push("Spatial SQL mode detected. Validate SRID and units for accurate distance logic.");
  }

  if (/top\s+\d+|limit\s+\d+|offset\s+\d+/i.test(normalized)) {
    notes.push("Dialect pagination clause detected. Good cross-engine awareness.");
  }

  if (/on\s+conflict/i.test(normalized)) {
    notes.push("Upsert strategy detected. Nice choice for write consistency.");
  }

  if (!notes.length) {
    notes.push("Try adding explicit clauses; the coach can then give richer guidance.");
  }

  return notes;
}

function calculateStars(success: boolean, hintsUsed: number, attemptNo: number, bonusHitRate: number): number {
  if (!success) {
    return 0;
  }

  let stars = 1;
  if (hintsUsed === 0) {
    stars += 1;
  }

  if (attemptNo <= 2 && bonusHitRate >= 0.5) {
    stars += 1;
  }

  return Math.min(3, stars);
}

export function evaluateMission(
  mission: Mission,
  query: string,
  hintsUsed: number,
  attemptNo: number
): MissionResult {
  const noCommentSql = compactSql(stripComments(query));
  const rawSql = compactSql(query);

  if (!noCommentSql) {
    return {
      success: false,
      score: 0,
      mastery: 0,
      stars: 0,
      matchedRules: [],
      missingRules: mission.rules,
      matchedBonusRules: [],
      antiPatterns: ["Mission scanner: query is empty."],
      coachNotes: ["Write a query, then submit for coaching."],
      explainPlan: ["No SQL to explain yet."],
    };
  }

  const matchedRules = mission.rules.filter((rule) => matchesRule(rule, noCommentSql, rawSql));
  const missingRules = mission.rules.filter((rule) => !matchesRule(rule, noCommentSql, rawSql));
  const matchedBonusRules = mission.bonusRules.filter((rule) => matchesRule(rule, noCommentSql, rawSql));
  const success = missingRules.length === 0;

  const requiredPoints = mission.rules.reduce((sum, rule) => sum + rule.points, 0);
  const bonusPoints = mission.bonusRules.reduce((sum, rule) => sum + rule.points, 0);
  const pointsFromRules = matchedRules.reduce((sum, rule) => sum + rule.points, 0);
  const pointsFromBonus = matchedBonusRules.reduce((sum, rule) => sum + rule.points, 0);
  const hitRate = requiredPoints ? pointsFromRules / requiredPoints : 0;
  const bonusHitRate = bonusPoints ? pointsFromBonus / bonusPoints : 0;

  const baseScore = Math.round(hitRate * 100);
  const bonusScore = Math.round(pointsFromBonus * 0.6);
  const firstTryBonus = success && attemptNo === 1 ? 16 : 0;
  const hintPenalty = hintsUsed * 8;
  const retryPenalty = Math.max(0, attemptNo - 1) * 5;
  const score = Math.max(success ? 35 : 5, baseScore + bonusScore + firstTryBonus - hintPenalty - retryPenalty);
  const stars = calculateStars(success, hintsUsed, attemptNo, bonusHitRate);
  const antiPatterns = detectAntiPatterns(query);

  return {
    success,
    score,
    mastery: Math.round(hitRate * 100),
    stars,
    matchedRules,
    missingRules,
    matchedBonusRules,
    antiPatterns,
    coachNotes: coachNotes(query),
    explainPlan: explainSql(query),
  };
}

export function xpToLevel(xp: number): number {
  return Math.floor(xp / 240) + 1;
}

export function nextLevelXp(xp: number): number {
  const level = xpToLevel(xp);
  return level * 240;
}

export function missionCountdown(difficulty: Mission["difficulty"]): number {
  if (difficulty === "Legend") {
    return 11 * 60;
  }
  if (difficulty === "Advanced") {
    return 9 * 60;
  }
  return 7 * 60;
}

export function summaryStats(progress: Record<number, MissionProgress>, missionCount: number) {
  const entries = Object.values(progress);
  const clearedCount = entries.filter((item) => item.cleared).length;
  const totalStars = entries.reduce((sum, item) => sum + item.stars, 0);
  const perfectCount = entries.filter((item) => item.stars === 3).length;
  const quizWins = entries.filter((item) => item.quizCorrect).length;

  return {
    clearedCount,
    totalStars,
    perfectCount,
    quizWins,
    campaignPercent: Math.round((clearedCount / missionCount) * 100),
  };
}

export function formatClock(seconds: number): string {
  const safe = Math.max(0, seconds);
  const mm = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const ss = (safe % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}
