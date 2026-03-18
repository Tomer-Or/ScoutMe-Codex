export function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-semibold tracking-tight text-brand-text">{title}</h2>
      {description ? <p className="max-w-2xl text-sm leading-6 text-slate-400">{description}</p> : null}
    </div>
  );
}
