import type { ProjectMember, MemberRole } from '@/src/types/member';

// إن كان عندك Avatar مشترك في المشروع، استبدل هذا المكوّن به
function MemberAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="h-10 w-10 shrink-0 rounded-xl object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DAE2FF] text-sm font-bold text-[#003D9B]">
      {initials}
    </div>
  );
}

const roleStyles: Record<MemberRole, string> = {
  owner: 'bg-[#0052CC] text-white',
  admin: 'bg-[#DAE2FF] text-[#434654]',
  member: 'bg-[#DAE2FF] text-[#434654]',
  viewer: 'bg-[#DAE2FF] text-[#434654]',
};

function RoleBadge({ role }: { role: MemberRole }) {
  return (
    <span
      className={`inline-block rounded-xl px-3 py-1 text-[10px] leading-none font-bold tracking-[0.5px] uppercase ${roleStyles[role]}`}
    >
      {role}
    </span>
  );
}

export function MembersList({ members }: { members: ProjectMember[] }) {
  return (
    <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-[0_1px_3px_#00000014] md:mt-10">
      {/* رأس الجدول: ديسكتوب/تابلت فقط */}
      <div className="hidden grid-cols-[minmax(0,3fr)_minmax(0,2fr)] bg-[#E0E8FF]/30 px-6 py-4 md:grid">
        <span className="text-[11px] leading-none font-bold tracking-[1.1px] text-[#434654] uppercase">
          Member
        </span>
        <span className="text-[11px] leading-none font-bold tracking-[1.1px] text-[#434654] uppercase">
          Role
        </span>
      </div>

      <ul className="divide-y divide-[#E0E8FF]">
        {members.map((m) => (
          <li
            key={m.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:px-6"
          >
            <div className="flex min-w-0 items-center gap-3">
              <MemberAvatar name={m.name} avatarUrl={m.avatarUrl} />
              <div className="min-w-0">
                <p className="truncate text-sm leading-5 font-semibold text-[#041B3C]">
                  {m.name}
                </p>
                <p className="truncate text-xs leading-4 text-[#434654]">
                  {m.email}
                </p>
              </div>
            </div>
            <div>
              <RoleBadge role={m.role} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
