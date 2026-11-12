# 静态部署

本项目不需要生产 Node 服务或数据库。开发与构建使用 Next.js，发布产物是 `out/` 中的完整静态文件。

## 从 Git 仓库部署

1. 拉取 `willxiong92/ai-learning-platform` 的已确认提交。
2. 使用 Node.js 24，执行 `npm ci`。
3. 执行 `npm run typecheck` 和 `npm run test:guide`（内容检查需要 Python 3）。
4. 执行 `npm run build`。
5. 将产物目录设为 `out`；静态服务入口为 `index.html`。
6. 保留目录层次，允许目录索引，例如 `/ai-guide/` 对应 `ai-guide/index.html`。
7. 检查首页、课程、术语、实践、协作手册、文章目录和任意文章深链接。

不要将所有路径重写到根 `index.html`：每个页面有自己的静态 HTML。没有站点运行密钥；不要填入 GitHub Token、个人模型 Key 或本机认证文件。不要开启旧课程的自动再生成钩子。

如果托管平台只接收 ZIP，上传完整 `out/` 的压缩包即可。包内根层应直接包含 `index.html`、`_next/` 和各路由目录；按目标平台要求选上传根目录。

## GPT Sites

当前身份由 `.openai/hosting.json` 固定。使用 Sites 官方源仓库工作流推送源码、打包并发布。源码提交与构建包必须一致。受众在 Sites 平台维护，不由本仓库修改。

## 更新文章

先更新 `sources/ai-guide/catalog.json` 和必要图片，再运行 `npm run content:guide`。此步骤重新生成阅读数据，不访问网络。`npm run build` 使用已经生成并提交的数据，因此其他机器无需原始 Obsidian Vault 或桌面业务目录。

## 回退

部署前记录 Git 提交和平台版本。需要回退时，部署上一个已验证提交的构建产物。GPT Sites 可重新部署先前保存的版本；不要混用两个站点的 project_id。
