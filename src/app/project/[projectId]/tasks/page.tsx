import ProjectTasksWorkspace from '@/src/components/tasks/ProjectTasksWorkspace';

interface TasksPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function TasksPage({ params }: TasksPageProps) {
  const { projectId } = await params;

  return <ProjectTasksWorkspace key={projectId} projectId={projectId} />;
}
