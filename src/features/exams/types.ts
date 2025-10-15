import { z } from "zod";
import type { Database } from "@/lib/supabase/types";

export type ExamRow = Database["public"]["Tables"]["exams"]["Row"];

export type ExamSummary = ExamRow & {
  questionCount: number;
};

export const examFormSchema = z.object({
  title: z
    .string({ required_error: "Judul wajib diisi." })
    .min(3, "Judul minimal 3 karakter."),
  description: z
    .string({ required_error: "Deskripsi wajib diisi." })
    .min(10, "Deskripsi minimal 10 karakter."),
  duration_in_minutes: z.coerce
    .number({ required_error: "Durasi wajib diisi." })
    .int("Durasi harus bilangan bulat.")
    .min(5, "Durasi minimal 5 menit.")
    .max(240, "Durasi maksimal 240 menit."),
  passing_score: z.coerce
    .number({ required_error: "Skor kelulusan wajib diisi." })
    .int("Skor harus bilangan bulat.")
    .min(0)
    .max(100, "Skor maksimal 100."),
  max_attempts: z.coerce
    .number()
    .int("Jumlah percobaan harus bilangan bulat.")
    .min(1, "Minimal 1 percobaan.")
    .max(10, "Maksimal 10 percobaan.")
    .default(1),
  package_id: z
    .string()
    .max(100, "Maksimal 100 karakter.")
    .nullable()
    .optional(),
});

export type ExamFormValues = z.infer<typeof examFormSchema>;
