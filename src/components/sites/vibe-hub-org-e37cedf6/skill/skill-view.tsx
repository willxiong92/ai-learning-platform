import Link from "next/link";
import skills from "@/data/local-skills.json";

export function SkillView() {
  return (
    <div className="skill-page">
      <div className="skill-detail">
        <nav className="detail-breadcrumb skill-breadcrumb" aria-label="面包屑">
          <Link className="breadcrumb-link" href="/">术语图鉴</Link>
          <span aria-hidden="true"> › </span><span aria-current="page">Skill</span>
        </nav>
        <section className="own-skill-intro">
          <div className="own-skill-label">本机精选 · 第一轮</div>
          <h1>把常用方法带走</h1>
          <p>从 Will 本机 Codex 已安装的 Skill 中精选。先了解用途与依赖，再下载到自己的环境试用。</p>
        </section>
        <section className="skill-install-note" aria-labelledby="skill-install-title">
          <h2 id="skill-install-title">如何使用</h2>
          <p>下载 ZIP 并解压，保留完整技能文件夹。请让你的 Codex 读取其中的 SKILL.md，检查依赖后安装到自己的技能目录，再开启新对话调用。</p>
          <p>这些是本机版本快照。已核对文件与下载包，尚未完成新设备安装及业务试用；网页下载不会自动安装或运行。</p>
        </section>
        <section className="local-skill-grid" aria-label="首批 Skill">
          {skills.map((skill) => (
            <article className="local-skill-card" key={skill.id}>
              <p className="own-skill-label">{skill.id}</p>
              <h2>{skill.title}</h2>
              <p>{skill.description}</p>
              <dl><dt>使用条件</dt><dd>{skill.requirements}</dd><dt>来源与版本</dt><dd>{skill.source}<br />{skill.version}</dd></dl>
              <div className="skill-example"><strong>这样开始</strong><p>{skill.prompt}</p></div>
              <a className="skill-download" href={skill.download} download>下载 {skill.id} · ZIP</a>
              <details><summary>文件清单与 SHA-256 校验</summary><ul>{skill.files.map((file) => <li key={file}><code>{file}</code></li>)}</ul><code className="skill-hash">{skill.sha256}</code></details>
            </article>
          ))}
        </section>
        <p className="skill-learn-more">想把自己的工作方法做成 Skill？<Link href="/ai-guide/articles/skill-guide/">查看 Skill 课程 →</Link></p>
      </div>
    </div>
  );
}
