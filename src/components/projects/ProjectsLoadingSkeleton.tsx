function SkeletonCard() {
  return (
    <div className="flex min-h-[220px] w-[304px] flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--color-card-border)] bg-white p-6">
      <div className="h-24 w-full animate-pulse rounded-md bg-[var(--color-surface-low)]" />
      <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--color-surface-low)]" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-[var(--color-surface-low)]" />
    </div>
  );
}

export function ProjectsLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-[length:var(--text-headline-lg)] font-[var(--text-headline-lg--font-weight)] text-[var(--color-slate-900)]">
            Projects
          </h1>
          <p className="text-[length:var(--text-body-lg)] text-[var(--color-slate-500)]">
            Manage and curate your projects
          </p>
        </div>
        <div className="h-10 w-40 animate-pulse rounded-[var(--radius-btn)] bg-[var(--color-surface-low)]" />
      </div>

      <div className="flex flex-wrap gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
