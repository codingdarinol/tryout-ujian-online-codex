"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExamForm } from "@/features/exams/components/exam-form";
import { useExamQuery, useUpdateExamMutation } from "@/features/exams/hooks";
import type { ExamFormValues } from "@/features/exams/types";

export default function EditExamPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const examId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: exam, isLoading } = useExamQuery(examId, Boolean(examId));
  const updateExam = useUpdateExamMutation(examId);

  const handleSubmit = async (values: ExamFormValues) => {
    try {
      await updateExam.mutateAsync(values);
      router.replace("/admin/exams");
    } catch {
      // Error handling ditangani di mutation hook.
    }
  };

  if (!examId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/exams" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Tryout</h1>
          <p className="text-sm text-muted-foreground">
            Perbarui metadata tryout untuk menjaga konten tetap akurat.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Tryout</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !exam ? (
            <div className="space-y-4">
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-24 w-full animate-pulse rounded-md bg-muted" />
              <div className="grid gap-4 md:grid-cols-3">
                <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              </div>
            </div>
          ) : (
            <ExamForm
              defaultValues={exam}
              onSubmit={handleSubmit}
              isSubmitting={updateExam.isPending}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
