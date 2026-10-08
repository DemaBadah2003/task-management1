import EpicsView from '@/src/components/epics/EpicsView';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function EpicsPage({ params }: PageProps) {
  const { projectId } = await params;
  return <EpicsView projectId={projectId} />;
}
