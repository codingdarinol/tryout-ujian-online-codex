"use client";

import { useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, ChartBar, Clock, Home, XCircle } from "lucide-react";
import { ExamWorkspaceShell } from "@/components/layout/exam-workspace-shell";
import {
  useExamDetailQuery,
  useExamResultQuery,
} from "@/features/exam-session/hooks";
import {
  getSessionById,
  parseUserAnswers,
} from "@/features/exam-session/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useSupabase } from "@/components/providers/supabase-provider";
import type { QuestionWithOptions } from "@/features/exam-session/types";
import { cn } from "@/lib/utils";

const ResultPage = () => {
  const params = useParams<{ examId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = useSupabase();

  const examId = Array.isArray(params.examId)
    ? params.examId[0]
    : params.examId;
  const sessionId = searchParams.get("session");

  const {
    data: examDetail,
    isLoading: examLoading,
    error: examError,
  } = useExamDetailQuery(examId ?? null);

  const {
    data: session,
    isLoading: sessionLoading,
    error: sessionError,
  } = useQuery({
    queryKey: ["exam-session-by-id", sessionId],
    queryFn: async () => {
      if (!sessionId) {
        throw new Error("Session ID tidak ditemukan.");
      }
      return getSessionById(supabase, sessionId);
    },
    enabled: Boolean(sessionId),
  });

  const {
    data: result,
    isLoading: resultLoading,
    error: resultError,
  } = useExamResultQuery(sessionId);

  const questions = useMemo(
    () => examDetail?.questions ?? [],
    [examDetail]
  );
  const exam = examDetail?.exam;

  const answers = useMemo(
    () => (session ? parseUserAnswers(session.user_answers) : {}),
    [session]
  );

  const outcomeList = useMemo(() => {
    return questions.map((question, index) => {
      const selectedId = answers[question.id];
      const selectedOption = question.question_options.find(
        (option) => option.id === selectedId
      );
      const correctOption = question.question_options.find(
        (option) => option.is_correct
      );
      const isCorrect =
        Boolean(selectedOption) &&
        selectedOption?.id === correctOption?.id;

      return {
        question,
        index,
        selectedOption,
        correctOption,
        isCorrect,
      };
    });
  }, [questions, answers]);

  const isLoading = examLoading || sessionLoading || resultLoading;
  const hasError = examError || sessionError || resultError;

  const passed =
    result && exam ? result.score >= exam.passing_score : null;

  const durationTaken = useMemo(() => {
    if (!session?.started_at || !(session.completed_at || session.updated_at)) {
      return null;
    }
    const start = new Date(session.started_at).getTime();
    const end = new Date(
      session.completed_at ?? session.updated_at ?? session.started_at
    ).getTime();
    const diff = Math.max(Math.floor((end - start) / 1000), 0);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes} menit ${seconds.toString().padStart(2, "0")} detik`;
  }, [session?.started_at, session?.completed_at, session?.updated_at]);

  const rightSidebar = result ? (
    <div className="space-y-6">
      <Card className="border-none bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-500 text-white shadow-emerald-200/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Hasil Ujian
          </CardTitle>
          <CardDescription className="text-emerald-50/80">
            Rekap singkat performa Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold">{result.score}</span>
            <span className="text-lg font-medium opacity-75">/ 100</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Total Soal</span>
              <span className="font-semibold text-white">
                {result.total_questions}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Benar</span>
              <span className="font-semibold text-white">
                {result.correct_count}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Salah / Kosong</span>
              <span className="font-semibold text-white">
                {result.incorrect_count}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Badge
            variant="secondary"
            className={cn(
              "rounded-full px-4 py-1 text-sm font-semibold",
              passed
                ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-600"
            )}
          >
            {passed ? "Lulus" : "Belum Lulus"}
          </Badge>
        </CardFooter>
      </Card>

      <Card className="border-none bg-white shadow-xl shadow-slate-200/80">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-800">
            Statistik Sesi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Durasi dikerjakan</span>
            <span className="font-medium text-slate-800">
              {durationTaken ?? "-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Tanggal ujian</span>
            <span className="font-medium text-slate-800">
              {session
                ? new Date(session.started_at).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Passing grade</span>
            <span className="font-medium text-slate-800">
              {exam?.passing_score ?? "-"}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full rounded-xl border-slate-200 bg-white text-slate-600 shadow hover:bg-slate-100"
        onClick={() => router.push("/dashboard")}
      >
        <Home className="mr-2 h-4 w-4" />
        Kembali ke Dashboard
      </Button>
    </div>
  ) : (
    <div className="space-y-6">
      <Skeleton className="h-48 rounded-3xl" />
      <Skeleton className="h-36 rounded-3xl" />
      <Skeleton className="h-12 rounded-3xl" />
    </div>
  );

  if (isLoading) {
    return (
      <ExamWorkspaceShell rightSidebar={rightSidebar}>
        <LoadingState />
      </ExamWorkspaceShell>
    );
  }

  if (hasError || !result || !exam) {
    return (
      <ExamWorkspaceShell rightSidebar={rightSidebar}>
        <ErrorState
          message={
            resultError?.message ??
            sessionError?.message ??
            examError?.message ??
            "Terjadi kesalahan saat memuat hasil ujian."
          }
          onBack={() => router.push("/dashboard")}
          onRetry={() => router.refresh()}
        />
      </ExamWorkspaceShell>
    );
  }

  return (
    <ExamWorkspaceShell rightSidebar={rightSidebar}>
      <div className="space-y-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Paket Saya &gt; Hasil Tryout{" "}
          <span className="text-emerald-600">{exam.title}</span>
        </div>

        <Card className="border-none bg-white shadow-2xl shadow-slate-200/80">
          <CardHeader className="space-y-4 border-b border-slate-100 bg-gradient-to-r from-white via-white to-emerald-50/50 p-6">
            <div className="flex items-center gap-3">
              {passed ? (
                <BadgeCheck className="h-8 w-8 text-emerald-500" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500" />
              )}
              <div>
                <CardTitle className="text-2xl font-semibold text-slate-800">
                  {passed ? "Selamat!" : "Tetap Semangat!"}
                </CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  {passed
                    ? "Anda telah memenuhi passing grade tryout ini."
                    : "Skor Anda belum mencapai passing grade. Evaluasi jawaban untuk meningkatkan hasil."}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                {exam.package_id ?? "Umum"}
              </Badge>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Durasi: {exam.duration_in_minutes} menit
              </div>
              <div className="flex items-center gap-2">
                <ChartBar className="h-4 w-4" />
                Passing grade: {exam.passing_score}%
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 p-6">
            <section className="space-y-4">
              <h3 className="text-base font-semibold text-slate-700">
                Ringkasan Jawaban
              </h3>
              <div className="space-y-6">
                {outcomeList.map(
                  ({ question, index, selectedOption, correctOption, isCorrect }) => (
                    <QuestionOutcomeCard
                      key={question.id}
                      question={question}
                      index={index}
                      selectedOption={selectedOption}
                      correctOption={correctOption}
                      isCorrect={isCorrect}
                    />
                  )
                )}
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </ExamWorkspaceShell>
  );
};

type OptionRow = QuestionWithOptions["question_options"][number];

const QuestionOutcomeCard = ({
  question,
  index,
  selectedOption,
  correctOption,
  isCorrect,
}: {
  question: QuestionWithOptions;
  index: number;
  selectedOption?: OptionRow;
  correctOption?: OptionRow;
  isCorrect: boolean;
}) => {
  const optionLabel = (option?: OptionRow) => {
    if (!option) {
      return null;
    }
    const optionIndex = question.question_options.findIndex(
      (item) => item.id === option.id
    );
    return optionIndex >= 0
      ? String.fromCharCode("A".charCodeAt(0) + optionIndex)
      : null;
  };

  const selectedLabel = optionLabel(selectedOption);
  const correctLabel = optionLabel(correctOption);

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Soal {index + 1}
          </p>
          <p className="text-sm leading-relaxed text-slate-700">
            {question.question_text}
          </p>
        </div>
        <Badge
          className={cn(
            "h-fit rounded-full px-3 py-1 text-sm font-semibold",
            isCorrect
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-600"
          )}
        >
          {isCorrect ? "Benar" : "Perlu Review"}
        </Badge>
      </div>
      <Separator />
      <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-inner">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Jawaban Anda
          </span>
          <p className="mt-1 font-medium text-slate-700">
            {selectedOption ? (
              <>
                <span className="mr-2 rounded bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {selectedLabel}
                </span>
                {selectedOption.option_text}
              </>
            ) : (
              <span className="italic text-slate-400">Belum dijawab</span>
            )}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 shadow-inner">
          <span className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
            Jawaban Benar
          </span>
          <p className="mt-1 font-medium text-emerald-700">
            {correctOption ? (
              <>
                <span className="mr-2 rounded bg-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {correctLabel}
                </span>
                {correctOption.option_text}
              </>
            ) : (
              "-"
            )}
          </p>
        </div>
      </div>
      {question.explanation && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600 shadow-inner">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Penjelasan
          </span>
          <p className="mt-1 leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};

const LoadingState = () => (
  <div className="space-y-6">
    <Skeleton className="h-6 w-64" />
    <Skeleton className="h-60 rounded-3xl" />
    <Skeleton className="h-60 rounded-3xl" />
  </div>
);

const ErrorState = ({
  message,
  onBack,
  onRetry,
}: {
  message: string;
  onBack: () => void;
  onRetry: () => void;
}) => (
  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center shadow-inner">
    <XCircle className="h-10 w-10 text-red-500" />
    <h2 className="mt-4 text-lg font-semibold text-slate-700">
      Tidak dapat memuat hasil
    </h2>
    <p className="mt-2 text-sm text-slate-500">{message}</p>
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <Button variant="outline" onClick={onBack}>
        Kembali ke Dashboard
      </Button>
      <Button onClick={onRetry}>Coba Lagi</Button>
    </div>
  </div>
);

export default ResultPage;
