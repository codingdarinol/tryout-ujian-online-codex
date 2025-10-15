"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExamForm } from "@/features/exams/components/exam-form";
import { useCreateExamMutation } from "@/features/exams/hooks";
import type { ExamFormValues } from "@/features/exams/types";

export default function CreateExamPage() {
  const router = useRouter();
  const createExam = useCreateExamMutation();

  const handleSubmit = async (values: ExamFormValues) => {
    try {
      await createExam.mutateAsync(values);
      router.replace("/admin/exams");
    } catch {
      // The mutation hook already surfaces errors via toast.
    }
  };

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
          <h1 className="text-2xl font-semibold tracking-tight">
            Tambah Tryout Baru
          </h1>
          <p className="text-sm text-muted-foreground">
            Isi metadata tryout untuk memulai penyusunan soal.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Tryout</CardTitle>
        </CardHeader>
        <CardContent>
          <ExamForm
            onSubmit={handleSubmit}
            isSubmitting={createExam.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
