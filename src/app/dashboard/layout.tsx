"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { UserShell } from "@/components/layout/user-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <UserShell>{children}</UserShell>
    </ProtectedRoute>
  );
}
