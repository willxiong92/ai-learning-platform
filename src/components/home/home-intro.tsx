import Link from "next/link";
import { ROUTE_TOPICS } from "@/lib/vibehub/data";

// Keep the existing course entry points and data-driven availability in the new visual shell.
const L01_HREF = "/courses/ai-m1/l01";
const pad2 = (n: number) => String(n).padStart(2, "0");

export function HomeIntro() {
  return (
    <section className="home-intro" aria-labelledby="home-intro-title">
      <div className="home-intro-inner">
        <div className="demo-mascot">
          <img src="/demo/learning-robot.webp" alt="微笑的蓝色机器人" width={176} height={137} />
          <span className="demo-mascot-speech">嗨，一起把 AI 用起来！</span>
        </div>
        <p className="home-intro-eyebrow">OKKI 团队 · AI 学习网站</p>
        <h1 id="home-intro-title" className="home-intro-title">
          按业务场景学 AI，
          <br />
          {/* The highlight follows the reference selected by Will. */}
          <span className="home-intro-mark">从第 01 课开始</span>
        </h1>
        <p className="home-intro-lead">
          先练 AI 使用基本功，再按业务场景一步步往下学。
          <span className="demo-home-policy">自愿学习，不考核、不计分；模块 1 已开放，其余模块编写中。</span>
        </p>
        <div className="home-intro-actions">
          <Link className="home-intro-primary" href={L01_HREF}>
            从第 01 课开始
            <i className="ti ti-arrow-right" aria-hidden="true" />
          </Link>
          <Link className="home-intro-secondary" href="/courses">
            看全部课程
          </Link>
          <a className="home-intro-link" href="#home-terms">
            遇到生词？往下查术语
          </a>
        </div>

      </div>
      <div className="home-route-section">
        <div className="home-route-inner">
          <div className="demo-route-heading"><h2>六个模块，一步步学。</h2><p>先从已开放的基本功开始，再按工作需要往下学。</p></div>
        <ol className="home-route" aria-label="学习路线：6 个模块">
          {ROUTE_TOPICS.map((t) => {
            const r = t.route!;
            return (
              <li key={t.slug}>
                <Link
                  className={`home-route-step${r.writing ? " is-writing" : " is-open"}`}
                  href={r.courseHref}
                >
                  <span className="home-route-num">{pad2(r.order)}</span>
                  <strong>{r.title}</strong>
                  <small>
                    {r.lessonRange}
                    <span className="home-route-status">{r.writing ? "编写中" : "已开放"}</span>
                  </small>
                </Link>
              </li>
            );
          })}
        </ol>
        </div>
      </div>
    </section>
  );
}
