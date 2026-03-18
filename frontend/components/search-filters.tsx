"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <Input placeholder="Search by name or bio" defaultValue={searchParams.get("q") ?? ""} onBlur={(e) => updateParam("q", e.target.value)} />
      <Input placeholder="Primary position" defaultValue={searchParams.get("primary_position") ?? ""} onBlur={(e) => updateParam("primary_position", e.target.value)} />
      <Input placeholder="Dominant foot" defaultValue={searchParams.get("dominant_foot") ?? ""} onBlur={(e) => updateParam("dominant_foot", e.target.value)} />
      <Input placeholder="City" defaultValue={searchParams.get("city") ?? ""} onBlur={(e) => updateParam("city", e.target.value)} />
      <Input placeholder="Country" defaultValue={searchParams.get("country") ?? ""} onBlur={(e) => updateParam("country", e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input placeholder="Min age" type="number" defaultValue={searchParams.get("min_age") ?? ""} onBlur={(e) => updateParam("min_age", e.target.value)} />
        <Input placeholder="Max age" type="number" defaultValue={searchParams.get("max_age") ?? ""} onBlur={(e) => updateParam("max_age", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input placeholder="Min height" type="number" defaultValue={searchParams.get("min_height") ?? ""} onBlur={(e) => updateParam("min_height", e.target.value)} />
        <Input placeholder="Max height" type="number" defaultValue={searchParams.get("max_height") ?? ""} onBlur={(e) => updateParam("max_height", e.target.value)} />
      </div>
      <Input placeholder="Club name" defaultValue={searchParams.get("club_name") ?? ""} onBlur={(e) => updateParam("club_name", e.target.value)} />
      <Input placeholder="Sort: newest, age_asc, age_desc, most_endorsed" defaultValue={searchParams.get("sort") ?? "newest"} onBlur={(e) => updateParam("sort", e.target.value)} />
    </div>
  );
}
