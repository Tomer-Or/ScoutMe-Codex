import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Avatar } from "@/components/avatar";
import type { PlayerCard } from "@/lib/types";

export function TrendingPlayerRow({ player }: { player: PlayerCard }) {
  const location = [player.city, player.country].filter(Boolean).join(", ") || "Location pending";

  return (
    <Link
      href={`/players/${player.id}`}
      className="flex items-center gap-3 rounded-2xl border border-transparent bg-[#f8fbf8] px-3 py-3 transition hover:-translate-y-0.5 hover:border-brand-border hover:bg-white"
    >
      <Avatar
        alt={player.full_name}
        className="h-12 w-12 rounded-2xl border border-white/10 text-base"
        initial={player.full_name.slice(0, 1)}
        src={player.profile_image_url}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-brand-text">{player.full_name}</p>
        <p className="truncate text-xs text-slate-500">
          {player.primary_position} - {location}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-400" />
    </Link>
  );
}
