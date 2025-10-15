"use client";

import { useState, createContext, useContext, useEffect } from "react";
import Sidebar from "@/components/sidebar/sidebar";

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
  const [collapsed, setCollapsed] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) setCollapsed(saved === "true");
  }, []);

  // Persist state
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  const toggleCollapse = () => setCollapsed((prev) => !prev);

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