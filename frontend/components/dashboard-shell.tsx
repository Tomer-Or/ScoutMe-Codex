"use client";

import { useEffect, useState } from "react";

import { ProfileBuilder } from "@/components/profile-builder";
import { Card } from "@/components/ui/card";
import { apiGetPlayer, apiGetPlayers } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { PlayerProfile } from "@/lib/types";

export function DashboardShell() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!user || user.role !== "player") {
        setLoading(false);
        return;
      }

      try {
        const players = await apiGetPlayers();
        const ownCard = players.find((player) => player.user_id === user.id);
        if (!ownCard) {
          setProfile(null);
          setStatus("Your profile is still empty. Fill in your details to go live.");
          setLoading(false);
          return;
        }

        const fullProfile = await apiGetPlayer(String(ownCard.id));
        setProfile(fullProfile);
        setStatus(null);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not load your profile");
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [user]);

  return (
    <>
      {loading ? (
        <Card className="p-6 text-sm text-slate-500">Loading your profile...</Card>
      ) : (
        <ProfileBuilder existingProfile={profile} onProfileSaved={setProfile} />
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-brand-secondary">Recommended Players</h2>
          <p className="mt-3 text-sm text-slate-500">(Coming Soon)</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-brand-secondary">Messaging</h2>
          <p className="mt-3 text-sm text-slate-500">Message player (Coming Soon)</p>
        </Card>
      </div>
      {status ? (
        <Card className="mt-6 border-emerald-100 bg-emerald-50 p-4 text-sm text-brand-primary">{status}</Card>
      ) : null}
    </>
  );
}
