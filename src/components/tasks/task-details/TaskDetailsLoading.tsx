export default function TaskDetailsLoading() {
  return (
    <>
      <main
        role="status"
        aria-label="Loading task details"
        aria-busy="true"
        className="min-h-64 space-y-5 p-0 md:min-h-[390px] md:p-6"
      >
        <div className="h-3 w-16 animate-pulse rounded bg-[#E5EBFF]" />
        <div className="h-9 animate-pulse rounded-md bg-[#E5EBFF]" />
        <div className="h-32 animate-pulse rounded-md bg-[#E5EBFF]" />
        <span className="sr-only">Loading task details...</span>
      </main>
      <aside
        aria-hidden="true"
        className="hidden space-y-4 bg-[#F1F3FF] p-5 md:block"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index}>
            <div className="mb-2 h-2 w-16 animate-pulse rounded bg-[#D7E2FF]" />
            <div className="h-9 animate-pulse rounded-md bg-white" />
          </div>
        ))}
      </aside>
    </>
  );
}
