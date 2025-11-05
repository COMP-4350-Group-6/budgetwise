"use client";

import React from "react";
import styles from "./modals.module.css";
import { TRANSACTION_STRINGS, GENERAL_STRINGS } from "@/constants/strings";

interface UploadInvoiceModalProps {
  show: boolean;
  onClose: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onParseInvoice: () => void;
  uploadedImage: string | null;
  uploadMessage: string;
  parsingInvoice: boolean;
  setUploadedImage: (v: string | null) => void;
  setUploadMessage: (v: string) => void;
}

/**
 * UploadInvoiceModal
 * ----------------------------------------------------------
 * Allows the user to upload and parse an invoice image.
 * Integrates with AI parsing for auto-filled transactions.
 * ----------------------------------------------------------
 */
export default function UploadInvoiceModal({
  show,
  onClose,
  onImageUpload,
  onParseInvoice,
  uploadedImage,
  uploadMessage,
  parsingInvoice,
  setUploadedImage,
  setUploadMessage,
}: UploadInvoiceModalProps) {
  if (!show) return null;

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* ===== Header ===== */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{TRANSACTION_STRINGS.add} - Upload Invoice</h2>
          <button
            className={styles.closeBtn}
            onClick={() => {
              onClose();
              setUploadedImage(null);
              setUploadMessage("");
            }}
          >
            ✕
          </button>
        </div>

        {/* ===== Upload Section ===== */}
        <div className={styles.uploadSection}>
          {!uploadedImage ? (
            <div className={styles.uploadArea}>
              <input
                type="file"
                accept="image/*"
                onChange={onImageUpload}
                className={styles.fileInput}
                id="invoice-upload"
              />
              <label htmlFor="invoice-upload" className={styles.uploadLabel}>
                <div className={styles.uploadIcon}>📸</div>
                <p>{TRANSACTION_STRINGS.add} Image</p>
                <p className={styles.uploadHint}>PNG, JPG up to 5MB</p>
              </label>
            </div>
          ) : (
            <div className={styles.imagePreview}>
              <img
                src={uploadedImage}
                alt="Invoice preview"
                className={styles.previewImage}
              />
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => setUploadedImage(null)}
              >
                Change Image
              </button>
            </div>
          )}
        </div>

        {/* ===== Upload Message ===== */}
        {uploadMessage && <div className={styles.message}>{uploadMessage}</div>}

        {/* ===== Actions ===== */}
        <div className={styles.formActions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => {
              onClose();
              setUploadedImage(null);
              setUploadMessage("");
            }}
          >
            {GENERAL_STRINGS.actions.cancel}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={onParseInvoice}
            disabled={!uploadedImage || parsingInvoice}
          >
            {parsingInvoice
              ? GENERAL_STRINGS.status.loading
              : "Parse Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}