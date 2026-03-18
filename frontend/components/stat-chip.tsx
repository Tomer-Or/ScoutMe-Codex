import { cn } from "@/lib/utils";

export function StatChip({
  label,
  value,
  className
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-brand-border bg-[#f8fbf8] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
        className
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-brand-text">{value}</p>
    </div>
  );
}
