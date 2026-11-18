import Link from "next/link";

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
          <span className="home-intro-mark">从一个工作场景开始</span>
        </h1>
        <p className="home-intro-lead">
          按主题阅读 AI 课程，再选一个工作场景动手练习。
          <span className="demo-home-policy">自愿学习，不考核、不计分。</span>
        </p>
        <div className="home-intro-actions">
          <Link className="home-intro-primary" href="/ai-guide/">
            查看课程
            <i className="ti ti-arrow-right" aria-hidden="true" />
          </Link>
          <Link className="home-intro-secondary" href="/practice/">
            去做实践
          </Link>
          <a className="home-intro-link" href="#home-terms">
            遇到生词？往下查术语
          </a>
        </div>

      </div>
    </section>
  );
}
