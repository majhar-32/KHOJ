"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await login({ email, password });
      if (user.role === "ADMIN") {
        router.push("/dashboard/admin");
      } else if (user.role === "ORGANIZER") {
        router.push("/dashboard/organizer");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-neutral-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary-600 hover:text-primary-500">
              Sign up
            </Link>
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 text-sm text-error-700 bg-error-50 border border-error-200 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                id="email"
                label="Email address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <Input
                id="password"
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Log In"}
            </Button>
          </form>
          <p className="mt-4 text-xs text-neutral-500 text-center">
            Note: Admin and Organizer accounts log in using the same form — your role is determined automatically.
          </p>

          <div className="mt-5 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-center">
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Quick Demo Logins
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("rahim@example.com");
                  setPassword("password123");
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-primary-50 dark:hover:bg-primary-950/50 text-neutral-700 dark:text-neutral-300 hover:text-primary-600 border border-neutral-200 dark:border-neutral-700 cursor-pointer transition-colors"
              >
                User: Rahim
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("sadia@example.com");
                  setPassword("password123");
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-primary-50 dark:hover:bg-primary-950/50 text-neutral-700 dark:text-neutral-300 hover:text-primary-600 border border-neutral-200 dark:border-neutral-700 cursor-pointer transition-colors"
              >
                Organizer: Sadia
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@khoj.dev");
                  setPassword("password123");
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-primary-50 dark:hover:bg-primary-950/50 text-neutral-700 dark:text-neutral-300 hover:text-primary-600 border border-neutral-200 dark:border-neutral-700 cursor-pointer transition-colors"
              >
                Admin
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
