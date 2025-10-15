"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ProtectedLayoutClient from "./ProtectedLayoutClient";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-green-dark">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>;
}
