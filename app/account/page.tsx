"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Check, LogOut, Mail, UserRound, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  authErrorMessage,
  displayNameSchema,
  isUsernameAvailable,
  resetPassword,
  saveProfile,
  signOut,
  useAuth,
  usernameSchema,
} from "@/hooks/use-auth";

const schema = z.object({ displayName: displayNameSchema, username: usernameSchema });
type Values = z.infer<typeof schema>;
type Availability = "idle" | "checking" | "available" | "taken";

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [availability, setAvailability] = useState<Availability>("idle");
  const [sendingReset, setSendingReset] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: "", username: "" },
  });
  const username = useWatch({ control: form.control, name: "username" });

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  // Load the saved profile into the form (and again after it changes elsewhere).
  useEffect(() => {
    if (profile) form.reset({ displayName: profile.displayName, username: profile.username });
  }, [profile, form]);

  // Debounced username availability check.
  useEffect(() => {
    if (!usernameSchema.safeParse(username).success || username === profile?.username) {
      setAvailability("idle"); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    setAvailability("checking");
    const t = setTimeout(async () => {
      try {
        setAvailability((await isUsernameAvailable(username)) ? "available" : "taken");
      } catch {
        setAvailability("idle");
      }
    }, 400);
    return () => clearTimeout(t);
  }, [username, profile?.username]);

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  const onSubmit = form.handleSubmit(async ({ displayName, username }) => {
    try {
      await saveProfile(user.uid, displayName, username);
      toast.success("Profile saved", { icon: <UserRound className="size-4" /> });
    } catch (e) {
      form.setError("username", { message: authErrorMessage(e) });
    }
  });

  const onReset = async () => {
    setSendingReset(true);
    try {
      await resetPassword(user.email!);
      toast.success(`Reset link sent to ${user.email}`, { icon: <Mail className="size-4" /> });
    } catch (e) {
      toast.error(authErrorMessage(e));
    }
    setSendingReset(false);
  };

  const onSignOut = async () => {
    await signOut();
    toast("Signed out", { icon: <LogOut className="size-4" /> });
  };

  return (
    <div className="flex flex-1 flex-col items-center pt-10 pb-24 px-4 font-sans min-h-screen">
      <div className="w-full max-w-[500px] flex flex-col gap-7">
        <h1
          className="text-3xl font-bold text-foreground"
          data-aos="fade-down"
          data-aos-duration="600"
          data-aos-offset="0"
        >
          Account
        </h1>

        <Card data-aos="fade-up" data-aos-duration="700" data-aos-offset="0">
          <CardHeader data-aos="fade-up" data-aos-duration="600" data-aos-delay="100" data-aos-offset="0">
            <CardTitle>Profile</CardTitle>
            {!profile && (
              <p className="text-sm text-foreground/50">Pick a name and username to finish setting up.</p>
            )}
          </CardHeader>
          <CardContent data-aos="fade-up" data-aos-duration="600" data-aos-delay="200" data-aos-offset="0">
            <Form {...form}>
              <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} autoComplete="name" placeholder="Your name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            @
                          </span>
                          <Input
                            {...field}
                            autoComplete="username"
                            className="pl-7 pr-9"
                            onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2" aria-live="polite">
                            {availability === "checking" && <Spinner className="text-muted-foreground" />}
                            {availability === "available" && (
                              <Check className="size-4 text-primary" aria-label="Available" />
                            )}
                            {availability === "taken" && (
                              <X className="size-4 text-destructive" aria-label="Taken" />
                            )}
                          </span>
                        </div>
                      </FormControl>
                      {availability === "taken" ? (
                        <p className="text-sm text-destructive">That username is taken.</p>
                      ) : (
                        <FormDescription>Lowercase letters, numbers and _ · 3–20 characters.</FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="self-end"
                  disabled={
                    form.formState.isSubmitting ||
                    (!!profile && !form.formState.isDirty) ||
                    availability === "taken" ||
                    availability === "checking"
                  }
                >
                  {form.formState.isSubmitting && <Spinner />}
                  Save changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card data-aos="fade-up" data-aos-duration="700" data-aos-delay="200" data-aos-offset="0">
          <CardHeader data-aos="fade-up" data-aos-duration="600" data-aos-delay="300" data-aos-offset="0">
            <CardTitle>Sign-in</CardTitle>
          </CardHeader>
          <CardContent
            className="flex flex-col gap-5"
            data-aos="fade-up"
            data-aos-duration="600"
            data-aos-delay="400"
            data-aos-offset="0"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email ?? ""} readOnly disabled />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" className="flex-1" onClick={onReset} disabled={sendingReset}>
                {sendingReset ? <Spinner /> : <Mail />}
                Send password reset
              </Button>
              <Button variant="outline" className="flex-1 hover:text-destructive" onClick={onSignOut}>
                <LogOut />
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
