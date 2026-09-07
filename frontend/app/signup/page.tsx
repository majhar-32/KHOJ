"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup } = useAuth();

  const roleParam = searchParams.get("role")?.toLowerCase();
  const initialRole: "USER" | "ORGANIZER" = roleParam === "organizer" ? "ORGANIZER" : "USER";

  const [selectedRole, setSelectedRole] = useState<"USER" | "ORGANIZER">(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (roleParam === "organizer") {
      setSelectedRole("ORGANIZER");
    }
  }, [roleParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signup({
        name,
        email,
        password,
        role: selectedRole,
      });
      if (selectedRole === "ORGANIZER") {
        router.push("/dashboard/organizer/submit");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create account");
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
            Create an account
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Or{" "}
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              log in to your existing account
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
            {/* Segmented Control for Role */}
            <div className="flex p-1 bg-neutral-100 rounded-lg">
              <button
                type="button"
                onClick={() => setSelectedRole("USER")}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  selectedRole === "USER"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                Find events
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("ORGANIZER")}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  selectedRole === "ORGANIZER"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                Publish events
              </button>
            </div>

            <div className="space-y-4">
              <Input
                id="name"
                label={selectedRole === "ORGANIZER" ? "Organization Name" : "Full Name"}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={selectedRole === "ORGANIZER" ? "e.g. DU IT Society" : "e.g. John Doe"}
              />
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
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-64px)] bg-neutral-50 flex items-center justify-center">Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
