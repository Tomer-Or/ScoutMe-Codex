"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircleMore } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function SiteHeader() {
  const router = useRouter();
  const { isReady, user, setAuth } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-brand-border bg-white/88 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary text-lg font-extrabold text-white">
            S
          </div>
          <div>
            <div className="text-lg font-bold text-brand-text">ScoutMe</div>
            <div className="text-xs text-slate-500">Talent discovery platform</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          <Link href="/search">Search Players</Link>
          <Link href="/#trending">Trending</Link>
          <Link href="/">Home</Link>
          <Link href="/dashboard">My Profile</Link>
        </nav>
        <div className="flex items-center gap-3">
          {!isReady ? null : user ? (
            <Button variant="ghost" className="flex items-center gap-2" onClick={() => router.push("/chat")}>
              <MessageCircleMore className="h-5 w-5" />
              <span className="hidden sm:inline">Chat</span>
            </Button>
          ) : null}
          {!isReady ? null : user ? (
            <Button
              variant="ghost"
              onClick={() => {
                setAuth(null);
                router.push("/");
              }}
            >
              Logout
            </Button>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
