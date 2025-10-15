"use client";

import type { TypedSupabaseClient } from "@/lib/supabase/client";
import type { QuestionWithOptions } from "./types";
import type { Database } from "@/lib/supabase/types";
import type { QuestionFormValues } from "./types";

type OptionInput =
  Database["public"]["CompositeTypes"]["option_input"];

export const listQuestions = async (
  client: TypedSupabaseClient,
  examId: string
): Promise<QuestionWithOptions[]> => {
  const { data, error } = await client
    .from("questions")
    .select("*, question_options(*)")
    .eq("exam_id", examId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data as QuestionWithOptions[];
};

export const createQuestion = async (
  client: TypedSupabaseClient,
  examId: string,
  payload: QuestionFormValues
): Promise<string> => {
  const options = mapOptions(payload);

  const { data, error } = await client.rpc("create_question_with_options", {
    exam_id_in: examId,
    question_text_in: payload.question_text,
    explanation_in: payload.explanation ?? null,
    options_in: options,
  });

  if (error) {
    throw error;
  }

  return data as string;
};

export const updateQuestion = async (
  client: TypedSupabaseClient,
  questionId: string,
  payload: QuestionFormValues
): Promise<void> => {
  const options = mapOptions(payload);

  const { error } = await client.rpc("update_question_with_options", {
    question_id_in: questionId,
    question_text_in: payload.question_text,
    explanation_in: payload.explanation ?? null,
    options_in: options,
  });

  if (error) {
    throw error;
  }
};

export const deleteQuestionById = async (
  client: TypedSupabaseClient,
  questionId: string
): Promise<void> => {
  const { error } = await client.rpc("delete_question", {
    question_id_in: questionId,
  });

  if (error) {
    throw error;
  }
};

const mapOptions = (payload: QuestionFormValues): OptionInput[] =>
  payload.options.map((option) => ({
    option_text: option.option_text,
    is_correct: option.is_correct,
  }));
