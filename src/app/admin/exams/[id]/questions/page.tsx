"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  HelpCircle,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QuestionFormModal } from "@/features/questions/components/question-form-modal";
import {
  useCreateQuestionMutation,
  useDeleteQuestionMutation,
  useUpdateQuestionMutation,
  useQuestionsQuery,
} from "@/features/questions/hooks";
import type {
  QuestionFormValues,
  QuestionWithOptions,
} from "@/features/questions/types";
import { useExamQuery } from "@/features/exams/hooks";

export default function QuestionManagementPage() {
  const params = useParams<{ id: string }>();
  const examId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: exam } = useExamQuery(examId, Boolean(examId));
  const {
    data: questions,
    isLoading,
  } = useQuestionsQuery(examId, Boolean(examId));

  const createQuestion = useCreateQuestionMutation(examId);
  const updateQuestion = useUpdateQuestionMutation(examId);
  const deleteQuestion = useDeleteQuestionMutation(examId);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] =
    useState<QuestionWithOptions | null>(null);
  const [questionToDelete, setQuestionToDelete] =
    useState<QuestionWithOptions | null>(null);

  if (!examId) {
    return null;
  }

  const handleCreate = async (values: QuestionFormValues) => {
    try {
      await createQuestion.mutateAsync(values);
      setIsCreateModalOpen(false);
    } catch { 
      // Error ditangani di mutation hook.
    }
  };

  const handleUpdate = async (values: QuestionFormValues) => {
    if (!questionToEdit) return;
    try {
      await updateQuestion.mutateAsync({
        questionId: questionToEdit.id,
        payload: values,
      });
      setQuestionToEdit(null);
    } catch { 
      // Error ditangani di mutation hook.
    }
  };

  const handleDelete = async () => {
    if (!questionToDelete) return;
    try {
      await deleteQuestion.mutateAsync(questionToDelete.id);
    } catch { 
      // Error ditangani di mutation hook.
    } finally {
      setQuestionToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/exams" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Manajemen Soal
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola konten soal untuk tryout {exam?.title ?? ""}.
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Soal
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>{exam?.title ?? "Memuat detail tryout..."}</CardTitle>
          <CardDescription>
            Soal yang terkelola rapi memastikan pengalaman peserta yang adil.
            Pertahankan kualitas soal dengan melakukan review berkala.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Memuat daftar soal…
              </p>
            </div>
          ) : !questions || questions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
              <HelpCircle className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium">Belum ada soal</p>
                <p className="text-sm text-muted-foreground">
                  Tambahkan minimal empat soal untuk mempublikasikan tryout.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="rounded-lg border bg-card shadow-sm"
                >
                  <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          Soal {index + 1}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ID: {question.id.slice(0, 8)}…
                        </span>
                      </div>
                      <p className="mt-2 font-medium">
                        {question.question_text}
                      </p>
                      {question.explanation ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            Pembahasan:
                          </span>{" "}
                          {question.explanation}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setQuestionToEdit(question)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={() => setQuestionToDelete(question)}
                        disabled={deleteQuestion.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3 px-6 py-4">
                    {question.question_options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-start gap-3 rounded-md border px-3 py-3"
                      >
                        <CheckCircle2
                          className={`mt-1 h-5 w-5 ${
                            option.is_correct
                              ? "text-emerald-500"
                              : "text-muted-foreground"
                          }`}
                          aria-hidden="true"
                        />
                        <div>
                          <p className="font-medium">
                            {option.option_text}
                          </p>
                          {option.is_correct ? (
                            <p className="text-xs text-emerald-600">
                              Jawaban benar
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Opsi jawaban
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <QuestionFormModal
        open={isCreateModalOpen}
        mode="create"
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreate}
        isSubmitting={createQuestion.isPending}
      />

      <QuestionFormModal
        open={!!questionToEdit}
        mode="edit"
        initialData={questionToEdit ?? undefined}
        onOpenChange={(open) => {
          if (!open) setQuestionToEdit(null);
        }}
        onSubmit={handleUpdate}
        isSubmitting={updateQuestion.isPending}
      />

      <AlertDialog
        open={!!questionToDelete}
        onOpenChange={(open) => {
          if (!open) setQuestionToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus soal?</AlertDialogTitle>
            <AlertDialogDescription>
              Soal akan dihapus permanen beserta seluruh opsinya. Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteQuestion.isPending}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Separator />
      <p className="text-sm text-muted-foreground">
        Catatan: gunakan kombinasi soal konseptual dan studi kasus untuk
        mendorong pemahaman pajak yang komprehensif.
      </p>
    </div>
  );
}
