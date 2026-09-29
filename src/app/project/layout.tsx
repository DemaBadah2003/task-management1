import { AuthenticatedLayout } from '@/src/components/layout/AuthenticatedLayout';

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
