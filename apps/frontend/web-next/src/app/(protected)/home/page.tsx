"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import styles from "./home.module.css";

// Service hooks
import { useBudgetService, useTransactionService } from "@/hooks/useServices";
import type { TransactionDTO, BudgetDashboard } from "@budget/schemas";

// Components
import StatCard from "@/components/dashboard/statCard";
import TrendChart from "@/components/dashboard/trendChart";
import DonutChart from "@/components/dashboard/donutChart";
import QuickActions from "@/components/dashboard/quickActions";
import SpendingOverview from "@/components/dashboard/spendingOverview";

// Constants
import { DASHBOARD_STRINGS, StatusLevel } from "@/constants";

/**
 * Maps a raw health string into a strongly typed StatusLevel.
 * Ensures UI consistency across dashboard status indicators.
 * TODO: Consider moving to /utils/statusUtils.ts if reused elsewhere.
 */
const mapHealthToStatus = (health: string): StatusLevel => {
  switch (health) {
    case "good":
      return "good";
    case "warning":
      return "warning";
    default:
      return "danger";
  }
};

/**
 * HomePage (Dashboard)
 * --------------------------------------
 * Displays an overview of the user's current financial data:
 * - Budget totals and remaining balance
 * - Spending trends (weekly and monthly)
 * - Category breakdown (via donut chart)
 * - Quick access to common actions (transactions, budgets)
 */
export default function HomePage() {
  const router = useRouter();
  const budgetService = useBudgetService();
  const transactionService = useTransactionService();

  // State: Dashboard data and transactions
  const [dashboard, setDashboard] = useState<BudgetDashboard | null>(null);
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetches dashboard metrics and recent transactions.
   * Services are stable (memoized), so this only runs once on mount.
   */
  useEffect(() => {
    let cancelled = false;

    const loadDashboardData = async () => {
      try {
        const [dash, txList] = await Promise.all([
          budgetService.getDashboard(),
          transactionService.listTransactions({ days: 90 }),
        ]);
        
        if (!cancelled) {
          setDashboard(dash);
          setTransactions(txList || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(DASHBOARD_STRINGS.errors.loadFailed, err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();
    
    return () => {
      cancelled = true;
    };
  }, [budgetService, transactionService]);

  /**
   * Computes aggregate budget statistics for summary cards.
   * Ensures calculations are memoized to prevent redundant renders.
   */
  const stats = useMemo(() => {
    const totalBudget = dashboard?.totalBudgetCents ?? 0;
    const totalSpent = dashboard?.totalSpentCents ?? 0;
    const remaining = totalBudget - totalSpent;

    const usage = totalBudget > 0 ? totalSpent / totalBudget : 0;
    const health: "good" | "warning" | "danger" =
      usage < 0.5 ? "good" : usage < 0.9 ? "warning" : "danger";

    return {
      totalBudget,
      totalSpent,
      remaining,
      usage,
      health,
      formatted: {
        budget: `$${(totalBudget / 100).toFixed(2)}`,
        spent: `$${(totalSpent / 100).toFixed(2)}`,
        remaining: `$${(remaining / 100).toFixed(2)}`,
      },
    };
  }, [dashboard]);

  /**
   * Determines insight messages based on current budget usage.
   */
  const insight =
    stats.usage < 0.5
      ? DASHBOARD_STRINGS.insights.good
      : stats.usage < 0.9
      ? DASHBOARD_STRINGS.insights.warning
      : DASHBOARD_STRINGS.insights.bad;

  // Loading state
  if (loading)
    return (
      <div className={styles.page}>
        <div className={styles.card}>{DASHBOARD_STRINGS.misc.loading}</div>
      </div>
    );

  return (
    <div className={styles.page}>
      {/* ===== Header ===== */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>{DASHBOARD_STRINGS.title}</h1>
      </div>

      {/* ===== Overview Statistics ===== */}
      <div className={styles.topStatsRow}>
        <StatCard
          title={DASHBOARD_STRINGS.totalBudget}
          value={stats.formatted.budget}
          icon="budget"
        />
        <StatCard
          title={DASHBOARD_STRINGS.totalSpent}
          value={stats.formatted.spent}
          icon="spent"
        />
        <StatCard
          title={DASHBOARD_STRINGS.remaining}
          value={stats.formatted.remaining}
          icon="remaining"
          status={mapHealthToStatus(stats.health)}
        />
        <StatCard
          title={DASHBOARD_STRINGS.health}
          value=""
          icon="health"
          subtitle={
            stats.health === "good"
              ? DASHBOARD_STRINGS.status.onTrack
              : stats.health === "warning"
              ? DASHBOARD_STRINGS.status.atRisk
              : DASHBOARD_STRINGS.status.overBudget
          }
          status={mapHealthToStatus(stats.health)}
        />
      </div>

      {/* ===== Spending Summary & Trends ===== */}
      <div className={styles.midRow}>
        <SpendingOverview transactions={transactions} />
      </div>

      <div className={styles.gridRow}>
        <TrendChart transactions={transactions} />
        <DonutChart dashboard={dashboard} />
      </div>

      {/* ===== Quick Actions ===== */}
      <QuickActions router={router} />
    </div>
  );
}