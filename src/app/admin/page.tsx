"use client";

import Link from "next/link";
import { useMemo } from "react";
import { FileQuestion, Layers3, ShieldCheck, UploadCloud } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useExamsQuery } from "@/features/exams/hooks";

export default function AdminDashboard() {
  const { data: exams, isLoading } = useExamsQuery();

  const stats = useMemo(() => {
    if (!exams) {
      return {
        total: 0,
        published: 0,
        draft: 0,
        questionTotal: 0,
      };
    }

    const published = exams.filter((exam) => exam.is_published).length;
    const questionTotal = exams.reduce(
      (total, exam) => total + exam.questionCount,
      0
    );

    return {
      total: exams.length,
      published,
      draft: exams.length - published,
      questionTotal,
    };
  }, [exams]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge variant="outline" className="mb-2 border-emerald-400 text-emerald-600">
              PahamPajak Tryout Admin
            </Badge>
            <h1 className="text-2xl font-semibold tracking-tight">
              Selamat datang kembali 👋
            </h1>
            <p className="text-sm text-muted-foreground">
              Awali hari dengan memeriksa status konten dan pastikan semua tryout siap dipublikasikan.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/admin/exams/new" className="gap-2">
              <UploadCloud className="h-5 w-5" />
              Buat Tryout Baru
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tryout</CardTitle>
            <Layers3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? "-" : stats.total}
            </div>
            <p className="text-xs text-muted-foreground">
              Semua paket tryout yang tersedia di portal.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dipublikasikan</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? "-" : stats.published}
            </div>
            <p className="text-xs text-muted-foreground">
              Tryout yang dapat diakses oleh peserta.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? "-" : stats.draft}
            </div>
            <p className="text-xs text-muted-foreground">
              Tryout yang masih menunggu review konten.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Soal</CardTitle>
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? "-" : stats.questionTotal}
            </div>
            <p className="text-xs text-muted-foreground">
              Akumulasi soal di semua tryout.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checklist Kualitas Konten</CardTitle>
          <CardDescription>
            Terapkan langkah-langkah berikut sebelum mempublikasikan tryout baru.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-semibold">Validasi Materi</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Pastikan soal sesuai dengan regulasi pajak terbaru dan sudah diverifikasi oleh reviewer.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-semibold">Pengacakan Opsi</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              System otomatis mengacak opsi setiap kali peserta memulai tryout untuk mengurangi kecurangan.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-semibold">Monitoring Status</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Periksa log aktivitas admin secara berkala untuk mengaudit perubahan kritis.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-semibold">Laporan Kinerja</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Modul analitik akan menampilkan kinerja peserta setelah fase user-facing dirilis.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
