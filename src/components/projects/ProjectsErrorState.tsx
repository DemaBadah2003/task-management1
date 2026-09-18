interface ProjectsErrorStateProps {
  onRetry: () => void;
}

export function ProjectsErrorState({ onRetry }: ProjectsErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-8 py-24 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-error-bg)]">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 4L16 16M16 4L4 16"
            stroke="var(--color-error)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>

      <h2 className="text-[18px] leading-7 font-semibold text-[var(--color-slate-900)]">
        Something went wrong
      </h2>
      <p className="max-w-[320px] text-[14px] leading-[22.75px] text-[var(--color-slate-500)]">
        We&apos;re having trouble retrieving your projects right now. Please try
        again in a moment.
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="rounded-[var(--radius-btn)] bg-[var(--color-primary)] px-6 py-3 text-[14px] font-medium text-white"
      >
        Retry Connection
      </button>
    </div>
  );
}
