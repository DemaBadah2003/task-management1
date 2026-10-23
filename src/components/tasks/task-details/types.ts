import type { TaskDetails } from '@/src/lib/tasks-api';

export interface TaskPerson {
  id?: string;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
}

export interface TaskEpic {
  id: string;
  epic_id?: string;
  title: string;
}

export interface TaskDetailsModalProps {
  projectId: string;
  taskId: string;
  assignee?: TaskPerson;
  projectMembers: TaskPerson[];
  projectEpics: TaskEpic[];
  epic?: TaskEpic;
  onClose: () => void;
}

export type TaskDetailsState =
  | { key: string; status: 'loading' }
  | { key: string; status: 'success'; task: TaskDetails }
  | { key: string; status: 'not-found' }
  | { key: string; status: 'error' }
  | { key: string; status: 'auth-error' };