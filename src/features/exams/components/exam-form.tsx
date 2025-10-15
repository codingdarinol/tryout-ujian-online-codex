"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ExamFormValues } from "../types";
import { examFormSchema } from "../types";

type ExamFormProps = {
  defaultValues?: Partial<ExamFormValues>;
  onSubmit: (values: ExamFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
};

export const ExamForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: ExamFormProps) => {
  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      duration_in_minutes: defaultValues?.duration_in_minutes ?? 60,
      passing_score: defaultValues?.passing_score ?? 70,
      max_attempts: defaultValues?.max_attempts ?? 1,
      package_id: defaultValues?.package_id ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      duration_in_minutes: defaultValues?.duration_in_minutes ?? 60,
      passing_score: defaultValues?.passing_score ?? 70,
      max_attempts: defaultValues?.max_attempts ?? 1,
      package_id: defaultValues?.package_id ?? "",
    });
  }, [defaultValues, form]);

  const handleSubmit = (values: ExamFormValues) => {
    const payload: ExamFormValues = {
      ...values,
      package_id: values.package_id ? values.package_id : null,
    };
    return onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
        noValidate
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Tryout</FormLabel>
              <FormControl>
                <Input
                  placeholder="Tryout Intensif PPh Badan"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi Singkat</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Deskripsi ringkas mengenai cakupan materi dan tujuan tryout."
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="duration_in_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durasi (menit)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={5}
                    max={240}
                    disabled={isSubmitting}
                    value={field.value ?? ""}
                    onChange={(event) => field.onChange(event.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="passing_score"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skor Kelulusan (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    disabled={isSubmitting}
                    value={field.value ?? ""}
                    onChange={(event) => field.onChange(event.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="max_attempts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batas Percobaan</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    disabled={isSubmitting}
                    value={field.value ?? ""}
                    onChange={(event) => field.onChange(event.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="package_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Paket (opsional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="PAKET-UTAMA-2025"
                  disabled={isSubmitting}
                  value={field.value ?? ""}
                  onChange={(event) => field.onChange(event.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
