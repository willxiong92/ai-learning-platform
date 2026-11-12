import type { Metadata } from "next";
import "./globals.css";
// 全站视觉层放在 globals.css 之后引入，保证能压过 globals 里对原站样式的补丁；撤回删这一行即可
import "./handbook.css";
// 第三轮质感与动效层，叠在手册视觉层之上；撤回删这一行即可
import "./handbook-motion.css";
// Demo-only visual layer; existing routes and interaction state stay on the v9 baseline.
import "./demo-theme.css";
import "./demo-learning.css";
import "./demo-practice.css";
import { THEME_INIT_SCRIPT } from "@/lib/vibehub/theme";
import { SiteShell } from "@/components/sites/vibe-hub-org-e37cedf6/shared/site-shell";

export const metadata: Metadata = {
  title: "OKKI 团队 AI 学习网站",
  description:
    "OKKI 团队自愿学习 AI 的通道：AI 课程、术语图鉴与业务情境练习，不考核、不计分。",
  icons: {
    icon: "/brand/okki-favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* Sets data-color-mode + theme brand CSS vars before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="demo-shell min-h-full flex flex-col" suppressHydrationWarning>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
