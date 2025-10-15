"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

let supabase: SupabaseClient<Database> | null = null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Environment variable NEXT_PUBLIC_SUPABASE_URL is not defined");
}

if (!supabaseAnonKey) {
  throw new Error(
    "Environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined"
  );
}

export const createBrowserSupabaseClient = (): SupabaseClient<Database> => {
  if (supabase) {
    return supabase;
  }

  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: "pahampajak.tryout.supabase.auth",
      autoRefreshToken: true,
    },
  });

  return supabase;
};

export type TypedSupabaseClient = SupabaseClient<Database>;
