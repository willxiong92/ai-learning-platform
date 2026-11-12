// 实践课引用的外网资料。编号对应 docs/research/practice-inquiry/research.md 的来源清单（S1、S3…），访问日期 2026-10-01。
// 课页只列标题和链接；每条资料支撑哪个要点、可信度多高，看研究稿。从业者文章只用来补充做法，不当结论依据。
import type { PracticeSource } from "./content";

export const PRACTICE_SOURCES: Record<string, PracticeSource> = {
  // S1：清楚直接、给背景、示例 3–5 个、用标签分隔材料、起草后自查。旧的提示词模板页已并入这一页
  "claude-prompting": {
    title: "Prompting best practices（Claude 官方文档）",
    url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices",
    kind: "官方文档",
  },
  // S3：先定成功标准，再做测试
  "claude-success": {
    title: "Define success criteria and build evaluations（Claude 官方文档）",
    url: "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests",
    kind: "官方文档",
  },
  // S4：允许说「不知道」、第一次很少一次成、不要过度设计提示词
  "claude-blog": {
    title: "Best practices for prompt engineering（Anthropic 官方博客，2025-11）",
    url: "https://claude.com/blog/best-practices-for-prompt-engineering",
    kind: "官方文档",
  },
  // S5：指令放前面并和材料隔开、量化要求、先不给示例再加示例、用占位符做模板
  "openai-api": {
    title: "Best practices for prompt engineering with the OpenAI API（OpenAI 帮助中心）",
    url: "https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-the-openai-api",
    kind: "官方文档",
  },
  // S6：看结果、调整、再看
  "openai-chatgpt": {
    title: "Prompt engineering best practices for ChatGPT（OpenAI 帮助中心）",
    url: "https://help.openai.com/en/articles/10032626-prompt-engineering-best-practices-for-chatgpt",
    kind: "官方文档",
  },
  // S11：只要全目录和价目表的请求、未经请求的附件、新买家问卷
  "tradegov-scam": {
    title: "How to Avoid Scammers and Win at Exporting（美国商务部 trade.gov）",
    url: "https://www.trade.gov/feature-article/how-avoid-scammers-and-win-exporting",
    kind: "政府或行业机构",
  },
  // S16：冒充平台的付款、退款邮件，带按钮跳仿冒页面
  "alibaba-phishing": {
    title: "提高警惕！防「钓鱼」诈骗（阿里巴巴国际站业务风控，2021-05）",
    url: "https://supplier.alibaba.com/us/news/PXYU46K3.htm",
    kind: "平台说明",
  },
  // S24：主体信息异常、交易过程异常、多渠道交叉验证
  "sinosure-risk": {
    title: "如何事前识别欺诈风险，避免上当受骗（中国信保广东分公司）",
    url: "https://www.sinosure.com.cn/mobile/xbsa/219679.shtml",
    kind: "政府或行业机构",
  },
  // S26：正常买家关心品质交期；免费邮箱、价格过于大方、广撒网等信号
  "singlewindow-fraud": {
    title: "外贸人防诈指南：三招破解贸易欺诈陷阱（辽宁国际贸易单一窗口）",
    url: "https://www.singlewindow.ln.cn/edi-inter/html/xbdsk/fxffal/b04.html",
    kind: "政府或行业机构",
  },
  // S18：先反问规格、数量、目标市场；免费邮箱不等于假询盘。可信度弱，只作补充
  "practitioner-first-reply": {
    title: "外贸新人别急着报价：3 个细节（百家号，2026-09）",
    url: "https://baijiahao.baidu.com/s?id=1877546666294022440",
    kind: "从业者文章",
  },
};
