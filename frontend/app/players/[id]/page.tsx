import Link from "next/link";
import { MapPin, MessageSquare, Phone, ShieldAlert, Trophy } from "lucide-react";

import { Avatar } from "@/components/avatar";
import { CommentBox } from "@/components/comment-box";
import { EndorseButton } from "@/components/endorse-button";
import { StartChatButton } from "@/components/start-chat-button";
import { StatChip } from "@/components/stat-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiGetPlayer } from "@/lib/api";

function formatDateRange(start: string, end?: string | null) {
  return `${start} - ${end ?? "Present"}`;
}

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const player = await apiGetPlayer(id);
  const location = [player.city, player.country].filter(Boolean).join(", ") || "Location pending";

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <Card className="relative overflow-hidden p-8">
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-r from-emerald-500/20 via-cyan-400/10 to-transparent" />
        <div className="relative grid gap-8 lg:grid-cols-[140px_1fr]">
          <Avatar
            alt={player.full_name}
            className="h-32 w-32 rounded-[32px] text-4xl shadow-[0_20px_50px_rgba(2,6,23,0.5)]"
            initial={player.full_name.slice(0, 1)}
            src={player.profile_image_url}
          />
          <div className="space-y-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-bold tracking-tight text-brand-text">{player.full_name}</h1>
                  <Badge>Available on ScoutMe</Badge>
                </div>
                <p className="mt-3 text-lg text-slate-300">
                  {player.primary_position} - {player.country ?? "ScoutMe"}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
                  <span>Age {player.age}</span>
                  <span>|</span>
                  <span>{player.height ? `${player.height} cm` : "Height not listed"}</span>
                  <span>|</span>
                  <span>{player.dominant_foot ?? "Foot not listed"}</span>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 text-sm text-slate-400">
                  <MapPin className="h-4 w-4 text-emerald-300" />
                  {location}
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
                <EndorseButton playerId={player.id} count={player.endorsement_count} />
                <StartChatButton targetUserId={player.user_id} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatChip label="Matches" value={player.stats?.matches_played ?? 0} />
              <StatChip label="Goals" value={player.stats?.goals ?? 0} />
              <StatChip label="Assists" value={player.stats?.assists ?? 0} />
              <StatChip label="Clean sheets" value={player.stats?.clean_sheets ?? 0} />
            </div>
            <p className="max-w-4xl text-base leading-7 text-slate-300">
              {player.bio || "This player has not added a bio yet. Highlight clips, stats, and career history appear below."}
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-8">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-brand-text">Highlights</h2>
                <p className="mt-2 text-sm text-slate-400">Scouts can review footage first, then move deeper into the player record.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {player.highlights.length > 0 ? (
                player.highlights.map((highlight) => (
                  <Link
                    key={highlight.id}
                    className="rounded-[24px] border border-brand-border bg-white/[0.03] p-5 transition hover:-translate-y-0.5 hover:bg-brand-hover"
                    href={highlight.video_url}
                    target="_blank"
                  >
                    <p className="text-lg font-semibold text-brand-text">{highlight.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{highlight.description ?? "External highlight video"}</p>
                    <p className="mt-4 text-sm font-semibold text-emerald-300">Watch highlight</p>
                  </Link>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-brand-border p-6 text-sm text-slate-400">
                  Highlight videos will appear here as the player uploads reels.
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-brand-text">Club History</h2>
            <div className="mt-5 space-y-4">
              {player.clubs.length > 0 ? (
                player.clubs.map((club) => (
                  <div key={club.id} className="rounded-[24px] border border-brand-border bg-white/[0.03] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-lg font-semibold text-brand-text">{club.club_name}</p>
                      <p className="text-sm text-slate-400">{formatDateRange(club.start_date, club.end_date)}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{club.position ?? player.primary_position}</p>
                    {club.notes ? <p className="mt-3 text-sm leading-6 text-slate-400">{club.notes}</p> : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">Club history has not been added yet.</p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-brand-text">Stats</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatChip label="Matches" value={player.stats?.matches_played ?? 0} />
              <StatChip label="Minutes" value={player.stats?.minutes_played ?? 0} />
              <StatChip label="Goals" value={player.stats?.goals ?? 0} />
              <StatChip label="Assists" value={player.stats?.assists ?? 0} />
              <StatChip label="Clean sheets" value={player.stats?.clean_sheets ?? 0} />
              <StatChip label="Endorsements" value={player.endorsement_count} />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-brand-text">Comments</h2>
            <div className="mt-5">
              <CommentBox playerId={player.id} />
            </div>
            <div className="mt-6 space-y-4">
              {player.comments.length > 0 ? (
                player.comments.map((comment) => (
                  <div key={comment.id} className="rounded-[24px] border border-brand-border bg-white/[0.02] p-4">
                    <div className="flex items-start gap-3">
                      <Avatar
                        alt={comment.author_email}
                        className="h-11 w-11 rounded-2xl text-sm"
                        initial={comment.author_email.slice(0, 1).toUpperCase()}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-brand-text">{comment.author_email}</p>
                          <p className="text-xs text-slate-500">{new Date(comment.created_at).toLocaleString()}</p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No comments yet.</p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-brand-text">Player Info</h2>
            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <div className="rounded-[22px] border border-brand-border bg-white/[0.03] p-4">
                Secondary position: {player.secondary_position ?? "Not listed"}
              </div>
              <div className="rounded-[22px] border border-brand-border bg-white/[0.03] p-4">
                Height: {player.height ? `${player.height} cm` : "Not listed"}
              </div>
              <div className="rounded-[22px] border border-brand-border bg-white/[0.03] p-4">
                Weight: {player.weight ? `${player.weight} kg` : "Not listed"}
              </div>
              <div className="rounded-[22px] border border-brand-border bg-white/[0.03] p-4">
                Dominant foot: {player.dominant_foot ?? "Not listed"}
              </div>
              <div className="rounded-[22px] border border-brand-border bg-white/[0.03] p-4">
                <span className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-300" />
                  {player.phone ?? "Private"}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-emerald-300" />
              <h2 className="text-2xl font-semibold text-brand-text">Achievements</h2>
            </div>
            <div className="mt-5 space-y-4">
              {player.achievements.length > 0 ? (
                player.achievements.map((achievement) => (
                  <div key={achievement.id} className="rounded-[24px] border border-brand-border bg-white/[0.03] p-5">
                    <p className="text-lg font-semibold text-brand-text">{achievement.title}</p>
                    <p className="mt-1 text-sm text-emerald-300">{achievement.year}</p>
                    {achievement.description ? <p className="mt-3 text-sm leading-6 text-slate-400">{achievement.description}</p> : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">Achievements have not been added yet.</p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-emerald-300" />
              <h2 className="text-2xl font-semibold text-brand-text">Verification</h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">Profiles are currently unverified. Identity and profile verification will be added in a future release.</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-emerald-300" />
              <h2 className="text-2xl font-semibold text-brand-text">Recommended Players</h2>
            </div>
            <p className="mt-4 text-sm text-slate-400">(Coming Soon)</p>
          </Card>
        </div>
      </div>
    </main>
  );
}
