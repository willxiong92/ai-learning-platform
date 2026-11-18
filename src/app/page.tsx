import { Suspense } from "react";
import { HOME_TOPIC_SLUG } from "@/lib/vibehub/data";
import { StaticCatalog } from "@/components/ai-learning/static-catalog";
// 首屏样式只在首页加载，避免影响课程页等其他页面
import "@/app/home.css";

// 首页默认：先是「从 L01 开始 + 路线条」首屏，下面接学习路线模块 1（AI 基本功）的术语目录。
// Sites 静态发布版：?q= 搜索在浏览器里执行，见 StaticCatalog。
export default function Home() {
  return (
    <Suspense fallback={<p>正在加载术语图鉴…</p>}>
      <StaticCatalog slug={HOME_TOPIC_SLUG} />
    </Suspense>
  );
}
