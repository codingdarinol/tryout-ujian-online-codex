"use client";

import type { PostgrestError } from "@supabase/supabase-js";
import type { TypedSupabaseClient } from "@/lib/supabase/client";
import type { ExamRow } from "@/lib/supabase/types";
import type { Json } from "@/lib/supabase/types";
import type {
  ExamDetail,
  ExamResultRow,
  ExamSessionRow,
  QuestionWithOptions,
  UserAnswerMap,
} from "./types";

const isPostgrestError = (error: unknown): error is PostgrestError =>
  Boolean(error && typeof error === "object" && "code" in error);

export const getExamDetail = async (
  client: TypedSupabaseClient,
  examId: string
): Promise<ExamDetail> => {
  const { data, error } = await client
    .from("exams")
    .select(
      `
        *,
        questions:questions(
          *,
          question_options(*)
        )
      `
    )
    .eq("id", examId)
    .order("order", {
      foreignTable: "questions",
      ascending: true,
      nullsFirst: true,
    })
    .order("created_at", {
      foreignTable: "questions",
      ascending: true,
    })
    .order("created_at", {
      foreignTable: "questions.question_options",
      ascending: true,
    })
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Tryout tidak ditemukan atau tidak tersedia.");
  }

  const typed = data as unknown as ExamRow & {
    questions: QuestionWithOptions[];
  };

  const { questions, ...examRest } = typed;

  const orderedQuestions = (questions ?? []).map((question) => ({
    ...question,
    question_options: [...(question.question_options ?? [])].sort((a, b) =>
      (a.created_at ?? "").localeCompare(b.created_at ?? "")
    ),
  }));

  return {
    exam: examRest,
    questions: orderedQuestions,
  };
};

export const startExamSession = async (
  client: TypedSupabaseClient,
  examId: string
): Promise<ExamSessionRow> => {
  const { data, error } = await client.rpc("start_exam_session", {
    exam_id_in: examId,
  });

  if (error) {
    throw error;
  }

  return data as ExamSessionRow;
};

export const recordExamAnswer = async (
  client: TypedSupabaseClient,
  params: {
    sessionId: string;
    questionId: string;
    optionId: string | null;
  }
): Promise<ExamSessionRow> => {
  const { data, error } = await client.rpc("record_exam_answer", {
    session_id_in: params.sessionId,
    question_id_in: params.questionId,
    option_id_in: params.optionId,
  });

  if (error) {
    throw error;
  }

  return data as ExamSessionRow;
};

export const completeExamSession = async (
  client: TypedSupabaseClient,
  sessionId: string
): Promise<ExamResultRow> => {
  const { data, error } = await client.rpc("complete_exam_session", {
    session_id_in: sessionId,
  });

  if (error) {
    throw error;
  }

  return data as ExamResultRow;
};

export const getSessionById = async (
  client: TypedSupabaseClient,
  sessionId: string
): Promise<ExamSessionRow> => {
  const { data, error } = await client
    .from("exam_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Sesi ujian tidak ditemukan.");
  }

  return data;
};

export const getLatestSessionForExam = async (
  client: TypedSupabaseClient,
  examId: string
): Promise<ExamSessionRow | null> => {
  const { data, error } = await client
    .from("exam_sessions")
    .select("*")
    .eq("exam_id", examId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && !isPostgrestError(error)) {
    throw error;
  }

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data ?? null;
};

export const getResultBySessionId = async (
  client: TypedSupabaseClient,
  sessionId: string
): Promise<ExamResultRow> => {
  const { data, error } = await client
    .from("exam_results")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Hasil ujian belum tersedia.");
  }

  return data;
};

export const parseUserAnswers = (
  answers: ExamSessionRow["user_answers"]
): UserAnswerMap => {
  const raw = (answers as Json) ?? {};

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  const entries = Object.entries(raw).reduce<UserAnswerMap>(
    (acc, [questionId, value]) => {
      if (typeof value === "string") {
        acc[questionId] = value;
      }
      return acc;
    },
    {}
  );

  return entries;
};

export const getLatestResultByExam = async (
  client: TypedSupabaseClient,
  examId: string
): Promise<ExamResultRow | null> => {
  const { data, error } = await client
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
};
