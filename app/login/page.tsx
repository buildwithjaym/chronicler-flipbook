"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const error = searchParams.get("error");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setIsLoading(false);
      toast({ title: "Login failed", description: signInError.message, variant: "error" });
      return;
    }

    toast({ title: "Welcome back", description: "Redirecting to the dashboard.", variant: "success" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="chronicler-container grid min-h-[calc(100vh-4rem)] place-items-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-chronicler-light text-chronicler-dark">
            <LockKeyhole className="h-7 w-7" />
          </div>
          <CardTitle className="text-center text-2xl">Admin Login</CardTitle>
          <p className="text-center text-sm leading-6 text-slate-600">
            Sign in with the Supabase Auth account assigned to the admin role.
          </p>
          {error === "admin_required" ? (
            <p className="rounded-2xl bg-red-50 p-3 text-center text-sm font-medium text-red-700">Admin access is required.</p>
          ) : null}
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input className="pl-10" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
              </div>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Password</span>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
            </label>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Signing in…" : "Login to Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
