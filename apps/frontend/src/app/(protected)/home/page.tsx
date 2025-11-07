"use client";
import { useEffect, useState, useMemo } from "react";
import styles from "./home.module.css";
import { useRouter } from "next/navigation";
import { budgetService, BudgetDashboard } from "@/services/budgetService";
import { apiFetch } from "@/lib/apiClient";
import type { TransactionDTO } from "@/services/transactionsService";
import StatCard from "@/components/dashboard/statCard";
import TrendChart from "@/components/dashboard/trendChart";
import DonutChart from "@/components/dashboard/donutChart";
import QuickActions from "@/components/dashboard/quickActions";
import SpendingOverview from "@/components/dashboard/spendingOverview";

export default function HomePage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<BudgetDashboard | null>(null);
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dash, tx] = await Promise.all([
          budgetService.getDashboard(),
          apiFetch<{ transactions: TransactionDTO[] }>("/transactions?days=90", {}, true),
        ]);
        setDashboard(dash);
        setTransactions(tx.transactions || []);
      } catch (err) {
        console.error("Failed to load dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const totalBudget = dashboard?.totalBudgetCents ?? 0;
    const totalSpent = dashboard?.totalSpentCents ?? 0;
    const remaining = totalBudget - totalSpent;
    const usage = totalBudget > 0 ? totalSpent / totalBudget : 0;
    const health =
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

  const insight =
    stats.usage < 0.5
      ? "✅ You're on track this month."
      : stats.usage < 0.9
      ? "⚠️ Caution: approaching budget limit."
      : "🚨 You've exceeded your monthly budget.";

  if (loading)
    return (
      <div className={styles.page}>
        <div className={styles.card}>Loading dashboard...</div>
      </div>
    );

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <p className={styles.breadcrumb}>Home / Dashboard</p>
        <h1 className={styles.pageTitle}>Budget Dashboard</h1>
      </div>


      {/* Top Stats */}
    <div className={styles.topStatsRow}>
      <StatCard title="Total Budget" value={stats.formatted.budget} icon="budget" />
      <StatCard title="Total Spent" value={stats.formatted.spent} icon="spent" />
      <StatCard
        title="Remaining"
        value={stats.formatted.remaining}
        icon="remaining"
        status={stats.health === "good" ? "good" : stats.health === "warning" ? "warning" : "bad"}
      />
      <StatCard
        title="Budget Health"
        value=""
        icon="health"
        subtitle={stats.health === "good" ? "On Track" : stats.health === "warning" ? "At Risk" : "Over Budget"}
        status={stats.health === "good" ? "good" : stats.health === "warning" ? "warning" : "bad"}
      />
    </div>

      {/* Mid Row */}
      <div className={styles.midRow}>
        <SpendingOverview transactions={transactions} />
    
      </div>

      {/* Grid Row */}
      <div className={styles.gridRow}>
        <TrendChart transactions={transactions} />
        <DonutChart dashboard={dashboard} />
        
      </div>

      {/*  Quick Actions */}
      <QuickActions router={router} />
    </div>
    
  );
}