"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type PropsWithChildren } from "react";
import { SupabaseProvider } from "./supabase-provider";
import { AuthInitializer } from "./auth-initializer";
import { Toaster } from "@/components/ui/sonner";

export const AppProviders = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30,
            gcTime: 1000 * 60 * 5,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SupabaseProvider>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer />
        {children}
        <Toaster />
      </QueryClientProvider>
    </SupabaseProvider>
  );
};
