"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { Role } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const { setRole } = useRole();
  const [selectedRole, setSelectedRole] = useState<Role>("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Temporary stand-in for real auth: set dev role and redirect
    setRole(selectedRole);
    router.push("/");
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Segmented Control for Role */}
            <div className="flex p-1 bg-neutral-100 rounded-lg">
              <button
                type="button"
                onClick={() => setSelectedRole("user")}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  selectedRole === "user"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                Find events
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("organizer")}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  selectedRole === "organizer"
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
                label={selectedRole === "organizer" ? "Organization Name" : "Full Name"}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={selectedRole === "organizer" ? "e.g. DU IT Society" : "e.g. John Doe"}
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

            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
