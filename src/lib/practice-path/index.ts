// 实践四步主线（PROJECT.md §5.48，框架 v0）。
// 四步跟着同一封询盘走，每一步挑的都是最该用这种能力做的外贸活（Will 2026-10-01 选定）：
// 读懂并回复一封询盘（提示词）→ 询盘分析与回复 Skill → 给发询盘的买家做背调的 Agent → 询盘跟进看板（网页）。
// 课目标题是 v0 假设，填充时可调；练习内容、真实询盘材料和参照答案都还没有，页面一律显示「待填充」，不编造。
import { curriculum, curriculumLessonHref } from "@/lib/ai-learning/practice-curriculum";

export type PracticeLesson = {
  /** 例如 "1-1"，页面路径 /practice/lessons/1-1 */
  id: string;
  /** 页面上显示的编号，例如 "1.1" */
  no: string;
  title: string;
};

export type PracticeStep = {
  n: 1 | 2 | 3 | 4;
  title: string;
  /** 括号里的白话说明 */
  plain: string;
  /** 这一步拿到手的材料（上一步的成果） */
  input: string;
  /** 这一步做完留下的成果，下一步接着用 */
  output: string;
  /** 课程补课：课程 ID（l02 / W01）或站内路径 */
  refs: string[];
  /** 现有内容收编到这一步的去向，搭骨架时只做标注，不搬内容 */
  absorb: { label: string; href: string }[];
  lessons: PracticeLesson[];
};

function lessons(n: number, titles: string[]): PracticeLesson[] {
  return titles.map((title, i) => ({ id: `${n}-${i + 1}`, no: `${n}.${i + 1}`, title }));
}

export const PRACTICE_CASE = "一封询盘从进来到跟进";

export const PRACTICE_STEPS: PracticeStep[] = [
  {
    n: 1,
    title: "跟 AI 沟通",
    plain: "提示词",
    input: "一封买家询盘和我方产品资料",
    output: "一套能反复用的询盘分析和回复提示词",
    refs: ["l02", "l03", "l04", "/ai-collab"],
    absorb: [
      { label: "从买家聊天中找出跟进机会（并进询盘分析）", href: "/practice/cases/chat-diagnosis" },
      { label: "原基础练习 1–4（收进对应课）", href: "/practice/l01" },
    ],
    lessons: lessons(1, ["把一件事说清楚", "给材料和样例", "看结果、追问、改", "存成模板"]),
  },
  {
    n: 2,
    title: "把工作流固化成 Skill",
    plain: "Skill",
    input: "第 1 步的提示词和满意的回复",
    output: "一个询盘分析与回复 Skill（带产品资料和常见问答）",
    refs: ["l13", "l14", "l15", "l16"],
    absorb: [
      { label: "让客户资料支持可靠的业务问答（并进 2.3 配资料）", href: "/practice/cases/knowledge-answer" },
      { label: "把一套客户服务方法封装成 Skill（换个场景再练）", href: "/practice/cases/reusable-skill" },
    ],
    lessons: lessons(2, ["从满意结果倒推流程", "写 Skill 说明", "配资料和模板", "测试和修订"]),
  },
  {
    n: 3,
    title: "做 Agent",
    plain: "Agent",
    input: "询盘里的买家线索，加第 2 步的 Skill",
    output: "一个买家背调 Agent，背调结论交给 Skill 写回复",
    refs: ["l17", "l18", "l19", "l20"],
    absorb: [
      { label: "客户背调试点（收进这一步）", href: "/practice/cases/customer-research" },
      { label: "把工作流做成可演示的交付方案（换个场景再练）", href: "/practice/cases/agent-delivery" },
    ],
    lessons: lessons(3, ["先判断要不要 Agent", "给它工具（读写边界）", "定规矩（步数上限、停下问人）", "试跑和控制"]),
  },
  {
    n: 4,
    title: "Web Coding",
    plain: "做网页",
    input: "前三步的询盘分析、回复草稿和背调结论",
    output: "一个询盘跟进看板",
    refs: ["l21", "l22", "W01", "W02", "W03"],
    absorb: [],
    lessons: lessons(4, ["需求收窄与看样", "搭第一版", "加交互和数据", "测试、版本、上线"]),
  },
];

export const PRACTICE_LESSONS = PRACTICE_STEPS.flatMap((step) => step.lessons.map((lesson) => ({ ...lesson, step })));

export function practiceLessonHref(id: string) {
  return `/practice/lessons/${id}`;
}

export function getPracticeLesson(id: string) {
  const i = PRACTICE_LESSONS.findIndex((l) => l.id === id);
  if (i < 0) return undefined;
  return { ...PRACTICE_LESSONS[i], prev: PRACTICE_LESSONS[i - 1], next: PRACTICE_LESSONS[i + 1] };
}

/** 补课链接：课程 ID 换成课程标题和地址；站内路径原样用 */
export function practiceRef(ref: string) {
  if (ref === "/ai-collab") return { id: "手册", title: "AI 协作手册", href: ref };
  const lesson = curriculum.lessons.find((l) => l.id === ref);
  return { id: ref, title: lesson?.title ?? ref, href: curriculumLessonHref(ref) };
}

/** 每个小练习固定的四格 */
export const EXERCISE_CELLS = ["材料", "动手做", "怎样算做好", "做完再看参照"] as const;
