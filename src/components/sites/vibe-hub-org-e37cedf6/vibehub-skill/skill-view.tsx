"use client";

import Link from "next/link";
import { getTerm } from "@/lib/vibehub/data";
import { TermPreviewTrigger } from "./term-preview-trigger";
import { CopyChip } from "../shared/copy-chip";

const INSTALL_TEXT = "https://github.com/oil-oil/vibe-hub-skill\n帮我安装这个仓库里的 skills/vibehub Skill。";
const REWRITE_TEXT = "为按钮补充 Hover 状态和 Active 状态，并使用 Transition 让状态变化更自然。";

export function SkillView() {
  const tooltipTerm = getTerm("tooltip")!;
  const hoverTerm = getTerm("hover")!;
  const activeTerm = getTerm("active")!;
  const transitionTerm = getTerm("transition")!;
  const switchTerm = getTerm("switch")!;

  return (
    <div className="skill-page">
      <div className="skill-detail">
        <nav className="detail-breadcrumb skill-breadcrumb" aria-label="面包屑">
          <Link className="breadcrumb-link" href="/">
            术语图鉴
          </Link>
          <span className="breadcrumb-separator" aria-hidden="true">
            ›
          </span>
          <span className="breadcrumb-current" aria-current="page">
            VibeHub Skill
          </span>
        </nav>

        <section className="skill-intro">
          <div className="skill-intro-copy">
            <div className="skill-label">VibeHub Skill</div>
            <h1>
              <span className="skill-hero-context">让 Vibe Coding</span>
              <strong>
                表达更<span className="skill-hero-accent">准确</span>
              </strong>
            </h1>
            <p>
              每当你的描述可能产生歧义，VibeHub 都会找出更恰当的技术术语，把需求改成可以直接发给 Agent
              的准确表达，并附上通俗解释和链接。
            </p>
            <div className="skill-facts">
              <div className="skill-fact">
                <b>322</b>
                <span>个可视化术语</span>
              </div>
              <div className="skill-fact">
                <b>2</b>
                <span>个核心功能</span>
              </div>
              <div className="skill-fact">
                <i className="ti ti-message" aria-hidden="true" />
                <span>一句话即可开始</span>
              </div>
            </div>
          </div>

          <section className="skill-browser-demo" aria-label="VibeHub Skill 真实对话演示">
            <div className="skill-browser-chrome">
              <span className="skill-browser-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="skill-browser-back" aria-hidden="true">
                <i className="ti ti-arrow-left" aria-hidden="true" />
              </span>
              <div className="skill-browser-address">
                <i className="ti ti-lock" aria-hidden="true" />
                <span>agent.local/project</span>
              </div>
              <span className="skill-browser-more" aria-hidden="true">
                •••
              </span>
            </div>
            <div className="skill-browser-tab">
              <i className="ti ti-message-circle" aria-hidden="true" />
              <span>Agent 对话</span>
            </div>
            <div className="skill-browser-viewport" aria-live="polite">
              <div className="skill-browser-thread">
                <div className="skill-browser-user">
                  <span>鼠标放到这个按钮上时，显示一个小提示，告诉用户它是做什么的。</span>
                </div>
                <div className="skill-browser-agent">
                  <div className="skill-browser-agent-head">
                    <i className="ti ti-sparkles" aria-hidden="true" />
                    <strong>Agent</strong>
                    <span>
                      <i className="ti ti-check" aria-hidden="true" />
                      已完成
                    </span>
                  </div>
                  <div className="skill-browser-agent-bubble">
                    <p>
                      已经加好了：鼠标悬停或键盘聚焦时，会显示“下载”。这种短提示通常叫{" "}
                      <TermPreviewTrigger term={tooltipTerm} label="Tooltip（文字提示）" />。
                    </p>
                  </div>
                  <small>
                    <i className="ti ti-pointer" aria-hidden="true" />
                    点击术语，原地查看通俗解释
                  </small>
                </div>
              </div>
            </div>
          </section>
        </section>

        <section className="skill-install" id="skill-install" aria-labelledby="install-title">
          <div className="skill-install-copy">
            <small>一分钟安装</small>
            <h2 id="install-title">复制这段话，发给你的 Agent</h2>
            <p>Agent 会打开 GitHub 仓库并完成安装。</p>
          </div>
          <div className="skill-install-prompt">
            <code>
              <a href="https://github.com/oil-oil/vibe-hub-skill" target="_blank" rel="noreferrer">
                https://github.com/oil-oil/vibe-hub-skill
              </a>
              <span>帮我安装这个仓库里的 skills/vibehub Skill。</span>
            </code>
            <CopyChip text={INSTALL_TEXT} label="复制安装指令" ariaLabel="复制安装指令" />
          </div>
        </section>

        <section className="skill-block" aria-labelledby="rewrite-title">
          <div className="skill-block-title">
            <span>功能一 · 规范表达</span>
            <h2 id="rewrite-title">把模糊描述改成可以直接发送的需求</h2>
            <p>Skill 会保留你的原意，只补上真正有用的术语，不擅自增加框架、参数或实现方案。</p>
          </div>
          <div className="skill-rewrite-visual">
            <div className="skill-rewrite-before">
              <span>你的原话</span>
              <p>这个按钮鼠标放上去变个色，点下去也要有一下反馈。</p>
            </div>
            <i className="ti ti-arrow-down skill-rewrite-arrow" aria-hidden="true" />
            <div className="skill-rewrite-after">
              <header>
                <span>可以直接对 Agent 说</span>
                <CopyChip text={REWRITE_TEXT} label="复制规范后的表达" ariaLabel="复制规范后的表达" />
              </header>
              <p>
                为按钮补充{" "}
                <Link className="skill-term-link" href={`/${hoverTerm.id}`}>
                  Hover
                </Link>{" "}
                状态和{" "}
                <Link className="skill-term-link" href={`/${activeTerm.id}`}>
                  Active
                </Link>{" "}
                状态，并使用{" "}
                <Link className="skill-term-link" href={`/${transitionTerm.id}`}>
                  Transition
                </Link>{" "}
                让状态变化更自然。
              </p>
            </div>
          </div>
        </section>

        <section className="skill-block" aria-labelledby="suggest-title">
          <div className="skill-block-title">
            <span>功能二 · 主动提示</span>
            <h2 id="suggest-title">不用先问“这叫什么”</h2>
            <p>只要你的描述存在歧义或缺少恰当名词，Skill 就会主动指出最相关的 1–3 个术语，并把解释放在当前场景里，不需要等你追问。</p>
          </div>
          <div className="skill-suggest-visual">
            <div className="skill-dialogue-user">
              <small>你说</small>
              <p>这个设置我想改了就马上生效，不想再点一次保存。</p>
            </div>
            <div className="skill-dialogue-agent">
              <header>
                <i className="ti ti-sparkles" aria-hidden="true" />
                <small>VibeHub 提示</small>
              </header>
              <p>
                这种场景通常适合{" "}
                <Link className="skill-term-link" href={`/${switchTerm.id}`}>
                  Switch
                </Link>
                ：它适合只有开和关两种状态、修改后立即生效的设置。如果用户需要先调整多项内容再统一确认，就不应该这样设计。
              </p>
            </div>
            <ul className="skill-suggest-rules">
              <li>
                <i className="ti ti-link" aria-hidden="true" />
                术语第一次出现时直接链接到 VibeHub
              </li>
              <li>
                <i className="ti ti-message-circle" aria-hidden="true" />
                解释紧跟当前任务，不讲百科式定义
              </li>
              <li>
                <i className="ti ti-filter" aria-hidden="true" />
                每次最多提示 3 个真正相关的术语
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
