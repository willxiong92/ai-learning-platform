# OKKI 团队 AI 学习站

课程、术语、实践、协作手册和按主题组织的 AI 文章库。基于 Next.js 16 / React 19，使用静态导出。设计规范见 [DESIGN.MD](DESIGN.MD)。

## 本地运行与构建

需要 Node.js 24。普通运行不依赖个人电脑上的教材目录，也不自动重新生成旧课程。

```sh
npm ci
npm run dev
npm run typecheck
npm run test:guide
npm run build
```

`npm run build` 导出到 `out/`。用 HTTP 服务预览，例如 `python3 -m http.server 3000 --directory out`。不可直接双击 HTML。部署说明见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)。

## 内容与维护

| 内容 | 维护入口 |
|---|---|
| 实践指南的36篇文章与原始来源 | `sources/ai-guide/catalog.json`；不可变原始抓取见 `sources/ai-guide/imports/` |
| 文章学习分类 | `src/data/ai-guide-learning-path.json`；每篇只归属一个分类 |
| 本地图片与封面 | `public/ai-guide/media/` |
| 文章派生数据 | `src/data/ai-guide.json`、`src/data/ai-guide-reading.json`；不手工改 |
| 已冻结课程与术语 | `src/lib/ai-learning/`、`src/lib/vibehub/`；与文章库独立维护 |
| 旧课程的显式再生成 | `npm run content:ai`；仅在教材母源已准备并明确更新课程时运行 |

实践指南入口 `/ai-guide/`，文章入口 `/ai-guide/articles/<slug>/`。原原创/精选目录保留兼容，首页按 AI 基础、模型与工具、方法与协作、设计与开发、产品与创作分类。阅读页使用原封面与插图、目录定位、字体字号设置、图片放大和同类前后篇导航。

本批共36篇（18原创、18精选），25篇公开完整、11篇授权 Pro 完整。原作者与来源保留在文章记录和参考来源中。9个模型档案保留原记录。文章媒体在本地提供，不依赖原站图片服务。

编辑文章母源后执行：

```sh
npm run content:guide
npm run test:guide
npm run build
```

内容生成需要 Python 3 标准库，无第三方 Python 依赖。`AI_GUIDE_SOURCE_DIR` 可显式指定外部母源；默认读取仓库内 `sources/ai-guide/`。匿名刷新在存在授权全文时拒绝覆盖，避免把全文退回 Pro 预览。新的授权原文沿用同一记录更新。

## 发布目标

- GPT Site：`appgprj_6ad2216ea7208191ae5867d47e662da2`，OKKI 团队 AI 学习网站。
- GitHub：`willxiong92/ai-learning-platform`，私有仓库。
- `.openai/hosting.json` 只标识当前 OKKI Site，不能用于更新旧 AI 学习站。
- GPT Site 访问策略在平台单独管理；Git 仓库私有不等于网站私有。发布保留现有策略，不在源码中保存登录凭据。

## 历史与边界

OKKI 界面从原学习站 v9 基线派生，保留课程、术语、实践和协作手册功能。课程阅读沿用2026-11-01已选样式；当前文章书架与阅读版式来自2026-11-12确认的A方案。代码技术验证、用户视觉确认和学习效果分别记录。底层脚手架的许可证见 `LICENSE`；第三方文章和图示按已确认的作者授权使用，代码许可证不改变其权利归属。
