import Link from "next/link";
import { ArrowUpRight, MapPin, MessageSquare, ThumbsUp } from "lucide-react";

import { Avatar } from "@/components/avatar";
import { StatChip } from "@/components/stat-chip";
import { Card } from "@/components/ui/card";
import type { PlayerCard as PlayerCardType } from "@/lib/types";

export function PlayerCard({ player }: { player: PlayerCardType }) {
  const location = [player.city, player.country].filter(Boolean).join(", ") || "Location pending";
  const foot = player.dominant_foot ? `${player.dominant_foot} Foot` : "Foot pending";

  return (
    <Link href={`/players/${player.id}`} className="block h-full">
      <Card className="group flex h-full flex-col justify-between p-6 transition duration-200 hover:-translate-y-1.5 hover:border-emerald-300 hover:bg-[#fbfefb] hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
        <div>
          <div className="flex items-start gap-4">
            <Avatar
              alt={player.full_name}
              className="h-20 w-20 rounded-[24px] text-2xl"
              initial={player.full_name.slice(0, 1)}
              src={player.profile_image_url}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-brand-text">{player.full_name}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {player.primary_position} - {player.country ?? "ScoutMe"}
                  </p>
                </div>
                <div className="rounded-full border border-emerald-100 bg-emerald-50 p-2 text-slate-500 transition group-hover:text-emerald-600">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                <span>Age {player.age}</span>
                <span>|</span>
                <span>{player.height ? `${player.height}cm` : "Height pending"}</span>
                <span>|</span>
                <span>{foot}</span>
              </div>
              <div className="mt-3 inline-flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span>{location}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <StatChip label="Matches" value={player.matches_played} />
            <StatChip label="Goals" value={player.goals} />
            <StatChip label="Assists" value={player.assists} />
            <StatChip label="Foot" value={player.dominant_foot ?? "N/A"} />
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-emerald-500" />
              {player.endorsement_count}
            </span>
            <span className="inline-flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-slate-400" />
              {player.comments_count}
            </span>
          </div>
          <span className="text-sm font-semibold text-emerald-600">View Profile</span>
        </div>
      </Card>
    </Link>
  );
}
