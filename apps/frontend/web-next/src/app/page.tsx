import { redirect } from "next/navigation";
import { getLoginUrl } from "@/lib/config";

export default function HomeRedirect() {
  // Redirect to Vue auth app login
  redirect(getLoginUrl());
  return null;
}
