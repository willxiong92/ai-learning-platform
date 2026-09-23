只做当前已定位的三项修复，最多5分钟，不重读全文：
1. npm run check lint失败：src/app/learning/[lesson]/page.tsx:60 使用变量module触发@next/next/no-assign-module-variable；改为courseModule并同步引用。
2. 页面把draft渲染为“未经内容复核”，与已取得的Grok内容ACCEPT事实不符；母源draft仍须保持。所有UI draft文案改为“内容草稿 · 待本人试学”，不改母源状态。涉及catalog getReviewLabel与render脚本LessonIntro。
3. 单课页用户说明不要暴露“vitepress createMarkdownRenderer 编译”的实现细节，改成普通阅读提示；技术细节留README。
回执精确已授权路径：/Users/will/code/网站克隆工作台/work/2026-09-19-learning-pages/claude-receipt.md。上一轮你猜的work/ALS-S3-A2-receipt.md不在范围内，不能写；本次使用原已批准路径，不新增权限。26项实际测试已通过，待这次修复后Codex再跑check。不要做无关美化/改写教材。