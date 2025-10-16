"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Clock, Target, BookOpen, ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { usePublishedExamsQuery } from "@/features/exams/hooks";
import { useLatestExamResult } from "@/features/exam-session/hooks";
import type { ExamSummary } from "@/features/exams/types";

export default function ParticipantDashboard() {
  const profile = useAuthStore((state) => state.profile);
  const purchasedPackages = profile?.purchased_packages ?? null;
  const { data: exams, isLoading } = usePublishedExamsQuery(
    purchasedPackages,
    Boolean(profile)
  );

  const packageSummary = useMemo(() => {
    if (!purchasedPackages || purchasedPackages.length === 0) {
      return "Paket dasar";
    }
    return purchasedPackages.join(", ");
  }, [purchasedPackages]);

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/40">
        <CardHeader>
          <CardTitle>Selamat datang kembali, {profile?.full_name ?? "Peserta"}!</CardTitle>
          <CardDescription>
            Pilih tryout yang tersedia sesuai paket Anda dan mulai latihan untuk
            memperkuat pemahaman perpajakan.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3 text-sm">
          <Badge variant="outline" className="border-emerald-400 text-emerald-600">
            Paket aktif: {packageSummary}
          </Badge>
          <Badge variant="secondary">
            Jumlah tryout siap: {exams?.length ?? 0}
          </Badge>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Tryout Tersedia</h2>
          <p className="text-sm text-muted-foreground">
            Pilih tryout sesuai paket aktif Anda. Semua jawaban tersimpan otomatis
            dan hasil dapat langsung dilihat setelah ujian selesai.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="space-y-3 p-6">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-2/3 rounded bg-muted" />
                  <div className="h-10 w-full rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !exams || exams.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <ShieldCheck className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium">Belum ada tryout yang tersedia</p>
                <p className="text-sm text-muted-foreground">
                  Hubungi administrator untuk mengaktifkan paket tambahan atau
                  menunggu tryout baru dipublikasikan.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {exams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ExamCard({ exam }: { exam: ExamSummary }) {
  const { data: latestResult } = useLatestExamResult(exam.id);
  const hasCompleted = Boolean(latestResult);
  const sessionId = latestResult?.session_id ?? "";

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary">{exam.package_id ?? "Umum"}</Badge>
          <Badge variant="outline">Published</Badge>
        </div>
        <CardTitle>{exam.title}</CardTitle>
        <CardDescription>{exam.description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Durasi {exam.duration_in_minutes} menit
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Kelulusan minimal {exam.passing_score}%
          </div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          {exam.questionCount} soal pilihan ganda
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {hasCompleted ? (
          <>
            <Button
              variant="secondary"
              disabled
              className="w-full cursor-default rounded-lg border border-slate-200 bg-slate-100 text-slate-500"
            >
              Sudah Diselesaikan
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-lg border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              asChild
            >
              <Link href={`/tryout/${exam.id}/result?session=${sessionId}`}>
                Lihat Hasil
              </Link>
            </Button>
          </>
        ) : (
          <Button
            className="w-full rounded-lg bg-emerald-500 text-white shadow hover:bg-emerald-600"
            asChild
          >
            <Link href={`/tryout/${exam.id}`}>Mulai Tryout</Link>
          </Button>
        )}
      </div>
      </CardContent>
    </Card>
  );
}
