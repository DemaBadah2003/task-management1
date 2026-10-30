import type { Metadata } from 'next';
import MyStatisticsDashboard from '@/src/components/statistics/MyStatisticsDashboard';

export const metadata: Metadata = {
  title: 'My Statistics · Taskly',
  description:
    'View your task activity and statistics for a selected date range.',
};

export default function MyStatisticsPage() {
  return <MyStatisticsDashboard />;
}
