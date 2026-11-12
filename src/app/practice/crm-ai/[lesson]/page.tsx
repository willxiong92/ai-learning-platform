import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/app/ai-collab/collab-copy";
import {
  CRM_CURRICULUM,
  CRM_LESSONS,
  crmLessonHref,
  getCrmLesson,
  getCrmLessonMaterials,
  getCrmReferenceHtml,
} from "@/lib/crm-ai-practice";
import { CaseDates, CourseCatalog, CourseFooter, LessonStatus, MaterialPack, PreviewNote } from "../components";
import { HtmlDownload, LessonQuestion } from "../interactions";
import "../crm-ai.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return CRM_LESSONS.map((lesson) => ({ lesson: lesson.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ lesson: string }> }): Promise<Metadata> {
  const { lesson: id } = await params;
  const lesson = getCrmLesson(id);
  if (!lesson) return {};
  return {
    title: `${lesson.title} · CRM 六课实践｜AI 学习站`,
    description: lesson.goal,
    robots: { index: false, follow: false },
  };
}

export default async function CrmLessonPage({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson: id } = await params;
  const lesson = getCrmLesson(id);
  if (!lesson) notFound();

  const ready = lesson.status === "ready";
  const lessonIndex = CRM_LESSONS.findIndex((item) => item.id === lesson.id);
  const previous = CRM_LESSONS[lessonIndex - 1];
  const next = CRM_LESSONS[lessonIndex + 1];
  const materials = getCrmLessonMaterials(lesson);
  const sections = [
    { id: "problem", title: "这次要解决什么" },
    ...(lesson.sections.length ? [{ id: "learn", title: ready ? "先读懂做法" : "教学设计大纲" }] : []),
    { id: "materials", title: ready ? "本课材料" : "拟用材料" },
    { id: "steps", title: ready ? "动手做" : "拟定练习流程" },
    { id: "outputs", title: ready ? "留下什么产物" : "拟定产物" },
    { id: "acceptance", title: ready ? "怎样算做好" : "拟定验收条件" },
    ...(ready && lesson.prompts.length ? [{ id: "prompts", title: "可复制提示词" }] : []),
    ...(ready && lesson.feedback.length ? [{ id: "feedback", title: "判断与即时反馈" }] : []),
    ...(ready && lesson.practiceFeedback.length ? [{ id: "repair", title: "练习卡住时" }] : []),
    ...(ready && lesson.reference.length ? [{ id: "reference", title: "做完再看参考" }] : []),
    ...(!ready && (lesson.prompts.length || lesson.reference.length) ? [{ id: "preview", title: "样稿预览 · 未实测" }] : []),
    ...(!ready ? [{ id: "future", title: "还有哪些待建设" }] : []),
  ];

  return (
    <article className="crm-page">
      <Link className="crm-back" href="/practice/crm-ai">← 返回 CRM 六课目录</Link>
      <PreviewNote />
      <header className="crm-hero crm-detail-hero">
        <p className="crm-kicker">CRM 客户成功实践 · 第 {lessonIndex + 1} 课 / 共 {CRM_LESSONS.length} 课</p>
        <h1>{lesson.title}</h1>
        <div className="crm-card-top">
          <LessonStatus status={lesson.status} />
          <span>{ready ? "建议练习" : "拟定时长"}：{lesson.duration}</span>
        </div>
        <p className="crm-lead">{lesson.goal}</p>
        <CaseDates />
        {!ready && <p className="crm-plan-note">本课尚未开放试学。下面是详细大纲与未实测的样稿预览；练习与参考产物完成并验收后再开放。</p>}
      </header>

      <div className="crm-detail-grid">
        <nav className="crm-toc" aria-label="本课目录">
          <p><strong>{ready ? "本课练习路径" : "本课大纲"}</strong></p>
          <ol>
            {sections.map((section, index) => (
              <li key={section.id}><a href={`#${section.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</a></li>
            ))}
          </ol>
          <Link className="crm-text-link" href="/practice/crm-ai">查看全部六课 →</Link>
        </nav>

        <div className="crm-content">
          <section className="crm-block" id="problem" aria-labelledby="problem-title">
            <h2 id="problem-title">这次要解决什么</h2>
            <p className="crm-prose">{lesson.businessProblem}</p>
            <div className="crm-case">
              <h3>{CRM_CURRICULUM.caseName}</h3>
              <p>{CRM_CURRICULUM.caseDisclaimer}</p>
            </div>
          </section>

          {lesson.sections.length > 0 && (
            <section className="crm-block" id="learn" aria-labelledby="learn-title">
              <h2 id="learn-title">{ready ? "先读懂做法" : "教学设计大纲"}</h2>
              {lesson.sections.map((section) => (
                <div key={section.title}>
                  <h3>{section.title}</h3>
                  <p className="crm-prose">{section.body}</p>
                </div>
              ))}
            </section>
          )}

          <section className="crm-block" id="materials" aria-labelledby="materials-title">
            <h2 id="materials-title">{ready ? "本课材料" : "拟用材料"}</h2>
            <p>按材料编号核对来源与状态。材料中的日期属于案例时间，不代表课程制作日的真实安排。</p>
            <MaterialPack materials={materials} />
          </section>

          <section className="crm-block" id="steps" aria-labelledby="steps-title">
            <h2 id="steps-title">{ready ? "动手做" : "拟定练习流程"}</h2>
            <ol className="crm-step-list">{lesson.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          </section>

          <section className="crm-block" id="outputs" aria-labelledby="outputs-title">
            <h2 id="outputs-title">{ready ? "留下什么产物" : "拟定产物"}</h2>
            <div className="crm-output-box">
              <ul className="crm-list">{lesson.outputs.map((output) => <li key={output}>{output}</li>)}</ul>
            </div>
          </section>

          <section className="crm-block" id="acceptance" aria-labelledby="acceptance-title">
            <h2 id="acceptance-title">{ready ? "怎样算做好" : "拟定验收条件"}</h2>
            <p>{ready ? "拿自己的产物逐条核对；发现不满足的条件，就带着具体位置再修改。" : "这些是课程拟采用的产物检查条件，目前还不是已完成验证的练习。"}</p>
            <ul className="crm-list">{lesson.acceptance.map((criterion) => <li key={criterion}>{criterion}</li>)}</ul>
          </section>

          {ready && lesson.prompts.length > 0 && (
            <section className="crm-block" id="prompts" aria-labelledby="prompts-title">
              <h2 id="prompts-title">可复制提示词</h2>
              <p>复制提示词和本课材料包，在你自己的 AI 工具中练习。只使用这里的教学材料。</p>
              {lesson.prompts.map((prompt) => (
                <section className="crm-prompt" key={prompt.title}>
                  <header className="crm-prompt-header"><h3>{prompt.title}</h3><CopyButton text={prompt.text} label="复制提示词" /></header>
                  <pre className="crm-prompt-text">{prompt.text}</pre>
                </section>
              ))}
            </section>
          )}

          {ready && lesson.feedback.length > 0 && (
            <section className="crm-block" id="feedback" aria-labelledby="feedback-title">
              <h2 id="feedback-title">判断与即时反馈</h2>
              <p>选一个判断，马上查看解释。可以重新选择，不计分，也不记录结果。</p>
              {lesson.feedback.map((question, index) => <LessonQuestion item={question} number={index + 1} key={question.question} />)}
            </section>
          )}

          {ready && lesson.practiceFeedback.length > 0 && (
            <section className="crm-block" id="repair" aria-labelledby="repair-title">
              <h2 id="repair-title">练习卡住时</h2>
              <dl className="crm-repair-list">
                {lesson.practiceFeedback.map((item) => (
                  <div key={item.symptom}><dt>{item.symptom}</dt><dd>{item.repair}</dd></div>
                ))}
              </dl>
            </section>
          )}

          {ready && lesson.reference.length > 0 && (
            <section className="crm-block" id="reference" aria-labelledby="reference-title">
              <h2 id="reference-title">做完再看参考</h2>
              <p>先保留自己的版本，再打开参考，比较证据、边界与表达方式。</p>
              {lesson.reference.map((reference, index) => {
                const html = getCrmReferenceHtml(lesson.id, reference.body);
                return (
                  <details className="crm-reference" key={reference.title}>
                    <summary>做完再看 · {reference.title}</summary>
                    <div className="crm-reference-body">
                      {html ? <pre className="crm-code"><code>{reference.body}</code></pre> : <pre className="crm-reference-text">{reference.body}</pre>}
                      <div className="crm-actions">
                        <CopyButton text={reference.body} label={html ? "复制 HTML 源码" : "复制参考产物"} />
                        {html && <HtmlDownload html={html} filename={`crm-ai-${lesson.id}-reference-${index + 1}.html`} />}
                      </div>
                    </div>
                  </details>
                );
              })}
            </section>
          )}

          {!ready && (lesson.prompts.length > 0 || lesson.reference.length > 0) && (
            <section className="crm-block" id="preview" aria-labelledby="preview-title">
              <h2 id="preview-title">样稿预览 · 未实测，不代表课程开放</h2>
              <p>以下内容用于审阅课程设计。样稿与提示词尚未完成实际练习验证，不构成本课已可试学的证明。</p>
              {lesson.prompts.map((prompt) => (
                <details className="crm-reference" key={`prompt-${prompt.title}`}>
                  <summary>提示词审阅 · {prompt.title}</summary>
                  <div className="crm-reference-body">
                    <pre className="crm-prompt-text">{prompt.text}</pre>
                    <div className="crm-actions"><CopyButton text={prompt.text} label="复制提示词供审阅" /></div>
                  </div>
                </details>
              ))}
              {lesson.reference.map((reference) => (
                <details className="crm-reference" key={`reference-${reference.title}`}>
                  <summary>样稿审阅 · {reference.title}</summary>
                  <div className="crm-reference-body">
                    <pre className="crm-reference-text">{reference.body}</pre>
                    <div className="crm-actions"><CopyButton text={reference.body} label="复制样稿供审阅" /></div>
                  </div>
                </details>
              ))}
            </section>
          )}

          {!ready && (
            <section className="crm-block crm-future" id="future" aria-labelledby="future-title">
              <h2 id="future-title">还有哪些待建设</h2>
              <ul className="crm-list">{lesson.futureWork.map((item) => <li key={item}>{item}</li>)}</ul>
              <p>完成以上建设并通过人工验收后，才会开放本课试学入口。</p>
            </section>
          )}

          {lesson.id === "c03" && (
            <aside className="crm-footer" aria-label="方法来源说明">
              <p>方法灵感来自用户提供的《AI回答太长，我用Karpathy同款 Skill把它变成网页》；本文为教学改编。原文的产品性能与成本数据不构成课程承诺；无需安装该 Skill。</p>
            </aside>
          )}

          <nav className="crm-pager" aria-label="上一课与下一课">
            {previous && <Link rel="prev" href={crmLessonHref(previous.id)}><small>← 上一课 · {previous.status === "ready" ? "可试学" : "待建设大纲"}</small><strong>{previous.title}</strong></Link>}
            {next && <Link rel="next" href={crmLessonHref(next.id)}><small>下一课 · {next.status === "ready" ? "可试学" : "查看待建设大纲"} →</small><strong>{next.title}</strong></Link>}
          </nav>
        </div>
      </div>
      <CourseCatalog currentId={lesson.id} />
      <CourseFooter />
    </article>
  );
}
