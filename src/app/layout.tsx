import type { Metadata } from "next";
import "./globals.css";
import { THEME_INIT_SCRIPT } from "@/lib/vibehub/theme";
import { SiteShell } from "@/components/sites/vibe-hub-org-e37cedf6/shared/site-shell";

export const metadata: Metadata = {
  title: "Web Coding 学习站 · 基于 VibeHub 术语图鉴",
  description:
    "个人 Web coding 学习网站：VibeHub 前端/后端/产品/测试/技术栈/AI/Git/设计风格术语图鉴 + 自建小课与练习。",
  icons: {
    icon: "/sites/vibe-hub-org-e37cedf6/shared/images/vh-logo-v4-tight.png",
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
