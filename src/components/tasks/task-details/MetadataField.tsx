import type { ReactNode } from 'react';

export default function MetadataField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="task-details-field-label mb-2 text-xs leading-[18px] font-bold tracking-normal text-[#434654] uppercase md:mb-4">
        {label}
      </p>
      <div className="flex min-h-10 min-w-0 items-center gap-2 rounded-lg border border-[#D7E2FF] bg-white px-2.5 py-1.5 text-xs leading-4 text-[#041B3C]">
        {children}
      </div>
    </div>
  );
}
