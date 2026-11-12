// 实践课正文。按步分文件，课页有正文就显示，没有就保留「待填充」。
// 材料一律是教学模拟（询盘、公司、产品都是虚构的），方法要点按外网公开资料拆解改写，出处列在每课末尾。
import { STEP1_CONTENT, STEP1_MATERIALS } from "./content-step1";

export type PracticeSource = {
  title: string;
  url: string;
  /** 官方文档 / 平台说明 / 政府或行业机构 / 从业者文章 */
  kind: string;
};

export type PracticeMaterial = {
  id: string;
  title: string;
  /** 一句话说这份材料是什么，折叠时也能看到 */
  note: string;
  body: string;
};

export type PracticeExercise = {
  title: string;
  /** 用到哪几份材料（材料包 id），再加一句补充 */
  materials: string[];
  materialNote?: string;
  task: string[];
  criteria: string[];
  /** 参照：提示词或回复类参照用等宽框并给复制按钮 */
  reference: { text: string; kind: "prompt" | "text"; note?: string };
};

export type PracticeLessonContent = {
  oneLiner: string;
  outcome: string;
  why: string;
  /** 先懂这几条：左边一句要点，右边一句解释 */
  principles: { point: string; explain: string }[];
  exercises: PracticeExercise[];
  /** 补课清单里每门课具体补哪一节 */
  refNotes: Record<string, string>;
  tools: { recommend: string; entry: string };
  sources: string[];
};

export const PRACTICE_MATERIALS: Record<number, PracticeMaterial[]> = {
  1: STEP1_MATERIALS,
};

export const PRACTICE_CONTENT: Record<string, PracticeLessonContent> = {
  ...STEP1_CONTENT,
};
