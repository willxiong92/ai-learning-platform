import Link from "next/link";

// Skill 页的新起点：原克隆站的 VibeHub Skill 介绍已移除（2026-09-19 Will 定），
// 这里以后放 will 自己整理的 Skill。还没有内容时只显示说明和学习入口，不放示例 Skill。
export function SkillView() {
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
            Skill
          </span>
        </nav>

        <section className="own-skill-intro">
          <div className="own-skill-label">Skill</div>
          <h1>团队精选 Skill</h1>
          <p>
            这里精选部门沉淀的成熟 Skill，提供适用场景、使用说明、来源、版本与已验证范围。使用前仍需核对自己的客户配置和权限。
          </p>
        </section>

        <section className="own-skill-empty" aria-label="Skill 列表">
          <i className="ti ti-sparkles" aria-hidden="true" />
          <h2>精选资产待核验上架</h2>
          <p>本栏目不复制部门全部资产，也不把教学样例当成熟成果。练习制作 Skill，请进入实践任务。</p>
          <div className="own-skill-links">
            <Link href="/courses/ai-m4">先看课程：从工作方法到 Skill</Link>
            <Link href="/topics/m4">相关术语</Link>
            <Link href="/practice/l14">查看 Skill 实践框架</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
