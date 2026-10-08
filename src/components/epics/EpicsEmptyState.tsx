import CreateEpicsIcon from '@/src/components/icons/CreateEpicsIcon';
import EpicsEmptyGridIcon from '@/src/components/icons/EpicsEmptyGridIcon';
import EpicsEmptyLampIcon from '@/src/components/icons/EpicsEmptyLampIcon';
import EpicsEmptyPlusIcon from '@/src/components/icons/EpicsEmptyPlusIcon';
import EpicsEmptyRocketIcon from '@/src/components/icons/EpicsEmptyRocketIcon';

export function EpicsEmptyState({
  title = 'No epics found for this project',
  description = 'Break down your large project into manageable epics to track progress better and maintain architectural clarity.',
  showCreateAction = true,
  onCreate,
}: {
  title?: string;
  description?: string;
  showCreateAction?: boolean;
  onCreate?: () => void;
}) {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-6 flex size-[min(224px,65vw)] items-center justify-center rounded-[32px] bg-white shadow-[0px_25px_50px_-12px_#003D9B1A]">
        <div className="grid w-fit grid-cols-[64px_64px] gap-2">
          <span className="flex size-16 items-center justify-center rounded-md bg-[#D7E2FF] text-[#003D9B]">
            <EpicsEmptyRocketIcon />
          </span>
          <span className="flex size-16 items-center justify-center rounded-md bg-[#D7E2FF] text-[#737685]">
            <EpicsEmptyLampIcon />
          </span>
          <span className="flex size-16 items-center justify-center rounded-md bg-[#D7E2FF] text-[#737685]">
            <EpicsEmptyGridIcon />
          </span>
          <span className="flex size-16 items-center justify-center rounded-md border border-dashed border-[#C3C6D6] text-[#9AA7C2]">
            <EpicsEmptyPlusIcon />
          </span>
        </div>
      </div>

      <h2 className="text-xl leading-7 font-semibold text-[#041B3C]">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-[360px] text-sm leading-5 text-[#434654]">
          {description}
        </p>
      ) : null}
      {showCreateAction ? (
        <button
          type="button"
          onClick={onCreate}
          className="mt-6 flex h-12 items-center justify-center gap-2 rounded bg-[#003D9B] px-5 text-sm font-bold text-white shadow-[0px_4px_8px_rgba(0,0,0,0.1)]"
        >
          <CreateEpicsIcon />
          Create First Epic
        </button>
      ) : null}
    </div>
  );
}
