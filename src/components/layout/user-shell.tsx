"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useAuthStore } from "@/stores/auth-store";

type UserShellProps = {
  children: React.ReactNode;
};

export const UserShell = ({ children }: UserShellProps) => {
  const router = useRouter();
  const supabase = useSupabase();
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const signOut = useAuthStore((state) => state.signOut);

  const handleLogout = async () => {
    await signOut(supabase);
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/10">
      <header className="border-b bg-background px-4 py-4 shadow-sm sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              Portal Tryout PahamPajak
            </p>
            <p className="text-xs text-muted-foreground">
              Persiapkan diri Anda dengan latihan terarah.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right text-xs sm:block">
              <p className="font-semibold text-foreground">
                {profile?.full_name ?? session?.user.email ?? "Peserta"}
              </p>
              <p className="text-muted-foreground">
                Hak akses: {profile?.role ?? "user"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-6">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
};
