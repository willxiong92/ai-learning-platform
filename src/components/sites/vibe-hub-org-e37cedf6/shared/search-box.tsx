"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SearchInput } from "@/components/ui/search-input";

export function SearchBox() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");

  return (
    <form
      className="nav-search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        router.push(q ? `/?q=${encodeURIComponent(q)}` : "/");
      }}
    >
      {/* 输入框换成组件库 550 的 SearchInput（带清空按钮），回车仍由这个 form 提交 */}
      <SearchInput
        value={value}
        onChange={setValue}
        placeholder="搜索术语：试试「按钮」「登录弹窗」「返回顶部」…"
        ariaLabel="搜索组件、技术栈和 AI 术语"
        className="sm:max-w-none"
        inputClassName="bg-muted focus-visible:bg-background"
      />
    </form>
  );
}
