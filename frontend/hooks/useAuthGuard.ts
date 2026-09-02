"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function useAuthGuard() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const requireAuth = (callbackOrUrl?: string | (() => void)) => {
    if (!isAuthenticated) {
      router.push("/login");
      return false;
    }
    if (typeof callbackOrUrl === "string") {
      router.push(callbackOrUrl);
    } else if (typeof callbackOrUrl === "function") {
      callbackOrUrl();
    }
    return true;
  };

  return { requireAuth, isAuthenticated, isLoading };
}
