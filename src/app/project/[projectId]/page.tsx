import ProjectTasksWorkspace from '@/src/components/tasks/ProjectTasksWorkspace';

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  return <ProjectTasksWorkspace key={projectId} projectId={projectId} />;
}
