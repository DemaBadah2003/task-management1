function SkeletonCard() {
  return (
    <div className="flex min-h-[220px] w-full min-w-0 flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--color-card-border)] bg-white p-6">
      <div className="h-6 w-3/4 animate-pulse rounded-md bg-[var(--color-surface-low)]" />
      <div className="h-4 w-full animate-pulse rounded bg-[var(--color-surface-low)]" />
      <div className="mt-auto h-4 w-1/2 animate-pulse rounded bg-[var(--color-surface-low)]" />
    </div>
  );
}

export function ProjectsLoadingSkeleton() {
  return (
    <div className="@container flex flex-col gap-6">
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[36px] leading-[40px] font-semibold tracking-[-0.9px] text-[#041B3C]">
            Projects
          </h1>
          <p className="text-[14px] leading-[20px] text-[#4F5F7B]">
            Manage and curate your projects
          </p>
        </div>
        <div className="hidden h-12 w-44 animate-pulse rounded-[2px] bg-[var(--color-surface-low)] md:block" />
      </div>

      <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @4xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
