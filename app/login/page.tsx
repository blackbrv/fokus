"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LogIn, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { authErrorMessage, emailSchema, resetPassword, signIn, useAuth } from "@/hooks/use-auth";

const schema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!loading && user) router.replace("/tasks");
  }, [user, loading, router]);

  const onSubmit = form.handleSubmit(async ({ email, password }) => {
    setError(null);
    try {
      await signIn(email, password);
      toast.success("Welcome back", { icon: <LogIn className="size-4" /> });
    } catch (e) {
      setError(authErrorMessage(e));
    }
  });

  const onForgot = async () => {
    if (!(await form.trigger("email"))) return;
    setResetting(true);
    try {
      await resetPassword(form.getValues("email"));
    } catch {
      /* Same message either way so we don't reveal which emails have accounts. */
    }
    setResetting(false);
    toast.success("If an account exists, a reset link is on its way", {
      icon: <Mail className="size-4" />,
    });
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 font-sans min-h-screen">
      <Card
        className="w-full max-w-[400px]"
        data-aos="fade-up"
        data-aos-duration="700"
        data-aos-offset="0"
      >
        <Form {...form}>
          <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
            <CardHeader
              className="text-center"
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay="100"
              data-aos-offset="0"
            >
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in to sync your sessions across devices.</CardDescription>
            </CardHeader>
            <CardContent
              className="flex flex-col gap-4"
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay="200"
              data-aos-offset="0"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" autoComplete="email" placeholder="you@example.com" />
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <button
                        type="button"
                        onClick={onForgot}
                        disabled={resetting}
                        className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline cursor-pointer disabled:opacity-50"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <FormControl>
                      <PasswordInput {...field} autoComplete="current-password" placeholder="••••••••" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </CardContent>
            <CardFooter
              className="flex-col gap-3"
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay="300"
              data-aos-offset="0"
            >
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Spinner />}
                Sign In
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="underline underline-offset-2 hover:text-foreground">
                  Register
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
