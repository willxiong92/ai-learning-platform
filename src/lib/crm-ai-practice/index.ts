import curriculumData from "./curriculum.json";
import type { CrmCurriculum, CrmLesson, CrmMaterial } from "./types";

export type { CrmCurriculum, CrmFeedbackQuestion, CrmLesson, CrmLessonStatus, CrmMaterial } from "./types";

// Keep the teaching source unchanged while matching the hosted trial context.
export const CRM_CURRICULUM: CrmCurriculum = {
  ...(curriculumData as CrmCurriculum),
  status: curriculumData.status.replace("可本地试学", "可试学"),
};
export const CRM_LESSONS = CRM_CURRICULUM.lessons;
export const COURSE_CREATED_ON = "2026-10-07";
export const CASE_EXERCISE_ON = "2026-09-18";

export function crmLessonHref(id: string): string {
  return `/practice/crm-ai/${id}`;
}

export function getCrmLesson(id: string): CrmLesson | undefined {
  return CRM_LESSONS.find((lesson) => lesson.id === id);
}

export function getCrmLessonMaterials(lesson: CrmLesson): CrmMaterial[] {
  return lesson.inputs.map((id) => {
    const material = CRM_CURRICULUM.materials.find((item) => item.id === id);
    if (!material) throw new Error(`CRM 课程 ${lesson.id} 引用了不存在的材料 ${id}`);
    return material;
  });
}

export function formatCrmMaterialPack(materials: CrmMaterial[]): string {
  return [
    `${CRM_CURRICULUM.caseName}\n${CRM_CURRICULUM.caseDisclaimer}`,
    ...materials.map((material) => `${material.id} · ${material.title}\n材料时间：${material.date}\n${material.body}`),
  ].join("\n\n");
}

export function getCrmReferenceHtml(lessonId: string, body: string): string | undefined {
  if (lessonId !== "c03") return undefined;
  return body.match(/<!doctype\s+html\b[^>]*>[\s\S]*?<\/html\s*>/i)?.[0];
}
