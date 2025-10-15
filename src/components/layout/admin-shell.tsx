"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileQuestion, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useSupabase } from "@/components/providers/supabase-provider";

const navigation = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/exams",
    label: "Kelola Tryout",
    icon: FileQuestion,
  },
];

type AdminShellProps = {
  children: React.ReactNode;
};

export const AdminShell = ({ children }: AdminShellProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useSupabase();
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);

  const handleLogout = async () => {
    await signOut(supabase);
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="hidden w-64 shrink-0 border-r bg-background/70 backdrop-blur lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-lg font-semibold text-primary">
            PahamPajak Admin
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t px-4 py-5 text-sm text-muted-foreground">
          <div className="mb-2 font-medium text-foreground">
            {session?.user.email ?? "Admin"}
          </div>
          <div>Konsol konten tryout</div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-background/80 px-4 shadow-sm backdrop-blur lg:px-8">
          <div className="flex items-center gap-4 lg:hidden">
            <span className="text-base font-semibold text-primary">
              PahamPajak Admin
            </span>
          </div>

          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="hidden flex-col text-right text-xs text-muted-foreground sm:flex">
              <span className="font-semibold text-foreground">
                {session?.user.email ?? "Admin"}
              </span>
              <span>Hak akses: Administrator</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
};
