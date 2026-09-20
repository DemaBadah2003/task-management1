import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectIdIndexPage({ params }: PageProps) {
  const { projectId } = await params;
  redirect(`/project/${projectId}/epics`);
}
