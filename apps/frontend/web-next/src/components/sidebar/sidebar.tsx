"use client";

import { useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { FaHome, FaChartLine, FaWallet } from "react-icons/fa";
import { FaSignOutAlt } from "react-icons/fa";
import { useSidebarState } from "@/app/(protected)/ProtectedLayoutClient";
import { authService } from "@/app/services/authService";
import { getLoginUrl } from "@/lib/config";
import { ConfirmModal } from "@/components/ui";
import styles from "./sidebar.module.css";

export default function Sidebar() {
  const { collapsed, toggleCollapse } = useSidebarState();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handle logout confirmation - shows modal first
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // Handle confirmed logout - calls API then redirects
  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Clear local storage tokens
      localStorage.removeItem("bw_access");
      localStorage.removeItem("bw_refresh");
      
      // Call logout API to clear httpOnly cookies
      await authService.logout();
      
      // Redirect to Vue auth app's logout page
      window.location.href = getLoginUrl();
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect even if API call fails
      window.location.href = getLoginUrl();
    }
  };

  // Handle logout cancellation
  const handleCancelLogout = () => {
    setShowLogoutModal(false);
    setIsLoggingOut(false);
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
        {/* <SidebarLink
          href="/insights"
          icon={<FaLightbulb />}
          label="Insights"
          collapsed={collapsed}
        /> */}
      </nav>

      {/* Logout button at bottom */}
      <button onClick={handleLogoutClick} className={styles.logout}>
        <FaSignOutAlt className={styles.logoutIcon} />
        {!collapsed && <span>Logout</span>}
      </button>

      {/* Logout confirmation modal */}
      <ConfirmModal
        show={showLogoutModal}
        title="Confirm Logout"
        message="Are you sure you want to log out? You will need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
        isLoading={isLoggingOut}
        variant="danger"
      />
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