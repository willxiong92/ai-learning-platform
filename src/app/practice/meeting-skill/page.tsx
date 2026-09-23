import type { Metadata } from "next";
import Link from "next/link";
import pilot from "@/lib/ai-learning/practice-pilot.json";
import "../practice-pilot.css";

export const metadata: Metadata = {
  title: "客户会议 Skill 实践｜AI 学习站",
  description: "从模拟客户需求到可复用 Skill：材料、六步任务、参考成果、异常测试和同事复现。",
};

export default function MeetingSkillPage() {
  return (
    <article className="practice-pilot">
      <Link className="pilot-back" href="/practice">← 返回实践</Link>
      <header className="pilot-hero">
        <p className="pilot-kicker">实践 01 · 客户交付 · 试做版</p>
        <h1>{pilot.title}</h1>
        <p className="pilot-lead">{pilot.intro}</p>
        <div className="pilot-actions">
          <a className="pilot-primary" href="/practice/meeting-skill/starter.zip" download>下载起步材料 <span aria-hidden="true">↓</span></a>
          <a className="pilot-secondary" href="#brief">从第一步开始 <span aria-hidden="true">→</span></a>
        </div>
        <p className="pilot-note">全部为模拟材料 · 在你自己的 AI 工具中实践 · 本页不上传资料、不记录进度</p>
      </header>
      <div className="pilot-outcomes" aria-label="完成后留下什么">
        {pilot.outcomes.map((outcome, i) => <div key={outcome}><span>0{i + 1}</span><strong>{outcome}</strong></div>)}
      </div>
      <div className="pilot-layout">
        <nav className="pilot-index" aria-label="实践步骤">
          <p>这次怎么做</p>
          <ol>{pilot.steps.map((step, i) => <li key={step.id}><a href={`#${step.id}`}><span>0{i + 1}</span>{step.title}</a></li>)}</ol>
          <a href="#reference">对照参考成果</a>
          <a href="#acceptance">检查交付物</a>
        </nav>
        <div className="pilot-body">
          <section className="pilot-setup" aria-labelledby="pilot-setup-title">
            <h2 id="pilot-setup-title">先准备一个能实际操作的环境</h2>
            <p>准备你有权使用的 AI 工具与本地练习目录。先用文件附件或完整粘贴运行一次；第 3 步再核验 Skill 的加载能力。起步包内含会议材料、配置、需求单、骨架、测试和交接模板。</p>
            <p>不需要先学完所有课程。遇到卡点，再点每一步的补课入口。</p>
          </section>
          {pilot.steps.map((step, i) => (
            <section className="pilot-step" id={step.id} key={step.id} aria-labelledby={`${step.id}-title`}>
              <div className="pilot-step-heading"><span className="pilot-step-number">0{i + 1}</span><h2 id={`${step.id}-title`}>{step.title}</h2></div>
              <p>{step.action}</p>
              <div className="pilot-deliverable"><span>留下什么</span><p>{step.deliverable}</p></div>
              {step.id === "transfer" && <a className="pilot-download" href="/practice/meeting-skill/transfer.zip" download>下载客户 B 变式材料 ↓</a>}
              <details className="pilot-hint"><summary>卡住了？看一点提示</summary><p>{step.hint}</p></details>
              <Link className="pilot-learn" href={step.href}>{step.learn} <span aria-hidden="true">↗</span></Link>
              {step.id === "test" && <div className="pilot-test-list">{pilot.tests.map(([title, input, expected]) => <details key={title}><summary>{title}</summary><p><strong>怎么布置：</strong>{input}</p><p><strong>预期行为：</strong>{expected}</p></details>)}</div>}
            </section>
          ))}
          <section className="pilot-reference" id="reference" aria-labelledby="pilot-reference-title">
            <p className="pilot-kicker">先做，再对照</p>
            <h2 id="pilot-reference-title">参照不是标准措辞，证据才是</h2>
            <p>先保留自己的输出。不要把这些参照一起发给模型，再把复述答案算作独立通过。</p>
            <details>
              <summary>看客户 A 的参考成果与错误示范</summary>
              <div className="pilot-reference-content">
                <h3>行动项 · 一种合格的表达</h3>
                <div className="pilot-table-scroll" role="region" aria-label="客户 A 参考行动项，可横向滚动" tabIndex={0}>
                  <table><thead><tr>{["事项", "负责人", "截止时间", "依赖或状态", "证据"].map(h => <th scope="col" key={h}>{h}</th>)}</tr></thead>
                    <tbody>{pilot.good.map(row => <tr key={row[4]}>{row.map((cell, i) => <td key={i}>{cell}</td>)}</tr>)}</tbody></table>
                </div>
                <h3>待确认项</h3><ul>{pilot.pending.map(item => <li key={item}>{item}</li>)}</ul>
                <p><strong>本次边界：</strong>只整理文本，没有发送通知、写入 CRM 或完成上述任务。</p>
                <div className="pilot-bad-example"><h3>看起来流畅，却不能交付</h3><blockquote>{pilot.bad}</blockquote><p>{pilot.badWhy}</p></div>
              </div>
            </details>
            <details><summary>看 Skill 参考实现与使用边界</summary><div className="pilot-reference-content"><p>参考包与起步骨架分开。先比较自己的规则，再决定怎么修改；不要同时加载两个同名 Skill。参考实现不包含客户材料，运行时显式指定输入和配置。</p><p>本样板未证明任何模型或工具的稳定性。只用手动粘贴时，请记录“只验证流程，未验证 Skill 自动发现”。</p><a className="pilot-download" href="/practice/meeting-skill/reference.zip" download>下载参考实现 ↓</a></div></details>
          </section>
          <section className="pilot-acceptance" id="acceptance" aria-labelledby="pilot-acceptance-title">
            <p className="pilot-kicker">用产物验证掌握</p><h2 id="pilot-acceptance-title">做到什么程度，可以交给同事？</h2>
            <ol>{pilot.acceptance.map(item => <li key={item}>{item}</li>)}</ol>
            <p className="pilot-note">这里没有“点一下就完成”。教学检查通过仍不等于真实客户交付可用；真实交付还要核验目标环境、数据权限和客户验收标准。</p>
          </section>
          <footer className="pilot-sources"><h2>这套方法的依据</h2>{pilot.sources.map(source => <p key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a><span>{source.note}</span></p>)}<small>来源核对：2026-09-20 · 样板版本 {pilot.version} · 待试做反馈</small></footer>
        </div>
      </div>
    </article>
  );
}
