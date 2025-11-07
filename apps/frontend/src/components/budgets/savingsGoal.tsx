"use client";

import React, { useState } from "react";
import styles from "./savingsGoal.module.css";
import { Trash2 } from "lucide-react";

interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
}

export default function SavingsGoal() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState<Goal | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Goal | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [form, setForm] = useState({
    name: "",
    target: "",
    saved: "",
  });

  const [fundsAmount, setFundsAmount] = useState("");

  // Save or edit goal
  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();

    const name = form.name.trim();
    const target = parseFloat(form.target);
    const saved = parseFloat(form.saved) || 0;

    if (!name || isNaN(target) || target <= 0) {
      alert("Please enter a valid goal name and amount.");
      return;
    }

    if (editingGoal) {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === editingGoal.id
            ? { ...g, name, target, saved: Math.min(saved, target) }
            : g
        )
      );
      setEditingGoal(null);
    } else {
      setGoals([
        ...goals,
        { id: crypto.randomUUID(), name, target, saved: Math.min(saved, target) },
      ]);
    }

    setForm({ name: "", target: "", saved: "" });
    setShowGoalModal(false);
  };

  // Add funds
  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddFundsModal) return;

    const amt = parseFloat(fundsAmount);
    if (isNaN(amt) || amt <= 0) return;

    setGoals((prev) =>
      prev.map((g) =>
        g.id === showAddFundsModal.id
          ? { ...g, saved: Math.min(g.saved + amt, g.target) }
          : g
      )
    );

    setFundsAmount("");
    setShowAddFundsModal(null);
  };

  // Confirm delete
  const confirmDeleteGoal = () => {
    if (showDeleteModal) {
      setGoals((prev) => prev.filter((g) => g.id !== showDeleteModal.id));
      setShowDeleteModal(null);
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setForm({
      name: goal.name,
      target: goal.target.toString(),
      saved: goal.saved.toString(),
    });
    setShowGoalModal(true);
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Savings & Goals</h3>
          <p className={styles.text}>
            Track progress towards your personal savings targets.
          </p>
        </div>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => setShowGoalModal(true)}
        >
          Set Goal
        </button>
      </div>

      {/* Goal list */}
      {goals.length === 0 ? (
        <p className={styles.noGoal}>No goals created yet.</p>
      ) : (
        <div className={styles.goalsGrid}>
          {goals.map((goal) => {
            const progress = (goal.saved / goal.target) * 100;

            return (
              <div key={goal.id} className={styles.goalCard}>
                <div className={styles.goalHeader}>
                  <div>
                    <h4 className={styles.goalName}>{goal.name}</h4>
                    <p className={styles.progressText}>
                      {progress.toFixed(1)}% complete
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(goal)}
                    className={styles.deleteBtn}
                    title="Delete Goal"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className={styles.progressBar}>
                  <div
                    className={`${styles.progressFill} ${
                      progress >= 100
                        ? styles.green
                        : progress >= 80
                        ? styles.yellow
                        : styles.yellow
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>

                <div className={styles.stats}>
                  <span>Saved: ${goal.saved.toFixed(2)}</span>
                  <span>Target: ${goal.target.toFixed(2)}</span>
                </div>

                <div className={styles.actions}>
                  <button
                    onClick={() => handleEditGoal(goal)}
                    className={styles.linkBtn}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setShowAddFundsModal(goal)}
                    className={styles.linkBtn}
                  >
                    Add Funds
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Goal Modal */}
      {showGoalModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowGoalModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingGoal ? "Edit Goal" : "Create Savings Goal"}
              </h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowGoalModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGoal}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Goal Name</label>
                <input
                  type="text"
                  className={styles.input}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Emergency Fund"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Target Amount ($)</label>
                <input
                  type="number"
                  className={styles.input}
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Amount Saved</label>
                <input
                  type="number"
                  className={styles.input}
                  value={form.saved}
                  onChange={(e) => setForm({ ...form, saved: e.target.value })}
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={() => setShowGoalModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  {editingGoal ? "Save Changes" : "Save Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {showAddFundsModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowAddFundsModal(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add Funds</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowAddFundsModal(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddFunds}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Amount to Add ($)</label>
                <input
                  type="number"
                  className={styles.input}
                  value={fundsAmount}
                  onChange={(e) => setFundsAmount(e.target.value)}
                  placeholder="e.g. 50"
                  required
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={() => setShowAddFundsModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  Add Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowDeleteModal(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Delete Goal</h2>
            <p className={styles.deleteText}>
              Are you sure you want to delete the goal "{showDeleteModal.name}"?
              This action cannot be undone.
            </p>
            <div className={styles.formActions}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => setShowDeleteModal(null)}
              >
                Cancel
              </button>
              <button
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={confirmDeleteGoal}
              >
                Delete Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}