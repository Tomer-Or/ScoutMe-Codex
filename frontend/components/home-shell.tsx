"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Compass, Play, Search, Sparkles, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar } from "@/components/avatar";
import { PlayerCard } from "@/components/player-card";
import { SectionTitle } from "@/components/section-title";
import { StatChip } from "@/components/stat-chip";
import { TrendingPlayerRow } from "@/components/trending-player-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiCreatePost } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { FeedItem, PlayerCard as PlayerCardType } from "@/lib/types";

function FeedComposer({ role }: { role: "player" | "scout" }) {
  const router = useRouter();
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submitPost() {
    if (!token || !title.trim() || !content.trim()) return;
    setSubmitting(true);
    setMessage(null);
    try {
      await apiCreatePost(token, { title, content });
      setTitle("");
      setContent("");
      setMessage(role === "scout" ? "Club post published." : "Player update published.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not publish post");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle
          title={role === "scout" ? "Post A Club Update" : "Post An Update"}
          description={
            role === "scout"
              ? "Announce a trial day, recruiting need, or scouting focus for the feed."
              : "Share a game summary, training note, or update that belongs in the feed."
          }
        />
        <Badge className={role === "scout" ? "border-amber-200 bg-amber-50 text-amber-700" : undefined}>
          {role === "scout" ? "Club Post" : "Player Update"}
        </Badge>
      </div>
      <div className="mt-5 grid gap-3">
        <Input placeholder={role === "scout" ? "Example: Open Trial Day For U19 Midfielders" : "Example: Match Summary vs Hapoel Academy"} value={title} onChange={(event) => setTitle(event.target.value)} />
        <Textarea
          placeholder={
            role === "scout"
              ? "Describe what profiles you are looking for, what date matters, and how players should stand out."
              : "Summarize the match, your performance, and what viewers should notice in your latest clip."
          }
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">{message ?? "Feed posts stay separate from endorsements and comments."}</p>
        <Button disabled={!token || submitting || !title.trim() || !content.trim()} onClick={submitPost}>
          {submitting ? "Publishing..." : "Publish Post"}
        </Button>
      </div>
    </Card>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  const authorLocation = [item.author_position, item.author_location].filter(Boolean).join(" - ");
  const authorLink = item.player_profile_id ? `/players/${item.player_profile_id}` : null;

  const mediaCard = (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-100 bg-gradient-to-br from-cyan-100 via-emerald-50 to-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge className="border-cyan-200 bg-cyan-50 text-cyan-700">Highlight</Badge>
            <h3 className="mt-4 text-2xl font-semibold text-brand-text">{item.title}</h3>
            {item.content ? <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{item.content}</p> : null}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-200 bg-white text-cyan-700 shadow-sm">
            <Play className="h-5 w-5" />
          </div>
        </div>
        {item.video_url ? (
          <Link href={item.video_url} target="_blank" className="mt-5 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-cyan-200 hover:bg-cyan-50">
            Watch Highlight
          </Link>
        ) : null}
      </div>
        <div className="flex items-center gap-4 p-5">
          <Avatar
            alt={item.author_name}
            className="h-14 w-14 rounded-[20px] text-lg"
            initial={item.author_name.slice(0, 1)}
            src={item.author_avatar_url}
          />
          <div className="min-w-0">
            {authorLink ? (
              <Link href={authorLink} className="font-semibold text-brand-text">
                {item.author_name}
              </Link>
            ) : (
              <p className="font-semibold text-brand-text">{item.author_name}</p>
            )}
            {authorLocation ? <p className="text-sm text-slate-500">{authorLocation}</p> : null}
          </div>
        </div>
    </Card>
  );

  const postCard = (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <Avatar
          alt={item.author_name}
          className="h-14 w-14 rounded-[20px] text-lg"
          initial={item.author_name.slice(0, 1)}
          src={item.author_avatar_url}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={item.author_role === "scout" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}>
              {item.author_role === "scout" ? "Club Post" : "Player Update"}
            </Badge>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{new Date(item.created_at).toLocaleDateString()}</p>
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-brand-text">{item.title}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">{item.content}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            {authorLink ? (
              <Link href={authorLink} className="font-medium text-brand-text">
                {item.author_name}
              </Link>
            ) : (
              <span className="font-medium text-brand-text">{item.author_name}</span>
            )}
            {authorLocation ? <span>{authorLocation}</span> : null}
          </div>
          {item.video_url ? (
            <Link href={item.video_url} target="_blank" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
              <Play className="h-4 w-4" />
              Watch linked highlight
            </Link>
          ) : null}
        </div>
      </div>
    </Card>
  );

  return item.item_type === "highlight" ? mediaCard : postCard;
}

function FeedSection({ items }: { items: FeedItem[] }) {
  return (
    <section>
      <SectionTitle title="ScoutMe Feed" description="Latest club announcements, player summaries, and fresh highlights posted across the platform." />
      <div className="mt-6 space-y-5">
        {items.map((item) => (
          <FeedCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function ScoutSidebar({ trendingPlayers, feedItems }: { trendingPlayers: PlayerCardType[]; feedItems: FeedItem[] }) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <SectionTitle title="Scout Radar" description="Shortlist movement and content flow at a glance." />
        <div className="mt-5 grid gap-3">
          <StatChip label="Trending players" value={trendingPlayers.length} />
          <StatChip label="Feed items" value={feedItems.length} />
          <StatChip label="Club posts" value={feedItems.filter((item) => item.author_role === "scout").length} />
        </div>
      </Card>
      <Card id="trending" className="p-6">
        <SectionTitle title="Trending Players" description="Strong endorsement momentum and scouting attention." />
        <div className="mt-6 space-y-3">
          {trendingPlayers.slice(0, 5).map((player) => (
            <TrendingPlayerRow key={player.id} player={player} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function PlayerSidebar({
  ownProfile,
  samePositionPlayers,
  feedItems
}: {
  ownProfile?: PlayerCardType;
  samePositionPlayers: PlayerCardType[];
  feedItems: FeedItem[];
}) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <SectionTitle title="My Momentum" description="Your profile and platform visibility in one view." />
        {ownProfile ? (
          <div className="mt-6">
            <div className="flex items-center gap-4">
              <Avatar
                alt={ownProfile.full_name}
                className="h-16 w-16 rounded-[24px] text-xl"
                initial={ownProfile.full_name.slice(0, 1)}
                src={ownProfile.profile_image_url}
              />
              <div>
                <p className="text-lg font-semibold text-brand-text">{ownProfile.full_name}</p>
                <p className="text-sm text-slate-500">{ownProfile.primary_position}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              <StatChip label="Endorsements" value={ownProfile.endorsement_count} />
              <StatChip label="Comments" value={ownProfile.comments_count} />
              <StatChip label="Feed posts live" value={feedItems.filter((item) => item.author_user_id === ownProfile.user_id).length} />
            </div>
            <div className="mt-5 flex gap-3">
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full">Open My Profile</Button>
              </Link>
              <Link href="/search" className="flex-1">
                <Button className="w-full" variant="secondary">
                  Discover Players
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-sm leading-6 text-slate-500">Create your player profile to unlock feed posts, highlights, and scouting visibility across the platform.</p>
            <Link href="/dashboard">
              <Button>Create My Profile</Button>
            </Link>
          </div>
        )}
      </Card>
      <Card className="p-6">
        <SectionTitle title="Players To Watch" description="Profiles around your position and current discovery flow." />
        <div className="mt-6 space-y-3">
          {samePositionPlayers.slice(0, 5).map((player) => (
            <TrendingPlayerRow key={player.id} player={player} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function LoggedInHome({
  players,
  feedItems,
  role,
  userId
}: {
  players: PlayerCardType[];
  feedItems: FeedItem[];
  role: "player" | "scout";
  userId: number;
}) {
  const [query, setQuery] = useState("");
  const trendingPlayers = useMemo(
    () => [...players].sort((a, b) => b.endorsement_count - a.endorsement_count).slice(0, 6),
    [players]
  );
  const recentPlayers = useMemo(
    () =>
      [...players]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 4),
    [players]
  );
  const ownProfile = useMemo(() => players.find((player) => player.user_id === userId), [players, userId]);
  const samePositionPlayers = useMemo(() => {
    if (!ownProfile) return trendingPlayers;
    return players.filter((player) => player.id !== ownProfile.id && player.primary_position === ownProfile.primary_position);
  }, [ownProfile, players, trendingPlayers]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <section className="mb-10">
        <Card className="relative overflow-hidden p-8">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-emerald-100 via-cyan-50 to-transparent" />
          <div className="relative">
            <p className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
              {role === "scout" ? "Club & Scout Home" : "Player Home"}
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-brand-text sm:text-5xl">
              The feed comes first, then discovery.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Follow recruiting notes, player game summaries, and posted highlights at the top of the platform, then move into trending players and deeper discovery.
            </p>
            <div className="mt-8">
              <form action="/search" className="flex flex-1 items-center gap-3 rounded-[24px] border border-brand-border bg-white p-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                <Search className="h-5 w-5 text-emerald-600" />
                <Input
                  className="h-12 border-0 bg-transparent px-0 focus:ring-0"
                  name="q"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={role === "scout" ? "Search players by position, country, or profile traits" : "Search players, positions, and fresh names on the platform"}
                  value={query}
                />
                <Button className="whitespace-nowrap" type="submit">
                  Search Players
                </Button>
              </form>
            </div>
          </div>
        </Card>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-8">
          <FeedComposer role={role} />
          <FeedSection items={feedItems} />
        </div>
        <div className="space-y-8">
          {role === "scout" ? (
            <ScoutSidebar feedItems={feedItems} trendingPlayers={trendingPlayers} />
          ) : (
            <PlayerSidebar feedItems={feedItems} ownProfile={ownProfile} samePositionPlayers={samePositionPlayers} />
          )}

          <section>
            <div className="flex items-end justify-between gap-4">
              <SectionTitle title="Recently Added Players" description="Fresh profiles that just became discoverable on ScoutMe." />
              <Link href="/search" className="hidden items-center gap-2 text-sm font-semibold text-emerald-600 sm:inline-flex">
                Browse all players
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {recentPlayers.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </section>

          {role === "scout" ? (
            <section>
              <div className="flex items-end justify-between gap-4">
                <SectionTitle title="Trending Players" description="Players drawing the strongest platform interest." />
                <Link href="/search" className="hidden items-center gap-2 text-sm font-semibold text-emerald-600 sm:inline-flex">
                  Open full search
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {trendingPlayers.slice(0, 4).map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function LandingView() {
  return (
    <section className="relative overflow-hidden border-b border-brand-border/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
            ScoutMe platform
          </p>
          <h1 className="max-w-3xl text-5xl font-extrabold leading-tight text-brand-text">
            The football network where players, scouts, and clubs stay visible
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Build a profile with footage, stats, and club history, then make discovery feel immediate for the people looking for real talent.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/register">
              <Button className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/search">
              <Button className="w-full sm:w-auto" variant="secondary">
                Discover Players
              </Button>
            </Link>
          </div>
        </div>
        <Card className="overflow-hidden p-8">
          <div className="rounded-[28px] border border-emerald-100 bg-white p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-700">Platform snapshot</p>
            <div className="mt-6 grid gap-4">
              <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-5">
                <p className="text-sm text-cyan-700">Feed</p>
                <p className="mt-2 text-2xl font-semibold text-brand-text">Player summaries, club recruiting notes, and posted highlights</p>
              </div>
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
                <p className="text-sm text-emerald-700">Discovery</p>
                <p className="mt-2 text-2xl font-semibold text-brand-text">Search by role, age, height, foot, and location</p>
              </div>
              <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
                <p className="text-sm text-amber-700">Roadmap</p>
                <p className="mt-2 text-2xl font-semibold text-brand-text">Messaging, AI, and verification are queued next</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

export function HomeShell({
  players,
  feedItems
}: {
  players: PlayerCardType[];
  feedItems: FeedItem[];
}) {
  const { isReady, user } = useAuth();
  if (!isReady) {
    return <main className="pb-16" />;
  }
  if (!user) {
    return <LandingView />;
  }
  return <LoggedInHome feedItems={feedItems} players={players} role={user.role} userId={user.id} />;
}
