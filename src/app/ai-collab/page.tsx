"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function AiCollabPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/practice/#collaboration"); }, [router]);
  return <p className="collab-page">协作案例已并入实践。<Link href="/practice/#collaboration">前往协作案例 →</Link></p>;
}
