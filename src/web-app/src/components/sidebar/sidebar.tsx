"use client";

import { useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { FaHome, FaChartLine, FaWallet, FaLightbulb } from "react-icons/fa";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`h-screen bg-white border-r border-brandGrey shadow-sm transition-all duration-300 flex flex-col ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header / Toggle */}
      <div className="p-4 flex items-center justify-between border-b border-brandGrey">
        <span className="font-bold text-brandDarkerGreen">
          {collapsed ? "B" : "BudgetWise"}
        </span>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-brandDarkerGreen hover:text-brandGreen transition"
        >
          {collapsed ? <FiArrowRight size={18} /> : <FiArrowLeft size={18} />}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <SidebarLink
          href="/"
          icon={<FaHome />}
          label="Home"
          collapsed={collapsed}
        />
        <SidebarLink
          href="/transactions"
          icon={<FaWallet />}
          label="Transactions"
          collapsed={collapsed}
        />
        <SidebarLink
          href="/budget"
          icon={<FaChartLine />}
          label="Budget"
          collapsed={collapsed}
        />
        <SidebarLink
          href="/insights"
          icon={<FaLightbulb />}
          label="Insights"
          collapsed={collapsed}
        />
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-brandGrey text-xs text-gray-500 text-center">
        {collapsed ? "© 2025" : "BudgetWise © 2025"}
      </div>
    </aside>
  );
}

/** Reusable link component */
function SidebarLink({
  href,
  icon,
  label,
  collapsed,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brandLightGreen/50 text-brandDarkerGreen transition-all ${
        collapsed ? "justify-center" : ""
      }`}
    >
      <span className="text-lg">{icon}</span>
      {!collapsed && <span className="font-medium">{label}</span>}
    </Link>
  );
}
