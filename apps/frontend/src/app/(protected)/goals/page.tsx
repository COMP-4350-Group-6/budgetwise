"use client";

import React, { useState } from "react";
import styles from "./goals.module.css";
import { useRouter } from "next/navigation";
import { Plus, ArrowLeft, Target, Calendar, DollarSign } from "lucide-react";

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<
    { id: string; name: string; target: number; saved: number; deadline: string }[]
  >([]);
  const [newGoal, setNewGoal] = useState({ name: "", target: "", deadline: "" });
  const [adding, setAdding] = useState(false);

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.target) return;
    setGoals([
      ...goals,
      {
        id: Date.now().toString(),
        name: newGoal.name,
        target: Number(newGoal.target),
        saved: 0,
        deadline: newGoal.deadline || "No deadline",
      },
    ]);
    setNewGoal({ name: "", target: "", deadline: "" });
    setAdding(false);
  };

  const handleSaveProgress = (id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, saved: Math.min(g.saved + amount, g.target) }
          : g
      )
    );
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </button>
        <h1 className={styles.pageTitle}>Your Savings Goals</h1>
      </div>

      {!adding ? (
        <div className={styles.headerActions}>
          <button className={styles.primaryBtn} onClick={() => setAdding(true)}>
            <Plus size={16} /> Add New Goal
          </button>
        </div>
      ) : (
        <div className={styles.addCard}>
          <h3 className={styles.formTitle}>Set a New Goal</h3>
          <input
            type="text"
            placeholder="Goal Name (e.g. Vacation Fund)"
            className={styles.input}
            value={newGoal.name}
            onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
          />
          <div className={styles.row}>
            <div className={styles.field}>
              <DollarSign size={16} />
              <input
                type="number"
                placeholder="Target Amount ($)"
                className={styles.inputInline}
                value={newGoal.target}
                onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              <Calendar size={16} />
              <input
                type="date"
                className={styles.inputInline}
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button className={styles.btnSecondary} onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button className={styles.btnPrimary} onClick={handleAddGoal}>
              Save Goal
            </button>
          </div>
        </div>
      )}

      <div className={styles.goalsGrid}>
        {goals.length === 0 ? (
          <div className={styles.emptyState}>
            <Target size={48} />
            <p>No goals yet. Create one to start saving!</p>
          </div>
        ) : (
          goals.map((g) => {
            const progress = (g.saved / g.target) * 100;
            return (
              <div key={g.id} className={styles.goalCard}>
                <div className={styles.goalHeader}>
                  <h3>{g.name}</h3>
                  <p className={styles.deadline}>
                    {g.deadline === "No deadline" ? "No deadline" : `Due: ${g.deadline}`}
                  </p>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${Math.min(progress, 100)}%`,
                      background:
                        progress >= 100
                          ? "#4E7C66"
                          : "linear-gradient(90deg, #A3C1AD, #4E7C66)",
                    }}
                  />
                </div>
                <p className={styles.amounts}>
                  ${g.saved.toLocaleString()} / ${g.target.toLocaleString()}
                </p>
                <button
                  className={styles.addProgressBtn}
                  onClick={() => handleSaveProgress(g.id, 100)}
                >
                  + Add $100
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}