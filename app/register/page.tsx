"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
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
import {
  authErrorMessage,
  displayNameSchema,
  emailSchema,
  signUp,
  useAuth,
  usernameSchema,
} from "@/hooks/use-auth";

const schema = z
  .object({
    displayName: displayNameSchema,
    username: usernameSchema,
    email: emailSchema,
    password: z.string().min(8, "At least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

type Values = z.infer<typeof schema>;

const fields: { name: keyof Values; label: string; type: string; autoComplete: string; placeholder: string }[] = [
  { name: "displayName", label: "Name", type: "text", autoComplete: "name", placeholder: "Your name" },
  { name: "username", label: "Username", type: "text", autoComplete: "username", placeholder: "e.g. deep_worker" },
  { name: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "you@example.com" },
  { name: "password", label: "Password", type: "password", autoComplete: "new-password", placeholder: "••••••••" },
  { name: "confirm", label: "Confirm Password", type: "password", autoComplete: "new-password", placeholder: "••••••••" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: "", username: "", email: "", password: "", confirm: "" },
  });

  useEffect(() => {
    if (!loading && user) router.replace("/tasks");
  }, [user, loading, router]);

  const onSubmit = form.handleSubmit(async ({ email, password, displayName, username }) => {
    setError(null);
    try {
      await signUp(email, password, displayName, username);
      toast.success("Account created", { icon: <UserPlus className="size-4" /> });
    } catch (e) {
      const message = authErrorMessage(e);
      if (message.includes("username")) form.setError("username", { message });
      else setError(message);
    }
  });

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10 font-sans min-h-screen">
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
              <CardTitle className="text-2xl">Create an account</CardTitle>
              <CardDescription>Keep your sessions and tasks in sync on every device.</CardDescription>
            </CardHeader>
            <CardContent
              className="flex flex-col gap-4"
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay="200"
              data-aos-offset="0"
            >
              {fields.map((f) => (
                <FormField
                  key={f.name}
                  control={form.control}
                  name={f.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{f.label}</FormLabel>
                      <FormControl>
                        {f.type === "password" ? (
                          <PasswordInput {...field} autoComplete={f.autoComplete} placeholder={f.placeholder} />
                        ) : (
                          <Input
                            {...field}
                            type={f.type}
                            autoComplete={f.autoComplete}
                            placeholder={f.placeholder}
                            onChange={(e) =>
                              field.onChange(f.name === "username" ? e.target.value.toLowerCase() : e.target.value)
                            }
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
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
                Create Account
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-2 hover:text-foreground">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
