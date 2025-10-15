"use client";

import { useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  questionFormSchema,
  type QuestionFormValues,
  type QuestionWithOptions,
} from "../types";

type QuestionFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: QuestionFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  initialData?: QuestionWithOptions;
};

const defaultOptions = () =>
  Array.from({ length: 4 }, (_, index) => ({
    option_text: "",
    is_correct: index === 0,
  }));

const extractOptionValues = (
  question?: QuestionWithOptions
): QuestionFormValues => {
  if (!question) {
    return {
      question_text: "",
      explanation: "",
      options: defaultOptions(),
    };
  }

  return {
    id: question.id,
    question_text: question.question_text,
    explanation: question.explanation ?? "",
    options:
      question.question_options
        ?.sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map((option) => ({
          id: option.id,
          option_text: option.option_text,
          is_correct: option.is_correct,
        })) ?? defaultOptions(),
  };
};

export const QuestionFormModal = ({
  open,
  mode,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  initialData,
}: QuestionFormModalProps) => {
  const initialValues = useMemo(
    () => extractOptionValues(initialData),
    [initialData]
  );

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(initialValues);
    }
  }, [form, initialValues, open]);

  const correctIndex = form
    .watch("options")
    .findIndex((option) => option.is_correct);

  const handleCorrectChange = (value: string) => {
    const targetIndex = Number.parseInt(value, 10);
    const options = form.getValues("options").map((option, index) => ({
      ...option,
      is_correct: index === targetIndex,
    }));
    form.setValue("options", options, { shouldValidate: true });
  };

  const handleSubmit = (values: QuestionFormValues) => {
    const normalized: QuestionFormValues = {
      ...values,
      explanation: values.explanation ? values.explanation : null,
      options: values.options.map((option) => ({
        ...option,
        option_text: option.option_text.trim(),
      })),
    };

    return onSubmit(normalized);
  };

  const title =
    mode === "create" ? "Tambah Soal Baru" : "Edit Soal";
  const description =
    mode === "create"
      ? "Lengkapi soal dan tentukan satu jawaban yang benar."
      : "Perbarui teks soal atau pilih jawaban yang benar.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
            noValidate
          >
            <FormField
              control={form.control}
              name="question_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pertanyaan</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Tuliskan pertanyaan secara lengkap."
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
              name="explanation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Penjelasan (opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Berikan uraian singkat untuk memperkuat pemahaman peserta."
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <Label>Pilihan Jawaban</Label>
              <RadioGroup
                value={correctIndex === -1 ? "" : String(correctIndex)}
                onValueChange={handleCorrectChange}
                className="space-y-3"
              >
                {form.watch("options").map((option, index) => (
                  <div
                    key={option.id ?? index}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <RadioGroupItem
                      value={String(index)}
                      id={`option-${index}`}
                      disabled={isSubmitting}
                      className="mt-2"
                    />
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`option-${index}`} className="flex gap-2">
                        <span className="font-semibold">
                          Opsi {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Tandai untuk menjadikannya jawaban benar
                        </span>
                      </Label>
                      <FormField
                        control={form.control}
                        name={`options.${index}.option_text`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder={`Masukkan teks jawaban opsi ${
                                  String.fromCharCode(65 + index)
                                }`}
                                disabled={isSubmitting}
                                value={field.value ?? ""}
                                onChange={(event) =>
                                  field.onChange(event.target.value)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </RadioGroup>
              <FormMessage className="text-sm text-destructive">
                {form.formState.errors.options?.message?.toString()}
              </FormMessage>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
