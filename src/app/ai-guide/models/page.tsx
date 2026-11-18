"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ModelsPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/practice/#models"); }, [router]);
  return <div className="guide-container"><Link href="/practice/#models">模型参考已移到实践页 →</Link></div>;
}
