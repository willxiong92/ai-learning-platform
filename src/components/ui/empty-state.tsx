// 来源：R-AI中后台组件库550组件 src/components/business/empty-state.tsx（Will 2026-09-26 确认授权，docs/REDESIGN.md §11）
import type { ReactNode } from "react";
import { InboxIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * 空状态：图标 + 标题 + 描述 + 可选操作按钮。
 * 列表/搜索无结果、无数据页面的统一占位。
 */
function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-12 text-center", className)}>
      <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full [&_svg]:size-6">
        {icon ?? <InboxIcon />}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
