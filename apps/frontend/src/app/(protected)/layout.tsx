"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ProtectedLayoutClient from "./ProtectedLayoutClient";
import { useEffect } from "react";
import { categoryService } from "@/services/budgetService";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const preloadCategories = async () => {
      try {
        const cats = await categoryService.listCategories(true);
        if (!cats || cats.length === 0) {
          await categoryService.seedDefaultCategories();
          await categoryService.listCategories(true);
        }
      } catch (err) {
        console.warn("Category preload failed:", err);
      }
    };

    if (isAuthenticated && !loading) {
      preloadCategories();
    }
  }, [isAuthenticated, loading]);

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
