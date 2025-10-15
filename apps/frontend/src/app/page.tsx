import { redirect } from "next/navigation";

export default function HomeRedirect() {
  // Redirect to login
  redirect("/login");
  return null;
}
