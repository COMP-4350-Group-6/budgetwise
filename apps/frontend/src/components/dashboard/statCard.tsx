"use client";

import React from "react";
import styles from "./statCard.module.css";
import { Wallet, TrendingDown, TrendingUp, ShieldCheck } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon?: "budget" | "spent" | "remaining" | "health";
  status?: "good" | "warning" | "bad" | "neutral";
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, status = "neutral", subtitle }) => {
  const iconMap = {
    budget: <Wallet size={18} color="#4E7C66" />,
    spent: <TrendingDown size={18} color="#4E7C66" />,
    remaining: <TrendingUp size={18} color="#4E7C66" />,
    health: <ShieldCheck size={18} color="#4E7C66" />,
  };

  const statusClass =
    status === "good"
      ? styles.statusGood
      : status === "warning"
      ? styles.statusWarning
      : status === "bad"
      ? styles.statusBad
      : styles.statusNeutral;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>{icon && iconMap[icon]}</div>
        <p className={styles.title}>{title}</p>
      </div>

      <h2 className={styles.value}>{value}</h2>

      {subtitle && (
        <div className={`${styles.statusRow} ${statusClass}`}>
          <span className={styles.statusDot}></span>
          <span className={styles.subtitle}>{subtitle}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;