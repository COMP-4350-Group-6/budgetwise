"use client";

import React from "react";
import styles from "./modals.module.css";
import { Upload } from "lucide-react";
import { TRANSACTION_STRINGS } from "@/constants/strings";
import type { CreateTransactionInput } from "@budget/schemas";

interface ImportCsvModalProps {
  show: boolean;
  onClose: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImport: () => void;

  csvFile: File | null;
  parsedTransactions: CreateTransactionInput[];
  parseErrors: Array<{ row: number; error: string }>;
  importResult: {
    imported: number;
    failed: number;
    errors: Array<{ index: number; error: string; data: unknown }>;
  } | null;
  importing: boolean;
}

export default function ImportCsvModal({
  show,
  onClose,
  onFileSelect,
  onImport,
  csvFile,
  parsedTransactions,
  parseErrors,
  importResult,
  importing,
}: ImportCsvModalProps) {
  if (!show) return null;

  return (
    <div className={styles.modal} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "850px", maxHeight: "90vh", overflow: "auto" }}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {TRANSACTION_STRINGS.labels.importCsv}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* ===== UPLOAD ===== */}
        <div style={{ marginBottom: "20px" }}>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
            Upload a CSV file with columns like{" "}
            <strong>amount</strong>, <strong>date</strong>, and{" "}
            <strong>description</strong>. Categories will be auto-assigned.
          </p>

          <input
            type="file"
            accept=".csv,.txt"
            onChange={onFileSelect}
            disabled={importing}
            style={{ marginBottom: "10px" }}
          />
          {csvFile && (
            <p style={{ fontSize: "12px", color: "#666" }}>
              Selected: {csvFile.name}
            </p>
          )}
        </div>

        {/* ===== PARSE ERRORS ===== */}
        {parseErrors.length > 0 && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              padding: "10px",
              marginBottom: "20px",
            }}
          >
            <strong style={{ color: "#c33" }}>
              Parse Errors ({parseErrors.length}):
            </strong>
            <ul style={{ paddingLeft: "20px", fontSize: "13px" }}>
              {parseErrors.slice(0, 10).map((err, idx) => (
                <li key={idx}>
                  Row {err.row}: {err.error}
                </li>
              ))}
              {parseErrors.length > 10 && (
                <li>...and {parseErrors.length - 10} more</li>
              )}
            </ul>
          </div>
        )}

        {/* ===== PREVIEW ===== */}
        {parsedTransactions.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <strong>
              Preview ({parsedTransactions.length} transactions ready):
            </strong>
            <div
              style={{
                marginTop: "10px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                maxHeight: "300px",
                overflow: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                }}
              >
                <thead style={{ backgroundColor: "#f9fafb" }}>
                  <tr>
                    <th
                      style={{
                        padding: "8px",
                        textAlign: "left",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        textAlign: "left",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      Amount
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        textAlign: "left",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {parsedTransactions.slice(0, 20).map((tx, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: "8px" }}>
                        {tx.occurredAt instanceof Date
                          ? tx.occurredAt.toLocaleDateString()
                          : new Date(tx.occurredAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "8px" }}>
                        ${(tx.amountCents / 100).toFixed(2)}
                      </td>
                      <td style={{ padding: "8px" }}>{tx.note || "-"}</td>
                    </tr>
                  ))}
                  {parsedTransactions.length > 20 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center", padding: "8px" }}>
                        ...and {parsedTransactions.length - 20} more
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== IMPORT RESULTS ===== */}
        {importResult && (
          <div
            style={{
              marginBottom: "20px",
              padding: "10px",
              backgroundColor: importResult.failed
                ? "#fff8e1"
                : "#e6f7e6",
              borderRadius: "6px",
            }}
          >
            <strong>Results:</strong>
            <ul style={{ fontSize: "13px", paddingLeft: "20px" }}>
              <li>✅ Imported: {importResult.imported}</li>
              {importResult.failed > 0 && (
                <>
                  <li>❌ Failed: {importResult.failed}</li>
                  {importResult.errors.slice(0, 5).map((err, idx) => (
                    <li key={idx}>
                      Row {err.index + 1}: {err.error}
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>
        )}

        {/* ===== ACTIONS ===== */}
        <div className={styles.formActions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={onClose}
            disabled={importing}
          >
            Cancel
          </button>
          {parsedTransactions.length > 0 && !importResult && (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={onImport}
              disabled={importing}
            >
              <Upload size={16} />
              {importing
                ? TRANSACTION_STRINGS.importCsv.importing
                : TRANSACTION_STRINGS.importCsv.importNow}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}