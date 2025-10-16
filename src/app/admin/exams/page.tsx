"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Edit2, Trash2, HelpCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useDeleteExamMutation,
  useExamsQuery,
  usePublishToggleMutation,
} from "@/features/exams/hooks";
import type { ExamSummary } from "@/features/exams/types";

export default function ExamListPage() {
  const { data, isLoading } = useExamsQuery();
  const deleteExam = useDeleteExamMutation();
  const togglePublish = usePublishToggleMutation();
  const [selectedExam, setSelectedExam] = useState<ExamSummary | null>(null);

  const exams = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Manajemen Tryout
          </h1>
          <p className="text-sm text-muted-foreground">
            Buat, terbitkan, dan tata ulang paket tryout pajak secara aman.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/exams/new" className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Tryout
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Tryout</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Memuat daftar tryout…
              </p>
            </div>
          ) : exams.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 p-6 text-center">
              <HelpCircle className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">Belum ada tryout</p>
                <p className="text-sm text-muted-foreground">
                  Mulai dengan membuat tryout pertama untuk portal latihan
                  PahamPajak.
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead className="hidden w-48 text-center md:table-cell">
                    Durasi
                  </TableHead>
                  <TableHead className="hidden w-48 text-center lg:table-cell">
                    Skor Lulus
                  </TableHead>
                  <TableHead className="hidden text-center sm:table-cell">
                    Jumlah Soal
                  </TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-60 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="align-top">
                      <div className="max-w-md font-medium leading-tight lg:max-w-lg xl:max-w-xl">
                        <span className="line-clamp-2 break-words">
                          {exam.title}
                        </span>
                      </div>
                      {exam.description && (
                        <div className="mt-1 max-w-md text-xs text-muted-foreground leading-relaxed lg:max-w-lg xl:max-w-xl">
                          <span className="line-clamp-3 break-words">
                            {exam.description}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden text-center text-sm text-muted-foreground md:table-cell">
                      {exam.duration_in_minutes} menit
                    </TableCell>
                    <TableCell className="hidden text-center text-sm text-muted-foreground lg:table-cell">
                      {exam.passing_score}%
                    </TableCell>
                    <TableCell className="hidden text-center text-sm text-muted-foreground sm:table-cell">
                      {exam.questionCount}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={exam.is_published}
                          onCheckedChange={(checked) =>
                            togglePublish.mutate({
                              id: exam.id,
                              nextState: checked,
                            })
                          }
                          disabled={togglePublish.isPending}
                        />
                        <Badge
                          variant={exam.is_published ? "default" : "secondary"}
                        >
                          {exam.is_published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/exams/${exam.id}/questions`}>
                            Kelola Soal
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/admin/exams/${exam.id}/edit`}
                            className="gap-2"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-2"
                          onClick={() => setSelectedExam(exam)}
                          disabled={deleteExam.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!selectedExam}
        onOpenChange={(opened) => {
          if (!opened) {
            setSelectedExam(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus tryout?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus seluruh data tryout{" "}
              <strong>{selectedExam?.title}</strong> beserta seluruh soal di
              dalamnya. Langkah ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedExam(null)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (selectedExam) {
                  deleteExam.mutate(selectedExam.id, {
                    onSettled: () => setSelectedExam(null),
                  });
                }
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
