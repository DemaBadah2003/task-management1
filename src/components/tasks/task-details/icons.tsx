export function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={className}
      fill="none"
    >
      <path
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-4 shrink-0 text-[#737685]"
      fill="none"
    >
      <rect
        x="2.25"
        y="3.5"
        width="11.5"
        height="10"
        rx="1.25"
        stroke="currentColor"
      />
      <path d="M5 2v3M11 2v3M2.5 6.5h11" stroke="currentColor" />
    </svg>
  );
}

export function LinkIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 8"
      className="h-2 w-[15px]"
      fill="none"
    >
      <path
        d="M5.5 5.5h-1a2.5 2.5 0 0 1 0-5h3a2.5 2.5 0 0 1 2.45 2M10.5 2.5h1a2.5 2.5 0 0 1 0 5h-3a2.5 2.5 0 0 1-2.45-2M5.5 4h5"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
}
