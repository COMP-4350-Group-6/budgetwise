"use client";

import React from "react";
import styles from "./savingsGoals.module.css";

interface Props {
  goals?: {
    id: string;
    name: string;
    targetCents: number;
    savedCents: number;
  }[];
  formatMoney: (cents: number, currency?: string) => string;
}

export default function SavingsGoalsSection({ goals = [], formatMoney }: Props) {
  const hasGoals = goals && goals.length > 0;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Savings Goals</h2>

      {hasGoals ? (
        <div className={styles.goalsGrid}>
          {goals.map((goal) => {
            const progress =
              goal.targetCents > 0
                ? Math.min((goal.savedCents / goal.targetCents) * 100, 100)
                : 0;

            return (
              <div key={goal.id} className={styles.goalCard}>
                <h4 className={styles.goalTitle}>{goal.name}</h4>
                <p className={styles.goalAmount}>
                  Target: {formatMoney(goal.targetCents, "CAD")}
                </p>
                <p className={styles.goalSaved}>
                  Saved: {formatMoney(goal.savedCents, "CAD")}
                </p>

                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className={styles.progressLabel}>{progress.toFixed(0)}% achieved</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎯</div>
          <h3 className={styles.emptyTitle}>No Savings Goals Yet</h3>
          <p className={styles.emptyText}>
            Set your first savings goal to plan for future purchases or expenses.
          </p>
          <button className={styles.ctaBtn}>+ Create Goal</button>
        </div>
      )}
    </section>
  );
}
