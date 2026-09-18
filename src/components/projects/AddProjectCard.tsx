import Link from 'next/link';

function CirclePlusIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M14 9.5V18.5M9.5 14H18.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AddProjectCard() {
  return (
    <Link
      href="/project/add"
      className="hidden min-h-[220px] w-full min-w-0 flex-col items-center justify-center gap-4 rounded-[var(--radius-card)] border border-[var(--color-card-border)] bg-white text-[var(--color-slate-900)] transition-shadow hover:shadow-md md:flex"
    >
      <span className="flex h-[60px] w-[60px] items-center justify-center rounded-[16px] bg-[#F1F3FF] text-[var(--color-primary)]">
        <CirclePlusIcon />
      </span>

      <span className="text-[16px] leading-[24px] font-semibold tracking-[0.08em] whitespace-nowrap uppercase">
        Add Project
      </span>
    </Link>
  );
}
