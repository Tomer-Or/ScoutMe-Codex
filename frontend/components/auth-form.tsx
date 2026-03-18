"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiLogin, apiRegister } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("player");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response =
        mode === "register"
          ? await apiRegister({ email, password, role })
          : await apiLogin({ email, password });
      setAuth(response);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-xl p-8">
      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-brand-secondary">
            {mode === "register" ? "Join ScoutMe" : "Welcome back"}
          </h1>
          <p className="text-sm text-slate-500">
            {mode === "register"
              ? "Create your account and choose how you want to use the platform."
              : "Login to manage your profile or discover your next signing."}
          </p>
        </div>
        {mode === "register" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              className={`rounded-3xl border p-4 text-left ${role === "player" ? "border-brand-primary bg-emerald-50" : "border-brand-border bg-white"}`}
              type="button"
              onClick={() => setRole("player")}
            >
              <div className="font-semibold text-brand-secondary">Player</div>
              <div className="mt-1 text-sm text-slate-500">Create and manage your football profile.</div>
            </button>
            <button
              className={`rounded-3xl border p-4 text-left ${role === "scout" ? "border-brand-primary bg-emerald-50" : "border-brand-border bg-white"}`}
              type="button"
              onClick={() => setRole("scout")}
            >
              <div className="font-semibold text-brand-secondary">Scout / Club</div>
              <div className="mt-1 text-sm text-slate-500">Search, filter, and evaluate player talent.</div>
            </button>
          </div>
        ) : null}
        <Input placeholder="name@club.com" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button className="w-full" disabled={loading} type="submit">
          {loading ? "Please wait..." : mode === "register" ? "Create account" : "Login"}
        </Button>
      </form>
    </Card>
  );
}
