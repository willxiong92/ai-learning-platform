// Type declarations for assessment.mjs, for TypeScript consumers (UI components).
// Quiz types mirror the `quiz` block of each lesson's activities.yaml.

// ---------- activities (input) ----------

export interface QuizOption {
  text: string;
  /** Empty string on the correct option. */
  feedback: string;
}

export interface QuizQuestion {
  id: string;
  critical?: boolean;
  section: string;
  prompt: string;
  options: QuizOption[];
  /** 0-based index into options. */
  answer: number;
  reason: string;
}

export interface QuizRule {
  status?: string;
  /** Minimum correct answers; falls back to all questions when missing. */
  min_correct: number;
  /** Critical questions must all be correct unless explicitly false. */
  critical_required: boolean;
  text?: string;
}

export interface ShortQuestion {
  prompt: string;
  placeholder?: string;
  rubric: string[];
  rubric_note?: string;
}

export interface Quiz {
  notice?: string;
  rule: QuizRule;
  questions: QuizQuestion[];
  short_question: ShortQuestion;
}

/** The part of a lesson's activities the assessment needs. */
export interface AssessmentActivities {
  version: string;
  quiz: Quiz;
}

// ---------- grading (output) ----------

/** Question id -> chosen option index. */
export type QuizAnswers = Record<string, number>;

export interface QuestionResult {
  id: string;
  section: string | null;
  critical: boolean;
  /** null when unanswered, malformed or out of range. */
  chosen: number | null;
  answered: boolean;
  correct: boolean;
}

export interface QuizGrade {
  results: QuestionResult[];
  total: number;
  correctCount: number;
  unansweredCount: number;
  minCorrect: number;
  criticalOk: boolean;
  passed: boolean;
}

/** Self-check state only; never an automatic score. */
export interface ShortAnswerState {
  written: boolean;
  /** Written and rubric self-check explicitly confirmed. Not human acceptance. */
  done: boolean;
  checked: number;
  total: number;
}

// ---------- progress (stored) ----------

export interface Attempt {
  /** activities.version the attempt was made against. */
  version: string;
  /** ISO timestamp. */
  at: string;
  answers: QuizAnswers;
  shortAnswer: string;
  rubricChecks: boolean[];
  rubricDone: boolean;
  /** Learner reported using notes or AI while answering; recorded, not graded. */
  aided: boolean;
}

export interface LessonProgress {
  readVersion: string | null;
  readAt: string | null;
  /** In order; index 0 is the first attempt, the rest are retakes. */
  attempts: Attempt[];
}

export interface Progress {
  schemaVersion: 1;
  lessons: Record<string, LessonProgress>;
}

export type ProgressNotice = "corrupt" | "unsupported" | "unavailable";

export interface AttemptInput {
  version: string;
  at: string;
  answers?: QuizAnswers;
  shortAnswer?: string;
  rubricChecks?: boolean[];
  rubricDone?: boolean;
  aided?: boolean;
}

// ---------- derived status ----------

export type LessonStatusKey =
  | "not_started"
  | "in_progress"
  | "read_quiz_pending"
  | "quiz_not_passed"
  | "short_pending"
  | "read_pending"
  /** Local self-test complete. Never means human or business acceptance. */
  | "self_check_complete";

export interface LessonAssessmentStatus {
  key: LessonStatusKey;
  label: string;
  version: string;
  readCurrent: boolean;
  /** Read mark exists but for an older version. */
  staleRead: boolean;
  first: { attempt: Attempt | null; isCurrent: boolean; grade: QuizGrade | null };
  /** Latest attempt on the current version only. */
  latest: { attempt: Attempt | null; grade: QuizGrade | null; short: ShortAnswerState | null };
  currentAttempts: number;
  retakeCount: number;
  staleAttempts: number;
  aidedCount: number;
  reviewSections: string[];
}

// ---------- storage ----------

/** Subset of the Web Storage API; pass window.localStorage from the UI. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  key?(index: number): string | null;
  readonly length?: number;
}

export interface StorageOptions {
  now?: () => string;
}

export interface LoadResult {
  data: Progress;
  notice: ProgressNotice | null;
  warning: "backup_failed" | null;
  backupKey: string | null;
}

export interface SaveResult {
  ok: boolean;
  warning: "unavailable" | "backup_failed" | "write_failed" | null;
  backupKey: string | null;
}

// ---------- exports ----------

export const STORAGE_KEY: "ai-learning-next:v1:progress";
export const BACKUP_PREFIX: "ai-learning-next:v1:progress-backup:";
export const SCHEMA_VERSION: 1;
export const STATUS_LABEL: Readonly<Record<LessonStatusKey, string>>;

export function normalizeAnswer(value: unknown, optionCount: number): number | null;
export function gradeQuiz(quiz: Pick<Quiz, "rule" | "questions">, answers: unknown): QuizGrade;
export function shortAnswerState(
  attempt: Pick<Attempt, "shortAnswer" | "rubricChecks" | "rubricDone"> | null | undefined,
  rubricCount: number,
): ShortAnswerState;
export function sectionsToReview(grade: QuizGrade): string[];

export function emptyProgress(): Progress;
export function parseProgress(raw: unknown): { data: Progress; notice: "corrupt" | "unsupported" | null };

export function markRead(progress: Progress, lessonId: string, version: string, at: string): Progress;
export function recordAttempt(progress: Progress, lessonId: string, input: AttemptInput): Progress;
export function setAttemptRubric(
  progress: Progress,
  lessonId: string,
  attemptIndex: number,
  rubricChecks: boolean[],
  rubricDone: boolean,
): Progress;

export function deriveLessonStatus(
  lesson: LessonProgress | undefined | null,
  activities: AssessmentActivities,
): LessonAssessmentStatus;

export function loadProgress(storage: StorageLike | null | undefined, options?: StorageOptions): LoadResult;
export function saveProgress(
  storage: StorageLike | null | undefined,
  progress: Progress,
  options?: StorageOptions,
): SaveResult;
