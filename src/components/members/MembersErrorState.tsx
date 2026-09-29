export function MembersErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFDAD6] text-[#BA1A1A]">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M22 17a4 4 0 0 0-3-3.87A6 6 0 0 0 7.3 8.4M5 14a4 4 0 0 0 1 7.9h11" />
          <path d="m2 2 20 20" />
        </svg>
      </div>
      <h2 className="text-base font-bold text-[#041B3C]">
        Something went wrong
      </h2>
      <p className="mt-2 max-w-xs text-sm text-[#434654]">
        We&apos;re having trouble retrieving your project members right now.
        Please try again in a moment.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded-[2px] bg-[#003D9B] px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_15px_-3px_#003D9B33,0_4px_6px_-4px_#003D9B33]"
      >
        Retry Connection
      </button>
    </div>
  );
}
