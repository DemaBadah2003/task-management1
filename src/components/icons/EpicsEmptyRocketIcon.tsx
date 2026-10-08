import Image from 'next/image';

export default function EpicsEmptyRocketIcon() {
  return (
    <Image
      src="/icons/epics2.svg"
      alt=""
      aria-hidden="true"
      width={32}
      height={32}
      className="size-8"
    />
  );
}
