import { redirect } from "next/navigation";

// The AI courses now live in the shared course list (/courses). This route stays
// only so old bookmarks and shared links keep working.
export default function LearningIndexRedirect() {
  redirect("/courses");
}
