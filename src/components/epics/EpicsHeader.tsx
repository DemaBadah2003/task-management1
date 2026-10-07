import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import Plus from 
import Breadcrumb from '@/src/components/epics/Breadcrumb';

interface Props {
  projectId: string;
  projectName: string;
  query?: string;
}

export default function EpicsHeader({ projectId, projectName, query }: Props) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Breadcrumb
            className="mb-4 hidden md:flex"
            items={[
              { label: 'Projects', href: '/projects' },
              { label: projectName, href: `/project/${projectId}` },
              { label: 'Epics' },
            ]}
          />
          <h1 className="text-[30px] leading-9 font-bold tracking-[-0.75px] text-[#041B3C]">
            Project Epics
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <form
            role="search"
            className="flex min-w-[300px] items-center gap-2 rounded-[2px] bg-[#D7E2FF] px-3 py-1.5"
          >
            <Search size={14} className="shrink-0 text-[#737685]" />
            <input
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search epics..."
              className="w-full bg-transparent text-sm leading-none font-normal text-[#041B3C] outline-none placeholder:text-[#737685]"
            />
          </form>

          <Link
            href={`/project/${projectId}/epics/new`}
            className="flex items-center justify-center gap-2 rounded-[2px] bg-[#003D9B] px-4 py-2 text-base leading-6 font-bold text-white"
          >
            <Plus size={16} />
            New Epic
          </Link>
        </div>
      </div>
    </header>
  );
}
