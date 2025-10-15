"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { AdminShell } from "@/components/layout/admin-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}
