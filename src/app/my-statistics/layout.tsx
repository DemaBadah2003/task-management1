import { AuthenticatedLayout } from '@/src/components/layout/AuthenticatedLayout';

export default function MyStatisticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
