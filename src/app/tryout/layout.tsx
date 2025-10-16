"use client";

import { ProtectedRoute } from "@/components/protected-route";

export default function TryoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["user", "admin"]}>
      {children}
    </ProtectedRoute>
  );
}
