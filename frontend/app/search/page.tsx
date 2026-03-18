import { PlayerCard } from "@/components/player-card";
import { SearchFilters } from "@/components/search-filters";
import { Card } from "@/components/ui/card";
import { apiSearchPlayers } from "@/lib/api";

export default async function SearchPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === "string" && value) params.set(key, value);
  });
  const players = await apiSearchPlayers(params).catch(() => []);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-brand-text">Search Players</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Filter talent by position, age, physical profile, and geography to build your shortlist faster.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit p-6 lg:sticky lg:top-24">
          <h2 className="text-xl font-semibold text-brand-text">Filters</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Refine by role, age, height, foot, location, and club context.</p>
          <div className="mt-5">
            <SearchFilters />
          </div>
        </Card>
        <section>
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-slate-400">{players.length} players found</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
