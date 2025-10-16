"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpenCheck,
  GraduationCap,
  Home,
  ListChecks,
  LogOut,
  MonitorPlay,
  PackageCheck,
  Settings,
  ShoppingCart,
  SquareStack,
} from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useSupabase } from "@/components/providers/supabase-provider";

type ExamWorkspaceShellProps = {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
};

type NavItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  active?: boolean;
};

const mainMenus: NavItem[] = [
  { label: "Home", icon: Home, href: "/dashboard" },
  { label: "Paket Intensif", icon: GraduationCap },
  { label: "Kelas Reguler", icon: MonitorPlay },
  { label: "Tryout", icon: ListChecks },
  { label: "Webinar", icon: SquareStack },
  { label: "Latihan Soal", icon: BookOpenCheck },
  { label: "Pembelian", icon: ShoppingCart },
  {
    label: "Paket Saya",
    icon: PackageCheck,
    active: true,
    href: "/dashboard",
  },
];

export const ExamWorkspaceShell = ({
  children,
  rightSidebar,
}: ExamWorkspaceShellProps) => {
  const router = useRouter();
  const supabase = useSupabase();
  const profile = useAuthStore((state) => state.profile);
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);

  const avatarInitial = useMemo(() => {
    const source = profile?.full_name ?? session?.user.email ?? "P";
    return source.trim().charAt(0).toUpperCase();
  }, [profile, session]);

  const handleLogout = async () => {
    await signOut(supabase);
    router.replace("/login");
  };

  const mobileMenus = useMemo(() => {
    return mainMenus.map((menu) => ({
      ...menu,
      href: menu.href ?? "#",
    }));
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F8FA] text-slate-900">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-200 text-lg font-bold uppercase text-emerald-700 shadow-sm">
              P
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Pahampajak
              </p>
              <p className="text-xs text-slate-400">
                Portal Tryout Perpajakan Indonesia
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-emerald-600"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="hidden text-right text-sm sm:block">
                <p className="font-semibold text-slate-700">
                  {profile?.full_name ?? session?.user.email ?? "Peserta"}
                </p>
                <p className="text-xs text-slate-400">Sedang mengikuti tryout</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white shadow-md">
                {avatarInitial}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-[80px]">
        <div className="mx-auto block w-full max-w-[1380px] px-4 pb-5 lg:hidden">
          <div className="flex gap-3 overflow-x-auto rounded-2xl border border-emerald-100 bg-white p-3 shadow">
            {mobileMenus.map((menu) => {
              const Icon = menu.icon;
              return (
                <button
                  key={menu.label}
                  type="button"
                  className={cn(
                    "flex min-w-[120px] flex-col items-start gap-2 rounded-xl border px-3 py-2 text-left text-xs shadow-sm transition",
                    menu.active
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-100 bg-white text-slate-500"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{menu.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-[1380px] gap-6 px-4 pb-12 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)_320px] lg:px-6">
          <aside className="hidden lg:block">
            <div className="sticky top-[116px] flex h-[calc(100vh-140px)] flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg shadow-emerald-100/50">
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Menu Utama
                  </p>
                  <nav className="mt-3 space-y-1">
                    {mainMenus.map((menu) => {
                      const Icon = menu.icon;
                      return (
                        <Link
                          key={menu.label}
                          href={menu.href ?? "#"}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                            menu.active
                              ? "bg-emerald-100 text-emerald-700 shadow-sm"
                              : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{menu.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
                <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm shadow-inner">
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">
                    Sub-menu
                  </p>
                  <div className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-emerald-600 shadow-sm">
                    Try Out USKP
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-emerald-100 px-5 py-6">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Pengaturan
                  </p>
                  <Link
                    href="#"
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <Settings className="h-4 w-4" />
                    Akun Saya
                  </Link>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="default"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-200 transition hover:bg-emerald-600"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </aside>

          <main className="min-w-0">{children}</main>

          {rightSidebar && (
            <aside className="hidden xl:block">
              <div className="sticky top-[116px] space-y-6">
                {rightSidebar}
              </div>
            </aside>
          )}
        </div>

        {rightSidebar && (
          <div className="mx-auto w-full max-w-[1380px] space-y-6 px-4 pb-12 xl:hidden">
            {rightSidebar}
          </div>
        )}
      </div>
    </div>
  );
};
