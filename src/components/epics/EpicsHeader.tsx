import Search from '@/src/components/icons/Search';
import NewEpics from '@/src/components/icons/NewEpics';
import Breadcrumb from '@/src/components/epics/Breadcrumb';

interface Props {
  projectId: string;
  projectName?: string;
  query?: string;
  onQueryChange?: (query: string) => void;
  onNewEpic?: () => void;
}

export default function EpicsHeader({
  projectId,
  projectName = projectId,
  query = '',
  onQueryChange,
  onNewEpic,
}: Props) {
  return (
    <header className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Breadcrumb
            className="mb-2 hidden md:flex"
            items={[
              { label: 'Projects', href: '/project' },
              { label: projectName, href: `/project/${projectId}` },
              { label: 'Epics' },
            ]}
          />
          <h1 className="hidden text-[30px] leading-9 font-bold tracking-[-0.75px] text-[#041B3C] md:block">
            Project Epics
          </h1>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto">
          <div
            role="search"
            className="flex h-12 w-full min-w-0 items-center gap-2 rounded-[2px] bg-[#D7E2FF] px-3 py-1.5 md:w-[303px] md:min-w-[300px] md:shrink-0"
          >
            <Search aria-hidden="true" className="size-3.5 shrink-0" />
            <input
              type="search"
              value={query}
              onChange={(event) => onQueryChange?.(event.target.value)}
              placeholder="Search epics..."
              aria-label="Search epics"
              className="w-full bg-transparent text-sm leading-5 font-normal text-[#737685] outline-none placeholder:text-[#737685]"
            />
          </div>

          <button
            type="button"
            onClick={onNewEpic}
            className="hidden h-12 shrink-0 items-center justify-center gap-2 rounded bg-[#003D9B] px-4 text-center text-base leading-6 font-bold text-white shadow-[0px_4px_8px_rgba(0,0,0,0.1)] md:flex"
          >
            <NewEpics aria-hidden="true" className="size-3.5" />
            <span>New Epic</span>
          </button>
        </div>
      </div>
    </header>
  );
}
