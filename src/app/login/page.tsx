"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email wajib diisi." })
    .email("Gunakan format email yang valid."),
  password: z
    .string({ required_error: "Kata sandi wajib diisi." })
    .min(6, "Kata sandi minimal 6 karakter."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useSupabase();
  const signIn = useAuthStore((state) => state.signIn);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await signIn(supabase, values);
      const { profile } = useAuthStore.getState();
      const defaultRoute = profile?.role === "admin" ? "/admin" : "/dashboard";
      const redirectTo = searchParams?.get("redirectTo") ?? defaultRoute;

      toast.success(
        profile?.role === "admin"
          ? "Berhasil masuk sebagai admin."
          : "Berhasil masuk ke portal tryout."
      );

      router.replace(redirectTo);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat melakukan autentikasi.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            PahamPajak Portal Login
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Masuk untuk mengelola atau mengikuti tryout sesuai hak akses Anda.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
              noValidate
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="admin@pahampajak.id"
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kata Sandi</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder="Masukkan kata sandi"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Memproses..."
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Masuk
                  </>
                )}
              </Button>
            </form>
          </Form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Hubungi administrator jika membutuhkan akses tambahan atau perubahan
            paket tryout.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
