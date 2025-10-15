"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export default function Home() {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const profile = useAuthStore((state) => state.profile);

  useEffect(() => {
    if (status === "authenticated" && profile) {
      const target = profile.role === "admin" ? "/admin" : "/dashboard";
      router.replace(target);
      return;
    }

    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status, profile]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/20">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Mengarahkan ke halaman yang sesuai…
        </p>
      </div>
    </main>
  );
}
