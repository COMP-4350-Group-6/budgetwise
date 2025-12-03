"use client";

import { useState, createContext, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/lib/config";

// Context shared between layout and sidebar
const SidebarContext = createContext<{
  collapsed: boolean;
  toggleCollapse: () => void;
}>({
  collapsed: false,
  toggleCollapse: () => {},
});

export function useSidebarState() {
  return useContext(SidebarContext);
}

export default function ProtectedLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Redirect to auth app if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to Vue auth app with current path as redirect
      window.location.href = getLoginUrl(pathname);
    }
  }, [isAuthenticated, isLoading, pathname]);

  // Load saved sidebar state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) setCollapsed(saved === "true");
  }, []);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  const toggleCollapse = () => setCollapsed((prev) => !prev);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-green-700">Loading...</div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapse }}>
      <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`flex-none transition-all duration-300 ease-in-out border-r border-gray-200 bg-white shadow-sm ${
            collapsed ? "w-20" : "w-64"
          }`}
        >
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto px-6 py-6">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}