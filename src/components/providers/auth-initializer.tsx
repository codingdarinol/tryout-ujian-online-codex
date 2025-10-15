"use client";

import { useEffect } from "react";
import { useSupabase } from "./supabase-provider";
import { useAuthStore } from "@/stores/auth-store";

export const AuthInitializer = () => {
  const supabase = useSupabase();
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize(supabase).catch((error) => {
      console.error("Failed to initialize auth state", error);
    });
  }, [initialize, supabase]);

  return null;
};
