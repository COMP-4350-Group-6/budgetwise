"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { FaHome, FaChartLine, FaWallet, FaLightbulb } from "react-icons/fa";
import { useSidebarState } from "@/app/(protected)/ProtectedLayoutClient";
import styles from "./sidebar.module.css";

export default function Sidebar() {
  const router = useRouter();
  const { collapsed, toggleCollapse } = useSidebarState();

  // Handle user logout by clearing tokens and redirecting to login
  const handleLogout = () => {
    localStorage.removeItem("bw_access");
    localStorage.removeItem("bw_refresh");
    router.push("/login");
  };

  return (
    <aside
      className={`${styles.sidebar} ${
        collapsed ? styles.collapsed : styles.expanded
      }`}
    >
      {/* Sidebar header with logo and collapse toggle */}
      <div className={styles.header}>
        <span className={styles.logo}>
          {collapsed ? "B" : "BudgetWise"} {/* Collapsed shows only initial */}
        </span>
        <button onClick={toggleCollapse} className={styles.toggle}>
          {collapsed ? <FiArrowRight size={18} /> : <FiArrowLeft size={18} />}
        </button>
      </div>

      {/* Main navigation links */}
      <nav className={styles.nav}>
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

      {/* Logout button at bottom */}
      <button onClick={handleLogout} className={styles.logout}>
        Logout
      </button>
    </aside>
  );
}

// Reusable sidebar link component that handles collapsed state
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
      className={`${styles.link} ${collapsed ? styles.centered : ""}`}
    >
      {/* Always show icon, conditionally show label */}
      <span className="text-lg">{icon}</span>
      {!collapsed && <span className="font-medium">{label}</span>}
    </Link>
  );
}