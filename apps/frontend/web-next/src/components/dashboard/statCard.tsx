"use client";

import React from "react";
import styles from "./statCard.module.css";
import { DASHBOARD_STRINGS,StatusLevel, DASHBOARD_ICONS,COLORS } from "@/constants";

/**
 * StatCard Component
 * 
 * Displays financial metrics with icons and status indicators.
 * Used across dashboard for consistent metric presentation.
 * 
 * This component was developed with claud.ai AI assistance
 * for code structure and accessibility features.
 */

/**
 * Props for the StatCard component
 */

interface StatCardProps {
  title: string;      // Metric title (e.g., "Total Budget")
  value: string;      // Formatted value (e.g., "$1,000.00")
  icon?: "budget" | "spent" | "remaining" | "health";  // Visual icon type
  status?: StatusLevel;     // Color-coded status indicator
  subtitle?: string;        // Additional status text
}

/**
 * Reusable card component for financial metrics
 * - Displays icon, value, and optional status
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon = "budget",
  status = "neutral",
  subtitle,
}) => {
  const IconComponent = DASHBOARD_ICONS[icon];

  
  const statusClass =
    status === "good"
      ? styles.statusGood
      : status === "warning"
      ? styles.statusWarning
      : status === "danger"
      ? styles.statusDanger
      : styles.statusNeutral;

  return (
    <div className={styles.card} aria-label={`${title} statistic`}>
      {/* Header with icon and title */}
      <header className={styles.header}>
        {IconComponent && (
          <div className={styles.iconWrapper}>
            <IconComponent size={18} color={COLORS.primary} />
          </div>
        )}
        <p className={styles.title}>{title || DASHBOARD_STRINGS.noData}</p>
      </header>

      {/* Main metric value */}
      <h2 className={styles.value}>{value || ""}</h2>

      {/* Status indicator with colored dot */}
      {subtitle && (
        <div
          className={`${styles.statusRow} ${statusClass}`}
          aria-label={`Status: ${subtitle}`}
        >
          <span className={styles.statusDot}></span>
          <span className={styles.subtitle}>{subtitle}</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(StatCard);