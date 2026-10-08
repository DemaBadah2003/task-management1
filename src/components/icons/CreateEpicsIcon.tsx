import Image from 'next/image';

export default function CreateEpicsIcon() {
  return (
    <Image
      src="/icons/createEpics.svg"
      alt=""
      aria-hidden="true"
      width={16}
      height={16}
      className="size-4"
    />
  );
}
