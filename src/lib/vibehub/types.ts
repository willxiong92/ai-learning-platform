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
}

export interface TopicSection {
  cat: string;
  ids: string[];
}

export interface Topic {
  slug: string; // "" for the default/frontend tab, served at "/"
  label: string;
  count: number;
  sections: TopicSection[];
}

export interface AifCard {
  id: string;
  title: string | null;
  quote: string | null;
  demoClass: string | null;
  demoHTML: string | null;
}

export interface AifSection {
  id: string;
  title: string | null;
  subtitle: string | null;
  cards: AifCard[];
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
