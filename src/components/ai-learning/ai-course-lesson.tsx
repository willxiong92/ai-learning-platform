import { curriculum, learningUnit } from "@/lib/ai-learning/practice-curriculum";
import { LessonGuide } from "./curriculum-view";
import "@/app/learning-paths.css";
// One AI course chapter inside the shared course reader layout: back to the
// course, section rail, the pre-rendered lesson, and previous/next chapter.
// Terms in the text open the 术语图鉴 card in a side panel (AiTermWorkspace).
// Chapters whose questions have moved to /practice ("split" lessons, listed in
// site-catalog.json) show no quiz here; chapters not yet split keep the old
// quiz block until they are migrated. reading_ready chapters (text written,
// practice pending) show their text only: no quiz, practice, score or read mark,
// and the assessment data is never looked up. Content comes only from rendered.json
// (built from the course sources); nothing here copies or edits lesson text.
import Link from "next/link";
import {
  getCourseMeta,
  getLessonSummary,
  getReviewLabel,
  getLessonStatusLabel,
  isReadableStatus,
  type CourseModule,
  type LessonSummary,
  type RenderedLearningData,
} from "@/lib/ai-learning/catalog";
import { getAssessmentActivities } from "@/lib/ai-learning/activities";
import { aiCourseHref, aiLessonHref, getAiCourseNumber } from "@/lib/ai-learning/course-routes";
import { LessonAssessment } from "./lesson-assessment";
import { AiMobileSectionSheet, AiSectionRail } from "./ai-section-rail";
import { AiTermWorkspace } from "./ai-term-workspace";
import siteCatalog from "@/lib/ai-learning/site-catalog.json";
// Server-only import: the lesson HTML is compiled ahead of time by scripts/render-ai-learning.mjs.
import rendered from "@/lib/ai-learning/rendered.json";

const renderedData = rendered as RenderedLearningData;
const splitLessons = new Set<string>(siteCatalog.splitLessons);
const pad = (n: number) => String(n).padStart(2, "0");

function ChapterLink({ lesson, dir }: { lesson: LessonSummary; dir: "prev" | "next" }) {
  const planned =
    lesson.status === "planned" ? "（待编写）" : lesson.status === "reading_ready" ? "（练习待编）" : "";
  return (
    <Link className={dir === "prev" ? "is-prev" : "is-next"} href={aiLessonHref(lesson.id) ?? "/courses"}>
      <span>{dir === "prev" ? "上一章" : "下一章"}</span>
      <strong>
        {lesson.title}
        {planned}
      </strong>
    </Link>
  );
}

export function AiCourseLesson({ courseModule, lesson }: { courseModule: CourseModule; lesson: LessonSummary }) {
  const meta = getCourseMeta();
  const index = courseModule.lessons.findIndex((l) => l.id === lesson.id);
  const group = curriculum.groups.find(group => group.ids.includes(lesson.id));
  const route = group?.ids ?? courseModule.lessons.map(item => item.id);
  const position = route.indexOf(lesson.id);
  const prev = getLessonSummary(route[position - 1]);
  const next = getLessonSummary(route[position + 1]);
  const courseHref = aiCourseHref(courseModule.id);

  const content = isReadableStatus(lesson.status) ? renderedData.lessons.find((l) => l.id === lesson.id) : undefined;
  // Only fully available chapters have assessment data; reading_ready never calls it.
  const activities =
    content && !learningUnit(lesson.id) && lesson.status === "available" && !splitLessons.has(lesson.id)
      ? getAssessmentActivities(lesson.id)
      : undefined;
  const rail = content
    ? [...content.sections, ...(activities ? [{ id: "assessment", title: "本章测验与进度" }] : [])]
    : [];

  return (
    <div className="course-app course-reader-app">
      <AiTermWorkspace>
        <div className="course-reader-pane">
          <article className="course-article">
            <div className="course-article-layout">
              <div className="course-article-side">
                <Link
                  className="detail-back-button course-reader-back"
                  href={courseHref}
                  aria-label="返回章节目录"
                  title="返回章节目录"
                >
                  <svg className="ui-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M19 12H5m6-6-6 6 6 6" />
                  </svg>
                </Link>
                {rail.length > 0 && <AiSectionRail items={rail} />}
              </div>
              <div className="course-article-inner ai-course-lesson">
                <header className="course-chapter-hero">
                  <nav className="ai-course-crumb" aria-label="位置">
                    <Link href="/courses">课程</Link>
                    <span aria-hidden="true">/</span>
                    <Link href={courseHref}>{courseModule.title}</Link>
                  </nav>
                  {/* Same eyebrow as the Web Coding chapters; the full-course number stays as a quiet hint. */}
                  <span className="course-section-eyebrow" title={`AI 应用课程第 ${getAiCourseNumber(courseModule.id)} 门 · 全套第 ${pad(lesson.order)} 课`}>
                    第 {index + 1} 章
                  </span>
                  {/* Available lessons carry their own title, intro line and 本章信息 inside the rendered HTML. */}
                  {!content && (
                    <>
                      <h1>{lesson.title}</h1>
                      <p className="ai-learning-badges">
                        <span className={`ai-learning-badge is-${lesson.status}`}>{getLessonStatusLabel(lesson.status)}</span>
                        <span className="ai-learning-badge is-draft">{getReviewLabel(meta.review)}</span>
                      </p>
                    </>
                  )}
                </header>

                <LessonGuide id={lesson.id} />

                {content ? (
                  <>
                    {/* HTML is produced at build time from the course sources and checked against a tag allowlist. */}
                    <div className="ai-learning-prose" dangerouslySetInnerHTML={{ __html: content.html }} />
                    {activities && (
                      <LessonAssessment lessonId={lesson.id} activities={activities} sections={content.sections} />
                    )}
                  </>
                ) : isReadableStatus(lesson.status) ? (
                  <section className="ai-learning-empty">
                    <p>本章在课程目录里标为有正文，但没有找到渲染后的正文。请重新运行内容生成（npm run content:ai）。</p>
                  </section>
                ) : (
                  <section className="ai-learning-empty">
                    <p><b>完整正文待编写。</b>上方是新版学习要点与任务目标。请通过实践入口查看材料计划、交付物和检验方式。</p>
                  </section>
                )}

                <nav className="course-bottom-nav" aria-label="上一章和下一章">
                  {prev && <ChapterLink lesson={prev} dir="prev" />}
                  {next ? (
                    <ChapterLink lesson={next} dir="next" />
                  ) : (
                    <Link className="is-next" href="/courses">
                      <span>选择下一步</span>
                      <strong>返回学习路线</strong>
                    </Link>
                  )}
                </nav>
              </div>
            </div>
          </article>
          {rail.length > 0 && <AiMobileSectionSheet items={rail} />}
        </div>
      </AiTermWorkspace>
    </div>
  );
}
