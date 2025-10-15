"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSupabase } from "@/components/providers/supabase-provider";
import {
  createQuestion,
  deleteQuestionById,
  listQuestions,
  updateQuestion,
} from "./api";
import type { QuestionFormValues } from "./types";

const questionKeys = {
  list: (examId: string) => ["questions", examId] as const,
};

export const useQuestionsQuery = (examId: string, enabled = true) => {
  const supabase = useSupabase();

  return useQuery({
    queryKey: questionKeys.list(examId),
    queryFn: () => listQuestions(supabase, examId),
    enabled,
  });
};

export const useCreateQuestionMutation = (examId: string) => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: QuestionFormValues) =>
      createQuestion(supabase, examId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: questionKeys.list(examId),
      });
      toast.success("Soal baru berhasil ditambahkan.");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Gagal menambahkan soal.";
      toast.error(message);
    },
  });
};

export const useUpdateQuestionMutation = (examId: string) => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      payload,
    }: {
      questionId: string;
      payload: QuestionFormValues;
    }) => updateQuestion(supabase, questionId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: questionKeys.list(examId),
      });
      toast.success("Soal berhasil diperbarui.");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Gagal memperbarui soal.";
      toast.error(message);
    },
  });
};

export const useDeleteQuestionMutation = (examId: string) => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) => deleteQuestionById(supabase, questionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: questionKeys.list(examId),
      });
      toast.success("Soal berhasil dihapus.");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Gagal menghapus soal.";
      toast.error(message);
    },
  });
};
