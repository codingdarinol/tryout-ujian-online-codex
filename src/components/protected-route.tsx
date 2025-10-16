"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";

type UserRole = Database["public"]["Enums"]["user_role"];

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
};

export const ProtectedRoute = ({
  children,
  allowedRoles = ["admin"],
}: ProtectedRouteProps) => {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const profile = useAuthStore((state) => state.profile);
  const roleKey = allowedRoles.slice().sort().join("|");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (status === "authenticated" && profile) {
      if (allowedRoles.includes(profile.role)) {
        return;
      }

      const fallbackRoute = profile.role === "admin" ? "/admin" : "/dashboard";
      router.replace(fallbackRoute);
    }
  }, [status, profile, roleKey, router, allowedRoles]);

  if (status === "idle" || status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (
    status === "authenticated" &&
    profile &&
    allowedRoles.includes(profile.role)
  ) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};
