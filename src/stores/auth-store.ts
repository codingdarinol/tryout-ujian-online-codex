"use client";

import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import type { TypedSupabaseClient } from "@/lib/supabase/client";
import type { ProfileRow } from "@/lib/supabase/types";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  profile: ProfileRow | null;
  initialize: (client: TypedSupabaseClient) => Promise<void>;
  signIn: (
    client: TypedSupabaseClient,
    params: { email: string; password: string }
  ) => Promise<void>;
  signOut: (client: TypedSupabaseClient) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "idle",
  session: null,
  profile: null,
  async initialize(client) {
    const currentStatus = get().status;
    if (currentStatus === "loading") {
      return;
    }

    set({ status: "loading" });

    const {
      data: { session },
      error: sessionError,
    } = await client.auth.getSession();

    if (sessionError) {
      console.error("Failed to load session", sessionError);
      set({ status: "unauthenticated", session: null, profile: null });
      return;
    }

    if (!session) {
      set({ status: "unauthenticated", session: null, profile: null });
      return;
    }

    const profile = await fetchProfile(client, session);

    if (!profile) {
      console.warn("Profile not found for authenticated user", session.user.id);
      set({ status: "unauthenticated", session: null, profile: null });
      return;
    }

    set({ status: "authenticated", session, profile });
  },
  async signIn(client, params) {
    set({ status: "loading" });

    const { email, password } = params;
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      set({ status: "unauthenticated", session: null, profile: null });
      throw error ?? new Error("Unable to sign in with provided credentials.");
    }

    const profile = await fetchProfile(client, data.session);

    if (!profile) {
      await client.auth.signOut();
      set({ status: "unauthenticated", session: null, profile: null });
      throw new Error("Profil pengguna tidak ditemukan.");
    }

    set({ status: "authenticated", session: data.session, profile });
  },
  async signOut(client) {
    await client.auth.signOut();
    set({ status: "unauthenticated", session: null, profile: null });
  },
}));

async function fetchProfile(
  client: TypedSupabaseClient,
  session: Session
): Promise<ProfileRow | null> {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error) {
    console.error("Failed to load profile", error);
    return null;
  }

  return data;
}
