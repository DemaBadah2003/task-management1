import Image from 'next/image';

export default function EpicsEmptyLampIcon() {
  return (
    <Image
      src="/icons/epics1.svg"
      alt=""
      aria-hidden="true"
      width={18}
      height={30}
      className="h-[30px] w-[18px]"
    />
  );
}
