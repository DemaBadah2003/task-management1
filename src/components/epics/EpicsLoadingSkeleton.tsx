const bar = 'animate-pulse rounded bg-[#E5EBFF]';

function EpicCardSkeleton() {
  return (
    <div className="min-w-0 rounded-lg border-l-4 border-[#E5EBFF] bg-white p-4 shadow-[0px_1px_2px_0px_#0000000D]">
      <div className="flex items-start justify-between">
        <div className={`${bar} h-[15px] w-12`} />
        <div className={`${bar} size-4 rounded-full`} />
      </div>
      <div className={`${bar} mt-3 h-7 w-4/5`} />
      <div className="mt-3 flex items-center gap-2">
        <div className={`${bar} size-8 rounded-full`} />
        <div className="space-y-1.5">
          <div className={`${bar} h-3 w-12`} />
          <div className={`${bar} h-4 w-20`} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[#E5E7EB] pt-3">
        <div className={`${bar} h-3 w-28`} />
        <div className={`${bar} h-3 w-16`} />
      </div>
    </div>
  );
}

export function EpicsLoadingSkeleton({ cardsOnly = false }: { cardsOnly?: boolean }) {
  return (
    <div aria-busy="true" aria-label="Loading project epics" className="w-full">
      {cardsOnly ? null : (
        <div className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <div className={`${bar} h-3 w-36`} />
            <div className={`${bar} h-9 w-56`} />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className={`${bar} h-12 w-full sm:w-[303px]`} />
            <div className={`${bar} h-12 w-[140px]`} />
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <EpicCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
