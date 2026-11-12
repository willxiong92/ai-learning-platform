import termsData from "./terms.json";
import topicsData from "./topics.json";
import changelogData from "./changelog-data.json";
import practiceData from "./practice-data.json";
import coursesData from "./courses-data.json";
import courseLessonsData from "./course-lessons-data.json";
// AI 课程接进图鉴与练习页的部分（npm run content:ai 从教材母源生成，不要手改）
import aiSiteCatalog from "../ai-learning/site-catalog.json";
// 术语详情页的长篇讲解（教材 sources/terms/，npm run content:ai 渲染成 HTML，不要手改）
import aiTermArticles from "../ai-learning/term-articles.json";
import type { Term, Topic, TopicSection, ChangelogData, PracticeQuestion, Course, CourseLesson } from "./types";

const aiCatalog = aiSiteCatalog as unknown as {
  terms: Term[];
  sections: { cat: string; ids: string[] }[];
  practice: PracticeQuestion[];
  path: {
    id: string;
    title: string;
    lessons: { id: string; order: number; title: string; status: string | null; terms: string[] }[];
  }[];
};

// AI 课程新建的术语卡追加到图鉴 AI 组对应分类的末尾；已有卡片不变。
const termArticles = (aiTermArticles as { articles: Record<string, { termId: string; html: string }> }).articles;
// 写了讲解的词（新卡和原有卡都可以），详情页在一句话介绍下面接整篇讲解
export const ALL_TERMS = [...(termsData as unknown as Term[]), ...aiCatalog.terms].map((term) =>
  termArticles[term.id] ? { ...term, article: termArticles[term.id].html } : term
);
// 术语页分两排（2026-09-19 Will 定）：
// - 学习路线：按 AI 课程 6 个模块排，每个模块按课分组，和课程、练习一一对应；首页（/）是模块 1。
// - 技术词典：原来的 8 个技术方向，按从入门到进阶排（AI 基础、产品、后端、前端，最后工程与设计），查词用。
export const HOME_TOPIC_SLUG = "m1";
const TOPIC_ORDER = ["ai", "product", "backend", "frontend", "git", "testing", "technology", "design"];
const topicRank = (slug: string) => {
  const i = TOPIC_ORDER.indexOf(slug);
  return i === -1 ? TOPIC_ORDER.length : i;
};

export const TOPICS = (topicsData as unknown as Topic[])
  .map((topic) => (topic.slug === "" ? { ...topic, slug: "frontend" } : topic))
  .sort((a, b) => topicRank(a.slug) - topicRank(b.slug))
  .map((topic) =>
  topic.slug !== "ai"
    ? topic
    : (() => {
        const sections = topic.sections.map((s) => {
          const extra = aiCatalog.sections.find((x) => x.cat === s.cat)?.ids ?? [];
          return extra.length ? { ...s, ids: [...s.ids, ...extra] } : s;
        });
        // 数量按合并后的卡片重算，课程新建的卡也计入
        return { ...topic, sections, count: new Set(sections.flatMap((s) => s.ids)).size };
      })()
);

// 学习路线里每一课放哪些已有卡片：
// 教材术语表写了本课术语的（目前只有第 01 课），直接用生成数据里的 path；
// 还没写术语表的课，先用下面这份网站侧暂定对应（假设，不是教材结论），课程写好后以教材术语表为准。
// 每张卡只放在一课里，按“第一次真正需要理解它”的那一课放。
const LESSON_CARDS_DRAFT: Record<string, string[]> = {
  l02: ["prompt", "system-prompt"],
  l03: ["context-engineering", "context-window", "conversation-history", "multimodal"],
  l04: ["ab-test"],
  l05: ["url"],
  l06: ["field", "data-type", "json", "structured-output", "import-export"],
  l07: ["sql", "database", "crud"],
  l08: ["conversion-funnel", "data-validation"],
  l12: ["regression-test"],
  l14: ["skill", "project-rules", "mcp"],
  l15: ["plugin", "config-file", "profile"],
  l16: ["test-case"],
  l17: ["user-flow", "human-in-the-loop"],
  l18: ["api", "api-key", "base-url", "provider", "openai-compatible-api", "permission-mode"],
  l19: ["ai-agent", "agent-loop", "sub-agent", "react-pattern"],
  l20: ["rate-limit", "token-cost", "idempotency", "audit-log", "sandbox", "server-log"],
  l21: ["git", "commit", "branch", "diff", "pull-request", "backend", "deployment", "browser-devtools", "terminal"],
  l22: ["mvp", "user-story", "prd", "acceptance-criteria"],
  l24: ["rollback"],
};

const ROUTE_LABELS: Record<string, string> = {
  m1: "AI 基本功",
  m2: "资料与数据",
  m3: "知识库",
  m4: "Skill",
  m5: "工作流",
  m6: "工程与交付",
};

// 左侧目录用的课程短名（网站侧写的，只用于目录，不改教材标题）：完整课名放在右侧分组标题里，
// 目录只放编号和短名，保持和技术词典分类名差不多的长度，一行放得下。
export const LESSON_NAV_LABELS: Record<string, string> = {
  l01: "大模型与工具",
  l02: "任务与提示词",
  l03: "材料与上下文",
  l04: "核验与改进",
  l05: "检索外部资料",
  l06: "表格与结构化",
  l07: "AI 辅助 SQL",
  l08: "核对数据分析",
  l09: "知识库结构",
  l10: "整理可复用知识",
  l11: "检索与 RAG",
  l12: "测试与维护",
  l13: "提炼 SOP",
  l14: "写出 Skill",
  l15: "参考资料与工具",
  l16: "测试与维护 Skill",
  l17: "拆解人工流程",
  l18: "连接工具",
  l19: "固定流程与 Agent",
  l20: "试跑与运行控制",
  l21: "看懂改动",
  l22: "需求与方案试跑",
  l23: "价值与交付证据",
  l24: "标准化与带教",
};

const pad2 = (n: number) => String(n).padStart(2, "0");

export const ROUTE_TOPICS: Topic[] = aiCatalog.path.map((m, i) => {
  const sections = m.lessons
    .map((l) => ({
      cat: `第 ${pad2(l.order)} 课 · ${l.title}`,
      nav: { num: pad2(l.order), label: LESSON_NAV_LABELS[l.id] ?? l.title },
      ids: (l.terms.length ? l.terms : LESSON_CARDS_DRAFT[l.id] ?? []).filter((id) => ALL_TERMS.some((t) => t.id === id)),
    }))
    .filter((s) => s.ids.length > 0);
  const orders = m.lessons.map((l) => l.order);
  return {
    slug: m.id,
    label: ROUTE_LABELS[m.id] ?? m.title,
    count: new Set(sections.flatMap((s) => s.ids)).size,
    sections,
    route: {
      order: i + 1,
      title: m.title,
      // 模块里一课都没开放，就是“课程编写中”
      writing: m.lessons.every((l) => l.status !== "available"),
      courseHref: `/courses/ai-${m.id}`,
      lessonRange: orders.length ? `第 ${pad2(Math.min(...orders))}–${pad2(Math.max(...orders))} 课` : "",
      lessonIds: m.lessons.map((l) => l.id),
    },
  };
});

const routeByLesson = new Map<string, string>();
const routeByTerm = new Map<string, string>();
for (const r of ROUTE_TOPICS) {
  for (const id of r.route!.lessonIds) routeByLesson.set(id, r.slug);
  for (const s of r.sections) for (const id of s.ids) if (!routeByTerm.has(id)) routeByTerm.set(id, r.slug);
}

/**
 * 练习题属于学习路线的哪个模块：课程拆出来的题（ai-l01-q1）按课算，
 * 原站的术语题按它的卡片在学习路线里放在哪一课算；不在路线里的题返回 undefined。
 */
export function getRouteForQuestion(q: PracticeQuestion): string | undefined {
  const lesson = /^ai-(l\d+)-/.exec(q.id)?.[1];
  return (lesson && routeByLesson.get(lesson)) || routeByTerm.get(q.termId);
}

// 更新日志：左侧的月份数量和统计数字按条目现算，新增一条记录只改 changelog-data.json 的 entries。
const changelogRaw = changelogData as unknown as ChangelogData;
export const CHANGELOG: ChangelogData = {
  ...changelogRaw,
  months: [...new Set(changelogRaw.entries.map((e) => e.datetime?.slice(0, 7)).filter(Boolean))].map((ym) => ({
    label: `${ym!.slice(0, 4)} 年 ${Number(ym!.slice(5, 7))} 月`,
    count: String(changelogRaw.entries.filter((e) => e.datetime?.startsWith(ym!)).length),
  })),
  stats: [
    { number: String(changelogRaw.entries.length), label: "次更新" },
    { number: String(ALL_TERMS.length), label: "个收录术语" },
  ],
};
export const PRACTICE_QUESTIONS = [...(practiceData as unknown as PracticeQuestion[]), ...aiCatalog.practice];
export const COURSES = coursesData as unknown as Course[];
export const COURSE_LESSONS = courseLessonsData as unknown as CourseLesson[];

export function getCourse(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}

export function getCourseLesson(courseSlug: string, lessonSlug: string): CourseLesson | undefined {
  return COURSE_LESSONS.find((l) => l.courseSlug === courseSlug && l.slug === lessonSlug);
}

const termById = new Map<string, Term>(ALL_TERMS.map((t) => [t.id, t]));

export function getTerm(id: string): Term | undefined {
  return termById.get(id);
}

/** 学习路线模块（m1–m6）或技术词典方向（ai、frontend…）。 */
export function getTopic(slug: string): Topic | undefined {
  return ROUTE_TOPICS.find((t) => t.slug === slug) ?? TOPICS.find((t) => t.slug === slug);
}

/** Ordered card list for a topic, grouped by its category sections. */
export function getTopicCards(slug: string): { cat: string; nav?: TopicSection["nav"]; terms: Term[] }[] {
  const topic = getTopic(slug);
  if (!topic) return [];
  return topic.sections.map((s) => ({
    cat: s.cat,
    nav: s.nav,
    terms: s.ids.map((id) => termById.get(id)).filter((t): t is Term => !!t),
  }));
}

/** Flat, in-catalog-order term list for a topic (used for prev/next nav). */
export function getTopicFlatIds(slug: string): string[] {
  const topic = getTopic(slug);
  if (!topic) return [];
  return topic.sections.flatMap((s) => s.ids);
}

/** Which topic a given term belongs to (first match wins). */
export function getTopicForTerm(id: string): Topic | undefined {
  return TOPICS.find((t) => t.sections.some((s) => s.ids.includes(id)));
}

/**
 * Prev/next cycles within the term's own category section (matches the
 * source site: e.g. 按钮 <-> 链接 within the 2-item 按钮与链接 category),
 * not across the whole topic tab.
 */
export function getAdjacentTerms(id: string): { prev: Term | null; next: Term | null } {
  const topic = getTopicForTerm(id);
  if (!topic) return { prev: null, next: null };
  const section = topic.sections.find((s) => s.ids.includes(id));
  if (!section) return { prev: null, next: null };
  const ids = section.ids;
  const i = ids.indexOf(id);
  if (i === -1) return { prev: null, next: null };
  const prevId = i > 0 ? ids[i - 1] : ids[ids.length - 1];
  const nextId = i < ids.length - 1 ? ids[i + 1] : ids[0];
  return { prev: termById.get(prevId) ?? null, next: termById.get(nextId) ?? null };
}

export function searchTerms(query: string): Term[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return ALL_TERMS.filter((t) => {
    if (t.name.toLowerCase().includes(q)) return true;
    if (t.cn.includes(q)) return true;
    if (t.aliases?.some((a) => a.toLowerCase().includes(q))) return true;
    if (t.tagline?.toLowerCase().includes(q)) return true;
    return false;
  });
}
