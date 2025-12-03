"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "@/app/services/authService";
import styles from "./login.module.css";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      await authService.login(email, password);
      router.push("/home");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid credentials or server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.shell}>
      <form onSubmit={handleLogin} className={styles.form}>
        {/* Header */}
        <h1 className={styles.heading}>BudgetWise</h1>
        
        {/* Error Message */}
        {error && <p className={styles.error}>{error}</p>}

        {/* Email */}
        <div>
          <label htmlFor="email" className={styles.label}>
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="john.doe@example.com"
            className={styles.input}
            required
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="••••••••"
              className={styles.passwordInput}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className={styles.toggleBtn}
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <EyeOff size={18} strokeWidth={1.8} />
              ) : (
                <Eye size={18} strokeWidth={1.8} />
              )}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <p className={styles.textCenter}>
          <Link href="#" className={styles.link}>
            Forgot password?
          </Link>
        </p>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={styles.submitBtn}
        >
          {isLoading ? (
            <svg
              className={styles.spinner}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          ) : (
            "Sign In"
          )}
        </button>

        {/* Sign Up Link */}
        <p className={styles.footerText}>
          Don’t have an account?{" "}
          <Link href="/signup" className={styles.signUpLink}>
            Sign up here
          </Link>
        </p>
      </form>
    </div>
  );
}