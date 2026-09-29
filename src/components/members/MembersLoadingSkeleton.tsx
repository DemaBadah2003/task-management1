const bar = 'animate-pulse rounded bg-[#E0E8FF]';

export function MembersLoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading members"
      className="mx-auto w-full max-w-5xl px-4 py-6"
    >
      {/* Header skeleton matching Figma (مستطيلات فقط بدون نصوص تتغير) */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className={`${bar} h-3 w-28`} />
          <div className={`${bar} h-8 w-56 md:w-64`} />
        </div>
        <div className={`${bar} h-10 w-32 rounded-xl`} />
      </div>

      {/* Table Container skeleton */}
      <div className="mx-auto w-full overflow-hidden rounded-2xl border border-[#E0E8FF] bg-white p-6 shadow-sm">
        {/* Table Header Row */}
        <div className="mb-4 grid grid-cols-[2fr_1.5fr_1fr_auto] items-center gap-6 border-b border-[#E0E8FF] pb-4">
          <div className={`${bar} h-3 w-28`} />
          <div className={`${bar} h-3 w-20`} />
          <div className={`${bar} h-3 w-16`} />
          <div className={`${bar} h-3 w-12`} />
        </div>

        {/* Rows skeleton */}
        <ul className="space-y-5">
          {Array.from({ length: rows }).map((_, i) => (
            <li
              key={i}
              className="grid grid-cols-[2fr_1.5fr_1fr_auto] items-center gap-6 py-2"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className={`${bar} h-10 w-10 shrink-0 rounded-full`} />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className={`${bar} h-4 w-36 max-w-full`} />
                  <div className={`${bar} h-3 w-48 max-w-full`} />
                </div>
              </div>
              <div className={`${bar} h-4 w-24`} />
              <div className={`${bar} h-4 w-20`} />
              <div className={`${bar} h-8 w-16 rounded-lg`} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
