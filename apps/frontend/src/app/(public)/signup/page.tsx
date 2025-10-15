"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/services/authService";
import PasswordRequirements, { isPasswordValid } from "@/components/signup/PasswordRequirement";

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
    <div className="flex justify-center min-h-screen items-center bg-shade-light">
      <form onSubmit={handleSignup} className="w-full max-w-lg space-y-3 bg-inherit">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Create Your Account
        </h2>

        {/* Global Error Message */}
        {error && (
          <p className="text-red-500 text-sm text-center mb-2 font-medium">{error}</p>
        )}

        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="John Doe"
            className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="••••••••"
              className={`w-full border rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 ${
                !isPasswordOk && password.length > 0
                  ? "border-red-500 focus:ring-red-300"
                  : "border-gray-300 focus:ring-green-mid"
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
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>


        {/* Confirm Password */}
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirm-password"
              name="confirm-password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-mid"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
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
          className={`
            w-full text-sm rounded-full py-2.5 flex items-center justify-center 
            transition font-semibold
            bg-green-pale text-green-dark
            hover:bg-green-mid hover:text-white
            disabled:cursor-not-allowed
            disabled:bg-gray-400
          `}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-green-mid hover:text-green-dark">
            Sign in here
          </Link>
        </p>
      </form>
    </div>
  );
}