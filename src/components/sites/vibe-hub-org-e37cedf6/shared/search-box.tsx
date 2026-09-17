"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SearchBox() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");

  return (
    <form
      className="nav-search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        router.push(q ? `/?q=${encodeURIComponent(q)}` : "/");
      }}
    >
      <div className="search-box">
        <span className="search-icon">⌕</span>
        <input
          placeholder="搜索术语：试试「按钮」「登录弹窗」「返回顶部」…"
          aria-label="搜索组件、技术栈和 AI 术语"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    </form>
  );
}
