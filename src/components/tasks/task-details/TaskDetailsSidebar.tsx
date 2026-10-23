import type { TaskDetails } from '@/src/lib/tasks-api';
import AssigneeAvatar from './AssigneeAvatar';
import { CalendarIcon, ChevronDownIcon } from './icons';
import MetadataField from './MetadataField';
import type { TaskEpic, TaskPerson } from './types';
import { displayName, formatDate, statusLabel } from './utils';

interface TaskDetailsSidebarProps {
  task: TaskDetails;
  assignee?: TaskPerson;
  projectMembers: TaskPerson[];
  projectEpics: TaskEpic[];
  epic?: TaskEpic;
}

export default function TaskDetailsSidebar({
  task,
  assignee,
  projectMembers,
  projectEpics,
  epic,
}: TaskDetailsSidebarProps) {
  const epicId = task.epic_id?.trim() || null;
  const relatedEpic =
    projectEpics.find((item) => item.id === epicId) ??
    (epic?.id === epicId ? epic : undefined);
  const epicValue = relatedEpic
    ? `(${relatedEpic.epic_id || relatedEpic.id}) ${relatedEpic.title}`
    : epicId || '—';

  const taskAssigneeMember = projectMembers.find(
    (member) => member.id === task.assignee_id
  );
  const assigneeName =
    displayName(taskAssigneeMember?.name) ||
    displayName(assignee?.name) ||
    displayName(task.assignee_name) ||
    (task.assignee_id ? 'Assignee unavailable' : 'Unassigned');
  const avatarUrl =
    task.assignee_avatar ||
    taskAssigneeMember?.avatarUrl ||
    assignee?.avatarUrl ||
    null;

  const reporterMember = projectMembers.find(
    (member) =>
      member.id === task.reporter ||
      member.name === task.reporter ||
      member.email === task.reporter
  );
  const reporterName = reporterMember?.name || task.reporter?.trim() || null;

  return (
    <aside className="task-details-sidebar flex min-h-0 shrink-0 flex-col gap-2.5 overflow-hidden bg-transparent p-0 md:[scrollbar-width:none] md:gap-6 md:overflow-hidden md:bg-[#F1F3FF] md:px-8 md:pt-[130px] md:pb-8 md:[&::-webkit-scrollbar]:hidden">
      <div className="md:hidden">
        <MetadataField label="Status">
          <span className="text-xs leading-[18px] font-medium tracking-normal text-[#041B3C]">
            {statusLabel(task.status)}
          </span>
        </MetadataField>
      </div>
      <MetadataField label="Assignee">
        {task.assignee_id || task.assignee_name || assignee?.name ? (
          <>
            <AssigneeAvatar name={assigneeName} avatarUrl={avatarUrl} />
            <span className="min-w-0 truncate">{assigneeName}</span>
          </>
        ) : (
          'Unassigned'
        )}
      </MetadataField>
      <MetadataField label="Epic">
        <span className="min-w-0 flex-1 truncate">{epicValue}</span>
        <ChevronDownIcon className="size-3 shrink-0 text-[#737685]" />
      </MetadataField>
      <MetadataField label="Due date">
        <CalendarIcon />
        <time dateTime={task.due_date ?? undefined}>
          {formatDate(task.due_date)}
        </time>
      </MetadataField>
      <MetadataField label="Created by">
        {reporterName ? (
          <>
            <AssigneeAvatar
              name={reporterName}
              avatarUrl={reporterMember?.avatarUrl ?? null}
            />
            <span className="min-w-0 truncate">{reporterName}</span>
          </>
        ) : (
          '—'
        )}
      </MetadataField>
      <MetadataField label="Created at">
        <CalendarIcon />
        <time dateTime={task.created_at ?? undefined}>
          {formatDate(task.created_at)}
        </time>
      </MetadataField>
    </aside>
  );
}
