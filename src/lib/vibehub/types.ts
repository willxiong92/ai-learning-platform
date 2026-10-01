// Data shapes for the VibeHub term catalog (ported from vibe-hub.org's own
// data-driven rendering — one big term array + per-term detail-page extras).
// Kept plain/serializable so it can be imported straight from terms.json.

export interface TermVariant {
  name: string | null;
  en: string | null;
  demoHtml: string | null;
  when: string | null;
}

export interface TermScenario {
  caption: string | null;
  html: string | null;
}

export interface TermAnatomyPart {
  idx: string | null;
  name: string | null;
  en: string | null;
  desc: string | null;
}

export interface TermAnatomy {
  stageHtml: string | null;
  parts: TermAnatomyPart[];
}

export interface TermQuizOption {
  marker: string | null;
  label: string | null;
}

export interface TermQuiz {
  kicker: string | null;
  hint: string | null;
  question: string | null;
  options: TermQuizOption[];
}

export interface TermReference {
  href: string;
  title: string | null;
  sub: string | null;
}

export interface TermDistinctionDetail {
  html: string;
  text: string;
  links: { href: string; text: string }[];
}

export interface TermDistinction {
  label?: string;
  text?: string;
  targetId?: string;
}

export interface Term {
  id: string;
  name: string;
  cn: string;
  cat: string;
  tagline: string;
  desc: string;
  demo: string;
  /** Modifier classes on the card's .card-demo wrapper (e.g. "scaled-preview diagram-preview"). */
  demoClass: string;
  /** Fully-formed demo markup including the source site's preview wrapper divs. */
  demoHTML: string;
  quote?: string;
  aliases?: string[];
  distinctions?: TermDistinction[];
  omitUsage?: boolean;
  prerequisites?: string[];
  learning?: string;
  detailKind?: string;
  detailTemplate?: string;
  // Extras scraped from the rendered detail page (server-rendered per term,
  // so not present in the card-grid data array on the live site).
  anatomy: TermAnatomy | null;
  variants: TermVariant[] | null;
  scenarios: TermScenario[] | null;
  aiPrompt: string | null;
  quiz: TermQuiz | null;
  references: TermReference[] | null;
  distinctionsDetail: TermDistinctionDetail[] | null;
  /** AI 课程写的长篇讲解（已渲染的 HTML），只有部分术语有 */
  article?: string;
}

export interface TopicSection {
  cat: string;
  ids: string[];
  /** 学习路线才有：左侧目录显示的课号和短名（cat 是完整的“第 0X 课 · 课名”） */
  nav?: { num: string; label: string };
}

export interface Topic {
  slug: string; // 技术词典：topics.json 里前端是 ""，data.ts 统一改成 "frontend"；学习路线：m1–m6，首页 / 显示 HOME_TOPIC_SLUG
  label: string;
  count: number;
  sections: TopicSection[];
  /** 只有学习路线模块有：对应的课程模块信息 */
  route?: {
    order: number;
    title: string;
    writing: boolean;
    courseHref: string;
    lessonRange: string;
    lessonIds: string[];
  };
}

export interface ChangelogMonth {
  label: string | null;
  count: string | null;
}

export interface ChangelogStat {
  number: string | null;
  label: string | null;
}

export interface ChangelogTermPill {
  href: string | null;
  title: string | null;
  cn: string | null;
  en: string | null;
  cat: string | null;
}

export interface ChangelogUpdateItem {
  icon: string | null;
  text: string | null;
}

export type ChangelogGroup =
  | { type: "updates"; items: ChangelogUpdateItem[] }
  | { type: "terms"; label: string | null; terms: ChangelogTermPill[] };

export interface ChangelogEntry {
  id: string | null;
  datetime: string | null;
  dateLabel: string | null;
  milestoneTitle: string | null;
  groups: ChangelogGroup[];
}

export interface ChangelogData {
  title: string | null;
  subtitle: string | null;
  months: ChangelogMonth[];
  stats: ChangelogStat[];
  filters: (string | undefined)[];
  entries: ChangelogEntry[];
}

export interface PracticeOption {
  id: string;
  label: string;
  feedback: string;
  correct: boolean;
}

export interface PracticeQuestion {
  id: string;
  termId: string;
  title: string;
  options: PracticeOption[];
  /** "write" = AI 课程的“写一写”卡：写几句话，再看解析、对照要点；不计分、不保存。缺省为选择题。 */
  kind?: "choice" | "write";
  write?: PracticeWrite;
}

export interface PracticeWrite {
  /** 动手任务的操作步骤，显示在输入框上方；没有步骤时为空数组。 */
  steps: string[];
  placeholder: string | null;
  hint: string | null;
  answer: string | null;
  points: string[];
}

export interface CourseChapter {
  number: string;
  slug: string;
  title: string;
  summary: string;
  blueprintId: string;
}

export interface Course {
  slug: string;
  title: string;
  lead: string;
  routeBlueprintId: string;
  chapters: CourseChapter[];
}

export interface CourseLesson {
  courseSlug: string;
  slug: string;
  bodyHtml: string;
}
