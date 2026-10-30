import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { TaskDetails } from '@/src/lib/tasks-api';
import { TASK_STATUSES } from '@/src/constants/task-statuses';
import type { TaskStatus } from '@/src/types/task';
import AssigneeAvatar from './AssigneeAvatar';
import { CalendarIcon, ChevronDownIcon } from './icons';
import MetadataField from './MetadataField';
import type {
  EditableTaskField,
  TaskDetailsUpdateHandler,
  TaskEpic,
  TaskPerson,
} from './types';
import { displayName, formatDate, statusLabel } from './utils';

interface TaskDetailsSidebarProps {
  task: TaskDetails;
  assignee?: TaskPerson;
  projectMembers: TaskPerson[];
  projectMembersLoading: boolean;
  projectMembersError?: string | null;
  projectEpics: TaskEpic[];
  projectEpicsLoading: boolean;
  projectEpicsError?: string | null;
  savingFields: Record<EditableTaskField, boolean>;
  onRefreshProjectMembers?: () => void;
  onRefreshProjectEpics?: () => void;
  onUpdate: TaskDetailsUpdateHandler;
  epic?: TaskEpic;
}

export default function TaskDetailsSidebar({
  task,
  assignee,
  projectMembers,
  projectMembersLoading,
  projectMembersError,
  projectEpics,
  projectEpicsLoading,
  projectEpicsError,
  savingFields,
  onRefreshProjectMembers,
  onRefreshProjectEpics,
  onUpdate,
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
  const dueDateValue = task.due_date?.slice(0, 10) ?? '';
  const reconciledEpicId = useRef<string | null>(null);

  useEffect(() => {
    if (
      !projectEpicsLoading &&
      !projectEpicsError &&
      epicId &&
      !projectEpics.some((item) => item.id === epicId) &&
      reconciledEpicId.current !== epicId
    ) {
      reconciledEpicId.current = epicId;
      void onUpdate({ epic_id: null });
    }
  }, [epicId, onUpdate, projectEpics, projectEpicsError, projectEpicsLoading]);

  const handleDueDateChange = (value: string) => {
    if (!value) {
      if (task.due_date !== null) void onUpdate({ due_date: null });
      return;
    }

    const date = new Date(`${value}T00:00:00.000Z`);
    const today = new Date().toISOString().slice(0, 10);
    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value ||
      value < today
    ) {
      toast.error('Due date cannot be in the past.');
      return;
    }

    if (task.due_date?.slice(0, 10) === value) return;

    const nextValue = `${value}T00:00:00Z`;
    void onUpdate({ due_date: nextValue });
  };

  return (
    <aside className="task-details-sidebar flex min-h-0 shrink-0 flex-col gap-2.5 overflow-hidden bg-transparent p-0 md:[scrollbar-width:none] md:gap-6 md:overflow-hidden md:bg-[#F1F3FF] md:px-8 md:pt-[130px] md:pb-8 md:[&::-webkit-scrollbar]:hidden">
      <div className="md:hidden">
        <MetadataField label="Status">
          <select
            aria-label="Task status"
            value={task.status}
            disabled={savingFields.status}
            aria-busy={savingFields.status}
            onChange={(event) => {
              const value = event.target.value;
              if (TASK_STATUSES.some((status) => status.key === value)) {
                void onUpdate({ status: value as TaskStatus });
              }
            }}
            className="min-w-0 flex-1 bg-transparent text-xs font-medium text-[#041B3C] outline-none disabled:opacity-60"
          >
            {TASK_STATUSES.map((status) => (
              <option key={status.key} value={status.key}>
                {statusLabel(status.key)}
              </option>
            ))}
          </select>
        </MetadataField>
      </div>
      <MetadataField label="Assignee">
        {task.assignee_id &&
        !projectMembers.some((member) => member.id === task.assignee_id) ? (
          <AssigneeAvatar name={assigneeName} avatarUrl={avatarUrl} />
        ) : null}
        <select
          aria-label="Task assignee"
          value={task.assignee_id ?? ''}
          disabled={
            savingFields.assignee_id ||
            (projectMembersLoading && projectMembers.length === 0)
          }
          aria-busy={savingFields.assignee_id || projectMembersLoading}
          onFocus={() => onRefreshProjectMembers?.()}
          onChange={(event) => {
            const value = event.target.value || null;
            if (value !== task.assignee_id) {
              void onUpdate({ assignee_id: value });
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-xs text-[#041B3C] outline-none disabled:opacity-60"
        >
          <option value="">Unassigned</option>
          {task.assignee_id &&
          !projectMembers.some((member) => member.id === task.assignee_id) ? (
            <option value={task.assignee_id}>
              Current assignee unavailable
            </option>
          ) : null}
          {projectMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name || member.email || member.id}
            </option>
          ))}
        </select>
        {savingFields.assignee_id || projectMembersLoading ? (
          <span role="status" className="text-[10px] text-[#737685]">
            {savingFields.assignee_id ? 'Saving...' : 'Loading...'}
          </span>
        ) : null}
      </MetadataField>
      {projectMembersError ? (
        <div
          role="alert"
          className="flex items-center justify-between gap-2 text-[10px] text-red-700"
        >
          <span>Could not load project members.</span>
          <button
            type="button"
            onClick={onRefreshProjectMembers}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      ) : null}
      <MetadataField label="Epic">
        <select
          aria-label="Task epic"
          value={epicId ?? ''}
          disabled={
            savingFields.epic_id ||
            (projectEpicsLoading && projectEpics.length === 0)
          }
          aria-busy={savingFields.epic_id || projectEpicsLoading}
          onFocus={() => onRefreshProjectEpics?.()}
          onChange={(event) => {
            const value = event.target.value || null;
            if (value !== epicId) void onUpdate({ epic_id: value });
          }}
          className="min-w-0 flex-1 bg-transparent text-xs text-[#041B3C] outline-none disabled:opacity-60"
        >
          <option value="">No epic</option>
          {epicId && !relatedEpic ? (
            <option value={epicId}>{epicValue}</option>
          ) : null}
          {projectEpics.map((item) => (
            <option key={item.id} value={item.id}>
              ({item.epic_id || item.id}) {item.title}
            </option>
          ))}
        </select>
        {savingFields.epic_id || projectEpicsLoading ? (
          <span role="status" className="text-[10px] text-[#737685]">
            {savingFields.epic_id ? 'Saving...' : 'Loading...'}
          </span>
        ) : null}
        <ChevronDownIcon className="size-3 shrink-0 text-[#737685]" />
      </MetadataField>
      {projectEpicsError ? (
        <div
          role="alert"
          className="flex items-center justify-between gap-2 text-[10px] text-red-700"
        >
          <span>Could not load project epics.</span>
          <button
            type="button"
            onClick={onRefreshProjectEpics}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      ) : null}
      <MetadataField label="Due date">
        <CalendarIcon />
        <input
          aria-label="Task due date"
          type="date"
          value={dueDateValue}
          min={new Date().toISOString().slice(0, 10)}
          disabled={savingFields.due_date}
          aria-busy={savingFields.due_date}
          onChange={(event) => handleDueDateChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-xs text-[#041B3C] outline-none disabled:opacity-60"
        />
        {task.due_date ? (
          <button
            type="button"
            aria-label="Clear due date"
            title="Clear due date"
            disabled={savingFields.due_date}
            onClick={() => handleDueDateChange('')}
            className="text-[10px] font-semibold text-[#003D9B] disabled:opacity-60"
          >
            Clear
          </button>
        ) : null}
        {savingFields.due_date ? (
          <span role="status" className="text-[10px] text-[#737685]">
            Saving...
          </span>
        ) : null}
        <span className="sr-only">{formatDate(task.due_date)}</span>
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
