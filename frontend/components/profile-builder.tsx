"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiAddHighlight, apiCreateProfile, apiGetPlayer, apiUpdateProfile, apiUpsertStats } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { PlayerProfile } from "@/lib/types";

const initialProfile = {
  full_name: "",
  phone: "",
  city: "",
  country: "",
  profile_image_url: "",
  primary_position: "",
  secondary_position: "",
  age: "",
  height: "",
  weight: "",
  dominant_foot: "",
  bio: ""
};

export function ProfileBuilder({
  existingProfile,
  onProfileSaved
}: {
  existingProfile?: PlayerProfile | null;
  onProfileSaved?: (profile: PlayerProfile) => void;
}) {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(initialProfile);
  const [stats, setStats] = useState({
    matches_played: 0,
    goals: 0,
    assists: 0,
    minutes_played: 0,
    clean_sheets: 0,
    custom_notes: ""
  });
  const [highlightUrl, setHighlightUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!existingProfile) return;
    setProfile({
      full_name: existingProfile.full_name,
      phone: existingProfile.phone ?? "",
      city: existingProfile.city ?? "",
      country: existingProfile.country ?? "",
      profile_image_url: existingProfile.profile_image_url ?? "",
      primary_position: existingProfile.primary_position,
      secondary_position: existingProfile.secondary_position ?? "",
      age: String(existingProfile.age),
      height: existingProfile.height ? String(existingProfile.height) : "",
      weight: existingProfile.weight ? String(existingProfile.weight) : "",
      dominant_foot: existingProfile.dominant_foot ?? "",
      bio: existingProfile.bio ?? ""
    });
    if (existingProfile.stats) {
      setStats({
        matches_played: existingProfile.stats.matches_played,
        goals: existingProfile.stats.goals,
        assists: existingProfile.stats.assists,
        minutes_played: existingProfile.stats.minutes_played,
        clean_sheets: existingProfile.stats.clean_sheets,
        custom_notes: existingProfile.stats.custom_notes ?? ""
      });
    }
  }, [existingProfile]);

  if (user?.role !== "player") {
    return (
      <Card className="p-8">
        <h2 className="text-xl font-semibold text-brand-secondary">Scout dashboard</h2>
        <p className="mt-2 text-sm text-slate-500">
          Search players, leave comments, and endorse standout talent. Messaging and AI recommendations are reserved for the next phase.
        </p>
      </Card>
    );
  }

  async function handleSave() {
    if (!token) return;
    if (!profile.full_name || !profile.primary_position || !profile.age) {
      setStatus("Full name, primary position, and age are required.");
      return;
    }
    setStatus("Saving profile...");
    try {
      const payload = {
        ...profile,
        age: Number(profile.age),
        height: profile.height ? Number(profile.height) : null,
        weight: profile.weight ? Number(profile.weight) : null,
        dominant_foot: profile.dominant_foot || null,
        phone: profile.phone || null,
        city: profile.city || null,
        country: profile.country || null,
        profile_image_url: profile.profile_image_url || null,
        secondary_position: profile.secondary_position || null,
        bio: profile.bio || null
      };
      const savedProfile = existingProfile
        ? await apiUpdateProfile(token, existingProfile.id, payload)
        : await apiCreateProfile(token, payload);
      await apiUpsertStats(token, savedProfile.id, stats);
      if (highlightUrl) {
        await apiAddHighlight(token, savedProfile.id, {
          title: "Latest highlight reel",
          description: "Added from dashboard",
          video_url: highlightUrl,
          thumbnail_url: ""
        });
      }
      if (onProfileSaved) {
        const refreshedProfile = await apiGetPlayer(String(savedProfile.id));
        onProfileSaved(refreshedProfile);
      }
      setStatus("Profile saved successfully.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save profile");
    }
  }

  const completeness = Math.min(
    100,
    Math.round(
      [
        profile.full_name,
        profile.city,
        profile.country,
        profile.primary_position,
        profile.bio,
        highlightUrl || existingProfile?.highlights?.length,
        stats.matches_played > 0
      ].filter(Boolean).length * 14.2
    )
  );

  return (
    <div className="space-y-6">
      <Card className="bg-brand-secondary p-6 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">My Profile</p>
            <h1 className="mt-2 text-3xl font-bold">
              {existingProfile ? "Update your football profile" : "Build your football story"}
            </h1>
          </div>
          <div className="min-w-[220px] rounded-3xl bg-white/10 p-4">
            <p className="text-sm text-emerald-100">Profile completeness</p>
            <p className="mt-2 text-4xl font-bold">{completeness}%</p>
          </div>
        </div>
      </Card>
      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Full name" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
          <Input placeholder="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          <Input placeholder="City" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
          <Input placeholder="Country" value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })} />
          <Input placeholder="Primary position" value={profile.primary_position} onChange={(e) => setProfile({ ...profile, primary_position: e.target.value })} />
          <Input placeholder="Secondary position" value={profile.secondary_position} onChange={(e) => setProfile({ ...profile, secondary_position: e.target.value })} />
          <Input placeholder="Age" type="number" value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} />
          <Input placeholder="Height (cm)" type="number" value={profile.height} onChange={(e) => setProfile({ ...profile, height: e.target.value })} />
          <Input placeholder="Weight (kg)" type="number" value={profile.weight} onChange={(e) => setProfile({ ...profile, weight: e.target.value })} />
          <Input placeholder="Dominant foot" value={profile.dominant_foot} onChange={(e) => setProfile({ ...profile, dominant_foot: e.target.value })} />
          <Input placeholder="Profile image URL" value={profile.profile_image_url} onChange={(e) => setProfile({ ...profile, profile_image_url: e.target.value })} className="md:col-span-2" />
          <Textarea placeholder="Tell scouts who you are, how you play, and what kind of team you help most." value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="md:col-span-2" />
        </div>
      </Card>
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-brand-secondary">Performance snapshot</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Input placeholder="Matches" type="number" value={stats.matches_played} onChange={(e) => setStats({ ...stats, matches_played: Number(e.target.value) })} />
          <Input placeholder="Goals" type="number" value={stats.goals} onChange={(e) => setStats({ ...stats, goals: Number(e.target.value) })} />
          <Input placeholder="Assists" type="number" value={stats.assists} onChange={(e) => setStats({ ...stats, assists: Number(e.target.value) })} />
          <Input placeholder="Minutes played" type="number" value={stats.minutes_played} onChange={(e) => setStats({ ...stats, minutes_played: Number(e.target.value) })} />
          <Input placeholder="Clean sheets" type="number" value={stats.clean_sheets} onChange={(e) => setStats({ ...stats, clean_sheets: Number(e.target.value) })} />
          <Input placeholder="Highlight URL" value={highlightUrl} onChange={(e) => setHighlightUrl(e.target.value)} />
        </div>
        <Textarea
          className="mt-4"
          placeholder="Add context on your role, league level, pressing responsibilities, or tactical strengths."
          value={stats.custom_notes}
          onChange={(e) => setStats({ ...stats, custom_notes: e.target.value })}
        />
      </Card>
      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Recent comments</p>
            <p className="mt-3 text-lg font-semibold text-brand-secondary">{existingProfile?.comments.length ?? 0}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Endorsements</p>
            <p className="mt-3 text-lg font-semibold text-brand-secondary">{existingProfile?.endorsement_count ?? 0}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Verification</p>
            <p className="mt-3 text-lg font-semibold text-brand-secondary">Unverified</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">{status ?? "Keep your profile current so scouts can trust the snapshot they see."}</p>
          <Button onClick={handleSave}>Save Profile</Button>
        </div>
      </Card>
    </div>
  );
}
