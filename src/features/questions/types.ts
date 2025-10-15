import { z } from "zod";
import type { QuestionOptionRow, QuestionRow } from "@/lib/supabase/types";

export type QuestionWithOptions = QuestionRow & {
  question_options: QuestionOptionRow[];
};

export const questionOptionSchema = z.object({
  id: z.string().uuid().optional(),
  option_text: z
    .string({ required_error: "Pilihan wajib diisi." })
    .min(1, "Pilihan tidak boleh kosong."),
  is_correct: z.boolean(),
});

export const questionFormSchema = z
  .object({
    id: z.string().uuid().optional(),
    question_text: z
      .string({ required_error: "Teks soal wajib diisi." })
      .min(10, "Soal minimal 10 karakter."),
    explanation: z
      .string()
      .max(500, "Penjelasan maksimal 500 karakter.")
      .optional()
      .nullable(),
    options: z
      .array(questionOptionSchema)
      .length(4, "Setiap soal harus memiliki 4 pilihan jawaban."),
  })
  .refine(
    (data) => data.options.filter((option) => option.is_correct).length === 1,
    {
      message: "Tepat satu pilihan harus ditandai sebagai jawaban benar.",
      path: ["options"],
    }
  );

export type QuestionFormValues = z.infer<typeof questionFormSchema>;
