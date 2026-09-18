'use client';

import Link from 'next/link';

const ICONS = {
  compass: '/icons/compass.svg',
  layers: '/icons/layers.svg',
  ruler: '/icons/ruler.svg',
} as const;

export function ProjectsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 px-8 py-24 text-center">
      <div className="relative flex h-[288px] w-[288px] items-center justify-center rounded-[8px] bg-[#F1F3FF]">
        <div
          className="absolute inset-0 rounded-[8px] opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(#003D9B 12px, transparent 12px), linear-gradient(90deg, #003D9B 12px, transparent 12px)',
          }}
        />

        <div
          className="absolute top-10 right-10 flex h-12 w-12 items-center justify-center rounded-[4px] bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
          style={{ transform: 'rotate(6deg)' }}
        >
          <img
            src={ICONS.layers}
            alt=""
            aria-hidden="true"
            className="h-5 w-5"
            draggable={false}
          />
        </div>

        <div
          className="absolute bottom-12 left-10 flex h-10 w-10 items-center justify-center rounded-[4px] bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
          style={{ transform: 'rotate(-12deg)' }}
        >
          <img
            src={ICONS.ruler}
            alt=""
            aria-hidden="true"
            className="h-4 w-4"
            draggable={false}
          />
        </div>

        <div
          className="relative z-10 flex h-24 w-24 items-center justify-center rounded-[12px] bg-[#DAE2FF]"
          style={{
            boxShadow:
              '0px 8px 10px -6px rgba(4,27,60,0.05), 0px 20px 25px -5px rgba(4,27,60,0.05)',
          }}
        >
          <img
            src={ICONS.compass}
            alt=""
            aria-hidden="true"
            className="h-10 w-10"
            draggable={false}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-[36px] leading-[40px] font-semibold tracking-[-0.9px] text-[#041B3C]">
          No Projects
        </h2>
        <p className="max-w-[520px] text-[18px] leading-[29.25px] font-normal text-[#434654]">
          You don&apos;t have any projects yet. Start by defining your first
          architectural workspace to begin tracking tasks and epics.
        </p>
      </div>

      <Link
        href="/project/add"
        className="flex w-fit items-center justify-center gap-[11.99px] rounded-[4px] px-8 py-4 text-center align-middle text-[18px] leading-[28px] font-bold text-white"
        style={{
          background: 'linear-gradient(135deg, #003D9B 0%, #0052CC 100%)',
        }}
      >
        Create New Project
      </Link>
    </div>
  );
}
