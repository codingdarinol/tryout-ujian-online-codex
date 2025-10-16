"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSupabase } from "@/components/providers/supabase-provider";
import {
  completeExamSession,
  getExamDetail,
  getResultBySessionId,
  recordExamAnswer,
  startExamSession,
} from "./api";
import type {
  ExamDetail,
  ExamResultRow,
  ExamSessionRow,
} from "./types";

const examDetailKey = (examId: string) => ["exam-detail", examId] as const;
const examSessionKey = (examId: string) => ["exam-session", examId] as const;
const examResultKey = (sessionId: string) => ["exam-result", sessionId] as const;
const examLatestResultKey = (examId: string) => ["exam-result", "latest", examId] as const;

export const useExamDetailQuery = (examId: string | null) => {
  const supabase = useSupabase();

  return useQuery<ExamDetail, Error>({
    queryKey: examId ? examDetailKey(examId) : ["exam-detail"],
    queryFn: async () => {
      if (!examId) {
        throw new Error("Exam ID tidak ditemukan.");
      }

      return getExamDetail(supabase, examId);
    },
    enabled: Boolean(examId),
  });
};

export const useExamSessionQuery = (
  examId: string | null,
  enabled: boolean
) => {
  const supabase = useSupabase();

  return useQuery<ExamSessionRow, Error>({
    queryKey: examId ? examSessionKey(examId) : ["exam-session"],
    queryFn: async () => {
      if (!examId) {
        throw new Error("Exam ID tidak ditemukan.");
      }

      return startExamSession(supabase, examId);
    },
    enabled: Boolean(examId) && enabled,
    refetchInterval: 1000 * 30,
  });
};

export const useRecordAnswerMutation = (examId: string) => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      sessionId: string;
      questionId: string;
      optionId: string | null;
    }) => recordExamAnswer(supabase, params),
    onSuccess: (session) => {
      queryClient.setQueryData(examSessionKey(examId), session);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useCompleteExamMutation = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ sessionId }: { sessionId: string }) =>
      completeExamSession(supabase, sessionId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: examSessionKey(result.exam_id),
      });
      queryClient.setQueryData(examResultKey(result.session_id), result);
      queryClient.setQueryData(examLatestResultKey(result.exam_id), result);
      router.push(`/tryout/${result.exam_id}/result?session=${result.session_id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useExamResultQuery = (sessionId: string | null) => {
  const supabase = useSupabase();

  return useQuery<ExamResultRow, Error>({
    queryKey: sessionId ? examResultKey(sessionId) : ["exam-result"],
    queryFn: async () => {
      if (!sessionId) {
        throw new Error("Session ID tidak ditemukan.");
      }

      return getResultBySessionId(supabase, sessionId);
    },
    enabled: Boolean(sessionId),
  });
};

export const useLatestExamResult = (examId: string | null) => {
  const supabase = useSupabase();

  return useQuery({
    queryKey: examId ? examLatestResultKey(examId) : ["exam-result", "latest"],
    queryFn: async () => {
      if (!examId) {
        throw new Error("Exam ID tidak ditemukan.");
      }
      const { data, error } = await supabase
        .from("exam_results")
        .select("*")
        .eq("exam_id", examId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    },
    enabled: Boolean(examId),
  });
};
