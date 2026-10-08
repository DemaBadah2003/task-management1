export function EpicsErrorState({
  onRetry,
  title = 'Failed to load epics',
}: {
  onRetry: () => void;
  title?: string;
}) {
  return (
    <div
      role="alert"
      className="flex min-h-[55vh] flex-col items-center justify-center px-4 text-center"
    >
      <div className="mb-4 flex size-7 items-center justify-center rounded-md bg-[#FFDAD6] text-[#BA1A1A]">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 17a4 4 0 0 0-3-3.87A6 6 0 0 0 7.3 8.4M5 14a4 4 0 0 0 1 7.9h11" />
          <path d="m2 2 20 20" />
        </svg>
      </div>
      <h2 className="text-sm leading-5 font-bold text-[#041B3C]">
        {title}
      </h2>
      <p className="mt-1 max-w-[250px] text-xs leading-[17px] text-[#434654]">
        We couldn&apos;t retrieve the project epics. Please try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 h-8 rounded-[2px] bg-[#003D9B] px-4 text-xs font-bold text-white shadow-[0px_4px_8px_#003D9B33]"
      >
        Retry Connection
      </button>
    </div>
  );
}
