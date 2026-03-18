import { HomeShell } from "@/components/home-shell";
import { apiGetFeed, apiGetPlayers } from "@/lib/api";

export default async function HomePage() {
  const players = await apiGetPlayers().catch(() => []);
  const feedItems = await apiGetFeed().catch(() => []);
  return <HomeShell players={players} feedItems={feedItems} />;
}
