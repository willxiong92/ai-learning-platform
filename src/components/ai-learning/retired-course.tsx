"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function RetiredCourse() {
  const router = useRouter();
  useEffect(() => { router.replace("/ai-guide/"); }, [router]);
  return <main className="collab-page"><Link href="/ai-guide/">前往课程 →</Link></main>;
}
