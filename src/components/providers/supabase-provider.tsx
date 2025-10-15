"use client";

import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";
import {
  createBrowserSupabaseClient,
  type TypedSupabaseClient,
} from "@/lib/supabase/client";

const SupabaseContext = createContext<TypedSupabaseClient | null>(null);

export const SupabaseProvider = ({ children }: PropsWithChildren) => {
  const client = useMemo(() => createBrowserSupabaseClient(), []);

  return (
    <SupabaseContext.Provider value={client}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = (): TypedSupabaseClient => {
  const context = useContext(SupabaseContext);

  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }

  return context;
};
