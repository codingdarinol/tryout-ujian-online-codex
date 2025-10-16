import type {
  Database,
  ExamRow,
  QuestionOptionRow,
  QuestionRow,
} from "@/lib/supabase/types";

export type ExamSessionRow =
  Database["public"]["Tables"]["exam_sessions"]["Row"];

export type ExamResultRow =
  Database["public"]["Tables"]["exam_results"]["Row"];

export type QuestionWithOptions = QuestionRow & {
  question_options: QuestionOptionRow[];
};

export type ExamDetail = {
  exam: ExamRow;
  questions: QuestionWithOptions[];
};

export type UserAnswerMap = Record<string, string>;
