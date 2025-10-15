"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/services/authService";
import PasswordRequirements, { isPasswordValid } from "@/components/validation/PasswordRequirement";
import styles from "./signup.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [isPasswordOk, setIsPasswordOk] = useState(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const confirmPassword = String(formData.get("confirm-password") ?? "");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (!isPasswordValid(password)) {
      setError("Password does not meet one or more requirements.");
      setIsLoading(false);
      return;
    }

    try {
      await authService.signup(email, password, name);
      router.push("/login");
    } catch (err) {
      console.error("Signup failed:", err);
      setError("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.shell}>
      <form onSubmit={handleSignup} className={styles.form}>
        <h2 className={styles.heading}>Create Your Account</h2>

        {error && <p className={styles.error}>{error}</p>}

        {/* Full Name */}
        <div>
          <label htmlFor="name" className={styles.label}>
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="John Doe"
            className={styles.input}
            required
          />
        </div>

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
              className={`${styles.passwordInput} ${
                !isPasswordOk && password.length > 0 ? styles.invalidInput : ""
              }`}
              required
              value={password}
              onChange={(e) => {
                const newPass = e.target.value;
                setPassword(newPass);
                setIsPasswordOk(isPasswordValid(newPass));
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className={styles.toggleBtn}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>


        {/* Confirm Password */}
        <div>
          <label htmlFor="confirm-password" className={styles.label}>
            Confirm Password
          </label>
          <div className={styles.passwordWrapper}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirm-password"
              name="confirm-password"
              placeholder="••••••••"
              className={styles.passwordInput}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className={styles.toggleBtn}
              aria-label="Toggle confirm password visibility"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

   {/* Password requirements */}
          <PasswordRequirements password={password} />
        </div>

        
        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={styles.submitBtn}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>

        {/* Login Link */}
        <p className={styles.footerText}>
          Already have an account?{" "}
          <Link href="/login" className={styles.loginLink}>
            Sign in here
          </Link>
        </p>
      </form>
    </div>
  );
}