"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { ExamWorkspaceShell } from "@/components/layout/exam-workspace-shell";
import {
  useCompleteExamMutation,
  useExamDetailQuery,
  useExamSessionQuery,
  useRecordAnswerMutation,
} from "@/features/exam-session/hooks";
import { parseUserAnswers } from "@/features/exam-session/api";
import type { UserAnswerMap } from "@/features/exam-session/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type QuestionStatus = {
  number: number;
  questionId: string;
  isCurrent: boolean;
  isAnswered: boolean;
};

const formatRemainingTime = (milliseconds: number | null): string => {
  if (milliseconds === null) {
    return "--";
  }

  const totalSeconds = Math.max(Math.floor(milliseconds / 1000), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (hours > 0) {
    parts.push(`${hours} Jam`);
  }
  parts.push(`${minutes.toString().padStart(2, "0")} Menit`);
  parts.push(`${seconds.toString().padStart(2, "0")} Detik`);
  return parts.join(" ");
};

const getRadioLabel = (index: number): string =>
  String.fromCharCode("A".charCodeAt(0) + index);

export default function TryoutExamPage() {
  const params = useParams<{ examId: string }>();
  const router = useRouter();
  const examId = Array.isArray(params.examId)
    ? params.examId[0]
    : params.examId;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  const {
    data: examDetail,
    isLoading: isExamLoading,
    error: examError,
  } = useExamDetailQuery(examId ?? null);

  const {
    data: session,
    isLoading: isSessionLoading,
    error: sessionError,
  } = useExamSessionQuery(examId ?? null, Boolean(examDetail));

  const recordAnswerMutation = useRecordAnswerMutation(examId ?? "");
  const completeExamMutation = useCompleteExamMutation();

  const questions = examDetail?.questions ?? [];
  const exam = examDetail?.exam;

  useEffect(() => {
    if (questions.length === 0) {
      setCurrentIndex(0);
      return;
    }

    if (currentIndex >= questions.length) {
      setCurrentIndex(questions.length - 1);
    }
  }, [questions.length, currentIndex]);

useEffect(() => {
  if (!session || !session.expires_at || session.status !== "in_progress") {
    setRemainingMs(null);
    return;
  }

  const target = new Date(session.expires_at).getTime();

  const tick = () => {
    const diff = target - Date.now();
    setRemainingMs(Math.max(diff, 0));
  };

  tick();
  const id = window.setInterval(tick, 1000);
  return () => window.clearInterval(id);
}, [session]);

  useEffect(() => {
    if (
      remainingMs !== null &&
      remainingMs <= 0 &&
      session &&
      session.status === "in_progress" &&
      !completeExamMutation.isPending &&
      !hasAutoSubmitted
    ) {
      setHasAutoSubmitted(true);
      toast.info("Waktu ujian telah berakhir. Mengirim jawaban Anda...");
      completeExamMutation.mutate({ sessionId: session.id });
    }
  }, [
    remainingMs,
    session,
    completeExamMutation,
    hasAutoSubmitted,
  ]);

  useEffect(() => {
    if (session?.status === "completed") {
      router.replace(`/tryout/${session.exam_id}/result?session=${session.id}`);
    }
  }, [session?.status, session?.exam_id, session?.id, router]);

  const answers: UserAnswerMap = useMemo(
    () => (session ? parseUserAnswers(session.user_answers) : {}),
    [session]
  );

  const currentQuestion = questions[currentIndex];
  const selectedOption = currentQuestion
    ? answers[currentQuestion.id] ?? ""
    : "";

  const questionStatuses: QuestionStatus[] = questions.map((question, idx) => ({
    number: idx + 1,
    questionId: question.id,
    isCurrent: idx === currentIndex,
    isAnswered: Boolean(answers[question.id]),
  }));

  const isLoading = isExamLoading || isSessionLoading;
  const hasError = examError || sessionError;

  const handleSelectOption = (optionId: string) => {
    if (!session || !currentQuestion) {
      return;
    }

    if (session.status !== "in_progress") {
      toast.error("Sesi ujian sudah selesai.");
      return;
    }

    recordAnswerMutation.mutate({
      sessionId: session.id,
      questionId: currentQuestion.id,
      optionId,
    });
  };

  const handleClearAnswer = () => {
    if (!session || !currentQuestion) {
      return;
    }
    recordAnswerMutation.mutate({
      sessionId: session.id,
      questionId: currentQuestion.id,
      optionId: null,
    });
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const handleFinishExam = () => {
    if (!session) {
      toast.error("Sesi ujian tidak ditemukan.");
      return;
    }
    completeExamMutation.mutate({ sessionId: session.id });
  };

  const rightSidebar = (
    <div className="space-y-6">
      <Card className="border border-orange-100 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-700">
            Waktu Tersisa
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Pastikan semua soal terjawab sebelum waktu habis.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-2xl font-semibold text-orange-500">
            {formatRemainingTime(remainingMs)}
          </p>
        </CardContent>
        <CardFooter className="pt-0">
          <Button
            size="lg"
            className="w-full rounded-xl bg-orange-500 text-white shadow-sm hover:bg-orange-600"
            onClick={handleFinishExam}
            disabled={
              !session ||
              session.status !== "in_progress" ||
              completeExamMutation.isPending
            }
          >
            {completeExamMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyelesaikan...
              </>
            ) : (
              "Selesaikan Ujian"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className="border border-emerald-100 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-700">
            Nomor Soal
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Klik nomor untuk pindah ke soal tertentu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {questionStatuses.map((item) => (
              <button
                key={item.questionId}
                type="button"
                onClick={() => setCurrentIndex(item.number - 1)}
                className={cn(
                  "flex h-9 items-center justify-center rounded-lg border text-xs font-semibold transition",
                  item.isCurrent
                    ? "border-orange-400 bg-orange-500 text-white shadow"
                    : item.isAnswered
                    ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
                )}
              >
                {item.number}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-4 w-4 rounded bg-orange-500" />
              <span>Soal aktif</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-4 w-4 rounded bg-emerald-500" />
              <span>Sudah dijawab</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-4 w-4 rounded bg-slate-200" />
              <span>Belum dijawab</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full rounded-xl border-emerald-200 bg-white text-emerald-600 shadow-sm hover:bg-emerald-50"
      >
        <HelpCircle className="mr-2 h-4 w-4" />
        Butuh Bantuan
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <ExamWorkspaceShell rightSidebar={<SkeletonSidebar />}>
        <div className="space-y-6">
          <Skeleton className="h-6 w-72" />
          <Card className="border-none bg-white shadow-xl shadow-slate-200/80">
            <CardHeader className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </CardFooter>
          </Card>
        </div>
      </ExamWorkspaceShell>
    );
  }

  if (hasError) {
    return (
      <ExamWorkspaceShell rightSidebar={rightSidebar}>
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center shadow-inner">
          <AlertTriangle className="h-10 w-10 text-amber-500" />
          <h2 className="mt-4 text-lg font-semibold text-slate-700">
            Tidak dapat memulai tryout
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {(examError ?? sessionError)?.message ??
              "Terjadi kesalahan saat memuat data tryout."}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Kembali ke Dashboard
            </Button>
            <Button variant="default" onClick={() => router.refresh()}>
              Coba Muat Ulang
            </Button>
          </div>
        </div>
      </ExamWorkspaceShell>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <ExamWorkspaceShell rightSidebar={rightSidebar}>
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-inner">
          <h2 className="text-xl font-semibold text-slate-700">
            Soal belum tersedia
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Administrator belum menambahkan soal untuk tryout ini. Silakan
            kembali lagi nanti.
          </p>
          <Button className="mt-6" onClick={() => router.push("/dashboard")}>
            Kembali ke Dashboard
          </Button>
        </div>
      </ExamWorkspaceShell>
    );
  }

  return (
    <ExamWorkspaceShell rightSidebar={rightSidebar}>
      <div className="space-y-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Paket Saya &gt; Kerjakan Latihan{" "}
          <span className="text-emerald-600">{exam.title}</span>
        </div>

        <Card className="gap-4 border border-emerald-100 bg-white shadow-sm">
          <CardHeader className="flex flex-col gap-2 border-b border-emerald-50 bg-[#F5FBFC] p-5 md:flex-row md:items-center md:justify-between md:gap-6">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold text-slate-700">
                Soal No. {currentIndex + 1}
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Kerjakan soal di bawah ini dengan teliti dan pilih satu jawaban yang paling tepat.
              </CardDescription>
            </div>
            <Badge className="rounded-full bg-indigo-100 text-indigo-600">
              {exam.package_id ?? "Umum"}
            </Badge>
          </CardHeader>

          <CardContent className="flex flex-col gap-3 p-5 pt-3">
            <div className="rounded-2xl border border-emerald-100 bg-white p-5 text-slate-700 shadow-sm leading-relaxed whitespace-pre-line">
              {currentQuestion?.question_text}
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-600">
                Pilih jawaban:
              </p>
              <RadioGroup
                value={selectedOption}
                onValueChange={handleSelectOption}
                className="mt-4 space-y-3"
              >
                {currentQuestion?.question_options.map((option, index) => {
                  const label = getRadioLabel(index);
                  const isSelected = selectedOption === option.id;
                  return (
                    <label
                      key={option.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-4 rounded-2xl border px-4 py-3 text-sm shadow-sm transition",
                        isSelected
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/50"
                      )}
                    >
                      <RadioGroupItem
                        value={option.id}
                        id={`option-${option.id}`}
                        className="mt-0.5"
                        disabled={
                          !session ||
                          session.status !== "in_progress" ||
                          recordAnswerMutation.isPending ||
                          remainingMs === 0
                        }
                      />
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Pilihan {label}
                        </span>
                        <span className="text-sm leading-relaxed">
                          {option.option_text}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-emerald-600"
                  onClick={handleClearAnswer}
                  disabled={
                    !session ||
                    session.status !== "in_progress" ||
                    !selectedOption ||
                    recordAnswerMutation.isPending
                  }
                >
                  Bersihkan jawaban
                </Button>
                {recordAnswerMutation.isPending && (
                  <span className="flex items-center gap-2 text-emerald-500">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Menyimpan jawaban...
                  </span>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t border-emerald-50 bg-[#F5FBFC] p-6 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 text-slate-500 hover:text-emerald-600"
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                Soal {currentIndex + 1} dari {questions.length}
              </span>
              <Button
                onClick={
                  currentIndex === questions.length - 1
                    ? handleFinishExam
                    : handleNext
                }
                className="flex items-center gap-2 rounded-xl bg-orange-500 text-white shadow hover:bg-orange-600"
              >
                {currentIndex === questions.length - 1
                  ? "Selesaikan Ujian"
                  : "Selanjutnya"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </ExamWorkspaceShell>
  );
}

const SkeletonSidebar = () => (
  <div className="space-y-6">
    <Skeleton className="h-44 rounded-3xl" />
    <Skeleton className="h-64 rounded-3xl" />
    <Skeleton className="h-12 rounded-3xl" />
  </div>
);
