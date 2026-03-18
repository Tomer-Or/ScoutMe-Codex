"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPin, MessageSquare, ShieldAlert, Trophy } from "lucide-react";

import { apiAddHighlight, apiCreatePost, apiGetPlayer, apiGetPlayers } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { PlayerProfile } from "@/lib/types";
import { Avatar } from "@/components/avatar";
import { ProfileBuilder } from "@/components/profile-builder";
import { StatChip } from "@/components/stat-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function MyProfileShell() {
  const { token, user, isReady } = useAuth();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [highlightTitle, setHighlightTitle] = useState("");
  const [highlightUrl, setHighlightUrl] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!isReady) return;
      if (!user || user.role !== "player") {
        setLoading(false);
        return;
      }
      try {
        const players = await apiGetPlayers();
        const ownCard = players.find((player) => player.user_id === user.id);
        if (!ownCard) {
          setProfile(null);
          setEditing(true);
          setLoading(false);
          return;
        }
        const fullProfile = await apiGetPlayer(String(ownCard.id));
        setProfile(fullProfile);
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [isReady, user]);

  async function refreshProfile() {
    if (!profile) return;
    const refreshed = await apiGetPlayer(String(profile.id));
    setProfile(refreshed);
  }

  async function submitHighlight() {
    if (!token || !profile || !highlightUrl) return;
    setStatus("Posting highlight...");
    try {
      await apiAddHighlight(token, profile.id, {
        title: highlightTitle || "New highlight",
        description: "Posted from My Profile",
        video_url: highlightUrl,
        thumbnail_url: ""
      });
      setHighlightTitle("");
      setHighlightUrl("");
      await refreshProfile();
      setStatus("Highlight posted.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not post highlight");
    }
  }

  async function submitPost() {
    if (!token || !profile || !postTitle.trim() || !postContent.trim()) return;
    setStatus("Posting update...");
    try {
      await apiCreatePost(token, { title: postTitle, content: postContent });
      setPostTitle("");
      setPostContent("");
      await refreshProfile();
      setStatus("Update posted to the home feed.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not post update");
    }
  }

  if (!isReady || loading) {
    return <main className="mx-auto max-w-7xl px-6 py-12"><Card className="p-6 text-sm text-slate-400">Loading your profile...</Card></main>;
  }

  if (!user || user.role !== "player") {
    return (
      <main className="mx-auto max-w-7xl px-6 py-12">
        <Card className="p-6 text-sm text-slate-400">Only player accounts have a personal profile page.</Card>
      </main>
    );
  }

  if (editing || !profile) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-12">
        {profile ? (
          <div className="mb-6 flex justify-end">
            <Button variant="secondary" onClick={() => setEditing(false)}>Back To Profile</Button>
          </div>
        ) : null}
        <ProfileBuilder
          existingProfile={profile}
          onProfileSaved={(saved) => {
            setProfile(saved);
            setEditing(false);
          }}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <Card className="relative overflow-hidden p-8">
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-r from-emerald-500/20 via-cyan-400/10 to-transparent" />
        <div className="relative grid gap-8 lg:grid-cols-[140px_1fr]">
          <Avatar
            alt={profile.full_name}
            className="h-32 w-32 rounded-[32px] text-4xl shadow-[0_20px_50px_rgba(2,6,23,0.5)]"
            initial={profile.full_name.slice(0, 1)}
            src={profile.profile_image_url}
          />
          <div className="space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-brand-text">{profile.full_name}</h1>
                <p className="mt-2 text-lg text-slate-300">{profile.primary_position}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge>Age {profile.age}</Badge>
                  <Badge className="border-white/10 bg-white/[0.04] text-slate-300">
                    <MapPin className="mr-1 h-3.5 w-3.5" />
                    {[profile.city, profile.country].filter(Boolean).join(", ") || "Location pending"}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button onClick={() => setEditing(true)}>Edit Profile</Button>
                <button className="rounded-full border border-brand-border bg-white/[0.03] px-5 py-3 text-sm font-semibold text-brand-text">
                  Share Profile
                </button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <StatChip label="Matches" value={profile.stats?.matches_played ?? 0} />
              <StatChip label="Goals" value={profile.stats?.goals ?? 0} />
              <StatChip label="Assists" value={profile.stats?.assists ?? 0} />
            </div>
            <p className="max-w-3xl text-slate-300">{profile.bio || "Player bio will appear here once added."}</p>
          </div>
        </div>
      </Card>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <Card className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-2xl font-semibold text-brand-text">Highlights</h2>
              <div className="grid gap-3 lg:grid-cols-[180px_1fr_auto]">
                <Input placeholder="Highlight title" value={highlightTitle} onChange={(e) => setHighlightTitle(e.target.value)} />
                <Input placeholder="YouTube or Vimeo URL" value={highlightUrl} onChange={(e) => setHighlightUrl(e.target.value)} />
                <Button onClick={submitHighlight}>Post Highlight</Button>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {profile.highlights.length > 0 ? profile.highlights.map((highlight) => (
                <Link
                  key={highlight.id}
                  className="rounded-3xl border border-brand-border bg-white/[0.03] p-4"
                  href={highlight.video_url}
                  target="_blank"
                >
                  <p className="font-semibold text-brand-text">{highlight.title}</p>
                  <p className="mt-2 text-sm text-slate-400">{highlight.description ?? "External highlight video"}</p>
                </Link>
              )) : (
                <div className="rounded-3xl border border-dashed border-brand-border p-6 text-sm text-slate-400">
                  Highlight videos will appear here as you upload reels.
                </div>
              )}
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-brand-text">Posts</h2>
              <Button variant="secondary" onClick={submitPost}>Post Update</Button>
            </div>
            <Input
              className="mt-4"
              placeholder="Post title"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
            />
            <Textarea
              className="mt-4"
              placeholder="Share a training update, match note, or availability post."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
            {status ? <p className="mt-3 text-sm text-slate-400">{status}</p> : null}
          </Card>
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-brand-text">Club History</h2>
            <div className="mt-4 space-y-4">
              {profile.clubs.length > 0 ? profile.clubs.map((club) => (
                <div key={club.id} className="rounded-3xl border border-brand-border bg-white/[0.03] p-4">
                  <p className="font-semibold text-brand-text">{club.club_name}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {club.start_date} - {club.end_date ?? "Present"} {club.position ? ` - ${club.position}` : ""}
                  </p>
                  {club.notes ? <p className="mt-2 text-sm text-slate-300">{club.notes}</p> : null}
                </div>
              )) : <p className="text-sm text-slate-400">Club history has not been added yet.</p>}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-brand-text">Comments & Updates</h2>
            <div className="mt-5 space-y-4">
              {profile.comments.map((comment) => (
                <div key={comment.id} className="rounded-3xl border border-brand-border bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-brand-text">{comment.author_email}</p>
                    <p className="text-xs text-slate-500">{new Date(comment.created_at).toLocaleString()}</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{comment.content}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-8">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-brand-text">Player Information</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>Secondary position: {profile.secondary_position ?? "Not listed"}</p>
              <p>Height: {profile.height ? `${profile.height} cm` : "Not listed"}</p>
              <p>Weight: {profile.weight ? `${profile.weight} kg` : "Not listed"}</p>
              <p>Dominant foot: {profile.dominant_foot ?? "Not listed"}</p>
              <p>Phone: {profile.phone ?? "Private"}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-brand-primary" />
              <h2 className="text-2xl font-semibold text-brand-text">Achievements</h2>
            </div>
            <div className="mt-4 space-y-4">
              {profile.achievements.length > 0 ? profile.achievements.map((achievement) => (
                <div key={achievement.id} className="rounded-3xl border border-brand-border bg-white/[0.03] p-4">
                  <p className="font-semibold text-brand-text">{achievement.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{achievement.year}</p>
                  {achievement.description ? <p className="mt-2 text-sm text-slate-300">{achievement.description}</p> : null}
                </div>
              )) : <p className="text-sm text-slate-400">Achievements have not been added yet.</p>}
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-brand-primary" />
              <h2 className="text-2xl font-semibold text-brand-text">Verification</h2>
            </div>
            <p className="mt-4 text-sm text-slate-400">Profiles are currently unverified.</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-brand-primary" />
              <h2 className="text-2xl font-semibold text-brand-text">Recommended Players</h2>
            </div>
            <p className="mt-4 text-sm text-slate-400">(Coming Soon)</p>
          </Card>
        </div>
      </div>
    </main>
  );
}
