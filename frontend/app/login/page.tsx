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
    <div className="min-h-[calc(100vh-64px)] bg-bg-page flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-accent hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <Card className="p-6 sm:p-8 border-border-default bg-bg-surface shadow-xl">
          {error && (
            <div className="mb-4 p-3 text-sm text-danger bg-danger/15 border border-danger/30 rounded-lg">
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
          <p className="mt-4 text-xs text-text-muted text-center">
            Note: Admin and Organizer accounts log in using the same form — your role is determined automatically.
          </p>

          <div className="mt-5 pt-4 border-t border-border-default text-center">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
              Quick Demo Logins
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("rahim@example.com");
                  setPassword("password123");
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-bg-surface-secondary hover:bg-accent/15 text-text-secondary hover:text-accent border border-border-default cursor-pointer transition-colors"
              >
                User: Rahim
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("sadia@example.com");
                  setPassword("password123");
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-bg-surface-secondary hover:bg-accent/15 text-text-secondary hover:text-accent border border-border-default cursor-pointer transition-colors"
              >
                Organizer: Sadia
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@khoj.dev");
                  setPassword("password123");
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-bg-surface-secondary hover:bg-accent/15 text-text-secondary hover:text-accent border border-border-default cursor-pointer transition-colors"
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
