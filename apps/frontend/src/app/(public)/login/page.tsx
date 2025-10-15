"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "@/app/services/authService";

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
    <div className="flex justify-center min-h-screen items-center bg-shade-light">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-lg space-y-3 bg-inherit"
      >
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Welcome Back
        </h2>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm text-center mb-2">{error}</p>
        )}

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="john.doe@example.com"
            className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
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
        <p className="text-center text-sm text-gray-600">
          <Link
            href="#"
            className="text-green-mid hover:text-green-dark font-medium"
          >
            Forgot password?
          </Link>
        </p>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`
            w-full text-sm rounded-full py-2.5 flex items-center justify-center 
            transition font-semibold
            bg-green-pale text-green-dark
            hover:bg-green-mid hover:text-white
            disabled:cursor-not-allowed
            disabled:bg-gray-400
          `}
        >
          {isLoading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
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
        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <Link
            href="/signup"
            className="text-green-mid font-semibold hover:text-green-dark"
          >
            Sign up here
          </Link>
        </p>
      </form>
    </div>
  );
}
