"use client";

import { Check, X } from "lucide-react";
import styles from "./PasswordRequirements.module.css";

export const requirements = [
  { re: /^.{8,25}$/, label: "Between 8 and 25 characters long" },
  { re: /[0-9]/, label: "Contains at least one number" },
  { re: /[A-Z]/, label: "Contains at least one uppercase letter" },
  { re: /[!@#$%^&*(),.?\":{}|<>]/, label: "Contains at least one special symbol" },
];

export function isPasswordValid(password: string): boolean {
  return requirements.every((req) => req.re.test(password));
}

export default function PasswordRequirements({ password }: { password: string }) {
  return (
    <ul className={styles.list} data-testid="pw-req-list">
      {requirements.map((req, i) => {
        const meets = req.re.test(password);
        return (
          <li
            key={i}
            role="listitem"
            className={meets ? styles.valid : styles.invalid}
            data-state={meets ? "valid" : "invalid"}   
            data-label={req.label}                 
          >
            {meets ? <Check size={14} /> : <X size={14} />}
            <span>{req.label}</span>
          </li>
        );
      })}
    </ul>
  );
}