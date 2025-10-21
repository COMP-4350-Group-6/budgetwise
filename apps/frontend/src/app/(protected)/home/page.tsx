"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./home.module.css";
import { budgetService } from "@/services/budgetService";
import type { BudgetDashboard } from "@/services/budgetService";

export default function HomePage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<BudgetDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await budgetService.getDashboard();
        setDashboard(data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const totalBudget = dashboard?.totalBudgetCents ?? 0;
  const totalSpent = dashboard?.totalSpentCents ?? 0;
  const totalRemaining = totalBudget - totalSpent;
  const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Generate colors for pie chart
  const categoryColors = [
    "#4F46E5", "#7C3AED", "#EC4899", "#F59E0B", "#10B981",
    "#3B82F6", "#8B5CF6", "#EF4444", "#F97316", "#14B8A6"
  ];

  const categoryData = dashboard?.categories?.map((cat, idx) => ({
    name: cat.categoryName,
    value: cat.totalSpentCents,
    color: categoryColors[idx % categoryColors.length],
    icon: cat.categoryIcon,
  })) ?? [];

  const total = categoryData.reduce((sum, cat) => sum + cat.value, 0);

  return (
    <div className={styles.shell}>
      <h1 className={styles.heading}>Home</h1>

      <section className={styles.gridSection}>
        {/* ---- Budget Overview ---- */}
        <div className={styles.card}>
          <h2 className={styles.subheading}>Budget Overview</h2>
          <p className={styles.subtitle}>Your current financial status.</p>

          {loading ? (
            <div className={styles.textGroup}>Loading...</div>
          ) : (
            <>
              <div className={styles.textGroup}>
                <div className={styles.row}>
                  <span>Total Budget:</span>
                  <span className={styles.boldGray}>
                    ${(totalBudget / 100).toFixed(2)}
                  </span>
                </div>
                <div className={styles.row}>
                  <span>Budget Used:</span>
                  <span className={styles.boldRed}>
                    ${(totalSpent / 100).toFixed(2)}
                  </span>
                </div>
                <div className={styles.row}>
                  <span>Remaining:</span>
                  <span className={styles.boldGreen}>
                    ${(totalRemaining / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className={styles.progress}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                />
              </div>
            </>
          )}

          <div className={styles.buttonGroup}>
            <button
              className={styles.primaryBtn}
              onClick={() => router.push('/transactions')}
            >
              View Transactions
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={() => router.push('/budget')}
            >
              Manage Budgets
            </button>
          </div>
        </div>

        {/* ---- Spending Categories ---- */}
        <div className={styles.card}>
          <h2 className={styles.subheading}>Spending Categories</h2>
          <p className={styles.subtitle}>Distribution of your expenses.</p>

          {loading ? (
            <div className={styles.chartPlaceholder}>Loading...</div>
          ) : categoryData.length === 0 ? (
            <div className={styles.chartPlaceholder}>No spending data yet</div>
          ) : (
            <>
              <div className={styles.pieChartContainer}>
                <svg viewBox="0 0 200 200" className={styles.pieChart}>
                  {categoryData.length === 1 ? (
                    // Single category - render as full circle
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill={categoryData[0].color}
                      stroke="white"
                      strokeWidth="2"
                    />
                  ) : (
                    // Multiple categories - render pie slices
                    (() => {
                      let currentAngle = -90; // Start at top (12 o'clock)
                      return categoryData.map((cat, idx) => {
                        const percentage = cat.value / total;
                        const angle = percentage * 360;
                        const startAngle = currentAngle;
                        currentAngle += angle;
                        
                        const startRad = (Math.PI * startAngle) / 180;
                        const endRad = (Math.PI * currentAngle) / 180;
                        
                        const x1 = 100 + 80 * Math.cos(startRad);
                        const y1 = 100 + 80 * Math.sin(startRad);
                        const x2 = 100 + 80 * Math.cos(endRad);
                        const y2 = 100 + 80 * Math.sin(endRad);
                        
                        const largeArcFlag = angle > 180 ? 1 : 0;
                        
                        const pathData = [
                          `M 100 100`,
                          `L ${x1} ${y1}`,
                          `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                          `Z`
                        ].join(' ');
                        
                        return (
                          <path
                            key={idx}
                            d={pathData}
                            fill={cat.color}
                            stroke="white"
                            strokeWidth="2"
                          />
                        );
                      });
                    })()
                  )}
                </svg>
              </div>

              <div className={styles.legendContainer}>
                {categoryData.map((cat, idx) => (
                  <div key={idx} className={styles.legendItem}>
                    <div
                      className={styles.legendColor}
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className={styles.legendText}>
                      {cat.icon} {cat.name}
                    </span>
                    <span className={styles.legendValue}>
                      ${(cat.value / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.headerRow}>
          <h2 className={styles.subheading}>Recent Transactions</h2>
          <button
            className={styles.linkBtn}
            onClick={() => router.push('/transactions')}
          >
            View All →
          </button>
        </div>
        <div className={styles.emptyState}>
          No recent transactions available yet.
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.subheading}>Quick Actions</h2>
        <p className={styles.subtitle}>Perform common tasks easily.</p>

        <div className={styles.buttonGroup}>
          <button
            className={styles.primaryBtn}
            onClick={() => router.push('/transactions')}
          >
            + Add New Transaction
          </button>
          <button className={styles.secondaryBtn}>Set New Savings Goal</button>
        </div>
      </section>
    </div>
  );
}