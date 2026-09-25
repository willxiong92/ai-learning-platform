import Link from "next/link";
import { ROUTE_TOPICS } from "@/lib/vibehub/data";

// 首页首屏（界面升级样稿，2026-09-26，docs/REDESIGN.md §3）：
// 先告诉新同事「这是什么站、从哪开始」，再往下才是术语目录。
// 路线条直接读课程数据（ROUTE_TOPICS），模块开放状态跟着教材走，这里不写死。
const L01_HREF = "/courses/ai-m1/l01";
const pad2 = (n: number) => String(n).padStart(2, "0");

export function HomeIntro() {
  return (
    <section className="home-intro" aria-labelledby="home-intro-title">
      <div className="home-intro-inner">
        <p className="home-intro-eyebrow">客户成功团队 · AI 学习站</p>
        <h1 id="home-intro-title" className="home-intro-title">
          按业务场景学 AI，
          <br />
          {/* 第二行加一道荧光笔式的底色，进场时从左往右划出来（home.css） */}
          <span className="home-intro-mark">从第 01 课开始</span>
        </h1>
        <p className="home-intro-lead">
          先练 AI 使用基本功，再按业务场景一步步往下学。自愿学习，不考核、不计分；模块 1 已开放，其余模块编写中。
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
    </section>
  );
}
