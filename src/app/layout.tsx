import type { Metadata } from "next";
import "./globals.css";
import { THEME_INIT_SCRIPT } from "@/lib/vibehub/theme";
import { SiteShell } from "@/components/sites/vibe-hub-org-e37cedf6/shared/site-shell";

export const metadata: Metadata = {
  title: "AI 学习站 · 团队 AI 实战通道",
  description:
    "团队自愿学习 AI 的通道：AI 课程、术语图鉴与业务情境练习，不考核、不计分。",
  icons: {
    icon: "/brand/ai-learning-mark.svg",
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
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
