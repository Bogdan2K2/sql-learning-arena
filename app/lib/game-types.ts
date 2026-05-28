export type Difficulty = "Rookie" | "Advanced" | "Legend";

export type Academy =
  | "Foundations"
  | "Relational"
  | "Analytics"
  | "Object SQL"
  | "Spatial SQL"
  | "SGBD";

export type SqlRule = {
  label: string;
  pattern: RegExp;
  points: number;
  tip: string;
};

export type SchemaTable = {
  id: string;
  name: string;
  columns: string[];
  x: number;
  y: number;
};

export type SchemaLink = {
  from: string;
  to: string;
  label: string;
};

export type MissionQuiz = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type DatasetPreview = {
  columns: string[];
  rows: string[][];
};

export type Mission = {
  id: number;
  level: number;
  academy: Academy;
  title: string;
  difficulty: Difficulty;
  dialect: string;
  story: string;
  objective: string;
  starterQuery: string;
  solutionQuery: string;
  hints: string[];
  concepts: string[];
  commonMistakes: string[];
  rules: SqlRule[];
  bonusRules: SqlRule[];
  quiz: MissionQuiz;
  datasetPreview: DatasetPreview;
  schema: {
    tables: SchemaTable[];
    links: SchemaLink[];
  };
};

export type MissionResult = {
  success: boolean;
  score: number;
  mastery: number;
  stars: number;
  matchedRules: SqlRule[];
  missingRules: SqlRule[];
  matchedBonusRules: SqlRule[];
  antiPatterns: string[];
  coachNotes: string[];
  explainPlan: string[];
};

export type MissionProgress = {
  bestScore: number;
  stars: number;
  cleared: boolean;
  quizCorrect: boolean;
};
