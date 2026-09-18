import Link from 'next/link';

// زر الإضافة العائم — يظهر في الموبايل فقط ويودّي لصفحة إضافة مشروع
export function AddProjectFab() {
  return (
    <Link
      href="/project/add"
      aria-label="Add project"
      className="fixed right-4 bottom-24 z-40 flex h-14 w-14 items-center justify-center rounded-[var(--radius-card)] bg-[var(--color-primary)] text-white shadow-lg transition-transform active:scale-95 md:hidden"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 5V19M5 12H19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </Link>
  );
}
