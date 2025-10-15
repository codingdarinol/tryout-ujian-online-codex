"use client";

import type { TypedSupabaseClient } from "@/lib/supabase/client";
import type { ExamRow } from "@/lib/supabase/types";
import type { ExamFormValues, ExamSummary } from "./types";

type ExamRecord = ExamRow & { questions: { count: number }[] };

const withQuestionCount = (exam: ExamRecord): ExamSummary => {
  const { questions, ...rest } = exam;

  return {
    ...rest,
    questionCount: questions?.[0]?.count ?? 0,
  };
};

export const listExams = async (
  client: TypedSupabaseClient
): Promise<ExamSummary[]> => {
  const { data, error } = await client
    .from("exams")
    .select("*, questions(count)")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as ExamRecord[]).map(withQuestionCount);
};

type PublishedExamOptions = {
  packageIds?: string[] | null;
};

export const listPublishedExams = async (
  client: TypedSupabaseClient,
  options?: PublishedExamOptions
): Promise<ExamSummary[]> => {
  const packageIds = options?.packageIds ?? null;
  const sanitizedPackages =
    packageIds?.filter((pkg) => typeof pkg === "string" && pkg.length > 0) ??
    [];

  let query = client
    .from("exams")
    .select("*, questions(count)")
    .eq("is_published", true)
    .order("created_at", { ascending: true });

  if (sanitizedPackages.length > 0) {
    query = query.in("package_id", sanitizedPackages);
  } else {
    query = query.is("package_id", null);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data as ExamRecord[]).map(withQuestionCount);
};

export const getExam = async (
  client: TypedSupabaseClient,
  id: string
): Promise<ExamSummary> => {
  const { data, error } = await client
    .from("exams")
    .select("*, questions(count)")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return withQuestionCount(data as ExamRecord);
};

export const createExam = async (
  client: TypedSupabaseClient,
  payload: ExamFormValues,
  authorId: string
): Promise<ExamRow> => {
  const insertPayload = {
    title: payload.title,
    description: payload.description,
    duration_in_minutes: payload.duration_in_minutes,
    passing_score: payload.passing_score,
    max_attempts: payload.max_attempts,
    package_id: payload.package_id ?? null,
    author_id: authorId,
  };

  const { data, error } = await client
    .from("exams")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateExam = async (
  client: TypedSupabaseClient,
  id: string,
  payload: ExamFormValues
): Promise<ExamRow> => {
  const updatePayload = {
    title: payload.title,
    description: payload.description,
    duration_in_minutes: payload.duration_in_minutes,
    passing_score: payload.passing_score,
    max_attempts: payload.max_attempts,
    package_id: payload.package_id ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await client
    .from("exams")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteExam = async (
  client: TypedSupabaseClient,
  id: string
): Promise<void> => {
  const { error } = await client.from("exams").delete().eq("id", id);
  if (error) {
    throw error;
  }
};

export const setExamPublishState = async (
  client: TypedSupabaseClient,
  id: string,
  nextState: boolean
): Promise<ExamRow> => {
  const { data, error } = await client
    .from("exams")
    .update({
      is_published: nextState,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
};
