import Image from 'next/image';
import { useState } from 'react';
import { initials } from './utils';

export default function AssigneeAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (avatarUrl && failedUrl !== avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt=""
        aria-hidden="true"
        width={20}
        height={20}
        unoptimized
        onError={() => setFailedUrl(avatarUrl)}
        className="size-5 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#D7E2FF] text-[8px] font-bold text-[#003D9B]"
    >
      {initials(name)}
    </span>
  );
}
