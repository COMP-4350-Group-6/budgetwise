"use client";

import Link from "next/link";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { FaHome, FaChartLine, FaWallet, FaLightbulb } from "react-icons/fa";
import { useSidebarState } from "@/app/(protected)/ProtectedLayoutClient";

export default function Sidebar() {
  const { collapsed, toggleCollapse } = useSidebarState();

  return (
    <aside
      className={`h-full bg-white border-r border-brandGrey shadow-sm transition-all duration-300 flex flex-col ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header / Toggle */}
      <div className="p-4 flex items-center justify-between border-b border-brandGrey">
        <span className="font-bold text-brandDarkerGreen">
          {collapsed ? "B" : "BudgetWise"}
        </span>
        <button
          onClick={toggleCollapse}
          className="text-brandDarkerGreen hover:text-brandGreen transition"
        >
          {collapsed ? <FiArrowRight size={18} /> : <FiArrowLeft size={18} />}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <SidebarLink
          href="/home"
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
