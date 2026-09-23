只读独立审查本次第一实践预览，不执行任何写入或外部动作，不调用子代理。材料已全部附在下面，不需要工具。用户确认：以吕洪伟客户背调Agent做真实业务案例，先给界面方案看，尚未安装/实跑。业务链：公司名官网→调研→补充卖方能力→匹配→开发切入点→来源核验。一个案例关联L01-04，不一课一作业。保持原站CSS风格。本轮只改本地，不发布。请检查附上的页面与案例是否有明显逻辑错误、虚假完成声明、不可用入口，或仍在强迫虚构业务流程。不要因这是方案预览、没有固定买家就要求完整实跑。输出ACCEPT/REVISE并列出准确位置及最小修正；偏好与缺陷分开。合同：policy_version=2026-09-02.1；role=reviewer；mode=review；approved_write_scope=[]；外部副作用无；使用现有CLI配置；最多3轮。代码冻结见frozen.json。

FILE /Users/will/code/网站克隆工作台/src/app/practice/cases/[caseId]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { practiceCases, getPracticeCase, practiceCaseAliases } from '@/lib/ai-learning/practice-cases';
import { curriculumLessonHref, learningUnit } from '@/lib/ai-learning/practice-curriculum';
import '../../../learning-paths.css';
import '../../practice-cases.css';
export function generateStaticParams() { return [...practiceCases.map(c=>({caseId:c.id})), ...Object.keys(practiceCaseAliases).map(caseId=>({caseId}))]; }
export async function generateMetadata({params}:{params:Promise<{caseId:string}>}) { const c=getPracticeCase((await params).caseId); return {title:`${c?.title ?? '案例'}｜AI 学习站`}; }
export default async function PracticeCasePage({params}:{params:Promise<{caseId:string}>}) {
 const c=getPracticeCase((await params).caseId); if(!c) notFound();
 return <article className="learning-hub practice-task"><nav className="learning-breadcrumb" aria-label="位置"><Link href="/practice">实践</Link><span>/</span><span>{c.level}</span></nav>
 <header className="learning-hero"><p className="learning-eyebrow">{c.status==='pilot'?'第一实践 · 方案预览，待实跑':'可选案例规划 · 材料待完善'}</p><h1>{c.title}</h1><p>{c.brief ?? c.scene}</p></header>
 <div className="task-deliverable"><strong>{c.status === 'pilot' && c.materials ? '这一轮只围绕一份成果' : '规划中的成果形式（尚未开放）'}</strong><p>{c.outcome}</p></div>

 {c.materials ? <>
 <section className="task-section"><h2>01 · 准备买家线索和我方资料</h2><p>先选择一个公开资料足够的潜在买家。固定示范对象与实跑记录待补齐；本站只提供流程和模板。</p><p><a href="https://agenthub.accio-ai.com/space/global/客户背调" target="_blank" rel="noreferrer">查看参考 Agent：吕洪伟「客户背调」 ↗</a></p><pre className="task-material">{c.materials}</pre><a href={`/practice-materials/${c.id}.txt`} download>下载准备清单与起步指令（TXT） ↓</a></section>
 <section className="task-section"><h2>02 · 从了解客户到准备开发</h2>{c.starterPrompt && <details><summary>展开起步指令，填写你的买家线索</summary><pre className="task-material">{c.starterPrompt}</pre></details>}<ol className="case-workflow">{c.steps?.map(s=><li key={s.title}><h3>{s.title}</h3><p>{s.action}</p><p className="learning-muted">这一步留下：{s.evidence}</p>{s.concept && <details><summary>这一步用到了什么知识？</summary><p>{s.concept}</p><Link href={curriculumLessonHref(s.lesson)}>遇到卡点，回课程补这一点 →</Link></details>}</li>)}</ol></section>
 <section className="task-section"><h2>03 · 检查简报是否能支持下一步</h2><ul>{c.checks?.map(x=><li key={x}>{x}</li>)}</ul><p>有依据地判断“不适合继续开发”同样合格。核验是为了做出更好的业务决定，不需要刻意找出一个错误。</p></section>
 <section className="task-section"><h2>04 · 整理成一份客户开发简报</h2><details className="task-reference"><summary>展开成果结构参考</summary><p>以下是成果结构，尚不是实际买家的示范答案。完成样板试跑后，再补充输入、输出和人工修订过程。</p><pre className="task-material">{c.reference}</pre></details></section>
 </> : <section className="task-section"><h2>案例准备方向</h2><p>{c.scene}</p><p><strong>预计成果形式：</strong>{c.outcome}</p><p>完整委托、模拟材料、步骤和测试参照尚未准备好，当前不作为可完成任务。相关课程按需学习，不必一次完成所有进阶分支。</p></section>}
 <section className="task-section"><h2>一个案例，串起四个知识点</h2><ul className="case-points">{c.points.map(p=><li key={p}>{p}</li>)}</ul><details><summary>卡住时，回到相关课程补知识</summary><ul>{c.lessons.map(id=><li key={id}><Link href={curriculumLessonHref(id)}>{id.toUpperCase()} · {learningUnit(id)?.title}</Link></li>)}</ul><p>按遇到的问题补课，不要求为每课另做一次实践。</p></details></section>
 {c.extensions && <section className="task-section"><h2>第一课做到哪里，后面怎样继续</h2><ul>{c.extensions.map(item=><li key={item}>{item}</li>)}</ul></section>}
 {c.sources && <details className="task-section"><summary>场景来源与使用边界</summary><p>参考 Agent 的公开说明用于设计业务流程，尚未安装或实跑；不把作者的能力描述当作已验证结果。来源核对日期：2026-09-20；不以平台推荐或下载量证明实际效果。</p><ul>{c.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul></details>}
 <footer className="learning-actions"><Link href="/practice">← 返回业务案例</Link><Link href="/courses">按需补课 →</Link></footer></article>;
}

FILE /Users/will/code/网站克隆工作台/src/app/practice/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { practiceCases } from '@/lib/ai-learning/practice-cases';
import '../learning-paths.css';
import './practice-cases.css';
import '@/app/courses/ai-courses.css';
export const metadata: Metadata = { title: '实践｜AI 学习站', description: '把关键知识串成真实工作的完整流程，用一个业务案例检验多项能力。' };
export default function PracticePage() { const ready = practiceCases.filter(c => c.status === 'pilot'); const planned = practiceCases.filter(c => c.status === 'planned');
 return <div className="course-app course-index-app"><div className="course-index-main learning-index">
 <header className="course-index-heading learning-index-heading"><h1>实践</h1><p>选一个业务场景，串起几项关键能力，完成一份可核验的成果。课程用来补知识，实践用来跑通工作流。</p><div className="learning-actions"><Link href="/courses">按需回课程补课</Link><Link href="/">查术语</Link></div></header>
 <div className="case-intro"><span>一个场景</span><span aria-hidden="true">→</span><span>3–4 项关键能力</span><span aria-hidden="true">→</span><span>一份业务成果</span></div>
 <section aria-labelledby="ready-cases"><div className="course-group-heading"><h2 id="ready-cases">先跑通一个案例</h2><span className="course-status is-review">方案预览 · 待实跑</span></div><p className="case-caption">不用每学一课再交一份作业。先用现成的客户背调 Agent，为一个潜在买家做好开发准备。后续基础课沿用同一案例。当前为方案预览，固定示范买家和实跑参照待补齐。</p>
 {ready.map(c => <article className="practice-case-card" key={c.id}><div className="case-card-heading"><span className="curriculum-level">{c.level}</span><h2><Link href={`/practice/cases/${c.id}`}>{c.title}</Link></h2></div><p>{c.scene}</p><div className="case-outcome"><span>完成后留下</span><strong>{c.outcome}</strong></div><ul className="case-points">{c.points.map(p=><li key={p}>{p}</li>)}</ul><Link className="case-start" href={`/practice/cases/${c.id}`}>进入案例，查看材料与流程 →</Link></article>)}
 </section>
 <details className="case-future"><summary>按工作需要选择后续场景 · {planned.length} 个方向待完善</summary><p className="case-caption">这些是可选案例规划，不是当前必交任务；有完整材料和检验参照后再开放。</p><div className="case-planned-grid">{planned.map(c=><article className="practice-case-card" key={c.id}><span className="curriculum-level">{c.level} · 待完善</span><h2><Link href={`/practice/cases/${c.id}`}>{c.title}</Link></h2><p>{c.scene}</p><p><strong>成果：</strong>{c.outcome}</p><Link href={`/practice/cases/${c.id}`}>看案例框架 →</Link></article>)}</div></details>
 <details className="learning-archive"><summary>补充单点练习与历史记录</summary><p>需要专项补练时再打开；这些材料不作为逐课必交作业。</p>{['l01','l02','l03','l04'].map((id,i)=><Link key={id} href={`/practice/${id}`}>原基础练习 {i+1}</Link>)}<Link href="/practice/meeting-skill">旧会议样板</Link><Link href="/learning/practice">原练习与草稿</Link><Link href="/learning/me">原学习记录</Link></details>
 </div></div>;
}

FILE /Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/practice/cases.json
{
  "version": "2026-09-20.7",
  "principle": "按业务案例整合关键能力，不按课号分配作业。",
  "cases": [
    {
      "id": "customer-research",
      "title": "为一个潜在买家做好开发准备",
      "level": "AI 基础",
      "status": "pilot",
      "scene": "拿到买家的公司名和官网，了解它做什么，判断与我方产品是否匹配、是否值得继续跟进、从哪里开启沟通。",
      "outcome": "一份有来源、有匹配理由、有下一步动作的客户开发简报。",
      "points": [
        "查清客户的真实业务",
        "结合我方能力判断匹配",
        "找到具体的开发切入点",
        "核实依据并决定下一步"
      ],
      "lessons": [
        "l01",
        "l02",
        "l03",
        "l04"
      ],
      "brief": "帮助外贸企业的业务员开发新客户。先使用现成的「客户背调」Agent 调查一个潜在买家，再补充我方产品与供货能力，形成有针对性的开发思路。第一课体验完整流程，后续基础课沿用同一个案例。",
      "materials": "买家线索：公司名称、官网、所在国家。选择公开资料足够的真实企业，先核实公司与域名对应。\n我方业务资料卡：主营产品、目标市场、定制能力、供货限制，以及希望开发哪类买家。使用获准的脱敏资料；模拟资料须明确标注。\n工具准备：Accio Work 中可用的「客户背调」Agent。先检查可用性和联网能力，本页不代为安装、运行或发送。\n样板状态：固定示范买家、实跑结果和人工修订记录尚待补齐。当前先审阅流程，也可自备合适材料探索。",
      "steps": [
        {
          "title": "先查清客户做什么",
          "action": "使用客户背调 Agent，输入公司名、官网、国家和调研目的。查看实际检索记录，保存客户业务概况与来源；工具不可用时记录问题，不把模型回答当作联网调查。",
          "evidence": "第一份客户概况与关键来源。",
          "concept": "模型与工具：模型负责分析，检索工具帮助获取外部资料。",
          "lesson": "l01"
        },
        {
          "title": "补充我方资料，判断哪里匹配",
          "action": "补充我方业务资料卡，追问：结合我们的产品、市场和供货限制，哪些业务可能匹配，哪些不适合？对比补充前后的建议。",
          "evidence": "一至两个匹配理由，以及不匹配或待确认条件。",
          "concept": "上下文：AI 需要了解我们是谁，才能给出有针对性的判断。",
          "lesson": "l03"
        },
        {
          "title": "选一个开发切入点",
          "action": "选择一个有依据的机会，明确优先接触的岗位、首次沟通主题和要确认的问题。可以准备沟通草稿，不要求搜齐联系人，不自动发送。",
          "evidence": "一个具体切入点和下一步行动。",
          "concept": "任务表达：把宽泛的背调请求变成支持业务决定的任务。",
          "lesson": "l02"
        },
        {
          "title": "打开来源，核实后做决定",
          "action": "打开关键来源，检查是否认对公司、产品匹配依据是否成立。修正未经证实的结论，决定继续了解、暂缓还是不开发；不要为了交作业强行推荐客户。",
          "evidence": "最终简报与一条人工核验记录。",
          "concept": "结果核验：区分公开事实、AI 推断和需要问客户的问题。",
          "lesson": "l04"
        }
      ],
      "checks": [
        "公司、官网与国家能对应，未混入同名企业资料。",
        "匹配理由与我方产品和供货条件有关，不是通用套话。",
        "重要结论可追溯到来源，潜在需求保留为推断或待确认问题。",
        "业务员知道下一步联系什么岗位、讨论什么、还要确认什么。",
        "记录实际核验和补充资料后的变化；未运行时不填写虚构结果。"
      ],
      "tests": [],
      "reference": "【成果结构参考，非实跑结果】\n客户是谁：主营产品、渠道、市场与关键来源。\n与我方哪里匹配：一至两个匹配理由，附依据；列出不匹配或待确认条件。\n是否继续跟进：继续了解 / 暂缓 / 不适合，并说明原因。\n如何开启沟通：优先联系的岗位、一个业务切入点、希望向对方确认的问题。找不到联系人时不编造姓名和邮箱。\n人工核验：检查了什么来源、修订了什么；没有发现错误也如实记录。\n前后变化：补充我方资料后，哪项建议更具体？若没有变化，检查材料是否足以影响判断。\n\n不同买家的结论应当不同。有依据地判断不适合开发，同样是合格成果。",
      "starterPrompt": "我正在为外贸业务开发潜在买家。请调研以下公司，先帮我了解它做什么、面向哪些市场和客户。\n公司名称：[填写]\n官网：[填写]\n国家/地区：[填写]\n请核对是否为同一家企业，标出关键来源及无法确认的信息。先不要假设它有明确采购意向；找到的资料与基于资料的判断请分开呈现。",
      "extensions": [
        "第一课：体验一份完整的客户开发简报，不要求自己制作 Skill、连接店铺或扫描全店。",
        "后续基础课：沿用同一案例，逐步改进任务表达、材料组织与核验方法；按需补课，不新增四份作业。",
        "进阶：再研究将验证过的方法封装成 Skill，或结合获准使用的买家行为和聊天记录。"
      ],
      "sources": [
        {
          "label": "吕洪伟「客户背调」· v1.0.1 · 第三方 Agent，已读 README，尚未实跑",
          "url": "https://agenthub.accio-ai.com/space/global/客户背调"
        }
      ]
    },
    {
      "id": "chat-diagnosis",
      "title": "从买家聊天中找出跟进机会",
      "level": "业务分析",
      "status": "planned",
      "scene": "客户想知道一批询盘为什么没有继续推进。",
      "outcome": "带证据的客户需求与下一步跟进清单。",
      "points": [
        "界定业务问题",
        "整理结构化信息",
        "区分事实与推断",
        "抽样核验"
      ],
      "lessons": [
        "l05",
        "l06",
        "l08"
      ]
    },
    {
      "id": "knowledge-answer",
      "title": "让客户资料支持可靠的业务问答",
      "level": "知识应用",
      "status": "planned",
      "scene": "业务员经常重复询问产品、样品和交付规则，需要能追溯来源的答复。",
      "outcome": "一组有来源的问答与未知问题处理记录。",
      "points": [
        "管理来源与版本",
        "整理资料结构",
        "引用证据作答",
        "更新后重新验证"
      ],
      "lessons": [
        "l09",
        "l10",
        "l11",
        "l12"
      ]
    },
    {
      "id": "reusable-skill",
      "title": "把一套客户服务方法封装成 Skill",
      "level": "可复用交付",
      "status": "planned",
      "scene": "把经过验证的询盘核验方法交给同事，并迁移到另一个客户的配置。",
      "outcome": "Skill包、使用说明、触发与异常测试记录。",
      "points": [
        "提炼任务边界",
        "设计触发与输入",
        "分离客户配置",
        "迁移与回归测试"
      ],
      "lessons": [
        "l13",
        "l14",
        "l15",
        "l16"
      ]
    },
    {
      "id": "agent-delivery",
      "title": "把工作流做成可演示的交付方案",
      "level": "按需进阶",
      "status": "planned",
      "scene": "客户需要连接工具的业务流程；按交付需要选择Agent或网页入口。",
      "outcome": "演示方案、授权边界、失败处理与交接记录。",
      "points": [
        "选择交付方式",
        "确认工具与权限",
        "处理失败与人工接管",
        "评估并交接"
      ],
      "lessons": [
        "l17",
        "l18",
        "l19",
        "l20",
        "l21",
        "W01",
        "W02",
        "W03",
        "l22",
        "l23",
        "l24"
      ]
    }
  ]
}
