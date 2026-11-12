import Link from "next/link";
import { CopyButton } from "@/app/ai-collab/collab-copy";
import {
  CASE_EXERCISE_ON,
  COURSE_CREATED_ON,
  CRM_CURRICULUM,
  CRM_LESSONS,
  crmLessonHref,
  formatCrmMaterialPack,
  type CrmLessonStatus,
  type CrmMaterial,
} from "@/lib/crm-ai-practice";

export function PreviewNote() {
  return (
    <div className="crm-preview">
      <strong>试学版</strong>
      <span>教学虚构 · 整批待人工验收</span>
    </div>
  );
}

export function CaseDates() {
  return (
    <p className="crm-meta">
      <span>课程制作：<time dateTime={COURSE_CREATED_ON}>{COURSE_CREATED_ON}</time></span>
      <span>案例演练日：<time dateTime={CASE_EXERCISE_ON}>{CASE_EXERCISE_ON}</time></span>
    </p>
  );
}

export function LessonStatus({ status }: { status: CrmLessonStatus }) {
  return <span className={`crm-status is-${status}`}>{status === "ready" ? "可试学" : "待建设 · 详细大纲"}</span>;
}

export function CourseCatalog({ currentId }: { currentId?: string }) {
  return (
    <nav className="crm-catalog" aria-label="六课目录">
      <p><strong>六课目录</strong><span> 按需查看，也可以从第 1 课依次练习。</span></p>
      <ol className="crm-catalog-links">
        {CRM_LESSONS.map((lesson, index) => (
          <li key={lesson.id}>
            <Link href={crmLessonHref(lesson.id)} aria-current={currentId === lesson.id ? "page" : undefined}>
              <span>第 {index + 1} 课</span>
              <strong>{lesson.title}</strong>
              <small>{lesson.status === "ready" ? "试学" : "待建设 · 查看大纲"}</small>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function MaterialPack({ materials }: { materials: CrmMaterial[] }) {
  return (
    <div>
      <div className="crm-actions">
        <CopyButton text={formatCrmMaterialPack(materials)} label="复制本页材料包" />
      </div>
      {materials.map((material) => (
        <article className="crm-material" id={`material-${material.id}`} key={material.id}>
          <header className="crm-material-heading">
            <h3><span className="crm-material-id">{material.id}</span>{material.title}</h3>
            <p>材料时间：{material.date}</p>
          </header>
          <p className="crm-prose">{material.body}</p>
          <CopyButton
            text={`${material.id} · ${material.title}\n材料时间：${material.date}\n${material.body}`}
            label={`复制 ${material.id}`}
          />
        </article>
      ))}
    </div>
  );
}

export function CourseFooter() {
  return (
    <footer className="crm-footer">
      <p>本页练习不计分；选择反馈只在当前页面显示，刷新后重置。本练习页不接入 AI 或 CRM，不上传、保存练习内容。</p>
      <p>{CRM_CURRICULUM.status}</p>
    </footer>
  );
}
