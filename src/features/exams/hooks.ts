"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useAuthStore } from "@/stores/auth-store";
import {
  createExam,
  deleteExam,
  getExam,
  listExams,
  listPublishedExams,
  setExamPublishState,
  updateExam,
} from "./api";
import type { ExamFormValues } from "./types";

const examKeys = {
  all: ["exams"] as const,
  detail: (id: string) => ["exams", id] as const,
  published: (packages: readonly string[]) =>
    ["exams", "published", packages] as const,
};

export const useExamsQuery = () => {
  const supabase = useSupabase();

  return useQuery({
    queryKey: examKeys.all,
    queryFn: () => listExams(supabase),
  });
};

export const useExamQuery = (id: string, enabled = true) => {
  const supabase = useSupabase();

  return useQuery({
    queryKey: examKeys.detail(id),
    queryFn: () => getExam(supabase, id),
    enabled,
  });
};

export const useCreateExamMutation = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const session = useAuthStore((state) => state.session);

  return useMutation({
    mutationFn: async (payload: ExamFormValues) => {
      const userId = session?.user.id;
      if (!userId) {
        throw new Error("Session tidak ditemukan. Silakan masuk ulang.");
      }

      return createExam(supabase, payload, userId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examKeys.all });
      toast.success("Tryout berhasil dibuat.");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Gagal membuat tryout baru.";
      toast.error(message);
    },
  });
};

export const useUpdateExamMutation = (id: string) => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExamFormValues) => updateExam(supabase, id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examKeys.all });
      void queryClient.invalidateQueries({ queryKey: examKeys.detail(id) });
      toast.success("Informasi tryout diperbarui.");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Gagal memperbarui tryout.";
      toast.error(message);
    },
  });
};

export const useDeleteExamMutation = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExam(supabase, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examKeys.all });
      toast.success("Tryout berhasil dihapus.");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Gagal menghapus tryout.";
      toast.error(message);
    },
  });
};

export const usePublishToggleMutation = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; nextState: boolean }) =>
      setExamPublishState(supabase, params.id, params.nextState),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: examKeys.all });
      void queryClient.invalidateQueries({
        queryKey: examKeys.detail(variables.id),
      });
      toast.success(
        variables.nextState
          ? "Tryout dipublikasikan."
          : "Tryout diubah menjadi draft."
      );
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Gagal mengubah status publik.";
      toast.error(message);
    },
  });
};

export const usePublishedExamsQuery = (
  packageIds: string[] | null | undefined,
  enabled = true
) => {
  const supabase = useSupabase();
  const normalizedPackages =
    packageIds
      ?.filter((pkg): pkg is string => Boolean(pkg && pkg.length > 0))
      .sort() ?? [];

  return useQuery({
    queryKey: examKeys.published(normalizedPackages),
    queryFn: () =>
      listPublishedExams(supabase, {
        packageIds: packageIds ?? null,
      }),
    enabled: enabled && packageIds !== undefined,
  });
};
