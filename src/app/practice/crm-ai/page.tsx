import type { Metadata } from "next";
import Link from "next/link";
import { CRM_CURRICULUM, CRM_LESSONS, crmLessonHref } from "@/lib/crm-ai-practice";
import { CaseDates, CourseFooter, LessonStatus, MaterialPack, PreviewNote } from "./components";
import "./crm-ai.css";

export const metadata: Metadata = {
  title: "CRM 客户成功 · 六课实践｜AI 学习站",
  description: "围绕同一个虚构 CRM 客户案例，练习任务说明、证据核对与 AI 输出验收。前三课可试学，后三课为待建设大纲。",
  robots: { index: false, follow: false },
};

export default function CrmPracticePage() {
  return (
    <div className="crm-page">
      <Link className="crm-back" href="/practice">← 返回实践</Link>
      <PreviewNote />
      <header className="crm-hero">
        <p className="crm-kicker">{CRM_CURRICULUM.subtitle}</p>
        <h1>{CRM_CURRICULUM.title}</h1>
        <p className="crm-lead">用同一份客户试点材料，把需求说清楚、把资料对齐、把结果检查好。每课留下一份能逐条验收的工作产物。</p>
        <CaseDates />
        <p className="crm-plan-note">{CRM_CURRICULUM.status}</p>
      </header>

      <section className="crm-section" aria-labelledby="crm-lessons-title">
        <div className="crm-section-heading">
          <h2 id="crm-lessons-title">六课目录</h2>
          <p>前 3 课可直接练习；第 4–6 课先看设计与待完成项。</p>
        </div>
        <ol className="crm-course-grid">
          {CRM_LESSONS.map((lesson, index) => (
            <li className="crm-course-card" key={lesson.id}>
              <div className="crm-card-top">
                <span className="crm-number">{String(index + 1).padStart(2, "0")}</span>
                <LessonStatus status={lesson.status} />
              </div>
              <h3><Link href={crmLessonHref(lesson.id)}>{lesson.title}</Link></h3>
              <p className="crm-card-goal">{lesson.goal}</p>
              <p className="crm-card-meta">{lesson.status === "ready" ? "建议练习" : "拟定时长"} · {lesson.duration}</p>
              <Link className={`crm-button${lesson.status === "ready" ? " is-primary" : ""}`} href={crmLessonHref(lesson.id)}>
                {lesson.status === "ready" ? `开始第 ${index + 1} 课试学` : `查看第 ${index + 1} 课大纲`} <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="crm-section crm-case" aria-labelledby="crm-case-title">
        <p className="crm-kicker">六课共用一个案例</p>
        <h2 id="crm-case-title">{CRM_CURRICULUM.caseName}</h2>
        <p>{CRM_CURRICULUM.caseDisclaimer}</p>
        <p>材料编号贯穿整套练习。进入每课后，会先看到本课需要的材料全文，再依次动手、验收、对照参考。</p>
      </section>

      <section className="crm-section" aria-labelledby="crm-materials-title">
        <div className="crm-section-heading">
          <h2 id="crm-materials-title">案例材料包</h2>
          <p>以下包含已确认材料、过时草稿和专供纠错的错误回答；请先识别每份材料的状态。</p>
        </div>
        <MaterialPack materials={CRM_CURRICULUM.materials} />
      </section>
      <CourseFooter />
    </div>
  );
}
