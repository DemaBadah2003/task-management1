import TasksBoard from '@/src/components/tasks/TasksBoard';
import TasksPageHeader from '@/src/components/tasks/TasksPageHeader';

interface TasksPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function TasksPage({ params }: TasksPageProps) {
  const { projectId } = await params;

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 p-4 md:p-8">
      <TasksPageHeader />
      <TasksBoard projectId={projectId} />
    </div>
  );
}
