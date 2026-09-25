"use client";

// 来源：R-AI中后台组件库550组件 src/components/business/search-input.tsx（Will 2026-09-26 确认授权，docs/REDESIGN.md §11）
// 本站改动：透传 aria-label 和输入框样式；左内边距让出放大镜图标（原版文字会压到图标上）；不在这里处理回车，交给外层 <form> 提交，避免回车时跳转两次。
import { SearchIcon, XIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * 独立搜索框：带清空按钮。
 */
function SearchInput({
  value,
  onChange,
  placeholder = "搜索…",
  ariaLabel,
  className,
  inputClassName,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  inputClassName?: string;
}) {
  return (
    <div className={cn("relative w-full sm:max-w-64", className)}>
      <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
      <Input
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn("pr-7 pl-8", inputClassName)}
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? (
        <button
          type="button"
          aria-label="清空"
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 flex size-4 -translate-y-1/2 items-center justify-center"
          onClick={() => onChange("")}
        >
          <XIcon className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

export { SearchInput };
