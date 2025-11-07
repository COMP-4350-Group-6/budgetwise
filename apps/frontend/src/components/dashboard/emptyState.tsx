"use client";

import styles from "@/app/(protected)/home/home.module.css";

export default function EmptyState({
  message,
  actionText,
  onAction,
}: {
  message: string;
  actionText: string;
  onAction: () => void;
}) {
  return (
    <div className={`${styles.cardBase} ${styles.emptyWrap}`}>
      <div className={styles.emptyMsg}>{message}</div>
      <button className={styles.emptyBtn} onClick={onAction}>
        {actionText}
      </button>
    </div>
  );
}