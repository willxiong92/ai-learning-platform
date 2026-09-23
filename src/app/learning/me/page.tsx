import { redirect } from "next/navigation";

// “我的学习”已下线（2026-09-19）：网站和克隆站一样把术语、练习、课程分开，练习不计分、不记录进度。
// 旧链接转到练习页。浏览器里以前存的学习记录没有删除，只是不再显示；登录后的学习记录另起阶段再做。
export default function MyLearningPage() {
  redirect("/practice");
}
