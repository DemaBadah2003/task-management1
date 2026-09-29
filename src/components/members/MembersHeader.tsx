import Link from 'next/link';

const crumb = 'text-xs font-bold uppercase leading-4 tracking-[1.2px]';

function UserPlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </svg>
  );
}

const shadow = 'shadow-[0_10px_15px_-3px_#003D9B33,0_4px_6px_-4px_#003D9B33]';

export function MembersHeader({
  projectName = 'Project Name',
}: {
  projectName?: string;
}) {
  return (
    <>
      <header className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          {/* Breadcrumb: يظهر على التابلت والديسكتوب فقط */}
          <nav
            aria-label="Breadcrumb"
            className="mb-2 hidden items-center gap-2 md:flex"
          >
            <Link href="/" className={`${crumb} text-[#434654]/60`}>
              Projects
            </Link>
            <span className="text-[#434654]/40" aria-hidden>
              ›
            </span>
            <span
              className={`${crumb} max-w-[200px] truncate text-[#434654]/60`}
            >
              {projectName}
            </span>
            <span className="text-[#434654]/40" aria-hidden>
              ›
            </span>
            <span className={`${crumb} text-[#003D9B]`}>Members</span>
          </nav>
          <h1 className="text-2xl font-semibold tracking-[-0.9px] text-[#041B3C] md:text-4xl md:leading-10">
            Project Members
          </h1>
        </div>

        {/* زر الديسكتوب (UI فقط) */}
        <button
          type="button"
          className={`hidden shrink-0 items-center gap-2 rounded-[2px] bg-[#003D9B] px-5 py-2.5 text-sm leading-5 font-bold text-white md:inline-flex ${shadow}`}
        >
          <UserPlusIcon />
          Invite Member
        </button>
      </header>

      {/* زر الموبايل: FAB (UI فقط) */}
      <button
        type="button"
        aria-label="Invite Member"
        className={`fixed right-4 bottom-20 z-20 flex h-12 w-12 items-center justify-center rounded-xl bg-[#003D9B] text-white md:hidden ${shadow}`}
      >
        <UserPlusIcon />
      </button>
    </>
  );
}
